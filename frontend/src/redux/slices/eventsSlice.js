// src/redux/slices/eventsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getEvents, createEvent, updateEvent, deleteEvent, likeEvent, addCommentToEvent } from '../../services/eventService'; // Предполагаемые API-сервисы

export const fetchEvents = createAsyncThunk(
    'events/fetchEvents',
    async (params, { rejectWithValue }) => {
        try {
            const response = await getEvents(params); // params могут содержать pagination, filter, sort
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const addEvent = createAsyncThunk(
    'events/addEvent',
    async (eventData, { rejectWithValue }) => {
        try {
            const response = await createEvent(eventData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const editEvent = createAsyncThunk(
    'events/editEvent',
    async ({ id, eventData }, { rejectWithValue }) => {
        try {
            const response = await updateEvent(id, eventData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const removeEvent = createAsyncThunk(
    'events/removeEvent',
    async (id, { rejectWithValue }) => {
        try {
            await deleteEvent(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const toggleLikeEvent = createAsyncThunk(
    'events/toggleLikeEvent',
    async ({ eventId, userId }, { rejectWithValue }) => {
        try {
            const response = await likeEvent(eventId, userId); // API для лайка/дизлайка
            return response.data; // Обновленное событие
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const addEventComment = createAsyncThunk(
    'events/addEventComment',
    async ({ eventId, commentData }, { rejectWithValue }) => {
        try {
            const response = await addCommentToEvent(eventId, commentData);
            return response.data; // Обновленное событие или просто комментарий
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const eventsSlice = createSlice({
    name: 'events',
    initialState: {
        list: [],
        status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
        error: null,
        pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
        }
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchEvents.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchEvents.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.list = action.payload.events; // Предполагается, что данные приходят как { events: [], total: ... }
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchEvents.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(addEvent.fulfilled, (state, action) => {
                state.list.push(action.payload);
            })
            .addCase(editEvent.fulfilled, (state, action) => {
                const index = state.list.findIndex(event => event.id === action.payload.id);
                if (index !== -1) {
                    state.list[index] = action.payload;
                }
            })
            .addCase(removeEvent.fulfilled, (state, action) => {
                state.list = state.list.filter(event => event.id !== action.payload);
            })
            .addCase(toggleLikeEvent.fulfilled, (state, action) => {
                const index = state.list.findIndex(event => event.id === action.payload.id);
                if (index !== -1) {
                    state.list[index].likes = action.payload.likes; // Предполагается, что API возвращает обновленное событие
                }
            })
            .addCase(addEventComment.fulfilled, (state, action) => {
                const index = state.list.findIndex(event => event.id === action.payload.eventId);
                if (index !== -1) {
                    state.list[index].comments.push(action.payload.comment); // Или обновленное событие с новым комментарием
                }
            });
    },
});

export default eventsSlice.reducer;