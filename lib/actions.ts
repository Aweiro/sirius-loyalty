"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function registerClient(formData) {
    const name = formData.get("name");
    const phone = formData.get("phone");
    const pin = formData.get("pin");
    const referredByCode = formData.get("referredByCode");

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

        // If referred by someone, increment their referralCount
        if (referredByCode && referredByCode.toString().trim() !== "") {
            const cleanCode = referredByCode.toString().trim().toUpperCase();
            console.log(`Checking referrer with code: [${cleanCode}]`);
            try {
                const referrer = await prisma.user.update({
                    where: { referralCode: cleanCode },
                    data: {
                        referralCount: { increment: 1 },
                        referralBonuses: { increment: 1 }
                    }
                });
                console.log(`REFERRAL SUCCESS: ${referrer.name} now has ${referrer.referralCount} referrals and ${referrer.referralBonuses} bonuses!`);

                // ALSO give a bonus to the NEW USER who joined via referral code
                await prisma.user.update({
                    where: { id: newUser.id },
                    data: { referralBonuses: { increment: 1 } }
                });
                console.log(`NEW USER BONUS: Added 1 referral bonus to new user ${newUser.name}`);
            } catch (err) {
                console.log(`REFERRAL ERROR: Code [${cleanCode}] not found or update failed.`);
            }
        }

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

        // Progression logic
        if (newVisits > 0 && newVisits % 10 === 0) {
            videoStage = Math.min(videoStage + 1, 3);
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                visitsCount: newVisits,
                videoStage,
                lastVisitAt: new Date(),
            },
        });

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
    const phone = formData.get("phone");
    const pin = formData.get("pin");

    try {
        const user = await prisma.user.findUnique({ where: { phone } });
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

        revalidatePath("/");
        return { success: true, user: updatedUser };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
