// frontend/src/api.js
import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5001/api', // Базовый URL для вашего бэкенда API
    headers: {
        'Content-Type': 'application/json',
    },
});

// Добавляем интерсептор для автоматического добавления токена к запросам
API.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('user')); // Получаем пользователя из localStorage
    if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default API;