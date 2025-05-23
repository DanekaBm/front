require('dotenv').config(); // Загружает переменные окружения из .env
const express = require('express');
const cors = require('cors');
const path = require('path'); // Модуль path для работы с путями файлов

const connectDB = require('./config/db.js'); // Подключаем функцию для работы с БД

// Импорт файлов маршрутов (роутов)
// Убедитесь, что имена файлов в папке 'routes' точно соответствуют этим именам
const authRoutes = require('./routes/auth');   // Для маршрутов аутентификации (регистрация, вход, сброс/обновление пароля)
const userRoutes = require('./routes/users');  // Для маршрутов пользователей (профиль, управление пользователями, загрузка аватара)
const eventRoutes = require('./routes/events'); // Для маршрутов событий

const app = express(); // Создаем экземпляр Express-приложения

// Подключение к базе данных MongoDB
connectDB();

// Middleware (промежуточное ПО)
// Используем express.json() для парсинга JSON-тел запросов (чтобы req.body был доступен)
app.use(express.json());
// Включаем CORS для всех запросов (важно для взаимодействия с фронтендом, если он на другом порту/домене)
app.use(cors());

// Главный (тестовый) роут для проверки работы сервера
app.get('/', (req, res) => {
    res.send('API культурных событий работает!');
});

// Подключение роутов API
// Все запросы, начинающиеся с /api/auth, будут обрабатываться authRoutes
app.use('/api/auth', authRoutes);
// Все запросы, начинающиеся с /api/users, будут обрабатываться userRoutes
app.use('/api/users', userRoutes);
// Все запросы, начинающиеся с /api/events, будут обрабатываться eventRoutes
app.use('/api/events', eventRoutes);

// Middleware для отдачи статических файлов
// Это позволяет фронтенду получать доступ к загруженным аватарам по URL /uploads/avatars/filename.jpg
// Убедитесь, что папка 'uploads' существует в корне вашего бэкенд-проекта
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Запуск сервера на указанном порту
// Используем порт из переменных окружения (.env файл) или 5001 по умолчанию
// Убедитесь, что PORT=5001 в вашем .env файле, если фронтенд ожидает 5001
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
