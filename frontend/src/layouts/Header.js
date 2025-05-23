// src/layouts/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import ThemeSwitcher from '../components/ThemeSwitcher';

const Header = () => {
    const { user, logout, isAdmin } = useAuth();
    const { t } = useTranslation();

    return (
        <header style={{ padding: '20px', backgroundColor: 'var(--primary-color)', color: 'var(--text-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <nav>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', gap: '20px' }}>
                    <li><Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Cultural Events App</Link></li>
                    <li><Link to="/events" style={{ color: 'inherit', textDecoration: 'none' }}>{t('events')}</Link></li>
                    {user ? (
                        <>
                            <li><Link to="/profile" style={{ color: 'inherit', textDecoration: 'none' }}>{t('profile')}</Link></li>
                            {isAdmin && (
                                <li><Link to="/admin" style={{ color: 'inherit', textDecoration: 'none' }}>{t('admin_panel')}</Link></li>
                            )}
                            <li><button onClick={logout} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1rem' }}>{t('logout')}</button></li>
                        </>
                    ) : (
                        <li><Link to="/login" style={{ color: 'inherit', textDecoration: 'none' }}>{t('login')}</Link></li>
                    )}
                </ul>
            </nav>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <LanguageSwitcher />
                <ThemeSwitcher />
            </div>
        </header>
    );
};

export default Header;