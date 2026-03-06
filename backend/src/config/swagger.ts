import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Task Manager API',
            version: '1.0.0',
            description:
                'A scalable REST API with JWT authentication and role-based access control. Built with Node.js, Express, TypeScript, and PostgreSQL.',
            contact: {
                name: 'API Support',
                email: 'support@taskmanager.com',
            },
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: 'cld1234abc' },
                        name: { type: 'string', example: 'Alice Smith' },
                        email: { type: 'string', example: 'alice@example.com' },
                        role: { type: 'string', enum: ['USER', 'ADMIN'], example: 'USER' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Task: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: 'clx9876xyz' },
                        title: { type: 'string', example: 'Fix login bug' },
                        description: { type: 'string', example: 'The login page throws 500 on wrong password' },
                        status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'DONE'], example: 'TODO' },
                        userId: { type: 'string', example: 'cld1234abc' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                AuthResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string', example: 'Login successful' },
                        data: {
                            type: 'object',
                            properties: {
                                token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                                user: { $ref: '#/components/schemas/User' },
                            },
                        },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string', example: 'Something went wrong' },
                        errors: { type: 'array', items: { type: 'object' } },
                    },
                },
            },
        },
    },
    apis: ['./src/routes/v1/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
