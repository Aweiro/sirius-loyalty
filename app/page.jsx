"use client";

import React, { useState, useEffect } from 'react';
import useLoyalty from '@/hooks/useLoyalty';
import ClientView from '@/components/client/ClientView';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { User as UserIcon, ShieldCheck as ShieldIcon, LogIn as LoginIcon, LogOut as LogoutIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Home() {
    const [activeTab, setActiveTab] = useState('client');
    const {
        currentUser,
        users,
        rewards,
        globalSettings,
        loading,
        addVisit,
        registerUser,
        logout,
        getVideoUrl,
        closeCelebration,
        updateReward,
        updateReferralReward,
        spendReferralBonus
    } = useLoyalty();

    // If user is client, always force client tab
    useEffect(() => {
        if (currentUser && currentUser.role !== 'ADMIN' && activeTab === 'admin') {
            setActiveTab('client');
        }
    }, [currentUser, activeTab]);

    if (loading) return (
        <div className="min-h-screen bg-sirius-bg flex items-center justify-center text-white font-sans">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-sirius-accent border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sirius-secondary animate-pulse uppercase tracking-widest text-xs">SIRIUS LOYALTY</span>
            </div>
        </div>
    );

    const isAdmin = currentUser?.role === 'ADMIN';

    return (
        <div className="min-h-screen w-full flex flex-col bg-sirius-bg text-white font-sans selection:bg-sirius-accent selection:text-white overflow-x-hidden">
            {/* Admin Header - Sticky Top */}
            {isAdmin && (
                <header className="sticky top-0 left-0 right-0 z-[1000] bg-sirius-bg/60 backdrop-blur-xl border-b border-white/5 px-6 py-3">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-sirius-accent flex items-center justify-center shadow-lg shadow-sirius-accent/20">
                                <ShieldIcon size={16} className="text-white" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-[0.3em] text-white">Sirius Admin</span>
                        </div>

                        <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/5">
                            <button
                                onClick={() => setActiveTab('client')}
                                className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-[0.65rem] sm:text-[0.7rem] font-black uppercase tracking-widest transition-all ${activeTab === 'client' ? 'bg-sirius-accent text-white' : 'text-sirius-secondary hover:text-white'
                                    }`}
                            >
                                <UserIcon size={14} />
                                <span className="hidden sm:inline">Вигляд клієнта</span>
                                <span className="sm:hidden">Клієнт</span>
                            </button>

                            <button
                                onClick={() => setActiveTab('admin')}
                                className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-[0.65rem] sm:text-[0.7rem] font-black uppercase tracking-widest transition-all ${activeTab === 'admin' ? 'bg-sirius-accent text-white' : 'text-sirius-secondary hover:text-white'
                                    }`}
                            >
                                <ShieldIcon size={14} />
                                <span className="hidden sm:inline">Дашборд</span>
                                <span className="sm:hidden">Адмін</span>
                            </button>
                        </div>

                        <button
                            onClick={logout}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sirius-secondary hover:text-red-400 transition-all"
                            title="Вийти"
                        >
                            <LogoutIcon size={18} />
                        </button>
                    </div>
                </header>
            )}

            {/* Login link for public visitors */}
            {!currentUser && (
                <div className="fixed top-5 right-5 z-[1000]">
                    <Link
                        href="/login"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 text-sm font-bold opacity-60 hover:opacity-100 hover:text-sirius-accent transition-all animate-fade-in"
                    >
                        <LoginIcon size={16} />
                        Увійти
                    </Link>
                </div>
            )}

            <main className="flex-1 w-full">
                {activeTab === 'client' || !isAdmin ? (
                    currentUser ? (
                        <ClientView
                            user={currentUser}
                            rewards={rewards}
                            globalSettings={globalSettings}
                            getVideoUrl={getVideoUrl}
                            closeCelebration={closeCelebration}
                            logout={logout}
                        />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-6 text-center gap-6 relative overflow-hidden bg-sirius-bg">
                            <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[140%] blur-[100px] z-[1] opacity-30 pointer-events-none">
                                <div className="absolute rounded-full bg-sirius-accent blur-[80px] mix-blend-screen animate-aurora-move w-[50%] h-[50%] top-[10%] left-[30%] opacity-20"></div>
                                <div className="absolute rounded-full bg-[#0033cc] blur-[80px] mix-blend-screen animate-aurora-move w-[60%] h-[60%] bottom-[10%] right-[20%] opacity-15 delay-[-5s]"></div>
                            </div>

                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex flex-col items-center gap-6 relative z-10"
                            >
                                <div className="w-24 h-24 bg-sirius-accent/20 rounded-full flex items-center justify-center mb-2 shadow-2xl shadow-sirius-accent/20">
                                    <UserIcon size={48} className="text-sirius-accent" />
                                </div>
                                <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter">Вітаємо у Sirius</h2>
                                <p className="text-sirius-secondary max-w-sm leading-relaxed text-sm sm:text-base font-medium">Увійдіть або зареєструйтесь, щоб отримати свою персональну картку лояльності.</p>
                                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs mt-2">
                                    <Link href="/login" className="bg-sirius-accent text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:brightness-110 transition-all text-center shadow-lg shadow-sirius-accent/20">
                                        Увійти
                                    </Link>
                                    <Link href="/register" className="bg-white/5 border border-white/10 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-white/10 transition-all text-center backdrop-blur-md">
                                        Реєстрація
                                    </Link>
                                </div>
                            </motion.div>
                        </div>
                    )
                ) : (
                    <AdminDashboard
                        users={users}
                        addVisit={addVisit}
                        registerUser={registerUser}
                        rewards={rewards}
                        globalSettings={globalSettings}
                        updateReward={updateReward}
                        updateReferralReward={updateReferralReward}
                        spendReferralBonus={spendReferralBonus}
                    />
                )}
            </main>
        </div>
    );
}
