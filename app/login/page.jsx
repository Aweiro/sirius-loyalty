"use client";

import React, { useState } from 'react';
import { loginClient } from '@/lib/actions';
import { motion } from 'framer-motion';
import { ArrowLeft, Phone, ShieldCheck, LogIn, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Login() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const formData = new FormData(e.target);
        const result = await loginClient(formData);

        if (result.success) {
            setSuccess(true);
            setTimeout(() => {
                router.push('/');
            }, 1200);
        } else {
            setError(result.error);
        }
        setIsLoading(false);
    };

    if (success) {
        return (
            <div className="min-h-screen bg-sirius-bg flex items-center justify-center p-6 overflow-hidden">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-sirius-card border border-sirius-accent/20 p-10 rounded-[40px] text-center max-w-[300px] w-full shadow-2xl"
                >
                    <div className="w-16 h-16 bg-sirius-accent/20 rounded-full flex items-center justify-center mx-auto mb-5">
                        <CheckCircle2 className="text-sirius-accent" size={32} />
                    </div>
                    <h2 className="text-2xl font-black uppercase mb-2 text-white">Вітаємо!</h2>
                    <p className="text-sirius-secondary text-sm">Входимо у ваш профіль...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-sirius-bg text-white font-sans flex flex-col p-6 overflow-x-hidden relative">
            <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-sirius-accent/5 to-transparent pointer-events-none"></div>

            <div className="max-w-[380px] w-full mx-auto relative z-10 flex flex-col flex-1">
                <header className="pt-4 mb-10 flex items-center">
                    <Link href="/" className="p-2 -ml-2 text-sirius-secondary hover:text-white transition-all">
                        <ArrowLeft size={22} />
                    </Link>
                </header>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <h1 className="text-3xl font-[900] uppercase tracking-tight leading-none mb-2">З Поверненням</h1>
                    <p className="text-sirius-secondary text-[0.65rem] uppercase font-bold tracking-[0.2em] opacity-60">Доступ до вашої картки</p>
                </motion.div>

                <motion.form
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-6"
                >
                    <div className="bg-white/[0.03] border border-white/10 rounded-[28px] p-2 flex flex-col gap-px">
                        <div className="flex items-center px-4 py-4">
                            <Phone className="text-sirius-accent shrink-0" size={20} />
                            <input
                                required
                                name="phone"
                                type="tel"
                                placeholder="Номер телефону"
                                className="w-full bg-transparent border-none py-1 px-4 text-white focus:outline-none text-base placeholder:text-white/20"
                            />
                        </div>

                        <div className="h-px bg-white/5 mx-4"></div>

                        <div className="flex items-center px-4 py-4">
                            <ShieldCheck className="text-sirius-accent shrink-0" size={20} />
                            <input
                                required
                                name="pin"
                                type="password"
                                inputMode="numeric"
                                pattern="[0-9]{4}"
                                maxLength={4}
                                placeholder="Ваш ПІН-код"
                                className="w-full bg-transparent border-none py-1 px-4 text-white focus:outline-none text-base placeholder:text-white/20 tracking-[0.3em]"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 text-red-400 p-4 rounded-2xl text-xs font-bold text-center border border-red-500/20">
                            {error}
                        </div>
                    )}

                    <button
                        disabled={isLoading}
                        type="submit"
                        className="w-full bg-sirius-accent text-white py-4.5 rounded-[24px] font-black text-sm uppercase tracking-widest shadow-xl shadow-sirius-accent/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                    >
                        <LogIn size={20} />
                        {isLoading ? 'Перевірка...' : 'Увійти'}
                    </button>

                    <div className="text-center pt-2">
                        <p className="text-sirius-secondary text-[0.7rem] font-bold uppercase tracking-wider opacity-60 italic">
                            Вперше у нас? <Link href="/register" className="text-sirius-accent hover:underline ml-1">Зареєструватися</Link>
                        </p>
                    </div>
                </motion.form>

                <footer className="mt-auto pb-6 text-center">
                    <p className="text-[0.6rem] text-sirius-secondary opacity-30 tracking-[0.4em] uppercase font-bold">Sirius Barbershop</p>
                </footer>
            </div>
        </div>
    );
}
