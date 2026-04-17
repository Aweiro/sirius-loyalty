"use client";

import React, { useState } from 'react';
import { loginClient } from '@/lib/actions';
import { motion } from 'framer-motion';
import { ArrowLeft, Phone, ShieldCheck, LogIn, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import useLoyalty from '@/hooks/useLoyalty';

export default function Login() {
    const { t, lang } = useLanguage();
    const { currentUser, loading: loyaltyLoading } = useLoyalty();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [phone, setPhone] = useState('');
    const router = useRouter();
    const pinRef = React.useRef(null);
    const phoneRef = React.useRef(null);

    React.useEffect(() => {
        if (currentUser && !loyaltyLoading) {
            router.push('/');
        }
    }, [currentUser, loyaltyLoading, router]);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            phoneRef.current?.focus();
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const formatPhone = (value) => {
        const digits = value.replace(/\D/g, '');
        const clean = digits.startsWith('48') ? digits.slice(2, 11) : digits.slice(0, 9);
        
        if (clean.length === 0) return { formatted: '', digits: '' };
        
        let formatted = '+48 (' + clean.slice(0, 3);
        if (clean.length > 3) {
            formatted += ') ' + clean.slice(3, 6);
            if (clean.length > 6) {
                formatted += ' ' + clean.slice(6, 9);
            }
        }
        return { formatted, digits: clean };
    };

    const handlePhoneChange = (e) => {
        const val = e.target.value;
        const { formatted, digits } = formatPhone(val);
        setPhone(formatted);
        
        // Auto-focus logic: if 9 digits are entered, move to PIN
        if (digits.length === 9) {
            pinRef.current?.focus();
        }
    };

    const handlePinKeyDown = (e) => {
        if (e.key === 'Backspace' && e.target.value === '') {
            phoneRef.current?.focus();
        }
    };

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
            // Translate standard backend errors
            if (result.error === "Невірний номер телефону або ПІН-код") {
                setError(t.authError);
            } else if (result.error === "Невірний номер телефону") {
                setError(t.errorInvalidPhone);
            } else {
                setError(result.error);
            }
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
                    <h2 className="text-2xl font-black uppercase mb-2 text-white">{t.successRegTitle}</h2>
                    <div className="flex justify-center gap-2">
                        <div className="w-2 h-2 bg-sirius-accent rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-sirius-accent rounded-full animate-bounce delay-75"></div>
                        <div className="w-2 h-2 bg-sirius-accent rounded-full animate-bounce delay-150"></div>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (loyaltyLoading) return null;

    return (
        <div className="h-[100dvh] max-h-[100dvh] bg-sirius-bg text-white font-sans flex flex-col items-center p-6 overflow-hidden overscroll-y-none relative pt-[4vh] sm:justify-center">
            <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-sirius-accent/5 to-transparent pointer-events-none"></div>

            <div className="max-w-[380px] w-full relative z-10 py-10">
                <header className="mb-8 p-0 flex items-center justify-between">
                    <Link href="/" className="p-2 -ml-2 text-sirius-secondary hover:text-white transition-all">
                        <ArrowLeft size={22} />
                    </Link>
                    <LanguageSwitcher />
                </header>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10 text-center sm:text-left"
                >
                    <h1 className="text-3xl font-[900] uppercase tracking-tight leading-none mb-2">
                        {lang === 'ua' ? 'З Поверненням' : 'Witaj Ponownie'}
                    </h1>
                    <p className="text-sirius-secondary text-[0.65rem] uppercase font-bold tracking-[0.2em] opacity-60">
                        {lang === 'ua' ? 'Доступ до вашої картки' : 'Dostęp do Twojej karty'}
                    </p>
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
                                ref={phoneRef}
                                name="phone"
                                type="tel"
                                autoFocus
                                value={phone}
                                onChange={handlePhoneChange}
                                placeholder="+48 (___) ___ ___"
                                className="w-full bg-transparent border-none py-1 px-4 text-white focus:outline-none text-base placeholder:text-white/20"
                            />
                        </div>

                        <div className="h-px bg-white/5 mx-4"></div>

                        <div className="flex items-center px-4 py-4">
                            <ShieldCheck className="text-sirius-accent shrink-0" size={20} />
                            <input
                                required
                                ref={pinRef}
                                onKeyDown={handlePinKeyDown}
                                name="pin"
                                type="password"
                                inputMode="numeric"
                                pattern="[0-9]{4}"
                                maxLength={4}
                                placeholder={t.pinLabel}
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
                        {isLoading ? (lang === 'ua' ? 'Зачекайте...' : 'Czekaj...') : t.submitLogin}
                    </button>

                    <div className="text-center pt-2">
                        <p className="text-sirius-secondary text-[0.7rem] font-bold uppercase tracking-wider opacity-60 italic">
                            {lang === 'ua' ? 'Вперше у нас?' : 'Pierwszy raz u nas?'} 
                            <Link href="/register" className="text-sirius-accent hover:underline ml-1">
                                {lang === 'ua' ? 'Зареєструватися' : 'Zarejestruj się'}
                            </Link>
                        </p>
                    </div>
                </motion.form>
            </div>

            <footer className="absolute bottom-6 sm:bottom-10 left-0 right-0 text-center z-10">
                <p className="text-[0.6rem] text-sirius-secondary opacity-30 tracking-[0.4em] uppercase font-bold">Sirius Barbershop</p>
            </footer>
        </div>
    );
}
