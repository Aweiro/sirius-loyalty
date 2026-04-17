"use client";

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';

export default function LanguageSwitcher() {
    const { lang, changeLang } = useLanguage();

    const langs = [
        { id: 'ua', label: 'UA' },
        { id: 'pl', label: 'PL' }
    ];

    return (
        <div className="flex bg-white/5 p-1 rounded-full border border-white/10">
            {langs.map((l) => (
                <button
                    key={l.id}
                    onClick={() => changeLang(l.id)}
                    className="relative px-3 py-1 rounded-full text-[0.65rem] font-black transition-all"
                >
                    {lang === l.id && (
                        <motion.div
                            layoutId="lang-bg"
                            className="absolute inset-0 bg-sirius-accent rounded-full -z-10"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                    )}
                    <span className={lang === l.id ? "text-white" : "text-white/40"}>
                        {l.label}
                    </span>
                </button>
            ))}
        </div>
    );
}
