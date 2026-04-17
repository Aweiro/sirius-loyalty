"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createHash } from "crypto";

function hashAdminPassword(password: string) {
    const salt = process.env.ADMIN_PASSWORD_SALT || "default_salt";
    return createHash("sha256").update(password + salt).digest("hex");
}

async function logAudit(action: string, targetId?: string, details?: string) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("currentUserId")?.value;
        await prisma.auditLog.create({
            data: {
                action,
                userId,
                targetId,
                details
            }
        });
    } catch (error) {
        console.error("Audit log failed:", error);
    }
}

function validatePolishPhone(phone: string) {
    // Remove all non-digit characters
    const clean = phone.replace(/\D/g, "");
    
    // Polish numbers are 9 digits (excluding 48)
    if (clean.length === 9) return "+48" + clean;
    if (clean.length === 11 && clean.startsWith("48")) return "+" + clean;
    
    return null;
}

export async function checkAdminPasswordSet() {
    try {
        const settings = await prisma.globalSettings.findUnique({
            where: { id: "SIRIUS_CONFIG" }
        });
        return { success: true, isSet: !!settings?.adminPasswordHash };
    } catch (error) {
        return { success: false, isSet: false };
    }
}

export async function verifyAdminPassword(password: string) {
    try {
        const settings = await prisma.globalSettings.findUnique({
            where: { id: "SIRIUS_CONFIG" }
        });
        if (!settings?.adminPasswordHash) {
            return { success: false, error: "Пароль не встановлено" };
        }

        const inputHash = hashAdminPassword(password);
        if (inputHash === settings.adminPasswordHash) {
            return { success: true };
        } else {
            return { success: false, error: "Невірний пароль" };
        }
    } catch (error) {
        return { success: false, error: "Помилка сервера" };
    }
}

export async function setAdminPassword(password: string) {
    try {
        const hash = hashAdminPassword(password);
        await prisma.globalSettings.upsert({
            where: { id: "SIRIUS_CONFIG" },
            update: { adminPasswordHash: hash },
            create: { id: "SIRIUS_CONFIG", adminPasswordHash: hash }
        });
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Помилка при збереженні пароля" };
    }
}

export async function registerClient(formData) {
    const name = formData.get("name");
    const rawPhone = formData.get("phone");
    const pin = formData.get("pin");
    const referredByCode = formData.get("referredByCode");

    const phone = validatePolishPhone(rawPhone);
    if (!phone) {
        return { success: false, error: "Невірний формат польського номера (має бути 9 цифр)" };
    }

    if (!pin || pin.length !== 4) {
        return { success: false, error: "ПІН-код має складатися з 4 цифр" };
    }

    try {
        const referralCode = name.split(' ')[0].toUpperCase() + Math.floor(Math.random() * 1000);

        // Count users to see if this is the first one
        const userCount = await prisma.user.count();
        const role = userCount === 0 ? "ADMIN" : "CLIENT";

        // Create the user
        const newUser = await prisma.user.create({
            data: {
                name,
                phone,
                pin,
                role,
                referralCode,
                referredByCode,
                videoStage: 1,
                visitsCount: 0,
                language: formData.get("language") || "ua",
            },
        });

        // Set session only if not requested to skip (e.g. by Admin)
        const skipSession = formData.get("skipSession") === "true";
        if (!skipSession) {
            const cookieStore = await cookies();
            cookieStore.set("currentUserId", newUser.id, {
                secure: true,
                httpOnly: true,
                path: "/",
                maxAge: 60 * 60 * 24 * 30 // 30 days
            });
        }

        // Referral Logic
        if (referredByCode && referredByCode.toString().trim() !== "") {
            const cleanCode = referredByCode.toString().trim().toUpperCase();
            
            // Check if referrer exists
            const referrer = await prisma.user.findUnique({
                where: { referralCode: cleanCode }
            });

            if (referrer) {
                // Code is VALID
                console.log(`VALID REFERRAL CODE: [${cleanCode}] from ${referrer.name}`);
                
                // 1. Mark that the referral was valid (optional tracking, but we already have referredByCode in newUser)
                // 2. Grant 1 bonus to the NEW USER immediately as a welcome gift
                await prisma.user.update({
                    where: { id: newUser.id },
                    data: { referralBonuses: { increment: 1 } }
                });
                console.log(`NEW USER WELCOME BONUS: Added 1 referral bonus to new user ${newUser.name}`);
            } else {
                // Code is INVALID
                console.log(`INVALID REFERRAL CODE: [${cleanCode}]. No bonuses granted.`);
            }
        }

        revalidatePath("/");

        revalidatePath("/");
        revalidatePath("/register");
        return { success: true, user: newUser };
    } catch (error) {
        console.error("Registration error:", error);
        if (error.code === 'P2002') {
            return { success: false, error: "Клієнт з таким номером телефону вже зареєстрований" };
        }
        return { success: false, error: error.message };
    }
}

