// src/components/ThemeSwitcher.js
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeSwitcher = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button onClick={toggleTheme} style={{ background: 'none', border: '1px solid', padding: '8px', borderRadius: '5px', cursor: 'pointer' }}>
            {theme === 'light' ? 'Переключить на темную тему' : 'Переключить на светлую тему'}
        </button>
    );
};

export default ThemeSwitcher;