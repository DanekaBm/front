import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext'; // Импортируем хук для работы с аутентификацией

// Импортируем компоненты страниц (мы создадим их ниже)
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import EventListPage from './pages/EventListPage';
import CreateEventPage from './pages/CreateEventPage'; // Для создания событий
import HomePage from './pages/HomePage'; // Простая домашняя страница

import './App.css'; // Для базовых стилей навигации

// src/App.js
// ... (imports)
import PasswordResetPage from './pages/PasswordResetPage';
import PasswordUpdatePage from './pages/PasswordUpdatePage'; // NEW

// src/App.js


import EventDetailsPage from './pages/EventDetailsPage'; // Make sure this is imported


function App() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="App">
            <nav>
                <ul>
                    <li><Link to="/">Главная</Link></li>
                    {!user ? (
                        <>
                            <li><Link to="/register">Регистрация</Link></li>
                            <li><Link to="/login">Вход</Link></li>
                            <li><Link to="/forgot-password">Забыли пароль?</Link></li>
                        </>
                    ) : (
                        <>
                            <li><Link to="/profile">Профиль</Link></li>
                            <li><Link to="/events">События</Link></li>
                            <li><Link to="/events/create">Создать событие</Link></li>
                            <li><Link to="/update-password">Изменить пароль</Link></li>
                            <li><button onClick={handleLogout}>Выход ({user.name})</button></li>
                        </>
                    )}
                </ul>
            </nav>

            <div className="content">
                <Routes>
                    <Route path="/" element={ <HomePage />} /> {/* Conditional rendering for home */}
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/forgot-password" element={<PasswordResetPage />} />
                    <Route path="/events/:id" element={<EventDetailsPage />} /> {/* Ensure this route exists */}

                    {user && (
                        <>
                            <Route path="/profile" element={<ProfilePage />} />
                            <Route path="/update-password" element={<PasswordUpdatePage />} />
                            <Route path="/events" element={<EventListPage />} />
                            <Route path="/events/create" element={<CreateEventPage />} />

                        </>
                    )}
                    <Route path="*" element={<h2>404 - Страница не найдена</h2>} />
                </Routes>
            </div>
        </div>
    );
}

//meow
export default App;