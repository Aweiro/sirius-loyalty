import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Users, Share2, Check, Copy, Gift, Star, LogOut } from 'lucide-react';

const ClientProfile = ({ user, globalSettings, logout }) => {
    const [copied, setCopied] = useState(false);
    const referralCode = user.referralCode || 'SIRIUS123';
    const completedCycles = user.completedCycles || 0;
    const referralCount = user.referralCount || 0;
    const referralReward = globalSettings?.referralReward || "Безкоштовна стрижка";

    const handleCopy = () => {
        navigator.clipboard.writeText(referralCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col gap-6 w-full lg:w-80">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-sirius-accent/20 border border-sirius-accent/30 p-5 rounded-[24px] backdrop-blur-md shadow-lg shadow-sirius-accent/10"
                >
                    <div className="flex items-center gap-3 mb-3 text-sirius-accent">
                        <Gift size={20} />
                        <span className="text-[0.7rem] font-black uppercase tracking-[0.2em]">Ваш Баланс</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="text-4xl font-black text-white leading-none">{user.referralBonuses || 0}</div>
                        <div className="flex flex-col">
                            <span className="text-sirius-accent font-black text-[0.8rem] uppercase leading-tight">{referralReward}</span>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/5 border border-white/10 p-5 rounded-[24px] backdrop-blur-md"
                >
                    <div className="flex items-center gap-3 mb-3 text-sirius-secondary">
                        <Users size={18} />
                        <span className="text-[0.7rem] font-bold uppercase tracking-wider">Реферали</span>
                    </div>
                    <div className="text-3xl font-black">{referralCount}</div>
                    <p className="text-[0.65rem] text-sirius-secondary mt-1 uppercase font-bold">Друзів прийшло</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-white/[0.03] border border-white/5 p-5 rounded-[24px] backdrop-blur-md"
                >
                    <div className="flex items-center gap-3 mb-3 text-sirius-accent/60">
                        <Star size={18} />
                        <span className="text-[0.7rem] font-bold uppercase tracking-wider text-sirius-secondary">Всього сеансів</span>
                    </div>
                    <div className="text-3xl font-black text-white">{completedCycles * 10 + user.visitsCount}</div>
                    <p className="text-[0.65rem] text-sirius-secondary mt-1 uppercase font-bold opacity-50">За весь час</p>
                </motion.div>
            </div>

            {/* Invite Section */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-sirius-accent/10 border border-sirius-accent/20 p-6 rounded-[24px] backdrop-blur-md relative overflow-hidden group shadow-xl shadow-sirius-accent/5"
            >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Share2 size={40} />
                </div>

                <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-sirius-accent/20 flex items-center justify-center">
                        <Gift className="text-sirius-accent" size={16} />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-tight">Подарунок за друга</h3>
                </div>

                <div className="bg-sirius-accent/20 border border-sirius-accent/30 rounded-xl py-2 px-3 mb-4 flex items-center gap-2">
                    <div className="text-xs font-black uppercase text-sirius-accent tracking-widest">{referralReward}</div>
                </div>

                <p className="text-[0.75rem] text-sirius-secondary mb-5 leading-relaxed">
                    Коли ваш друг зареєструється за цим кодом, ви <b>ОБОЄ</b> отримаєте цей подарунок!
                </p>

                <div className="relative">
                    <div className="bg-black/40 border border-sirius-accent/30 rounded-2xl py-5 px-4 text-center font-black text-sirius-accent tracking-[0.2em] text-2xl mb-4 shadow-inner transform transition-transform group-hover:scale-[1.02]">
                        {referralCode}
                    </div>
                    <button
                        onClick={handleCopy}
                        className="w-full flex items-center justify-center gap-2 bg-sirius-accent text-white py-4 rounded-xl font-black text-sm transition-all hover:brightness-110 active:scale-95 shadow-xl shadow-sirius-accent/20"
                    >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                        {copied ? 'СКОПІЙОВАНО' : 'ЗАПРОСИТИ'}
                    </button>
                </div>
            </motion.div>

            {/* Logout Button */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                whileHover={{ opacity: 1 }}
                onClick={logout}
                className="flex items-center justify-center gap-2 text-sirius-secondary text-[0.7rem] font-bold uppercase tracking-widest py-3 hover:text-red-400 transition-all"
            >
                <LogOut size={16} />
                Вийти з акаунта
            </motion.button>
        </div>
    );
};

export default ClientProfile;
