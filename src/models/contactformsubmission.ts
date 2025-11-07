import { Collection, Db, ObjectId } from 'mongodb';
import { database } from '../utils/database';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

/**
 * Represents a contact form submission.
 * Stored in the database.
 */
export class ContactFormSubmission {
  private static readonly COLLECTION_NAME = 'contact_form_submissions';

  public id: string; // Unique identifier for the submission (UUID)
  public name: string; // The name of the person submitting the form
  public email: string; // The email address of the person submitting the form
  public message: string; // The message or inquiry from the user
  private _mongo_id?: ObjectId; // MongoDB's internal _id

  constructor(
    id: string,
    name: string,
    email: string,
    message: string,
    _mongo_id?: ObjectId,
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.message = message;
    this._mongo_id = _mongo_id;
  }

  /**
   * Converts a MongoDB document to a ContactFormSubmission instance.
   * @param doc The MongoDB document.
   * @returns A ContactFormSubmission instance, or null if the document is invalid.
   */
  static fromDocument(doc: any): ContactFormSubmission | null {
    if (!doc) {
      return null;
    }
    // Ensure all required fields exist
    if (typeof doc.id !== 'string' || typeof doc.name !== 'string' || typeof doc.email !== 'string' || typeof doc.message !== 'string') {
      logger.warn('Invalid document structure for ContactFormSubmission:', doc);
      return null;
    }
    return new ContactFormSubmission(
      doc.id,
      doc.name,
      doc.email,
      doc.message,
      doc._id instanceof ObjectId ? doc._id : undefined,
    );
  }

  /**
   * Converts the ContactFormSubmission instance to a MongoDB document.
   * @returns A plain object suitable for MongoDB insertion/update.
   */
  toDocument(): Omit<ContactFormSubmission, '_mongo_id'> {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      message: this.message,
    };
  }

  /**
   * Gets the MongoDB collection for ContactFormSubmission.
   * @returns The MongoDB collection.
   */
  private static async getCollection(): Promise<Collection<any>> {
    const db: Db = await database.getDb();
    return db.collection(ContactFormSubmission.COLLECTION_NAME);
  }

  /**
   * Creates a new contact form submission in the database.
   * @param name The name of the person submitting the form.
   * @param email The email address of the person submitting the form.
   * @param message The message or inquiry from the user.
   * @returns The created ContactFormSubmission instance, or null if creation failed.
   */
  static async create(name: string, email: string, message: string): Promise<ContactFormSubmission | null> {
    try {
      const collection = await ContactFormSubmission.getCollection();
      const newSubmission = new ContactFormSubmission(uuidv4(), name, email, message);
      const result = await collection.insertOne(newSubmission.toDocument());

      if (result.acknowledged) {
        // Re-fetch to ensure _id is correctly populated if needed, or simply assign it
        newSubmission._mongo_id = result.insertedId;
        return newSubmission;
      }
      logger.error('Failed to insert contact form submission:', newSubmission);
      return null;
    } catch (error) {
      logger.error('Error creating contact form submission:', error);
      return null;
    }
  }

  /**
   * Finds a contact form submission by its business ID.
   * @param id The unique identifier (UUID) of the submission.
   * @returns The ContactFormSubmission instance, or null if not found.
   */
  static async findById(id: string): Promise<ContactFormSubmission | null> {
    try {
      const collection = await ContactFormSubmission.getCollection();
      const doc = await collection.findOne({ id: id });
      return ContactFormSubmission.fromDocument(doc);
    } catch (error) {
      logger.error(`Error finding contact form submission by id ${id}:`, error);
      return null;
    }
  }

  /**
   * Updates an existing contact form submission.
   * @param id The unique identifier (UUID) of the submission to update.
   * @param updateFields An object containing the fields to update.
   * @returns The updated ContactFormSubmission instance, or null if not found or update failed.
   */
  static async update(id: string, updateFields: Partial<Omit<ContactFormSubmission, 'id' | '_mongo_id'>>): Promise<ContactFormSubmission | null> {
    try {
      const collection = await ContactFormSubmission.getCollection();
      const result = await collection.findOneAndUpdate(
        { id: id },
        { $set: updateFields },
        { returnDocument: 'after' }
      );

      // MongoDB v6 findOneAndUpdate returns the document directly
      if (result) {
        return ContactFormSubmission.fromDocument(result);
      }
      logger.warn(`Contact form submission with id ${id} not found for update.`);
      return null;
    } catch (error) {
      logger.error(`Error updating contact form submission with id ${id}:`, error);
      return null;
    }
  }

  /**
   * Deletes a contact form submission by its business ID.
   * @param id The unique identifier (UUID) of the submission to delete.
   * @returns True if the submission was deleted, false otherwise.
   */
  static async delete(id: string): Promise<boolean> {
    try {
      const collection = await ContactFormSubmission.getCollection();
      const result = await collection.deleteOne({ id: id });
      if (result.deletedCount === 0) {
        logger.warn(`Contact form submission with id ${id} not found for deletion.`);
      }
      return result.deletedCount === 1;
    } catch (error) {
      logger.error(`Error deleting contact form submission with id ${id}:`, error);
      return false;
    }
  }
}
