const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AI Chat Application API',
      version: '1.0.0',
      description: 'API documentation for the AI Chat Application with Azure OpenAI integration',
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        ChatMessage: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'The chat message content',
            },
            image: {
              type: 'string',
              format: 'binary',
              description: 'Optional image file to be attached with the message',
            },
            voice: {
              type: 'string',
              format: 'binary',
              description: 'Optional voice recording file to be attached with the message',
            },
          },
        },
        ChatResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'The AI response message',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp of the response',
            },
          },
        },
        Config: {
          type: 'object',
          properties: {
            apiKey: {
              type: 'string',
              description: 'Azure OpenAI API key',
            },
            endpoint: {
              type: 'string',
              description: 'Azure OpenAI endpoint URL',
            },
            deploymentName: {
              type: 'string',
              description: 'Azure OpenAI deployment name',
            },
            temperature: {
              type: 'number',
              minimum: 0,
              maximum: 2,
              description: 'Temperature setting for the model (0-2)',
            },
            topP: {
              type: 'number',
              minimum: 0,
              maximum: 1,
              description: 'Top P setting for the model (0-1)',
            },
          },
        },
        HealthCheck: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['ok'],
              description: 'Server status',
            },
            configured: {
              type: 'boolean',
              description: 'Whether Azure OpenAI is configured',
            },
          },
        },
      },
    },
  },
  apis: ['./server.js'], // Path to the API routes
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'AI Chat Application API',
      version: '1.0.0',
      description: 'API documentation for the AI Chat Application with Azure OpenAI integration',
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
    ],
  },
};

const specs = swaggerJsdoc(options);

module.exports = specs;