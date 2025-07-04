const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/db');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routes
const bookRoutes = require('./routes/bookRoutes');
const studentRoutes = require('./routes/studentRoutes');
const rakRoutes = require('./routes/rakRoutes');
const pinjamRoutes = require('./routes/pinjamRoutes'); // Pastikan file ini ada
const authRoutes = require('./routes/authRoutes');

app.use('/api/books', bookRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/raks', rakRoutes);
app.use('/api/pinjam', pinjamRoutes); // Route untuk peminjaman
app.use('/api/auth', authRoutes);

// Test route
app.get('/', (req, res) => {
    res.send('Library API is running...');
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// Database connection and server start
const PORT = process.env.PORT || 5000;

sequelize.sync({ force: false })
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log('Database connected');
        });
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });