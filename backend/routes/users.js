const express = require('express');
const User = require('../models/User'); // Подключаем модель пользователя
const { protect, authorizeRoles } = require('../middleware/authMiddleware'); // Подключаем middleware

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Получить профиль текущего аутентифицированного пользователя
// @access  Private (требует JWT)
router.get('/profile', protect, (req, res) => {
    res.json(req.user); // Объект req.user содержит данные пользователя, установленные middleware 'protect'
});

// @route   PUT /api/users/profile
// @desc    Обновить профиль текущего аутентифицированного пользователя
// @access  Private
router.put('/profile', protect, async (req, res) => {
    const { name, email, password, avatar } = req.body; // Получаем данные для обновления

    try {
        const user = await User.findById(req.user._id); // Находим текущего пользователя по ID из токена

        if (user) {
            // Обновляем поля, только если они предоставлены в запросе
            user.name = name || user.name;
            user.email = email || user.email;
            user.avatar = avatar || user.avatar;

            // Если предоставлен новый пароль, обновляем его
            if (password) {
                user.password = password; // Middleware 'pre' в модели User позаботится о хешировании
            }

            const updatedUser = await user.save(); // Сохраняем изменения

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                avatar: updatedUser.avatar,
            });
        } else {
            res.status(404).json({ message: 'Пользователь не найден' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// @route   GET /api/users
// @desc    Получить список всех пользователей (доступно только для админов)
// @access  Private/Admin
router.get('/', protect, authorizeRoles('admin'), async (req, res) => {
    try {
        const users = await User.find({}).select('-password'); // Находим всех пользователей, исключая пароли
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// @route   DELETE /api/users/:id
// @desc    Удалить пользователя по ID (доступно только для админов)
// @access  Private/Admin
router.delete('/:id', protect, authorizeRoles('admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id); // Находим пользователя по ID из URL

        if (user) {
            await user.deleteOne(); // Удаляем пользователя
            res.json({ message: 'Пользователь удален' });
        } else {
            res.status(404).json({ message: 'Пользователь не найден' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

module.exports = router;