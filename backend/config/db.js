const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB подключена успешно!');
    } catch (error) {
        console.error('Ошибка подключения к MongoDB:', error.message);
        process.exit(1); // Выход из процесса в случае ошибки подключения к БД
    }
};

module.exports = connectDB;