import { ObjectId } from 'mongodb';
/**
 * Represents a contact form submission.
 * Stored in the database.
 */
export declare class ContactFormSubmission {
    private static readonly COLLECTION_NAME;
    id: string;
    name: string;
    email: string;
    message: string;
    private _mongo_id?;
    constructor(id: string, name: string, email: string, message: string, _mongo_id?: ObjectId);
    /**
     * Converts a MongoDB document to a ContactFormSubmission instance.
     * @param doc The MongoDB document.
     * @returns A ContactFormSubmission instance, or null if the document is invalid.
     */
    static fromDocument(doc: any): ContactFormSubmission | null;
    /**
     * Converts the ContactFormSubmission instance to a MongoDB document.
     * @returns A plain object suitable for MongoDB insertion/update.
     */
    toDocument(): Omit<ContactFormSubmission, '_mongo_id'>;
    /**
     * Gets the MongoDB collection for ContactFormSubmission.
     * @returns The MongoDB collection.
     */
    private static getCollection;
    /**
     * Creates a new contact form submission in the database.
     * @param name The name of the person submitting the form.
     * @param email The email address of the person submitting the form.
     * @param message The message or inquiry from the user.
     * @returns The created ContactFormSubmission instance, or null if creation failed.
     */
    static create(name: string, email: string, message: string): Promise<ContactFormSubmission | null>;
    /**
     * Finds a contact form submission by its business ID.
     * @param id The unique identifier (UUID) of the submission.
     * @returns The ContactFormSubmission instance, or null if not found.
     */
    static findById(id: string): Promise<ContactFormSubmission | null>;
    /**
     * Updates an existing contact form submission.
     * @param id The unique identifier (UUID) of the submission to update.
     * @param updateFields An object containing the fields to update.
     * @returns The updated ContactFormSubmission instance, or null if not found or update failed.
     */
    static update(id: string, updateFields: Partial<Omit<ContactFormSubmission, 'id' | '_mongo_id'>>): Promise<ContactFormSubmission | null>;
    /**
     * Deletes a contact form submission by its business ID.
     * @param id The unique identifier (UUID) of the submission to delete.
     * @returns True if the submission was deleted, false otherwise.
     */
    static delete(id: string): Promise<boolean>;
}
