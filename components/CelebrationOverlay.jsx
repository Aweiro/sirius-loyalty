import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Award, Share2, Sparkles } from 'lucide-react';

const CelebrationOverlay = ({ isVisible, onClose }) => {
  const celebrationTriggered = useRef(false);

  useEffect(() => {
    if (isVisible && !celebrationTriggered.current) {
      // Trigger confetti
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 3000 };

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      celebrationTriggered.current = true;
    } else if (!isVisible) {
      celebrationTriggered.current = false;
    }
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-5">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-[15px]"
          />

          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            className="relative w-full max-w-[440px] bg-sirius-card border border-white/10 p-10 lg:p-14 flex flex-col items-center gap-6 text-center rounded-[32px] shadow-modal"
          >
            <motion.div
              initial={{ rotate: -20, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", damping: 10, delay: 0.2 }}
              className="w-20 h-20 bg-sirius-accent/20 rounded-full flex items-center justify-center text-sirius-accent mb-2"
            >
              <Award size={40} />
            </motion.div>

            <div className="space-y-2">
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl lg:text-[3.5rem] font-black tracking-tight leading-tight"
              >
                ВІТАЄМО!
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-sirius-secondary text-lg"
              >
                Ви отримали свій супер-бонус
              </motion.p>
            </div>

            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
              className="bg-sirius-accent/10 px-8 py-4 rounded-3xl border border-sirius-accent/20 my-2"
            >
              <span className="text-7xl font-black text-sirius-accent block [text-shadow:0_0_60px_rgba(0,71,255,0.4)]">
                -30%
              </span>
            </motion.div>

            <div className="flex flex-col gap-3 w-full mt-4">
              <button
                onClick={onClose}
                className="w-full bg-sirius-accent text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-sirius-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                ЗАБРАТИ БОНУС
              </button>

              <button className="flex items-center justify-center gap-2 text-sirius-secondary font-bold py-2 hover:text-white transition-colors">
                <Share2 size={18} />
                ПОВІДОМИТИ ДРУЗЯМ
              </button>
            </div>

            <div className="absolute -top-4 -right-4 animate-pulse">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-3 rounded-2xl shadow-lg ring-4 ring-sirius-card">
                <Sparkles className="text-white" size={24} />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CelebrationOverlay;
