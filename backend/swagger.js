const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Eventure API',
      version: '1.0.0',
      description: 'Event booking and management platform API',
      contact: {
        name: 'API Support',
        email: 'support@eventure.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://api.eventure.com',
        description: 'Production server',
      },
    ],
    components: {
      schemas: {
        Event: {
          type: 'object',
          required: ['title', 'date', 'location', 'price', 'description', 'email', 'selectedCategory'],
          properties: {
            _id: {
              type: 'string',
              description: 'Event ID',
            },
            title: {
              type: 'string',
              description: 'Event title',
            },
            date: {
              type: 'string',
              format: 'date',
              description: 'Event date',
            },
            location: {
              type: 'string',
              description: 'Event location',
            },
            price: {
              type: 'number',
              description: 'Ticket price',
            },
            capacity: {
              type: 'number',
              nullable: true,
              description: 'Maximum attendees (null = unlimited)',
            },
            attendees: {
              type: 'number',
              description: 'Current number of attendees',
            },
            description: {
              type: 'string',
              description: 'Event description',
            },
            image: {
              type: 'string',
              description: 'Event image URL',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Organizer email',
            },
            selectedCategory: {
              type: 'object',
              properties: {
                label: { type: 'string' },
                value: { type: 'string' },
              },
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Booking: {
          type: 'object',
          required: ['name', 'email', 'quantity', 'totalPrice', 'eventId', 'eventTitle'],
          properties: {
            _id: {
              type: 'string',
              description: 'Booking ID',
            },
            name: {
              type: 'string',
              description: 'Customer name',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Customer email',
            },
            quantity: {
              type: 'number',
              minimum: 1,
              description: 'Number of tickets',
            },
            totalPrice: {
              type: 'number',
              description: 'Total price paid',
            },
            eventId: {
              type: 'string',
              description: 'Associated event ID',
            },
            eventTitle: {
              type: 'string',
              description: 'Event title',
            },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'cancelled'],
              description: 'Booking status',
            },
            paymentIntentId: {
              type: 'string',
              description: 'Stripe payment intent ID',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message',
            },
            error: {
              type: 'string',
              description: 'Error details',
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: {
              type: 'number',
              description: 'Current page number',
            },
            limit: {
              type: 'number',
              description: 'Items per page',
            },
            total: {
              type: 'number',
              description: 'Total number of items',
            },
            pages: {
              type: 'number',
              description: 'Total number of pages',
            },
            hasMore: {
              type: 'boolean',
              description: 'Whether more items exist',
            },
          },
        },
      },
    },
  },
  apis: ['./controllers/*.js', './index.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = swaggerDocs;
