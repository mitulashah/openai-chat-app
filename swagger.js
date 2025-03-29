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
        url: 'http://localhost:3002',
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
            previousMessages: {
              type: 'array',
              description: 'Previous messages in the conversation (for context)',
              items: {
                type: 'object'
              }
            }
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
            tokenUsage: {
              type: 'object',
              description: 'Token usage statistics',
              properties: {
                promptTokens: {
                  type: 'number',
                  description: 'Number of tokens used in the prompt'
                },
                completionTokens: {
                  type: 'number',
                  description: 'Number of tokens used in the completion'
                },
                totalTokens: {
                  type: 'number',
                  description: 'Total number of tokens used'
                }
              }
            }
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
            memoryMode: {
              type: 'string',
              enum: ['none', 'limited', 'full'],
              description: 'Memory mode for conversation history'
            },
            memoryLimit: {
              type: 'number',
              description: 'Number of message pairs to remember when in limited memory mode'
            },
            includeSystemMessage: {
              type: 'boolean',
              description: 'Whether to include a system message in the conversation'
            },
            systemMessage: {
              type: 'string',
              description: 'System message to include in the conversation'
            }
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
  apis: ['./server/index.js'], // Updated path to point to our new consolidated server file
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'AI Chat Application API',
      version: '1.0.0',
      description: 'API documentation for the AI Chat Application with Azure OpenAI integration',
    },
    servers: [
      {
        url: 'http://localhost:3002',
        description: 'Development server',
      },
    ],
  },
};

const specs = swaggerJsdoc(options);

module.exports = specs;