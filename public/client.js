export default class ClientAPI {
  // Helper method for common fetch operations
  async fetchJSON(endpoint, options = {}) {
    const url = `${endpoint}`;

    // Get the auth token from cookie
    const authToken = this.getCookie("storm_app_token");

    // Build headers
    const headers = {
      // Only include Content-Type for requests with body
      ...(options.body && {
        "Content-Type": "application/json",
      }),
      // Add auth header if token exists
      ...(authToken && {
        Authorization: `Bearer ${authToken}`,
      }),
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || `Request failed with status ${response.status}`,
      );
    }

    return data;
  }

  // Helper method to get cookie by name
  getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  }

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
  async createContactFormSubmission(contactFormSubmission) {
    return this.fetchJSON('/api/contact_form_submissions', {
      method: 'POST',
      body: JSON.stringify({
        name: contactFormSubmission.name,
        email: contactFormSubmission.email,
        message: contactFormSubmission.message
      })
    });
  }

  /**
   * Fetches the current storm user.
   * @async
   * @returns {Promise<{ userId: string, role: string, email: string, name: string }>} A promise that resolves to an object containing the user's ID and name, role and email.
   */
  async getCurrentAuthUser() {
    return await this.fetchJSON(`/api/storm/me`);
  }
}