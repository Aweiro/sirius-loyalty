import { useState, useEffect } from 'react';
import {
    addVisit as serverAddVisit,
    registerClient as serverRegister,
    getUsers as serverGetUsers,
    getCurrentUser as serverGetCurrentUser,
    logoutClient as serverLogout,
    getRewardsConfig as serverGetRewards,
    updateRewardConfig as serverUpdateReward,
    getGlobalSettings as serverGetSettings,
    updateGlobalSettings as serverUpdateSettings,
    useReferralBonus as serverUseBonus,
    removeVisit as serverRemoveVisit,
    checkAdminPasswordSet as serverCheckAdminSet,
    verifyAdminPassword as serverVerifyAdmin,
    setAdminPassword as serverSetAdmin
} from '@/lib/actions';


export const useLoyalty = () => {
    const [users, setUsers] = useState([]);
    const [rewards, setRewards] = useState([]);
    const [globalSettings, setGlobalSettings] = useState({ referralReward: "" });
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initial Load
    useEffect(() => {
        const loadInitialData = async () => {
            // 1. Check for logged in user session
            const sessionUser = await serverGetCurrentUser();
            if (sessionUser) {
                setCurrentUser(sessionUser);
            }

            // 2. Load all users (for admin side)
            const dbUsers = await serverGetUsers();
            if (dbUsers) {
                setUsers(dbUsers);
            }

            // 3. Load rewards configuration from DB
            const dbRewards = await serverGetRewards();
            if (dbRewards) {
                // Convert to array of strings for easier UI mapping in cards
                const rewardStrings = new Array(10).fill("");
                dbRewards.forEach(r => {
                    rewardStrings[r.visitNumber - 1] = r.rewardText;
                });
                setRewards(rewardStrings);
            }

            // 4. Load global settings
            const settings = await serverGetSettings();
            if (settings) setGlobalSettings(settings);

            setLoading(false);
        };
        loadInitialData();
    }, []);

    const addVisit = async (userId) => {
        const result = await serverAddVisit(userId);
        if (result.success) {
            setUsers(prev => prev.map(u => u.id === userId ? result.user : u));
            if (currentUser && currentUser.id === userId) {
                setCurrentUser(result.user);
            }
            return result.user;
        }
        return null;
    };

    const removeVisit = async (userId) => {
        const result = await serverRemoveVisit(userId);
        if (result.success) {
            setUsers(prev => prev.map(u => u.id === userId ? result.user : u));
            if (currentUser && currentUser.id === userId) {
                setCurrentUser(result.user);
            }
            return result.user;
        }
        return null;
    };

    const registerUser = async (name, phone, pin, referredByCode = null, isAdminRegistration = false, language = "ua") => {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('phone', phone);
        formData.append('pin', pin);
        formData.append('language', language);
        if (referredByCode) formData.append('referredByCode', referredByCode);
        if (isAdminRegistration) formData.append('skipSession', 'true');

        const result = await serverRegister(formData);
        if (result.success) {
            setUsers(prev => [result.user, ...prev]);
            if (!isAdminRegistration) {
                setCurrentUser(result.user);
            }
            return result.user;
        }
        return null;
    };

    const logout = async () => {
        await serverLogout();
        setCurrentUser(null);
    };

    const closeCelebration = (userId) => {
        // Logic for closing celebration
    };

    const updateReward = async (index, value) => {
        const visitNumber = index + 1;
        const result = await serverUpdateReward(visitNumber, value);
        if (result.success) {
            setRewards(prev => {
                const next = [...prev];
                next[index] = value;
                return next;
            });
        }
    };

    const updateReferralReward = async (settings) => {
        // Handle both single value (legacy) and settings object
        const settingsObj = typeof settings === 'string' ? { referralReward: settings } : settings;
        
        const result = await serverUpdateSettings(settingsObj);
        if (result.success) {
            setGlobalSettings(prev => ({ ...prev, ...settingsObj }));
        }
    };

    const spendReferralBonus = async (userId) => {
        const result = await serverUseBonus(userId);
        if (result.success) {
            setUsers(prev => prev.map(u => u.id === userId ? result.user : u));
            if (currentUser && currentUser.id === userId) {
                setCurrentUser(result.user);
            }
            return true;
        }
        return false;
    };

    const checkAdminPasswordSet = async () => {
        return await serverCheckAdminSet();
    };

    const verifyAdminPassword = async (pwd) => {
        return await serverVerifyAdmin(pwd);
    };

    const setAdminPassword = async (pwd) => {
        return await serverSetAdmin(pwd);
    };


    return {
        users,
        rewards,
        globalSettings,
        currentUser,
        loading,
        setCurrentUser,
        addVisit,
        closeCelebration,
        registerUser,
        logout,
        updateReward,
        updateReferralReward,
        spendReferralBonus,
        removeVisit,
        checkAdminPasswordSet,
        verifyAdminPassword,
        setAdminPassword
    };
};

export default useLoyalty;
