import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { translateReward } from '@/lib/translations';

const LoyaltyCard = ({ progress, rewards }) => {
  const { lang } = useLanguage();

  return (
    <div className="grid grid-cols-5 gap-[clamp(8px,2vw,45px)] w-full max-w-[950px] overflow-visible">
      {rewards.map((reward, index) => {
        const dotNumber = index + 1;
        const isFilled = dotNumber <= progress;
        const isNext = dotNumber === progress + 1 || (progress === 0 && dotNumber === 1);

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`aspect-square rounded-full flex items-center justify-center relative transition-all duration-400 overflow-visible shadow-dot ${isFilled
              ? 'bg-sirius-filled shadow-dot-filled'
              : 'bg-sirius-accent'
              } ${isNext ? 'animate-dot-pulse border-2 border-white/30' : ''}`}
          >
            {!isFilled && reward && (
              <span className="text-[clamp(10px,2vw,22px)] font-black text-white/90 drop-shadow-md">
                {translateReward(reward, lang)}
              </span>
            )}
            {!reward && !isFilled && (
              <div className="w-2.5 h-2.5 bg-white/20 rounded-full"></div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default LoyaltyCard;
