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
    useReferralBonus as serverUseBonus
} from '@/lib/actions';

const VIDEO_STAGES = [
    { stage: 1, url: "/video1.mp4" },
    { stage: 2, url: "/video2.mp4" },
    { stage: 3, url: "/video3.mp4" }
];

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

    const registerUser = async (name, phone, pin, referredByCode = null, isAdminRegistration = false) => {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('phone', phone);
        formData.append('pin', pin);
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

    const updateReferralReward = async (value) => {
        const result = await serverUpdateSettings(value);
        if (result.success) {
            setGlobalSettings(prev => ({ ...prev, referralReward: value }));
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

    const getVideoUrl = (stage) => {
        const video = VIDEO_STAGES.find(v => v.stage === (stage || 1));
        return video ? video.url : VIDEO_STAGES[0].url;
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
        getVideoUrl
    };
};

export default useLoyalty;
