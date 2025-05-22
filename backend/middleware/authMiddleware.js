const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Подключаем модель пользователя

// Middleware для защиты маршрутов (проверка JWT)
const protect = async (req, res, next) => {
    let token;

    // Проверяем, есть ли токен в заголовке Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Извлекаем токен из заголовка (Bearer TOKEN)
            token = req.headers.authorization.split(' ')[1];

            // Верифицируем токен с использованием секретного ключа
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Находим пользователя по ID, извлеченному из токена, и исключаем пароль
            req.user = await User.findById(decoded.id).select('-password');

            // Если пользователь не найден, токен недействителен
            if (!req.user) {
                return res.status(401).json({ message: 'Не авторизован, пользователь не найден' });
            }
            next(); // Если токен валиден и пользователь найден, передаем управление следующему middleware
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Не авторизован, токен недействителен' });
        }
    }

    // Если токен отсутствует
    if (!token) {
        res.status(401).json({ message: 'Не авторизован, нет токена' });
    }
};

// Middleware для авторизации по ролям
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        // Проверяем, существует ли пользователь в req.user и имеет ли он необходимую роль
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: `Доступ запрещен. Требуется роль: ${roles.join(', ')}` });
        }
        next(); // Если роль соответствует, передаем управление следующему middleware
    };
};

module.exports = { protect, authorizeRoles };