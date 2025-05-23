import React, { createContext, useState, useContext, useEffect } from 'react';
import API from '../api'; // Импортируем настроенный Axios

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Проверяем localStorage при загрузке приложения
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    // Добавляем isAdmin для удобства
    const isAdmin = user?.role === 'admin';

    const login = async (email, password) => {
        try {
            const res = await API.post('/auth/login', { email, password });
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data)); // Сохраняем пользователя в localStorage
            return true; // Успешный вход
        } catch (error) {
            console.error('Login failed:', error.response?.data?.message || error.message);
            throw new Error(error.response?.data?.message || 'Ошибка входа');
        }
    };

    const register = async (name, email, password) => {
        try {
            const res = await API.post('/auth/register', { name, email, password });
            // При регистрации обычно не происходит автоматический вход,
            // но можно настроить бэкенд, чтобы он возвращал токен
            // Для простоты, после регистрации пользователь должен будет войти
            return true; // Успешная регистрация
        } catch (error) {
            console.error('Registration failed:', error.response?.data?.message || error.message);
            throw new Error(error.response?.data?.message || 'Ошибка регистрации');
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user'); // Удаляем данные пользователя из localStorage
    };

    // НОВЫЕ ФУНКЦИИ ДЛЯ СБРОСА ПАРОЛЯ
    const forgotPassword = async (email) => {
        try {
            const res = await API.post('/auth/forgot-password', { email });
            return res.data.message; // Возвращаем сообщение об успехе
        } catch (error) {
            console.error('Forgot password failed:', error.response?.data?.message || error.message);
            throw new Error(error.response?.data?.message || 'Ошибка запроса сброса пароля');
        }
    };

    const resetPassword = async (token, newPassword) => {
        try {
            const res = await API.put(`/auth/reset-password/${token}`, { password: newPassword });
            return res.data.message; // Возвращаем сообщение об успехе
        } catch (error) {
            console.error('Reset password failed:', error.response?.data?.message || error.message);
            throw new Error(error.response?.data?.message || 'Ошибка сброса пароля');
        }
    };

    // ВОЗВРАЩЕННАЯ ФУНКЦИЯ ДЛЯ ОБНОВЛЕНИЯ ПАРОЛЯ АВТОРИЗОВАННОГО ПОЛЬЗОВАТЕЛЯ
    const updatePassword = async (oldPassword, newPassword) => {
        try {
            // Этот маршрут находится в auth.js (PUT /api/auth/update-password)
            const res = await API.put('/auth/update-password', { oldPassword, newPassword });
            return res.data.message; // Возвращаем сообщение об успехе
        } catch (error) {
            console.error('Update password failed:', error.response?.data?.message || error.message);
            throw new Error(error.response?.data?.message || 'Ошибка обновления пароля');
        }
    };


    const value = {
        user,
        loading,
        isAdmin,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        updatePassword, // ВОЗВРАЩЕНО
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children} {/* Отображаем дочерние элементы после загрузки */}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