export async function addVisit(userId) {
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error("User not found");

        const newVisits = user.visitsCount + 1;
        let videoStage = user.videoStage;

        // Progression logic: Increase video stage every 10 visits
        if (newVisits > 0 && newVisits % 10 === 0) {
            videoStage = Math.min(videoStage + 1, 3);
        }

        // Check if this is the FIRST visit
        const isFirstVisit = user.visitsCount === 0;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                visitsCount: newVisits,
                videoStage,
                lastVisitAt: new Date(),
            },
        });

        await logAudit("ADD_VISIT", userId, `New count: ${newVisits}`);

        // If it's the first visit and they were referred, reward the referrer now
        if (isFirstVisit && user.referredByCode) {
            const cleanCode = user.referredByCode.trim().toUpperCase();
            try {
                const referrer = await prisma.user.update({
                    where: { referralCode: cleanCode },
                    data: {
                        referralCount: { increment: 1 },
                        referralBonuses: { increment: 1 }
                    }
                });
                console.log(`REFERRAL REWARDED: ${referrer.name} received a bonus for ${user.name}'s first visit!`);
            } catch (err) {
                console.log(`REFERRAL REWARD FAILED: Referrer code [${cleanCode}] not found or update failed.`);
            }
        }

        revalidatePath("/");
        return { success: true, user: updatedUser };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function removeVisit(userId) {
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error("User not found");
        if (user.visitsCount <= 0) throw new Error("No visits to remove");

        const newVisits = user.visitsCount - 1;
        let videoStage = user.videoStage;

        // Regression logic: Decrease video stage if falling below a 10-visit threshold
        // e.g., if was 10 (stage 2) and becomes 9, go back to stage 1
        if (newVisits >= 0 && (newVisits + 1) % 10 === 0 && newVisits > 0) {
            videoStage = Math.max(videoStage - 1, 1);
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                visitsCount: newVisits,
                videoStage
            },
        });

        await logAudit("REMOVE_VISIT", userId, `New count: ${newVisits}`);

        revalidatePath("/");
        return { success: true, user: updatedUser };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function getUsers() {
    try {
        return await prisma.user.findMany({
            orderBy: { createdAt: 'desc' }
        });
    } catch (error) {
        console.error("Fetch users error:", error);
        return [];
    }
}

export async function loginClient(formData) {
    const rawPhone = formData.get("phone");
    const pin = formData.get("pin");

    const phone = validatePolishPhone(rawPhone);
    if (!phone) {
        return { success: false, error: "Невірний номер телефону" };
    }

    try {
        // Try finding by full international format first
        let user = await prisma.user.findUnique({ where: { phone } });
        
        // Fallback for transition period: search by 9-digit version if not found
        if (!user && phone.startsWith("+48")) {
            const shortPhone = phone.slice(3);
            user = await prisma.user.findUnique({ where: { phone: shortPhone } });
            
            // Auto-update to new format on successful login
            if (user && user.pin === pin) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { phone: phone }
                });
            }
        }

        if (!user || user.pin !== pin) {
            return { success: false, error: "Невірний номер телефону або ПІН-код" };
        }

        const cookieStore = await cookies();
        cookieStore.set("currentUserId", user.id, {
            secure: true,
            httpOnly: true,
            path: "/",
            maxAge: 60 * 60 * 24 * 30
        });

        return { success: true, user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function logoutClient() {
    const cookieStore = await cookies();
    cookieStore.delete("currentUserId");
    revalidatePath("/");
}

export async function getCurrentUser() {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("currentUserId")?.value;
        if (!userId) return null;

        return await prisma.user.findUnique({ where: { id: userId } });
    } catch (error) {
        return null;
    }
}

export async function getRewardsConfig() {
    try {
        const rewards = await prisma.visitReward.findMany({
            orderBy: { visitNumber: 'asc' }
        });

        // If no rewards, seed them
        if (rewards.length === 0) {
            const defaultRewards = ["-20%", "-10%", "", "-10%", "-5%", "", "-20%", "", "-5%", "-30%"];
            const seed = defaultRewards.map((text, i) => ({
                visitNumber: i + 1,
                rewardText: text
            }));
            await prisma.visitReward.createMany({ data: seed });
            return await prisma.visitReward.findMany({ orderBy: { visitNumber: 'asc' } });
        }

        return rewards;
    } catch (error) {
        console.error("Fetch rewards error:", error);
        return [];
    }
}

export async function updateRewardConfig(visitNumber, rewardText) {
    try {
        console.log(`Updating reward for visit ${visitNumber} to: "${rewardText}"`);
        await prisma.visitReward.upsert({
            where: { visitNumber },
            update: { rewardText },
            create: { visitNumber, rewardText }
        });
        console.log(`Successfully updated reward ${visitNumber}`);
        await logAudit("UPDATE_REWARD", null, `Visit ${visitNumber}: ${rewardText}`);
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error(`Error updating reward ${visitNumber}:`, error);
        return { success: false, error: error.message };
    }
}

export async function getGlobalSettings() {
    try {
        let settings = await prisma.globalSettings.findUnique({
            where: { id: "SIRIUS_CONFIG" }
        });

        if (!settings) {
            settings = await prisma.globalSettings.create({
                data: { id: "SIRIUS_CONFIG", referralReward: "Безкоштовна стрижка" }
            });
        }

        return settings;
    } catch (error) {
        console.error("Fetch settings error:", error);
        return null;
    }
}

export async function updateGlobalSettings(referralReward) {
    try {
        console.log(`Updating global settings (referral reward) to: "${referralReward}"`);
        await prisma.globalSettings.upsert({
            where: { id: "SIRIUS_CONFIG" },
            update: { referralReward },
            create: { id: "SIRIUS_CONFIG", referralReward }
        });
        console.log(`Successfully updated global settings`);
        await logAudit("UPDATE_GLOBAL_SETTINGS", null, `Referral reward: ${referralReward}`);
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error(`Error updating global settings:`, error);
        return { success: false, error: error.message };
    }
}

export async function useReferralBonus(userId) {
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.referralBonuses <= 0) {
            return { success: false, error: "Немає доступних бонусів" };
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                referralBonuses: { decrement: 1 }
            }
        });

        await logAudit("SPEND_REFERRAL_BONUS", userId);

        revalidatePath("/");
        return { success: true, user: updatedUser };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function updateUserLanguage(userId: string, language: string) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { language }
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
