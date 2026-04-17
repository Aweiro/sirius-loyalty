"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '@/lib/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [lang, setLang] = useState('ua');

    useEffect(() => {
        const savedLang = localStorage.getItem('sirius_lang');
        if (savedLang && (savedLang === 'ua' || savedLang === 'pl')) {
            setLang(savedLang);
        } else {
            // Detect browser language
            const browserLang = navigator.language.split('-')[0];
            const defaultLang = browserLang === 'pl' ? 'pl' : 'ua';
            setLang(defaultLang);
            localStorage.setItem('sirius_lang', defaultLang);
        }
    }, []);

    const changeLang = (newLang) => {
        setLang(newLang);
        localStorage.setItem('sirius_lang', newLang);
    };

    const t = translations[lang];

    return (
        <LanguageContext.Provider value={{ lang, changeLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
