const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Для хеширования паролей

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true // Email должен быть уникальным
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'], // Роли пользователя: 'user' или 'admin'
        default: 'user' // По умолчанию пользователь имеет роль 'user'
    },
    avatar: {
        type: String // Поле для URL или пути к аватару пользователя
    },
    createdAt: {
        type: Date,
        default: Date.now // Автоматически устанавливается дата создания
    }
});

// Middleware Mongoose: хешируем пароль перед сохранением пользователя
UserSchema.pre('save', async function (next) {
    // Если пароль не был изменен, переходим к следующему middleware
    if (!this.isModified('password')) {
        next();
    }
    // Генерируем "соль" (случайные данные для хеширования)
    const salt = await bcrypt.genSalt(10);
    // Хешируем пароль с использованием сгенерированной соли
    this.password = await bcrypt.hash(this.password, salt);
    next(); // Переходим к следующему middleware или сохранению
});

// Метод для экземпляра модели: сравнивает введенный пароль с хешированным
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Экспортируем модель User
module.exports = mongoose.model('User', UserSchema);