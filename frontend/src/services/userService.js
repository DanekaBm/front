// src/services/userService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users'; // Замените на URL вашего бэкенда

export const getUserProfile = async (userId) => {
    // В реальном приложении здесь нужен токен авторизации
    const response = await axios.get(`<span class="math-inline">\{API\_URL\}/</span>{userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
};

export const updateProfile = async (userId, profileData) => {
    const response = await axios.put(`<span class="math-inline">\{API\_URL\}/</span>{userId}`, profileData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
};

export const uploadAvatar = async (userId, avatarFile) => {
    const formData = new FormData();
    formData.append('avatar', avatarFile);

    const response = await axios.post(`<span class="math-inline">\{API\_URL\}/</span>{userId}/avatar`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data.avatarUrl; // Предполагается, что бэкенд возвращает URL аватара
};