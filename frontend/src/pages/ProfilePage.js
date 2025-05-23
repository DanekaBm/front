import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api';
import { updateProfile, uploadAvatar } from '../services/userService'; // Импортируем оставшиеся функции

function ProfilePage() {
    // Получаем updatePassword из useAuth
    const { user, logout, updatePassword } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Состояния для обновления профиля
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [profileUpdateMessage, setProfileUpdateMessage] = useState('');
    const [profileUpdateError, setProfileUpdateError] = useState('');

    // Состояния для обновления пароля
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [passwordUpdateMessage, setPasswordUpdateMessage] = useState('');
    const [passwordUpdateError, setPasswordUpdateError] = useState('');

    // Состояние для загрузки аватара
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarUploadMessage, setAvatarUploadMessage] = useState('');
    const [avatarUploadError, setAvatarUploadError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            try {
                const res = await API.get('/users/profile');
                setProfileData(res.data);
                setName(res.data.name); // Инициализируем поле имени
                setEmail(res.data.email); // Инициализируем поле email
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

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setProfileUpdateMessage('');
        setProfileUpdateError('');

        try {
            // userId не нужен, т.к. бэкенд использует req.user._id
            const updatedUser = await updateProfile({ name, email });
            setProfileData(updatedUser); // Обновляем отображаемые данные профиля
            setProfileUpdateMessage('Профиль успешно обновлен!');
        } catch (err) {
            setProfileUpdateError(err.message);
            console.error('Ошибка обновления профиля:', err.response?.data || err.message);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setPasswordUpdateMessage('');
        setPasswordUpdateError('');

        if (newPassword !== confirmNewPassword) {
            setPasswordUpdateError('Новый пароль и подтверждение не совпадают');
            return;
        }

        try {
            // Используем updatePassword из AuthContext
            const message = await updatePassword(oldPassword, newPassword);
            setPasswordUpdateMessage(message);
            setOldPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (err) {
            setPasswordUpdateError(err.message);
        }
    };

    const handleAvatarChange = (e) => {
        setAvatarFile(e.target.files[0]);
    };

    const handleAvatarUpload = async (e) => {
        e.preventDefault();
        setAvatarUploadMessage('');
        setAvatarUploadError('');

        if (!avatarFile) {
            setAvatarUploadError('Пожалуйста, выберите файл для загрузки.');
            return;
        }

        try {
            // userId не нужен, т.к. бэкенд использует req.user._id
            const avatarUrl = await uploadAvatar(avatarFile);
            setProfileData(prevData => ({ ...prevData, avatar: avatarUrl })); // Обновляем аватар в данных профиля
            setAvatarUploadMessage('Аватар успешно загружен!');
            setAvatarFile(null); // Очищаем выбранный файл
        } catch (err) {
            setAvatarUploadError(err.message);
            console.error('Ошибка загрузки аватара:', err.response?.data || err.message);
        }
    };

    if (loading) return <p>Загрузка профиля...</p>;
    if (error) return <p>Ошибка: {error}</p>;
    if (!user) return <p>Пожалуйста, войдите, чтобы просмотреть профиль.</p>; // Если user null, но загрузка завершена

    return (
        <div>
            <h2>Мой Профиль</h2>
            {profileData ? (
                <>
                    {profileData.avatar && (
                        <div>
                            <img src={profileData.avatar} alt="Аватар пользователя" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} />
                        </div>
                    )}
                    <p>Имя: {profileData.name}</p>
                    <p>Email: {profileData.email}</p>
                    <p>Роль: {profileData.role}</p>

                    {/* Форма для обновления имени и email */}
                    <h3>Обновить профиль</h3>
                    <form onSubmit={handleProfileUpdate}>
                        <input
                            type="text"
                            placeholder="Имя"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <button type="submit">Сохранить изменения</button>
                        {profileUpdateMessage && <p style={{ color: 'green' }}>{profileUpdateMessage}</p>}
                        {profileUpdateError && <p style={{ color: 'red' }}>{profileUpdateError}</p>}
                    </form>

                    {/* Форма для загрузки аватара */}
                    <h3>Загрузить/обновить аватар</h3>
                    <form onSubmit={handleAvatarUpload}>
                        <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/gif"
                            onChange={handleAvatarChange}
                        />
                        <button type="submit" disabled={!avatarFile}>Загрузить аватар</button>
                        {avatarUploadMessage && <p style={{ color: 'green' }}>{avatarUploadMessage}</p>}
                        {avatarUploadError && <p style={{ color: 'red' }}>{avatarUploadError}</p>}
                    </form>

                    {/* Форма для изменения пароля */}
                    <h3>Изменить пароль</h3>
                    <form onSubmit={handlePasswordUpdate}>
                        <input
                            type="password"
                            placeholder="Старый пароль"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Новый пароль"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Подтвердите новый пароль"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            required
                        />
                        <button type="submit">Обновить пароль</button>
                        {passwordUpdateMessage && <p style={{ color: 'green' }}>{passwordUpdateMessage}</p>}
                        {passwordUpdateError && <p style={{ color: 'red' }}>{passwordUpdateError}</p>}
                    </form>
                </>
            ) : (
                <p>Данные профиля не найдены.</p>
            )}
        </div>
    );
}

export default ProfilePage;
