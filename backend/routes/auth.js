const express = require('express');
const User = require('../models/User'); // Подключаем модель пользователя
const { protect } = require('../middleware/authMiddleware'); // Подключаем middleware для защиты маршрутов
const crypto = require('crypto'); // Встроенный модуль Node.js для криптографии
const nodemailer = require('nodemailer'); // Для отправки писем
const jwt = require('jsonwebtoken'); // Убедитесь, что jwt импортирован

// !!! ВАЖНО: Эта строка должна быть в самом начале файла, после импортов !!!
const router = express.Router();

// Вспомогательная функция для генерации JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION, // Время жизни токена
    });
};

// Вспомогательная функция для отправки email
const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_PORT == 465,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        html: options.message,
    };

    await transporter.sendMail(mailOptions);
};

// @route   POST /api/auth/register
// @desc    Регистрация пользователя
// @access  Public
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const user = await User.create({ name, email, password });
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            message: 'Регистрация успешна!',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка регистрации' });
    }
});

// @route   POST /api/auth/login
// @desc    Вход пользователя
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Неверный email или пароль' });
        }
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Неверный email или пароль' });
        }
        // ИСПРАВЛЕНО: Используем generateToken вместо user.getSignedJwtToken()
        const token = generateToken(user._id);
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token, // Отправляем токен фронтенду
        });
    } catch (error) {
        console.error(error); // Выводим ошибку в консоль бэкенда
        res.status(500).json({ message: 'Ошибка входа' });
    }
});

// @route   POST /api/auth/forgot-password
// @desc    Request password reset link
// @access  Public
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Пользователь с таким email не найден.' });
        }

        const resetToken = user.getResetPasswordToken(); // Этот метод должен быть в модели User
        await user.save({ validateBeforeSave: false }); // Сохраняем токен и срок действия без валидации

        const resetUrl = `${req.protocol}://${process.env.FRONTEND_URL || req.get('host')}/reset-password/${resetToken}`;

        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject: 'Сброс пароля для Cultural Events App',
            html: `
                <h1>Запрос на сброс пароля</h1>
                <p>Вы запросили сброс пароля. Пожалуйста, перейдите по этой ссылке, чтобы сбросить пароль:</p>
                <a href="${resetUrl}">${resetUrl}</a>
                <p>Эта ссылка будет действительна в течение 1 часа.</p>
                <p>Если вы не запрашивали сброс пароля, проигнорируйте это письмо.</p>
            `,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Ссылка для сброса пароля отправлена на ваш email.' });

    } catch (error) {
        console.error(error);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        res.status(500).json({ message: 'Ошибка сервера при отправке письма для сброса пароля.' });
    }
});

// @route   PUT /api/auth/reset-password/:resettoken
// @desc    Reset user password using token
// @access  Public
router.put('/reset-password/:resettoken', async (req, res) => {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');
    const { password } = req.body;

    try {
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Неверный или просроченный токен сброса пароля.' });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({ message: 'Пароль успешно сброшен.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера при сбросе пароля.' });
    }
});

// @route   PUT /api/auth/update-password
// @desc    Update user password (authenticated)
// @access  Private
router.put('/update-password', protect, async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден.' });
        }

        const isMatch = await user.matchPassword(oldPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Неверный старый пароль.' });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: 'Пароль успешно обновлен.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера при обновлении пароля.' });
    }
});

module.exports = router; // Экспортируем настроенный роутер
