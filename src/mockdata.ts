import { database } from "./utils/database";
import { ClientSession, Db, ObjectId } from "mongodb";
import logger from "./utils/logger";

import { v4 as uuidv4 } from "uuid";
import { ContactFormSubmission } from "./models/contactformsubmission";

/**
 * Inserts mock data for the Flower Festival landing page
 * @param db Database instance
 * @param session MongoDB session for transaction
 */
async function insertMockData(db: Db, session: ClientSession) {
  logger.info("Inserting mock data for Flower Festival landing page...");

  // Create some sample contact form submissions
  const contactSubmissions = [
    {
      name: "Jane Smith",
      email: "jane.smith@example.com",
      message: "I'd like to know if there are any discounts for group tickets to the Flower Festival."
    },
    {
      name: "Michael Johnson",
      email: "michael.j@example.com",
      message: "Can you please provide more information about the floral arrangement workshop on Saturday?"
    },
    {
      name: "Emily Davis",
      email: "emily.davis@example.com",
      message: "I'm interested in being a vendor at next year's festival. Who should I contact about this opportunity?"
    },
    {
      name: "Robert Wilson",
      email: "rwilson@example.com",
      message: "Are there any accommodations for visitors with disabilities at the festival grounds?"
    },
    {
      name: "Sarah Thompson",
      email: "sarah.t@example.com",
      message: "I'm a photographer interested in covering the festival. Do you offer press passes?"
    }
  ];

  // Get the collection directly to use the session
  const contactFormCollection = db.collection("contact_form_submissions");

  // Insert contact form submissions
  for (const submission of contactSubmissions) {
    const doc = {
      id: uuidv4(),
      name: submission.name,
      email: submission.email,
      message: submission.message
    };
    
    await contactFormCollection.insertOne(doc, { session });
  }

  logger.info("Successfully inserted mock data for Flower Festival landing page");
}


// Flag to ensure we only try to populate once per process
let populationAttempted = false;

/**
 * Populates the database with mock data for the App
 */
async function populate_with_mock_data(): Promise<void> {
  // Process-level check to prevent multiple calls within the same process
  if (populationAttempted) {
    logger.info("Population already attempted in this process, skipping");
    return;
  }

  // Mark that we've attempted population in this process
  populationAttempted = true;

  const db = await database.getDb();
  const mockDataCollection = db.collection("mock_data_execution");

  try {
    // Try to create the flag document with a unique index
    // This will fail if another process has already created it
    const result = await mockDataCollection.updateOne(
      { _id: new ObjectId("000000000000000000000001") },
      {
        $setOnInsert: {
          executed: true,
          timestamp: Math.floor(Date.now() / 1000),
          instance: `instance-${Math.random().toString(36).substring(2, 15)}`,
        },
      },
      { upsert: true },
    );

    // If the document was not inserted (upserted), it already exists
    if (result.upsertedCount === 0) {
      logger.info("Mock data flag already exists, skipping execution");
      return;
    }

    const userId = "storm_preview_user";
    logger.info(`Starting mock data population for ${userId}...`);

    // If we get here, we're the first to create the flag document
    // Now proceed with actual data insertion
    const client = await database.getClient();
    const session = await client.startSession();

    try {
      await session.withTransaction(async () => {
        await insertMockData(db, session);

        // Update the flag to mark successful completion
        await mockDataCollection.updateOne(
          { _id: new ObjectId("000000000000000000000001") },
          {
            $set: {
              completed: true,
              completedTimestamp: Math.floor(Date.now() / 1000),
            },
          },
          { session },
        );

        logger.info("Successfully populated mock data");
      });
    } catch (error) {
      logger.error("Failed to populate mock data during transaction:", error);

      // Mark the flag as failed so we can retry next time
      try {
        await mockDataCollection.updateOne(
          { _id: new ObjectId("000000000000000000000001") },
          {
            $set: {
              failed: true,
              failedTimestamp: Math.floor(Date.now() / 1000),
              error: (error as Error).toString(),
            },
          },
        );
      } catch (updateError) {
        logger.error("Failed to update error state:", updateError);
      }

      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    // Handle DuplicateKey errors gracefully - this means another process beat us to it
    if ((error as any).code === 11000) {
      logger.info("Another process is handling population, skipping");
      return;
    }

    logger.error("Failed to initialize mock data population:", error);
    throw error;
  }
}

// never change this!
export default populate_with_mock_data;
