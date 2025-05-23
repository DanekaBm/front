import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';

function CreateEventPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');

  // Перенаправляем, если пользователь не авторизован
  if (!user) {
    navigate('/login');
    return <p>Перенаправление на страницу входа...</p>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // Очищаем предыдущие сообщения

    try {
      // Форматируем дату для бэкенда (ISO string)
      const formattedDate = new Date(date).toISOString();

      await API.post('/events', { // Токен автоматически добавится из api.js
        title,
        description,
        date: formattedDate,
        location,
        category,
      });
      setMessage('Событие успешно создано!');
      // Очистить форму
      setTitle('');
      setDescription('');
      setDate('');
      setLocation('');
      setCategory('');
      // Или перенаправить на список событий
      navigate('/events');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Ошибка создания события.');
      console.error('Ошибка создания события:', error.response?.data || error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Создать Новое Событие</h2>
      <input type="text" placeholder="Название" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <textarea placeholder="Описание" value={description} onChange={(e) => setDescription(e.target.value)} required />
      <label>Дата и время:</label>
      <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required />
      <input type="text" placeholder="Место" value={location} onChange={(e) => setLocation(e.target.value)} required />
      <input type="text" placeholder="Категория" value={category} onChange={(e) => setCategory(e.target.value)} required />
      <button type="submit">Создать Событие</button>
      {message && <p>{message}</p>}
    </form>
  );
}

export default CreateEventPage;