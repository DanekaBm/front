import React, { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';

function EventListPage() {
  const { user } = useAuth(); // Чтобы знать, авторизован ли пользователь
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await API.get('/events'); // Получаем все события
        setEvents(res.data.events);
        setLoading(false);
      } catch (err) {
        setError('Не удалось загрузить события.');
        setLoading(false);
        console.error('Ошибка загрузки событий:', err.response?.data || err.message);
      }
    };
    fetchEvents();
  }, []);

  if (loading) return <p>Загрузка событий...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Список Событий</h2>
      {events.length === 0 ? (
        <p>Пока нет событий.</p>
      ) : (
        <ul>
          {events.map((event) => (
            <li key={event._id}>
              <h3>{event.title}</h3>
              <p>{event.description}</p>
              <p>Дата: {new Date(event.date).toLocaleDateString()} {new Date(event.date).toLocaleTimeString()}</p>
              <p>Место: {event.location}</p>
              <p>Категория: {event.category}</p>
              <p>Создатель: {event.createdBy ? event.createdBy.name : 'Неизвестно'}</p>
              <p>Лайки: {event.likes ? event.likes.length : 0}</p>
              {/* Добавьте кнопки для лайков/комментариев/удаления/редактирования, если нужно */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default EventListPage;