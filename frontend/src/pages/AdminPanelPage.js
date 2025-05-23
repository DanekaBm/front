// src/pages/AdminPanelPage.js
import API from '../api'; // Убедитесь, что путь правильный относительно вашего файла
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminPanelPage = () => {
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();

    // Если этот компонент используется как часть ProtectedRoute, эта проверка избыточна,
    // но хороша для наглядности или дополнительной защиты.
    if (!isAdmin) {
        navigate('/'); // Перенаправить, если не админ
        return null;
    }

    return (
        <div>
            <h1>Панель администратора</h1>
            <p>Добро пожаловать, администратор {user?.name}!</p>
            <nav>
                <ul>
                    <li><button onClick={() => alert('Управление пользователями')}>Управление пользователями</button></li>
                    <li><button onClick={() => alert('Управление событиями')}>Управление событиями</button></li>
                    <li><button onClick={() => alert('Статистика')}>Просмотр статистики</button></li>
                </ul>
            </nav>
            {/* Здесь будут компоненты для управления пользователями, событиями и т.д. */}
        </div>
    );
};

export default AdminPanelPage;