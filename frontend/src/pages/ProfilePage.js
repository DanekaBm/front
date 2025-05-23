import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api';

function ProfilePage() {
  const { user, logout } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) { // Если нет пользователя в контексте, не пытаемся загрузить профиль
        setLoading(false);
        return;
      }
      try {
        const res = await API.get('/users/profile'); // Токен добавится через интерсептор
        setProfileData(res.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Не удалось загрузить профиль.');
        setLoading(false);
        console.error('Ошибка загрузки профиля:', err.response?.data || err.message);
        if (err.response?.status === 401) {
          logout(); // Разлогиниваем, если токен недействителен
        }
      }
    };

    fetchProfile();
  }, [user, logout]); // Зависимости: user и logout, чтобы эффект запускался при их изменении

  if (loading) return <p>Загрузка профиля...</p>;
  if (error) return <p>Ошибка: {error}</p>;
  if (!user) return <p>Пожалуйста, войдите, чтобы просмотреть профиль.</p>; // Если user null, но загрузка завершена

  return (
    <div>
      <h2>Мой Профиль</h2>
      {profileData ? (
        <>
          <p>Имя: {profileData.name}</p>
          <p>Email: {profileData.email}</p>
          <p>Роль: {profileData.role}</p>
          {/* Добавьте другие поля профиля, если они есть */}
        </>
      ) : (
        <p>Данные профиля не найдены.</p>
      )}
    </div>
  );
}

export default ProfilePage;