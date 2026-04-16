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
        <div className="h-screen w-screen flex flex-col overflow-hidden bg-sirius-bg text-white font-sans selection:bg-sirius-accent selection:text-white">
            {/* View Switcher & Auth - Only for Admin */}
            {isAdmin && (
                <div className="fixed top-5 left-1/2 -translate-x-1/2 sm:left-auto sm:right-5 sm:translate-x-0 flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl z-[1000] bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
                    <button
                        onClick={() => setActiveTab('client')}
                        className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-[0.75rem] sm:text-sm font-medium transition-all duration-300 ${activeTab === 'client' ? 'bg-sirius-accent text-white opacity-100' : 'opacity-60 hover:opacity-100'
                            }`}
                    >
                        <UserIcon size={16} />
                        Клієнт
                    </button>

                    <button
                        onClick={() => setActiveTab('admin')}
                        className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-[0.75rem] sm:text-sm font-medium transition-all duration-300 ${activeTab === 'admin' ? 'bg-sirius-accent text-white opacity-100' : 'opacity-60 hover:opacity-100'
                            }`}
                    >
                        <ShieldIcon size={16} />
                        Адмін
                    </button>

                    <div className="w-px h-6 bg-white/10 mx-1 hidden sm:block" />

                    <button
                        onClick={logout}
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-[0.75rem] sm:text-sm font-medium opacity-60 hover:opacity-100 hover:text-red-400 transition-all duration-300"
                    >
                        <LogoutIcon size={16} />
                        <span className="hidden sm:inline">Вийти</span>
                    </button>
                </div>
            )}

            {/* Login link for public visitors who are not logged in yet */}
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

            <main className="flex-1 h-full overflow-hidden">
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
