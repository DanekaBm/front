const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    // Связь с моделью User: кто создал это событие
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Ссылка на модель 'User'
        required: true
    },
    likes: {
        type: [mongoose.Schema.Types.ObjectId], // Массив ID пользователей, которые "лайкнули" событие
        ref: 'User',
        default: []
    },
    comments: [ // Массив встроенных документов для комментариев
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            text: {
                type: String,
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Event', EventSchema);