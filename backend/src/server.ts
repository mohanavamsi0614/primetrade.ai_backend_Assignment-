import 'dotenv/config';
import app from './app';
import { prisma } from './config/database';

const PORT = process.env.PORT || 5000;

async function main() {
    try {
        await prisma.$connect();
        console.log('✅ Database connected successfully');

        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📚 Swagger docs at http://localhost:${PORT}/api/v1/docs`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

main();

// Graceful shutdown
process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    process.exit(0);
});
