"use client";

import React, { useState, useEffect } from 'react';
import useLoyalty from '@/hooks/useLoyalty';
import ClientView from '@/components/client/ClientView';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { User as UserIcon, ShieldCheck as ShieldIcon, LogIn as LoginIcon, LogOut as LogoutIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Home() {
    const { t, changeLang, lang } = useLanguage();
    const [activeTab, setActiveTab] = useState('client');
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const {
        currentUser,
        users,
        rewards,
        globalSettings,
        loading,
        addVisit,
        registerUser,
        logout,
        closeCelebration,
        updateReward,
        updateReferralReward,
        spendReferralBonus,
        removeVisit,
        checkAdminPasswordSet,
        verifyAdminPassword,
        setAdminPassword
    } = useLoyalty();

    useEffect(() => {
        if (currentUser && currentUser.role !== 'ADMIN' && activeTab === 'admin') {
            setActiveTab('client');
        }
    }, [currentUser, activeTab]);

    // Only sync language from profile ONCE when user loads
    useEffect(() => {
        if (currentUser?.language) {
            changeLang(currentUser.language);
        }
    }, [currentUser?.id]); // Only run when user changes (login/load)

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
        <div className="relative w-full bg-sirius-bg text-white font-sans selection:bg-sirius-accent selection:text-white">
            {/* Admin Header - Sticky Top */}
            {isAdmin && (
                <header className="sticky top-0 left-0 right-0 z-[1000] bg-sirius-bg/60 backdrop-blur-xl border-b border-white/5 px-4 sm:px-6 py-2.5">
                    <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
                        {/* Logo - Hidden text on tiny screens */}
                        <div className="flex items-center gap-2 shrink-0">
                            <div className="w-8 h-8 rounded-lg bg-sirius-accent flex items-center justify-center shadow-lg shadow-sirius-accent/20">
                                <ShieldIcon size={16} className="text-white" />
                            </div>
                            <span className="text-[0.6rem] sm:text-xs font-black uppercase tracking-[0.2em] text-white hidden xs:block">Admin</span>
                        </div>

                        {/* Mode Switcher - Compact on mobile */}
                        <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/5 mx-auto">
                            <button
                                onClick={() => setActiveTab('client')}
                                className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-[0.6rem] sm:text-[0.75rem] font-bold uppercase tracking-wider transition-all ${activeTab === 'client' ? 'bg-sirius-accent text-white shadow-lg shadow-sirius-accent/20' : 'text-sirius-secondary hover:text-white'
                                    }`}
                            >
                                <UserIcon size={12} className="sm:size-[14px]" />
                                <span>Клієнт</span>
                            </button>

                            <button
                                onClick={() => setActiveTab('admin')}
                                className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-[0.6rem] sm:text-[0.75rem] font-bold uppercase tracking-wider transition-all ${activeTab === 'admin' ? 'bg-sirius-accent text-white shadow-lg shadow-sirius-accent/20' : 'text-sirius-secondary hover:text-white'
                                    }`}
                            >
                                <ShieldIcon size={12} className="sm:size-[14px]" />
                                <span>Адмін</span>
                            </button>
                        </div>

                        {/* Language & Logout */}
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:block">
                                <LanguageSwitcher />
                            </div>
                            <button
                                onClick={() => setShowLogoutConfirm(true)}
                                className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-sirius-secondary hover:text-red-400 hover:bg-white/5 transition-all shrink-0"
                                title={t.logout}
                            >
                                <LogoutIcon size={18} />
                            </button>
                        </div>
                    </div>
                </header>
            )}

            <main className="w-full">
                {activeTab === 'client' || !isAdmin ? (
                    currentUser ? (
                        <ClientView
                            user={currentUser}
                            rewards={rewards}
                            globalSettings={globalSettings}
                            closeCelebration={closeCelebration}
                            logout={() => setShowLogoutConfirm(true)}
                        />
                    ) : (
                        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center gap-6 relative overflow-hidden bg-[#05070a]">
                            {/* Aurora Background */}
                            <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[140%] blur-[100px] z-[1] opacity-30 pointer-events-none">
                                <div className="absolute rounded-full bg-sirius-accent blur-[80px] mix-blend-screen animate-aurora-move w-[50%] h-[50%] top-[10%] left-[30%] opacity-20"></div>
                                <div className="absolute rounded-full bg-[#0033cc] blur-[80px] mix-blend-screen animate-aurora-move w-[60%] h-[60%] bottom-[10%] right-[20%] opacity-15 delay-[-5s]"></div>
                            </div>

                            {/* Top Header Section */}
                            <header className="absolute top-0 left-0 right-0 p-6 sm:p-10 flex justify-between items-start z-50 pointer-events-none">
                                <motion.div 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex flex-col gap-0.5"
                                >
                                    <span className="text-2xl font-black uppercase tracking-tighter leading-none text-white">Sirius</span>
                                    <span className="text-[0.6rem] uppercase tracking-[0.4em] font-bold text-sirius-secondary opacity-50">Barbershop</span>
                                </motion.div>

                                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 pointer-events-auto">
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                    >
                                        <a 
                                            href="https://t.me/siriusxbarbershop" 
                                            target="_blank" 
                                            className="px-5 py-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-sirius-secondary hover:text-white hover:border-white/20 transition-all font-medium text-sm flex items-center gap-2"
                                        >
                                            <span className="text-xs opacity-50 font-normal">@</span>siriusxbarbershop
                                        </a>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <LanguageSwitcher />
                                    </motion.div>
                                </div>
                            </header>

                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex flex-col items-center gap-4 sm:gap-6 relative z-10 w-full"
                            >
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-sirius-accent/20 rounded-full flex items-center justify-center mb-0 shadow-2xl shadow-sirius-accent/20 relative">
                                    <div className="absolute inset-0 bg-sirius-accent/10 blur-xl rounded-full"></div>
                                    <UserIcon size={28} className="text-sirius-accent relative z-10 sm:size-[32px]" />
                                </div>
                                
                                <div className="flex flex-col gap-2">
                                    <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight leading-[0.9] text-white">
                                        {t.welcomeTitle}
                                    </h1>
                                    <p className="text-sirius-secondary max-w-[280px] sm:max-w-sm mx-auto leading-relaxed text-sm sm:text-base font-medium opacity-60 px-4">
                                        {t.welcomeSubtitle}
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mt-6 px-4">
                                    <Link href="/login" className="flex-1 bg-sirius-accent text-white px-8 py-4.5 rounded-2xl font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all text-center shadow-xl shadow-sirius-accent/30 text-base">
                                        {t.loginBtn}
                                    </Link>
                                    <Link href="/register" className="flex-1 bg-white/5 border border-white/10 text-white px-8 py-4.5 rounded-2xl font-black uppercase tracking-widest hover:bg-white/10 active:scale-95 transition-all text-center backdrop-blur-xl text-base">
                                        {t.registerLink}
                                    </Link>
                                </div>
                            </motion.div>

                            <div className="absolute bottom-10 z-10 opacity-20 text-[0.6rem] uppercase tracking-[0.5em] font-bold text-sirius-secondary">
                                Sirius Barbershop 2026
                            </div>
                        </div>
                    )
                ) : (
                    <AdminDashboard
                        users={users}
                        addVisit={addVisit}
                        removeVisit={removeVisit}
                        registerUser={registerUser}
                        rewards={rewards}
                        globalSettings={globalSettings}
                        updateReward={updateReward}
                        updateReferralReward={updateReferralReward}
                        spendReferralBonus={spendReferralBonus}
                        checkAdminPasswordSet={checkAdminPasswordSet}
                        verifyAdminPassword={verifyAdminPassword}
                        setAdminPassword={setAdminPassword}
                    />
                )}
            </main>

            {/* Logout Confirmation Modal */}
            <AnimatePresence>
                {showLogoutConfirm && (
                    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowLogoutConfirm(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-sirius-card border border-white/10 p-8 rounded-[32px] max-w-sm w-full relative z-10 shadow-2xl text-white text-center"
                        >
                            <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-500 mx-auto mb-6 flex items-center justify-center">
                                <LogoutIcon size={32} />
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-tight mb-2">{t.logoutConfirmTitle}</h3>
                            <p className="text-sirius-secondary text-sm mb-8 leading-relaxed">
                                {t.logoutConfirmText}
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setShowLogoutConfirm(false)}
                                    className="bg-white/5 hover:bg-white/10 text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all"
                                >
                                    {t.cancelBtn}
                                </button>
                                <button
                                    onClick={() => {
                                        logout();
                                        setShowLogoutConfirm(false);
                                    }}
                                    className="bg-red-500 hover:bg-red-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-red-500/20"
                                >
                                    {t.confirmBtn}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
