import React, { useMemo, useState, useEffect } from 'react';
import LoyaltyCard from './LoyaltyCard';
import ClientProfile from './ClientProfile';
import CelebrationOverlay from '@/components/CelebrationOverlay';
import { motion, AnimatePresence } from 'framer-motion';

const SiriusLogo = () => (
  <div className="logo-text">
    <h2 className="text-[1.4rem] font-[900] mb-0.5 uppercase tracking-tight">SIRIUS</h2>
    <span className="text-[0.65rem] tracking-[3px] text-sirius-secondary block">BARBERSHOP</span>
  </div>
);

import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { updateUserLanguage } from '@/lib/actions';

const ClientView = ({ user, rewards, globalSettings, closeCelebration, logout }) => {
  const { t, lang } = useLanguage();
  const currentCycleProgress = user.visitsCount % 10;

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Sync language with DB when it changes
  useEffect(() => {
    if (user?.id && lang) {
      updateUserLanguage(user.id, lang);
    }
  }, [lang, user?.id]);

  const particles = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 10}s`,
      duration: `${15 + Math.random() * 10}s`,
      size: `${Math.random() * 2 + 1}px`
    }));
  }, []);

  return (
    <div className="relative w-full flex flex-col bg-sirius-bg text-white">
      {/* Background Layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="fixed w-[500px] h-[500px] rounded-full pointer-events-none z-[2] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 bg-[radial-gradient(circle,_rgba(0,71,255,0.06)_0%,_transparent_70%)]"
          style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px`, opacity: mousePos.x === 0 ? 0 : 1 }}
        />

        <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[140%] blur-[60px] z-[1] opacity-30 pointer-events-none">
          <div className="absolute rounded-full bg-sirius-accent blur-[40px] mix-blend-screen animate-aurora-move w-[50%] h-[50%] top-[10%] left-[30%] opacity-40"></div>
          <div className="absolute rounded-full bg-[#0033cc] blur-[40px] mix-blend-screen animate-aurora-move w-[60%] h-[60%] bottom-[10%] right-[20%] opacity-30 delay-[-5s]"></div>
        </div>

        <div className="absolute inset-0 z-[3] pointer-events-none">
          {particles.map(p => (
            <div
              key={p.id}
              className="absolute bg-white rounded-full opacity-10 animate-float-particle"
              style={{
                left: p.left,
                animationDelay: p.delay,
                animationDuration: p.duration,
                width: p.size,
                height: p.size
              }}
            />
          ))}
        </div>

        <div className="absolute top-1/2 right-[-15vh] -translate-y-1/2 w-[120vh] h-[120vh] z-[1] pointer-events-none">
          {[1, 0.85, 0.7, 0.55, 0.4].map((scale, i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sirius-accent/10 animate-ring-swing"
              style={{
                width: `${scale * 100}%`,
                height: `${scale * 100}%`,
                animationDuration: `${20 + i * 2}s`
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-20 w-full max-w-[1250px] mx-auto px-6 sm:px-10 pt-[4vh] pb-24">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
          {/* Left Column: Heading + Card */}
          <div className="flex-1 w-full flex flex-col gap-[4vh] sm:gap-[6vh]">
            <header className="w-full flex flex-col gap-[1.5vh]">
              <div className="flex justify-between items-center w-full">
                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                  <SiriusLogo />
                </motion.div>
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 pointer-events-auto">
                  <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                  >
                    <a 
                      href="https://t.me/siriusxbarbershop"
                      target="_blank"
                      className="px-4 py-2 rounded-[30px] text-[0.75rem] sm:text-[0.85rem] text-sirius-secondary bg-white/5 border border-white/10 w-fit backdrop-blur-md flex items-center gap-2 hover:text-white transition-all shadow-lg"
                    >
                      <span className="opacity-50 font-normal">@</span>siriusxbarbershop
                    </a>
                  </motion.div>
                  <LanguageSwitcher />
                </div>
              </div>

              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col gap-1 mt-4"
              >
                <span className="text-sirius-accent font-black text-[0.8rem] tracking-[0.2em] uppercase">
                  {lang === 'ua' ? 'З Поверненням' : 'Witaj Ponownie'}
                </span>
                <h1 className="text-[1.8rem] sm:text-[2.2rem] font-black leading-tight uppercase tracking-tight text-white drop-shadow-2xl">
                  {user.name}
                </h1>
              </motion.div>

              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="w-full h-px bg-gradient-to-r from-sirius-accent/50 to-transparent"
              />

              <motion.h2
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="loyalty-title-main !text-[2.5rem] sm:!text-[3.5rem]"
              >
                {t.loyaltyCardTitle}
              </motion.h2>
            </header>

            <main className="w-full overflow-visible">
              <LoyaltyCard progress={currentCycleProgress} rewards={rewards} />
            </main>
          </div>

          {/* Right Column: Profile */}
          <div className="w-full lg:w-auto lg:mt-[10vh]">
            <ClientProfile user={user} globalSettings={globalSettings} logout={logout} />
          </div>
        </div>
      </div>

      <CelebrationOverlay
        isVisible={user.showCelebration}
        onClose={() => closeCelebration(user.id)}
      />
    </div>
  );
};

export default ClientView;
