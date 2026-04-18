import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { translateReward } from '@/lib/translations';

import { Gift } from 'lucide-react';

const LoyaltyProgress = ({ progress, nextReward, visitsRemaining }) => {
    const { t, lang } = useLanguage();
    const percentage = (progress / 10) * 100;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-[950px] bg-white/[0.03] border border-white/5 rounded-2xl px-3 py-2 sm:px-4 sm:py-3 backdrop-blur-xl relative overflow-hidden mb-5 flex flex-row items-center gap-3 sm:gap-4 shadow-2xl shadow-black/20"
        >
            {/* Minimal Counter with Label */}
            <div className="shrink-0 flex items-center gap-0.5">
                <span className="text-sirius-accent font-black text-lg sm:text-2xl leading-none">
                    {progress}
                </span>
                <span className="text-white/20 font-black text-xs sm:text-base leading-none">/</span>
                <span className="text-white/20 font-black text-xs sm:text-base leading-none">10</span>
            </div>

            {/* The Slim Bar */}
            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden relative border border-white/5">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                    className="h-full bg-gradient-to-r from-sirius-accent to-blue-500 relative rounded-full"
                    style={{
                        backgroundImage: 'linear-gradient(90deg, var(--color-sirius-accent), #3b82f6, var(--color-sirius-accent))',
                        backgroundSize: '200% 100%',
                    }}
                >
                    {/* Improved Shimmer Overlay */}
                    <div
                        className="absolute inset-0 animate-shimmer"
                        style={{
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                            backgroundSize: '200% 100%'
                        }}
                    ></div>
                </motion.div>
            </div>

            {/* Clarified Goal Badge */}
            {nextReward && (
                <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="shrink-0 flex items-center gap-2 sm:gap-3 bg-sirius-accent/10 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border border-sirius-accent/20"
                >
                    <div className="flex items-center gap-2">
                        {/* Status: X Left */}
                        <div className="flex items-center gap-1">
                            <span className="text-sirius-secondary/60 text-[0.55rem] font-bold uppercase tracking-tight">
                                {t.stillShort}
                            </span>
                            <span className="text-white font-black text-xs">
                                {visitsRemaining}
                            </span>
                        </div>

                        <div className="w-px h-3 bg-white/10"></div>

                        {/* Reward: Professional Gift Icon + Value */}
                        <div className="flex items-center gap-1.5">
                            <Gift size={12} className="text-sirius-accent" />
                            <span className="text-sirius-accent font-black text-[0.7rem] sm:text-xs uppercase tracking-tight animate-reward-glow">
                                {translateReward(nextReward, lang)}
                            </span>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default LoyaltyProgress;
