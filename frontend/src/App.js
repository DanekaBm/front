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

function App() {
  const { user, logout } = useAuth(); // Получаем состояние пользователя и функцию выхода
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Выходим из системы
    navigate('/login'); // Перенаправляем на страницу входа
  };

  return (
    <div className="App">
      <nav>
        <ul>
          <li><Link to="/">Главная</Link></li>
          {!user ? ( // Если пользователь не авторизован
            <>
              <li><Link to="/register">Регистрация</Link></li>
              <li><Link to="/login">Вход</Link></li>
            </>
          ) : ( // Если пользователь авторизован
            <>
              <li><Link to="/profile">Профиль</Link></li>
              <li><Link to="/events">События</Link></li>
              <li><Link to="/events/create">Создать событие</Link></li>
              <li><button onClick={handleLogout}>Выход ({user.name})</button></li>
            </>
          )}
        </ul>
      </nav>

      <div className="content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          {user && ( // Защищенные маршруты: только для авторизованных пользователей
            <>
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/events" element={<EventListPage />} />
              <Route path="/events/create" element={<CreateEventPage />} />
            </>
          )}
          {/* Можно добавить маршрут для NotFound страницы */}
          <Route path="*" element={<h2>404 - Страница не найдена</h2>} />
        </Routes>
      </div>
    </div>
  );
}

export default App;