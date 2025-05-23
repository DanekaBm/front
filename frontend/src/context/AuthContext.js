// frontend/src/context/AuthContext.js
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

    const value = {
        user,
        loading,
        login,
        register,
        logout,
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