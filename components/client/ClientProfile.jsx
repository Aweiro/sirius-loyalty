import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Users, Share2, Check, Copy, Gift, Star, LogOut, Info, MapPin, Calendar, Navigation } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

import LanguageSwitcher from '@/components/LanguageSwitcher';

const ClientProfile = ({ user, globalSettings, logout }) => {
    const { t, lang } = useLanguage();
    const [copied, setCopied] = useState(false);
    const [codeCopied, setCodeCopied] = useState(false);
    const referralCode = user.referralCode || 'SIRIUS123';
    const completedCycles = user.completedCycles || 0;
    const referralCount = user.referralCount || 0;
    const referralReward = globalSettings?.referralReward || "0";

    // Extract number and currency from string (e.g., "20 PLN" -> 20 and "PLN")
    const match = referralReward.match(/\d+/);
    const rewardValue = match ? parseInt(match[0]) : null;
    const currency = rewardValue !== null ? referralReward.replace(/\d+/g, '').trim() : (lang === 'ua' ? "Бонусів" : "Bonusów");
    const totalBalance = rewardValue !== null ? (user.referralBonuses || 0) * rewardValue : (user.referralBonuses || 0);

    const [showInfo, setShowInfo] = useState(false);

    const handleInvite = async () => {
        const inviteLink = `${window.location.origin}/register?ref=${referralCode}`;
        const inviteText = t.inviteMessage(referralReward, inviteLink);

        // Check if we are likely on a mobile device that supports sharing
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        if (isMobile && navigator.share) {
            try {
                await navigator.share({
                    title: 'Sirius Barbershop',
                    text: inviteText,
                    url: inviteLink,
                });
                // If shared successfully, we don't need to show "Copied"
            } catch (err) {
                // Only fall back to copy if it's not a "AbortError" (user cancelled)
                if (err.name !== 'AbortError') {
                    copyToClipboard(inviteText);
                }
            }
        } else {
            // Deskshop or no native share: just copy
            copyToClipboard(inviteText);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const copyCodeOnly = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(referralCode);
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
    };

    const totalEarnedAmount = rewardValue !== null ? referralCount * rewardValue : referralCount;

    return (
        <div className="flex flex-col gap-6 w-full lg:w-80 text-white">
            {/* Booking & Address Section */}
            {(globalSettings?.booksyLink || globalSettings?.addressText) && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.25 }}
                    className="flex flex-col gap-3"
                >
                    {globalSettings?.booksyLink && (
                        <a
                            href={globalSettings.booksyLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-3 bg-white text-black py-4 rounded-xl font-black text-sm transition-all hover:bg-sirius-accent hover:text-white active:scale-95 shadow-xl group shadow-sirius-accent/5 px-2 text-center"
                        >
                            <Calendar size={18} className="group-hover:scale-110 transition-transform shrink-0" />
                            {t.bookNow}
                        </a>
                    )}

                    {globalSettings?.addressText && (
                        <div className="bg-white/5 border border-white/10 p-5 rounded-[24px] backdrop-blur-md relative overflow-hidden group">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-sirius-accent/10 flex items-center justify-center shrink-0">
                                    <MapPin className="text-sirius-accent" size={20} />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[0.65rem] font-black uppercase tracking-widest text-sirius-secondary mb-1">{t.salonAddress}</span>
                                    <p className="text-xs font-bold leading-relaxed mb-2 pr-2 line-clamp-2">{globalSettings.addressText}</p>

                                    {globalSettings?.googleMapsLink && (
                                        <a
                                            href={globalSettings.googleMapsLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[0.6rem] font-black uppercase tracking-widest text-sirius-accent flex items-center gap-1 hover:underline w-fit"
                                        >
                                            <Navigation size={10} />
                                            {t.viewOnMap}
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Invite Section (Blue Style) */}
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
                    <h3 className="text-sm font-black uppercase tracking-tight">{t.giftForFriendTitle}</h3>
                </div>

                <div className="bg-sirius-accent/20 border border-sirius-accent/30 rounded-xl py-2 px-3 mb-4 flex items-center gap-2">
                    <div className="text-xs font-black uppercase text-sirius-accent tracking-widest">{referralReward}</div>
                </div>

                <p className="text-[0.75rem] text-sirius-secondary mb-5 leading-relaxed">
                    {t.giftHint.split('ОБОЄ').map((part, i, arr) => (
                        <React.Fragment key={i}>
                            {part}
                            {i < arr.length - 1 && <b>{lang === 'ua' ? 'ОБОЄ' : 'OBIE osoby'}</b>}
                        </React.Fragment>
                    ))}
                </p>

                <div className="relative">
                    <div
                        onClick={copyCodeOnly}
                        className="bg-black/40 border border-sirius-accent/30 rounded-2xl py-5 px-4 text-center font-black text-sirius-accent tracking-[0.2em] text-2xl mb-4 shadow-inner transform transition-all hover:scale-[1.02] active:scale-95 cursor-pointer relative group/code"
                    >
                        {referralCode}
                        <AnimatePresence>
                            {codeCopied && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="absolute inset-0 bg-sirius-accent/90 rounded-2xl flex items-center justify-center text-white text-xs tracking-normal font-bold z-10"
                                >
                                    <Check size={16} className="mr-2" /> {t.copied}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <button
                        onClick={handleInvite}
                        className="w-full flex items-center justify-center gap-2 bg-sirius-accent text-white py-4 rounded-xl font-black text-sm transition-all hover:brightness-110 active:scale-95 shadow-xl shadow-sirius-accent/20"
                    >
                        {copied ? <Check size={18} /> : <Share2 size={18} />}
                        {copied ? t.copied : t.inviteBtn}
                    </button>
                </div>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-sirius-accent/20 border border-sirius-accent/30 p-5 rounded-[24px] backdrop-blur-md shadow-lg shadow-sirius-accent/10 relative"
                >
                    <div className="flex items-center justify-between mb-3 text-sirius-accent">
                        <div className="flex items-center gap-3">
                            <Gift size={20} />
                            <span className="text-[0.7rem] font-black uppercase tracking-[0.2em]">{t.balanceLabel}</span>
                        </div>
                        <div className="relative">
                            <button
                                onMouseEnter={() => setShowInfo(true)}
                                onMouseLeave={() => setShowInfo(false)}
                                onClick={() => setShowInfo(!showInfo)}
                                className="focus:outline-none"
                            >
                                <Info size={14} className={`transition-opacity ${showInfo ? 'opacity-100' : 'opacity-40'}`} />
                            </button>
                            <AnimatePresence>
                                {showInfo && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9, y: 5 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, y: 5 }}
                                        className="absolute bottom-full right-0 mb-2 w-64 p-4 bg-sirius-card/95 border border-white/10 rounded-2xl text-[0.65rem] text-white leading-relaxed shadow-2xl z-[100] backdrop-blur-xl"
                                    >
                                        <p className="mb-2">{t.infoVisits}</p>
                                        <div className="h-px bg-white/5 my-2"></div>
                                        <p className="opacity-80">{t.infoReferral}</p>
                                        <div className="absolute -bottom-1 right-2 w-2 h-2 bg-sirius-card border-r border-b border-white/10 rotate-45"></div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-baseline gap-2">
                            <div className="text-3xl font-black text-white leading-none">
                                {totalBalance}
                            </div>
                            <span className="text-sirius-accent font-black text-[0.7rem] uppercase">{currency}</span>
                        </div>

                        {(user.pendingReferralsCount || 0) > 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="mt-2 flex items-center gap-1.5 text-white/40 font-bold"
                            >
                                <span className="text-[0.6rem] uppercase tracking-wider">
                                    +{rewardValue !== null ? user.pendingReferralsCount * rewardValue : user.pendingReferralsCount} {currency}
                                </span>
                            </motion.div>
                        )}
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
                        <span className="text-[0.7rem] font-bold uppercase tracking-wider">{t.referralsLabel}</span>
                    </div>
                    <div className="flex flex-col">
                        <div className="text-3xl font-black text-white">{referralCount} <span className="text-sirius-secondary text-sm">{t.friendsSuffix}</span></div>
                        <p className="text-[0.65rem] text-sirius-accent font-bold uppercase tracking-wider mt-1">
                            {t.youEarned} {totalEarnedAmount} {currency}
                        </p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-white/[0.03] border border-white/5 p-5 rounded-[24px] backdrop-blur-md flex flex-col justify-between"
                >
                    <div className="flex items-center gap-3 mb-3 text-sirius-accent/60">
                        <Star size={18} />
                        <span className="text-[0.7rem] font-bold uppercase tracking-wider text-sirius-secondary">{t.totalVisits}</span>
                    </div>
                    <div>
                        <div className="text-3xl font-black text-white">{completedCycles * 10 + user.visitsCount}</div>
                        <p className="text-[0.55rem] text-sirius-secondary mt-1 uppercase font-bold opacity-30">{t.lifetimeVisits}</p>
                    </div>
                </motion.div>
            </div>

            {/* Logout Button */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                whileHover={{ opacity: 1 }}
                onClick={logout}
                className="flex items-center justify-center gap-2 text-sirius-secondary text-[0.7rem] font-bold uppercase tracking-widest py-3 hover:text-red-400 transition-all"
            >
                <LogOut size={16} />
                {t.logout}
            </motion.button>
        </div>
    );
};

export default ClientProfile;
