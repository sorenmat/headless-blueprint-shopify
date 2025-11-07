export default class ClientAPI {
    fetchJSON(endpoint: any, options?: {}): Promise<any>;
    getCookie(name: any): string;
    /**
     * Creates a contact form submission
     *
     * Request:
     * {
     *   name: string,
     *   email: string,
     *   message: string
     * }
     *
     * Response:
     * {
     *   id: string, // UUID
     *   name: string,
     *   email: string,
     *   message: string
     * }
     *
     * @param {Object} contactFormSubmission - The contact form submission data
     * @param {string} contactFormSubmission.name - The name of the person submitting the form
     * @param {string} contactFormSubmission.email - The email address of the person submitting the form
     * @param {string} contactFormSubmission.message - The message or inquiry from the user
     * @returns {Promise<Object>} The created contact form submission with an id
     */
    createContactFormSubmission(contactFormSubmission: any): Promise<any>;
    /**
     * Fetches the current storm user.
     * @async
     * @returns {Promise<{ userId: string, role: string, email: string, name: string }>} A promise that resolves to an object containing the user's ID and name, role and email.
     */
    getCurrentAuthUser(): Promise<any>;
}
