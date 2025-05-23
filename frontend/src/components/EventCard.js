// src/components/EventCard.js
import React from 'react';
import { Link } from 'react-router-dom';

const EventCard = ({ event }) => {
    return (
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', width: '300px' }}>
            <h3>{event.name}</h3>
            <p>{event.description}</p>
            <p>Дата: {new Date(event.date).toLocaleDateString()}</p>
            <Link to={`/events/${event.id}`}>Подробнее</Link>
        </div>
    );
};

export default EventCard;