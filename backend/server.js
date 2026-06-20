import dotenv from 'dotenv/config';
import app from './app.js';
import db from './db/db.js';

const PORT = process.env.PORT || 3443;

async function startServer() {
    try {
        await db.raw("SELECT 1+1 AS result");
        console.log('Database connection established successfully.');

        app.listen(PORT, () => {
            console.log(`Server is running on ${process.env.BASE_URL}`);
        })
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
    
}
startServer();