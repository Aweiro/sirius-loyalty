import React, { useState, useEffect } from 'react';
import { Plus, Search, UserPlus, Gift, Star, Settings, Save, CheckCircle2, Users, MinusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = ({ users, addVisit, registerUser, rewards, updateReward, globalSettings, updateReferralReward, spendReferralBonus }) => {
  const [activeSubTab, setActiveSubTab] = useState('users'); // 'users' or 'settings'
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [localRewards, setLocalRewards] = useState(rewards);
  const [localReferral, setLocalReferral] = useState(globalSettings?.referralReward || "");
  const [saveStatus, setSaveStatus] = useState(null); // 'saving', 'saved', null

  // Sync local state when props change
  useEffect(() => {
    if (rewards && rewards.length > 0) setLocalRewards(rewards);
  }, [rewards]);

  useEffect(() => {
    if (globalSettings?.referralReward) setLocalReferral(globalSettings.referralReward);
  }, [globalSettings]);

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.phone.includes(searchTerm)
  );

  const stats = [
    { label: 'Клієнти', value: users.length, icon: UserPlus, color: 'text-blue-400' },
    { label: 'Візити', value: users.reduce((acc, u) => acc + (u.visitsCount || 0), 0), icon: Star, color: 'text-yellow-400' },
    { label: 'Бонуси', value: users.reduce((acc, u) => acc + (u.referralBonuses || 0), 0), icon: Gift, color: 'text-pink-400' },
  ];

  const handleRegister = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const user = await registerUser(
      formData.get('name'),
      formData.get('phone'),
      formData.get('pin'),
      formData.get('referredByCode'),
      true // isAdminRegistration
    );
    if (user) setIsModalOpen(false);
  };

  const handleRewardChange = (index, value) => {
    const next = [...localRewards];
    next[index] = value;
    setLocalRewards(next);
  };

  const commitRewardUpdate = async (index) => {
    if (localRewards[index] === rewards[index]) return;
    setSaveStatus('saving');
    await updateReward(index, localRewards[index]);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus(null), 2000);
  };

  const commitReferralUpdate = async () => {
    if (localReferral === globalSettings.referralReward) return;
    setSaveStatus('saving');
    await updateReferralReward(localReferral);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus(null), 2000);
  };

  return (
    <div className="flex flex-col p-4 sm:p-8 max-w-7xl mx-auto w-full gap-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 sm:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-sirius-card border border-white/5 rounded-2xl sm:rounded-3xl p-3 sm:p-6 flex flex-col gap-1 sm:gap-2 text-white">
            <stat.icon className={`${stat.color} opacity-80`} size={18} />
            <div className="text-sirius-secondary text-[0.6rem] sm:text-xs font-bold uppercase tracking-widest">{stat.label}</div>
            <div className="text-2xl sm:text-3xl font-black">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex gap-4 border-b border-white/5 pb-1">
        <button
          onClick={() => setActiveSubTab('users')}
          className={`pb-3 px-2 text-sm font-bold uppercase tracking-widest transition-all relative ${activeSubTab === 'users' ? 'text-sirius-accent' : 'text-sirius-secondary opacity-60'}`}
        >
          Клієнти
          {activeSubTab === 'users' && <motion.div layoutId="subtab" className="absolute bottom-0 left-0 right-0 h-1 bg-sirius-accent rounded-full" />}
        </button>
        <button
          onClick={() => setActiveSubTab('settings')}
          className={`pb-3 px-2 text-sm font-bold uppercase tracking-widest transition-all relative ${activeSubTab === 'settings' ? 'text-sirius-accent' : 'text-sirius-secondary opacity-60'}`}
        >
          Налаштування
          {activeSubTab === 'settings' && <motion.div layoutId="subtab" className="absolute bottom-0 left-0 right-0 h-1 bg-sirius-accent rounded-full" />}
        </button>
      </div>

      <div className="bg-sirius-card border border-white/5 rounded-[24px] sm:rounded-[40px] flex flex-col shadow-2xl relative text-white">
        {activeSubTab === 'users' ? (
          <>
            <div className="p-4 sm:p-8 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-sirius-secondary" size={18} />
                <input
                  type="text"
                  placeholder="Пошук клієнта..."
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3 sm:py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-sirius-accent transition-colors"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto bg-sirius-accent text-white px-6 py-3 sm:py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-sirius-accent/20"
              >
                <Plus size={20} />
                Додати Клієнта
              </button>
            </div>

            <div className="w-full overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="text-sirius-secondary text-[0.7rem] sm:text-sm uppercase tracking-wider bg-white/[0.02]">
                    <th className="px-6 py-4 font-semibold border-b border-white/5">Клієнт</th>
                    <th className="px-6 py-4 font-semibold border-b border-white/5">Візити</th>
                    <th className="px-6 py-4 font-semibold border-b border-white/5">Наступний бонус</th>
                    <th className="px-6 py-4 font-semibold border-b border-white/5">Бонуси (Баланс)</th>
                    <th className="px-6 py-4 text-right font-semibold border-b border-white/5">Дії</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode='popLayout'>
                    {filteredUsers.map((user) => {
                      const currentVisitIndex = user.visitsCount % 10;
                      const nextReward = rewards[currentVisitIndex];

                      return (
                        <motion.tr
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          key={user.id}
                          className="group hover:bg-white/[0.02] transition-colors border-b border-white/5 last:border-0"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-sirius-accent/20 flex items-center justify-center text-sirius-accent font-bold">
                                {user.name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold">{user.name}</div>
                                <div className="text-sm text-sirius-secondary truncate">{user.phone}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-lg">{user.visitsCount}</span>
                              <div className="flex gap-1">
                                {[...Array(10)].map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-1.5 h-1.5 rounded-full ${i < currentVisitIndex ? 'bg-sirius-filled' : 'bg-white/10'}`}
                                  />
                                ))}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {nextReward ? (
                              <div className="bg-sirius-accent/10 text-sirius-accent px-3 py-1 rounded-lg text-[0.7rem] font-black w-fit border border-sirius-accent/10">
                                {nextReward}
                              </div>
                            ) : <span className="text-sirius-secondary opacity-30 text-xs">-</span>}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className={`flex items-center justify-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-tight ${user.referralBonuses > 0 ? 'bg-sirius-accent/20 text-sirius-accent' : 'bg-white/5 text-sirius-secondary opacity-40'}`}>
                                <Gift size={14} />
                                {user.referralBonuses || 0}
                              </div>
                              {user.referralBonuses > 0 && (
                                <button
                                  onClick={() => spendReferralBonus(user.id)}
                                  className="text-sirius-secondary hover:text-red-400 transition-colors"
                                  title="Списати 1 бонус"
                                >
                                  <MinusCircle size={18} />
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => addVisit(user.id)}
                              className="bg-sirius-accent hover:bg-sirius-accent/80 text-white p-3 rounded-xl transition-all active:scale-90"
                            >
                              <Plus size={20} />
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="p-6 sm:p-10 overflow-auto custom-scrollbar">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">Налаштування</h3>
                  <p className="text-sirius-secondary text-sm">Керування винагородами за візити та друзів</p>
                </div>
                {saveStatus && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-sirius-accent font-bold text-sm uppercase tracking-widest">
                    {saveStatus === 'saving' ? 'Зберігаємо...' : <><CheckCircle2 size={16} /> Збережено</>}
                  </motion.div>
                )}
              </div>

              {/* Visit Rewards - Compact Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {localRewards.map((reward, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/[0.02] border border-white/5 p-3 rounded-xl group focus-within:border-sirius-accent transition-all">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center font-black text-sirius-secondary text-xs border border-white/10 group-focus-within:bg-sirius-accent/20 group-focus-within:text-sirius-accent transition-all shrink-0">
                      {i + 1}
                    </div>
                    <input
                      type="text"
                      value={reward}
                      onChange={(e) => handleRewardChange(i, e.target.value)}
                      onBlur={() => commitRewardUpdate(i)}
                      className="bg-transparent border-none w-full focus:outline-none font-bold text-sm"
                      placeholder={`Бонус за візит ${i + 1}`}
                    />
                  </div>
                ))}
              </div>

              {/* Referral Bonus Card - Enhanced Design */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-sirius-accent/50 to-sirius-accent/5 rounded-[24px] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative bg-sirius-card border border-sirius-accent/20 p-6 sm:p-8 rounded-[24px] overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Gift size={120} />
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-sirius-accent/20 rounded-lg text-sirius-accent">
                          <Gift size={20} />
                        </div>
                        <h4 className="text-lg font-black uppercase tracking-tight">Бонус за друга</h4>
                      </div>
                      <p className="text-sirius-secondary text-xs sm:text-sm max-w-md">
                        Ця нагорода нараховується автоматично <span className="text-white font-bold">обом сторонам</span>: і клієнту, який поділився кодом, і його другу після реєстрації.
                      </p>
                    </div>

                    <div className="w-full md:w-80">
                      <div className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-sirius-accent mb-2">Назва винагороди</div>
                      <input
                        name="referralReward"
                        value={localReferral}
                        onChange={(e) => setLocalReferral(e.target.value)}
                        onBlur={commitReferralUpdate}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-sirius-accent font-black text-sm transition-all shadow-inner"
                        placeholder="Наприклад: Безкоштовна стрижка"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal User Registration */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-sirius-bg/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-sirius-card border border-white/10 p-10 rounded-[40px] max-w-lg w-full relative z-10 shadow-2xl text-white">
            <h2 className="text-3xl font-black uppercase mb-8 text-center">Новий клієнт</h2>
            <form onSubmit={handleRegister} className="space-y-6">
              <input required name="name" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-sirius-accent" placeholder="Ім'я" />
              <input required name="phone" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-sirius-accent" placeholder="Телефон" />
              <div className="grid grid-cols-2 gap-4">
                <input required name="pin" maxLength={4} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-sirius-accent text-center" placeholder="PIN" />
                <input name="referredByCode" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-sirius-accent text-center uppercase" placeholder="КОД" />
              </div>
              <button type="submit" className="w-full bg-sirius-accent text-white py-5 rounded-2xl font-black uppercase tracking-widest mt-4 shadow-xl shadow-sirius-accent/20">Зареєструвати</button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
