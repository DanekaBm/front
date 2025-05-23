// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import eventsReducer from './slices/eventsSlice';
import notificationsReducer from './slices/notificationsSlice'; // Если вы создали slice для уведомлений

const store = configureStore({
    reducer: {
        events: eventsReducer,
        notifications: notificationsReducer, // Добавьте, если используете
        // Добавьте другие редюсеры (например, users, bookings) здесь
    },
});

export default store;