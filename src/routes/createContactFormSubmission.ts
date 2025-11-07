import type express from 'express';
import logger from '../utils/logger';
import { ContactFormSubmission } from '../models/contactformsubmission';

/**
 * Request handler for creating a new contact form submission
 */
const createContactFormSubmission = (): express.RequestHandler => {
  const handler: express.RequestHandler = async (req, res, next) => {
    try {
      logger.info('Processing contact form submission request');
      
      // Extract request body
      const { name, email, message } = req.body;
      
      // Validate required fields
      if (!name) {
        logger.warn('Contact form submission missing name field');
        res.status(400).json({ error: 'Name is required' });
        return;
      }
      
      if (!email) {
        logger.warn('Contact form submission missing email field');
        res.status(400).json({ error: 'Email is required' });
        return;
      }
      
      if (!message) {
        logger.warn('Contact form submission missing message field');
        res.status(400).json({ error: 'Message is required' });
        return;
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        logger.warn(`Invalid email format: ${email}`);
        res.status(400).json({ error: 'Invalid email format' });
        return;
      }
      
      // Create the contact form submission
      const submission = await ContactFormSubmission.create(name, email, message);
      
      if (!submission) {
        logger.error('Failed to create contact form submission');
        next(new Error('Failed to create contact form submission'));
        return;
      }
      
      // Return the created submission
      logger.info(`Contact form submission created with ID: ${submission.id}`);
      res.status(201).json({
        id: submission.id,
        name: submission.name,
        email: submission.email,
        message: submission.message
      });
      return;
      
    } catch (e) {
      logger.error('Error in contact form submission handler:', e);
      next(e);
    }
  };
  return handler;
};

export default createContactFormSubmission;
