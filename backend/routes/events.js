const express = require('express');
const Event = require('../models/Event'); // Подключаем модель события
const { protect, authorizeRoles } = require('../middleware/authMiddleware'); // Подключаем middleware

const router = express.Router();

// @route   GET /api/events
// @desc    Получить все события с пагинацией, фильтрацией, сортировкой
// @access  Public (доступно всем)
router.get('/', async (req, res) => {
    // Параметры для пагинации
    const pageSize = parseInt(req.query.limit) || 10; // Сколько элементов на странице (по умолчанию 10)
    const page = parseInt(req.query.page) || 1; // Номер текущей страницы (по умолчанию 1)

    // Параметры для поиска по ключевому слову (title, description, location)
    const keyword = req.query.keyword ? {
        $or: [ // Используем $or для поиска по нескольким полям
            { title: { $regex: req.query.keyword, $options: 'i' } }, // $regex для поиска по шаблону, $options: 'i' для регистронезависимого поиска
            { description: { $regex: req.query.keyword, $options: 'i' } },
            { location: { $regex: req.query.keyword, $options: 'i' } },
        ]
    } : {};

    // Параметры для фильтрации по категории
    const category = req.query.category ? { category: req.query.category } : {};

    // Параметры для сортировки
    const sort = req.query.sort || 'createdAt'; // Поле для сортировки (по умолчанию по дате создания)
    const order = req.query.order === 'asc' ? 1 : -1; // Порядок сортировки (1 для возрастания, -1 для убывания)

    try {
        // Подсчитываем общее количество документов, соответствующих фильтрам
        const count = await Event.countDocuments({ ...keyword, ...category });
        // Находим события, применяем фильтры, сортировку, пагинацию
        const events = await Event.find({ ...keyword, ...category })
            .sort({ [sort]: order }) // Сортировка по полю и порядку
            .limit(pageSize) // Ограничиваем количество результатов на странице
            .skip(pageSize * (page - 1)) // Пропускаем нужное количество документов для текущей страницы
            .populate('createdBy', 'name email') // Загружаем (populate) имя и email создателя
            .populate('comments.user', 'name'); // Загружаем имя пользователя, оставившего комментарий

        res.json({
            events,
            page,
            pages: Math.ceil(count / pageSize), // Общее количество страниц
            total: count // Общее количество элементов
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// @route   GET /api/events/:id
// @desc    Получить событие по ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('comments.user', 'name');

        if (event) {
            res.json(event);
        } else {
            res.status(404).json({ message: 'Событие не найдено' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// @route   POST /api/events
// @desc    Создать новое событие
// @access  Private (требует JWT)
router.post('/', protect, async (req, res) => {
    const { title, description, date, location, category } = req.body;

    try {
        const event = new Event({
            title,
            description,
            date,
            location,
            category,
            createdBy: req.user._id // Создатель события - текущий аутентифицированный пользователь
        });

        const createdEvent = await event.save();
        res.status(201).json(createdEvent); // 201 Created
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// @route   PUT /api/events/:id
// @desc    Обновить событие
// @access  Private (только создатель события или админ)
router.put('/:id', protect, async (req, res) => {
    const { title, description, date, location, category } = req.body;

    try {
        const event = await Event.findById(req.params.id);

        if (event) {
            // Проверка прав: только создатель события или пользователь с ролью 'admin' может обновить
            if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Недостаточно прав для обновления этого события' });
            }

            // Обновляем поля, только если они предоставлены
            event.title = title || event.title;
            event.description = description || event.description;
            event.date = date || event.date;
            event.location = location || event.location;
            event.category = category || event.category;

            const updatedEvent = await event.save();
            res.json(updatedEvent);
        } else {
            res.status(404).json({ message: 'Событие не найдено' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// @route   DELETE /api/events/:id
// @desc    Удалить событие
// @access  Private (только создатель события или админ)
router.delete('/:id', protect, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (event) {
            // Проверка прав: только создатель события или пользователь с ролью 'admin' может удалить
            if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Недостаточно прав для удаления этого события' });
            }

            await event.deleteOne(); // Используем deleteOne() для удаления документа
            res.json({ message: 'Событие удалено' });
        } else {
            res.status(404).json({ message: 'Событие не найдено' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// @route   POST /api/events/:id/like
// @desc    Поставить/убрать лайк событию
// @access  Private
router.post('/:id/like', protect, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Событие не найдено' });
        }

        const userId = req.user._id;
        const hasLiked = event.likes.includes(userId);

        if (hasLiked) {
            event.likes = event.likes.filter(id => id.toString() !== userId.toString());
        } else {
            event.likes.push(userId);
        }

        await event.save();
        res.json({ message: 'Лайк обновлен', likes: event.likes.length });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// @route   POST /api/events/:id/comment
// @desc    Добавить комментарий к событию
// @access  Private
router.post('/:id/comment', protect, async (req, res) => {
    const { text } = req.body;
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Событие не найдено' });
        }

        const newComment = {
            user: req.user._id,
            text: text,
        };

        event.comments.push(newComment);
        await event.save();

        // Отправляем обратно обновленное событие с "популированным" комментарием
        const updatedEvent = await Event.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('comments.user', 'name'); // Загружаем имя комментатора для ответа

        const lastComment = updatedEvent.comments[updatedEvent.comments.length - 1]; // Получить последний добавленный комментарий

        res.status(201).json({ message: 'Комментарий добавлен', comment: lastComment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

module.exports = router;