/**
 * @file Type definitions for the Eventure backend
 * @description This file contains JSDoc type definitions used throughout the application
 */

/**
 * @typedef {Object} Event
 * @property {string} _id - MongoDB ObjectId
 * @property {string} title - Event title
 * @property {Date} date - Event date
 * @property {string} location - Event location
 * @property {number} price - Ticket price
 * @property {string} description - Event description
 * @property {string} email - Organizer email
 * @property {number} attendees - Current number of attendees
 * @property {number|null} capacity - Maximum attendees (null = unlimited)
 * @property {string} [image] - Event image URL
 * @property {Category} selectedCategory - Event category
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */

/**
 * @typedef {Object} Category
 * @property {string} label - Category display name
 * @property {string} value - Category value
 */

/**
 * @typedef {Object} Booking
 * @property {string} _id - MongoDB ObjectId
 * @property {string} name - Customer name
 * @property {string} email - Customer email
 * @property {number} quantity - Number of tickets
 * @property {number} totalPrice - Total amount paid
 * @property {string} eventId - Reference to Event
 * @property {string} eventTitle - Event title (denormalized)
 * @property {('pending'|'confirmed'|'cancelled')} status - Booking status
 * @property {string} [paymentIntentId] - Stripe payment intent ID
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */

/**
 * @typedef {Object} PaginationMeta
 * @property {number} page - Current page number
 * @property {number} limit - Items per page
 * @property {number} total - Total number of items
 * @property {number} pages - Total number of pages
 * @property {boolean} hasMore - Whether more items exist
 */

/**
 * @typedef {Object} PaginatedResponse
 * @property {Array} items - Array of items (events or bookings)
 * @property {PaginationMeta} pagination - Pagination metadata
 */

/**
 * @typedef {Object} ErrorResponse
 * @property {string} message - Error message
 * @property {string} [error] - Detailed error information
 */

/**
 * @typedef {Object} SuccessResponse
 * @property {*} data - Response data
 */

module.exports = {};
