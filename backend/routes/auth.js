const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Подключаем модель пользователя

const router = express.Router(); // Создаем роутер Express

// Вспомогательная функция для генерации JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION, // Время жизни токена
    });
};

// @route   POST /api/auth/register
// @desc    Регистрация нового пользователя
// @access  Public (доступен без аутентификации)
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body; // Получаем данные из тела запроса

    try {
        // Проверяем, существует ли пользователь с таким email
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
        }

        // Создаем нового пользователя
        user = await User.create({
            name,
            email,
            password, // Пароль будет автоматически хеширован благодаря middleware в модели User
        });

        // Отправляем успешный ответ с данными пользователя и токеном
        res.status(201).json({ // 201 Created
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id), // Генерируем и отправляем JWT
        });

    } catch (error) {
        console.error(error); // Выводим ошибку в консоль сервера
        res.status(500).json({ message: 'Ошибка сервера' }); // Отправляем общую ошибку
    }
});

// @route   POST /api/auth/login
// @desc    Вход пользователя
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body; // Получаем email и пароль

    try {
        // Находим пользователя по email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Неверные учетные данные' });
        }

        // Сравниваем введенный пароль с хешированным паролем пользователя
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Неверные учетные данные' });
        }

        // Отправляем успешный ответ с данными пользователя и токеном
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

module.exports = router;