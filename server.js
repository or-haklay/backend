// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const {startBaileysBot} = require('./services/baileysBot');
const userRouter = require('./routes/userRoutes');
const apartmentRouter = require('./routes/apartmentRoutes');
// אתחול אפליקציית Express
const app = express();

// מידלוורים (Middlewares)
app.use(cors()); // מאפשר לריאקט להתחבר לשרת בהמשך
app.use(express.json()); // מאפשר קבלת JSON בבקשות

// התחברות לדאטה בייס
connectDB();

// הפעלת בוט הוואטסאפ
startBaileysBot();

// ראוטים
app.use('/api/users', userRouter);
app.use('/api/apartments', apartmentRouter);
// ראוט בדיקה פשוט (לוודא שהשרת חי)
app.get('/', (req, res) => {
  res.send('Master Splitter Server is running 🐀🍕');
});


// --- הפעלת השרת ---
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`   Waiting for WhatsApp QR code...`);
});

// טיפול ב-shutdown נקי של השרת
// (ה-WhatsApp client מטופל ב-whatsappBot.js)
const gracefulShutdown = async (signal) => {
    console.log(`\n🛑 Received ${signal}, shutting down server...`);
    
    // סגירת השרת
    server.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
    });
    
    // timeout למקרה שהשרת לא נסגר
    setTimeout(() => {
        console.error('⚠️ Forced shutdown after timeout');
        process.exit(1);
    }, 10000);
};

// טיפול ב-SIGINT (Ctrl+C) - ה-WhatsApp client מטופל ב-whatsappBot.js
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// טיפול ב-SIGTERM (kill command)
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// טיפול בשגיאות לא מטופלות
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('unhandledRejection');
});