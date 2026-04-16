"use client";

import React, { useState } from 'react';
import { registerClient } from '@/lib/actions';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Phone, Ticket, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Register() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const formData = new FormData(e.target);
        const result = await registerClient(formData);

        if (result.success) {
            setSuccess(true);
            setTimeout(() => {
                router.push('/');
            }, 2000);
        } else {
            setError(result.error);
        }
        setIsLoading(false);
    };

    if (success) {
        return (
            <div className="min-h-screen bg-sirius-bg flex items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-sirius-accent/5 animate-pulse"></div>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-sirius-card border border-white/10 p-8 rounded-[32px] text-center max-w-[320px] w-full shadow-2xl relative z-10"
                >
                    <div className="w-16 h-16 bg-sirius-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="text-sirius-accent" size={32} />
                    </div>
                    <h2 className="text-2xl font-black uppercase mb-2">Готово!</h2>
                    <p className="text-sirius-secondary text-sm leading-relaxed">Профіль створено. Ласкаво просимо до клубу!</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-sirius-bg text-white font-sans flex flex-col items-center justify-center p-5 overflow-x-hidden relative">
            {/* Minimal Background Effects */}
            <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-sirius-accent/10 to-transparent pointer-events-none opacity-50"></div>

            <div className="max-w-[400px] w-full relative z-10 py-10">
                <header className="mb-8 p-0 flex justify-between items-center">
                    <Link href="/" className="p-2 -ml-2 text-sirius-secondary hover:text-white transition-all">
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="text-[0.6rem] font-bold tracking-[0.3em] text-sirius-accent uppercase border border-sirius-accent/30 px-3 py-1 rounded-full bg-sirius-accent/5">
                        Loyalty Card
                    </div>
                </header>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-[900] uppercase tracking-tight leading-[0.9]">Реєстрація</h1>
                    <p className="text-sirius-secondary text-xs mt-2 uppercase tracking-widest font-bold opacity-60">Новий клієнт Sirius</p>
                </motion.div>

                <motion.form
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-4"
                >
                    <div className="bg-white/[0.03] border border-white/10 rounded-[24px] p-2 space-y-px overflow-hidden">
                        {/* Name Field */}
                        <div className="relative group flex items-center px-4 py-3 bg-transparent">
                            <User className="text-sirius-accent shrink-0" size={18} />
                            <input
                                required
                                name="name"
                                type="text"
                                placeholder="Ім'я"
                                className="w-full bg-transparent border-none py-1 px-4 text-white focus:outline-none text-base placeholder:text-white/20"
                            />
                        </div>

                        <div className="h-px bg-white/5 mx-4"></div>

                        {/* Phone Field */}
                        <div className="relative group flex items-center px-4 py-3 bg-transparent">
                            <Phone className="text-sirius-accent shrink-0" size={18} />
                            <input
                                required
                                name="phone"
                                type="tel"
                                placeholder="Телефон (напр. +380...)"
                                className="w-full bg-transparent border-none py-1 px-4 text-white focus:outline-none text-base placeholder:text-white/20"
                            />
                        </div>

                        <div className="h-px bg-white/5 mx-4"></div>

                        {/* PIN Field */}
                        <div className="relative group flex items-center px-4 py-3 bg-transparent">
                            <ShieldCheck className="text-sirius-accent shrink-0" size={18} />
                            <input
                                required
                                name="pin"
                                type="password"
                                inputMode="numeric"
                                pattern="[0-9]{4}"
                                maxLength={4}
                                placeholder="ПІН-код (4 цифри)"
                                className="w-full bg-transparent border-none py-1 px-4 text-white focus:outline-none text-base placeholder:text-white/20 tracking-[0.2em]"
                            />
                        </div>
                    </div>

                    {/* Referral Field (Separate for minimalism) */}
                    <div className="relative group flex items-center px-5 py-4 bg-white/[0.03] border border-white/10 rounded-[20px]">
                        <Ticket className="text-sirius-secondary shrink-0" size={16} />
                        <input
                            name="referredByCode"
                            type="text"
                            placeholder="Код реферала (якщо є)"
                            className="w-full bg-transparent border-none py-0 px-4 text-white focus:outline-none text-sm placeholder:text-white/20 uppercase tracking-wider"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-500/10 text-red-400 p-3 rounded-xl text-xs font-bold text-center border border-red-500/20">
                            {error}
                        </div>
                    )}

                    <div className="pt-2">
                        <button
                            disabled={isLoading}
                            type="submit"
                            className="w-full bg-sirius-accent text-white py-4.5 rounded-[22px] font-black text-sm uppercase tracking-[0.15em] shadow-xl shadow-sirius-accent/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {isLoading ? 'Зачекайте...' : 'Стати Клієнтом'}
                        </button>
                    </div>

                    <div className="text-center pt-4">
                        <p className="text-sirius-secondary text-[0.7rem] uppercase font-bold tracking-wider opacity-60">
                            Вже у клубі? <Link href="/login" className="text-sirius-accent hover:underline ml-1">Вхід</Link>
                        </p>
                    </div>
                </motion.form>
            </div>

            <footer className="absolute bottom-0 left-0 right-0 pb-10 text-center z-10">
                <p className="text-[0.6rem] text-sirius-secondary opacity-30 tracking-[0.4em] uppercase font-bold">Sirius Barbershop 2026</p>
            </footer>
        </div>
    );
}
