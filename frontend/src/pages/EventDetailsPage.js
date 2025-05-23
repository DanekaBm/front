// src/pages/EventDetailsPage.js
import API from '../api'; // Убедитесь, что путь правильный относительно вашего файла
import React from 'react';
import { useParams } from 'react-router-dom';

const EventDetailsPage = () => {
    const { id } = useParams();
    return (
        <div>
            <h1>Детали события: {id}</h1>
            <p>Здесь будет подробная информация о событии.</p>
        </div>
    );
};

export default EventDetailsPage;