import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, UserPlus, Gift, Star, Settings, Save, CheckCircle2, Users, MinusCircle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = ({ users, addVisit, removeVisit, registerUser, rewards, updateReward, globalSettings, updateReferralReward, spendReferralBonus, checkAdminPasswordSet, verifyAdminPassword, setAdminPassword }) => {
  const [activeSubTab, setActiveSubTab] = useState('users'); // 'users' or 'settings'
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const adminPinRef = useRef(null);
  const adminPhoneRef = useRef(null);

  const [localRewards, setLocalRewards] = useState(rewards);
  const [localReferral, setLocalReferral] = useState(globalSettings?.referralReward || "");
  const [localBooksy, setLocalBooksy] = useState(globalSettings?.booksyLink || "");
  const [localAddress, setLocalAddress] = useState(globalSettings?.addressText || "");
  const [localMaps, setLocalMaps] = useState(globalSettings?.googleMapsLink || "");
  const [saveStatus, setSaveStatus] = useState(null); // 'saving', 'saved', null
  const [confirmation, setConfirmation] = useState(null); // { type, user, action }

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isPwdSet, setIsPwdSet] = useState(false);
  const [pwdInput, setPwdInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [isCheckingPwd, setIsCheckingPwd] = useState(true);

  // Check if admin password is set on mount
  useEffect(() => {
    const checkPwd = async () => {
      const res = await checkAdminPasswordSet();
      setIsPwdSet(res.isSet);
      
      // Check for persistent unlock
      const savedAuth = localStorage.getItem('sirius_admin_unlocked');
      if (savedAuth === 'true') {
        setIsUnlocked(true);
      }
      
      setIsCheckingPwd(false);
    };
    checkPwd();
  }, []);

  // Sync local state when props change
  useEffect(() => {
    if (rewards && rewards.length > 0) setLocalRewards(rewards);
  }, [rewards]);

  useEffect(() => {
    if (globalSettings?.referralReward) setLocalReferral(globalSettings.referralReward);
    if (globalSettings?.booksyLink) setLocalBooksy(globalSettings.booksyLink);
    if (globalSettings?.addressText) setLocalAddress(globalSettings.addressText);
    if (globalSettings?.googleMapsLink) setLocalMaps(globalSettings.googleMapsLink);
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
    if (user) {
      setIsModalOpen(false);
      setPhoneInput("");
    }
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

  const commitGlobalUpdate = async (field, value) => {
    if (value === globalSettings[field]) return;
    setSaveStatus('saving');
    await updateReferralReward({ [field]: value }); // Note: actions.ts is being updated to take an object
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus(null), 2000);
  };

  const handleActionClick = (type, user) => {
    let action, title, description;

    if (type === 'add') {
      action = () => addVisit(user.id);
      title = "Додати візит?";
      description = `Додати 1 візит для ${user.name}?`;
    } else if (type === 'remove') {
      action = () => removeVisit(user.id);
      title = "Видалити візит?";
      description = `Відняти 1 візит для ${user.name}?`;
    } else if (type === 'spend') {
      action = () => spendReferralBonus(user.id);
      title = "Списати бонус?";
      description = `Використати 1 бонус друга для ${user.name}?`;
    }

    setConfirmation({ type, title, description, action });
  };

  const executeConfirmedAction = async () => {
    if (!confirmation) return;
    await confirmation.action();
    setConfirmation(null);
  };

  const handleAdminAuth = async (e) => {
    e.preventDefault();
    setAuthError("");

    if (!isPwdSet) {
      // Setup phase
      if (pwdInput.length < 4) {
        setAuthError("Пароль занадто короткий");
        return;
      }
      const res = await setAdminPassword(pwdInput);
      if (res.success) {
        setIsPwdSet(true);
        setIsUnlocked(true);
      }
    } else {
      // Verify phase
      const res = await verifyAdminPassword(pwdInput);
      if (res.success) {
        setIsUnlocked(true);
        localStorage.setItem('sirius_admin_unlocked', 'true');
      } else {
        setAuthError(res.error || "Невірний пароль");
      }
    }
  };

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '');
    const clean = digits.startsWith('48') ? digits.slice(2, 11) : digits.slice(0, 9);
    if (clean.length === 0) return { formatted: '', digits: '' };
    let formatted = '+48 (' + clean.slice(0, 3);
    if (clean.length > 3) {
      formatted += ') ' + clean.slice(3, 6);
      if (clean.length > 6) {
        formatted += ' ' + clean.slice(6, 9);
      }
    }
    return { formatted, digits: clean };
  };

  const handleAdminPhoneChange = (e) => {
    const { formatted, digits } = formatPhone(e.target.value);
    setPhoneInput(formatted);
    if (digits.length === 9) {
      adminPinRef.current?.focus();
    }
  };

  const handleAdminPinKeyDown = (e) => {
    if (e.key === 'Backspace' && e.target.value === '') {
      adminPhoneRef.current?.focus();
    }
  };

  if (isCheckingPwd) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="w-8 h-8 border-4 border-sirius-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-lg mx-auto w-full min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-sirius-card border border-white/10 rounded-[40px] p-8 sm:p-12 w-full shadow-2xl relative overflow-hidden text-center"
        >
          {/* Lock Background Decor */}
          <div className="absolute top-0 right-0 p-10 opacity-5">
            <ShieldCheck size={120} />
          </div>

          <div className="w-20 h-20 bg-sirius-accent/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-sirius-accent/10">
            <ShieldCheck size={40} className="text-sirius-accent" />
          </div>

          <h2 className="text-2xl font-black uppercase tracking-tight mb-3">
            {isPwdSet ? "Адмін-панель заблокована" : "Створення Адмін-пароля"}
          </h2>
          <p className="text-sirius-secondary text-sm mb-10 leading-relaxed font-medium">
            {isPwdSet
              ? "Для доступу до керування базою Sirius введіть ваш таємний пароль."
              : "Встановіть спеціальний пароль, який буде запитуватись при вході в дашборд. Це додатковий рівень захисту."}
          </p>

          <form onSubmit={handleAdminAuth} className="space-y-6">
            <div className="relative group">
              <input
                autoFocus
                type="password"
                placeholder={isPwdSet ? "Введіть пароль" : "Придумайте пароль"}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 focus:outline-none focus:border-sirius-accent text-center text-xl font-bold tracking-[0.2em] transition-all"
                value={pwdInput}
                onChange={(e) => setPwdInput(e.target.value)}
              />
            </div>

            {authError && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-xs font-bold uppercase tracking-widest">
                {authError}
              </motion.div>
            )}

            <button
              type="submit"
              className="w-full bg-sirius-accent text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-sirius-accent/20"
            >
              {isPwdSet ? "Розблокувати" : "Встановити та увійти"}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

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

            <div className="w-full overflow-x-auto">
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
                                  onClick={() => handleActionClick('spend', user)}
                                  className="text-sirius-secondary hover:text-red-400 transition-colors"
                                  title="Списати 1 бонус"
                                >
                                  <MinusCircle size={18} />
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end items-center gap-2">
                              <button
                                onClick={() => handleActionClick('remove', user)}
                                disabled={user.visitsCount <= 0}
                                className="bg-white/5 hover:bg-red-500/10 text-sirius-secondary hover:text-red-400 p-3 rounded-xl transition-all active:scale-90 disabled:opacity-30 disabled:pointer-events-none"
                                title="Видалити візит"
                              >
                                <MinusCircle size={20} />
                              </button>
                              <button
                                onClick={() => handleActionClick('add', user)}
                                className="bg-sirius-accent hover:bg-sirius-accent/80 text-white p-3 rounded-xl transition-all active:scale-90"
                                title="Додати візит"
                              >
                                <Plus size={20} />
                              </button>
                            </div>
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
          <div className="p-6 sm:p-10">
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
                        onBlur={() => commitGlobalUpdate('referralReward', localReferral)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-sirius-accent font-black text-sm transition-all shadow-inner"
                        placeholder="Наприклад: Безкоштовна стрижка"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Booksy & Address Card */}
              <div className="bg-sirius-card border border-white/5 p-6 sm:p-8 rounded-[24px] mt-6">
                <h4 className="text-lg font-black uppercase tracking-tight mb-6 flex items-center gap-3">
                  <Settings size={20} className="text-sirius-accent" />
                  Контакти та Запис
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-sirius-secondary mb-2">Посилання на Booksy</div>
                      <input
                        value={localBooksy}
                        onChange={(e) => setLocalBooksy(e.target.value)}
                        onBlur={() => commitGlobalUpdate('booksyLink', localBooksy)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-sirius-accent text-sm"
                        placeholder="https://booksy.com/..."
                      />
                    </div>
                    <div>
                      <div className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-sirius-secondary mb-2">Посилання на Google Maps</div>
                      <input
                        value={localMaps}
                        onChange={(e) => setLocalMaps(e.target.value)}
                        onBlur={() => commitGlobalUpdate('googleMapsLink', localMaps)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-sirius-accent text-sm"
                        placeholder="https://goo.gl/maps/..."
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-sirius-secondary mb-2">Адреса салону</div>
                    <textarea
                      value={localAddress}
                      onChange={(e) => setLocalAddress(e.target.value)}
                      onBlur={() => commitGlobalUpdate('addressText', localAddress)}
                      rows={5}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-sirius-accent text-sm resize-none"
                      placeholder="Вулиця, номер будинку, місто..."
                    />
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
              <input
                required
                ref={adminPhoneRef}
                name="phone"
                value={phoneInput}
                onChange={handleAdminPhoneChange}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-sirius-accent"
                placeholder="+48 (___) ___ ___"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  required
                  ref={adminPinRef}
                  onKeyDown={handleAdminPinKeyDown}
                  name="pin"
                  maxLength={4}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-sirius-accent text-center"
                  placeholder="PIN"
                />
                <input name="referredByCode" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-sirius-accent text-center uppercase" placeholder="КОД" />
              </div>
              <button type="submit" className="w-full bg-sirius-accent text-white py-5 rounded-2xl font-black uppercase tracking-widest mt-4 shadow-xl shadow-sirius-accent/20">Зареєструвати</button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      <AnimatePresence>
        {confirmation && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setConfirmation(null)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-sirius-card border border-white/10 p-8 rounded-[32px] max-w-sm w-full relative z-10 shadow-2xl text-white text-center"
            >
              <div className={`w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center ${confirmation.type === 'remove' ? 'bg-red-500/20 text-red-400' : 'bg-sirius-accent/20 text-sirius-accent'}`}>
                {confirmation.type === 'remove' ? <MinusCircle size={32} /> : <CheckCircle2 size={32} />}
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-2">{confirmation.title}</h3>
              <p className="text-sirius-secondary text-sm mb-8 leading-relaxed">
                {confirmation.description}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setConfirmation(null)}
                  className="bg-white/5 hover:bg-white/10 text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all"
                >
                  Скасувати
                </button>
                <button
                  onClick={executeConfirmedAction}
                  className={`py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg ${confirmation.type === 'remove' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 'bg-sirius-accent hover:brightness-110 shadow-sirius-accent/20'}`}
                >
                  Підтвердити
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
