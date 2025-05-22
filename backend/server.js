require('dotenv').config(); // Загружает переменные окружения из .env
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db.js'); // Подключаем функцию для работы с БД

// Импорт файлов маршрутов (роутов)
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const eventRoutes = require('./routes/events');

const app = express(); // Создаем экземпляр Express-приложения

// Подключение к базе данных
connectDB();

// Middleware (промежуточное ПО)
app.use(express.json()); // Для парсинга JSON-тел запросов (чтобы req.body был доступен)
app.use(cors()); // Включаем CORS для всех запросов (важно для взаимодействия с фронтендом)

// Главный (тестовый) роут для проверки работы сервера
app.get('/', (req, res) => {
    res.send('API культурных событий работает!');
});

// Подключение роутов API
// Все запросы к /api/auth будут обрабатываться authRoutes
app.use('/api/auth', authRoutes);
// Все запросы к /api/users будут обрабатываться userRoutes
app.use('/api/users', userRoutes);
// Все запросы к /api/events будут обрабатываться eventRoutes
app.use('/api/events', eventRoutes);

// Запуск сервера на указанном порту
const PORT = process.env.PORT || 5000; // Используем порт из .env или 5000 по умолчанию

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});