export const translations = {
    ua: {
        welcomeTitle: "Вітаємо в Sirius",
        welcomeSubtitle: "Система лояльності найкращого барбершопу",
        loginBtn: "Увійти",
        registerLink: "Зареєструватися",
        nameLabel: "Ім'я",
        phoneLabel: "Номер телефону",
        pinLabel: "ПІН-код",
        pinHint: "4 цифри",
        referralLabel: "Код реферала (якщо є)",
        submitRegister: "Стати Клієнтом",
        submitLogin: "Увійти",
        backToLogin: "Вже у клубі? Вхід",
        logout: "Вийти з акаунта",
        logoutConfirmTitle: "Дійсно вийти?",
        logoutConfirmText: "Ви впевнені, що хочете завершити сесію?",
        confirmBtn: "Так, вийти",
        cancelBtn: "Скасувати",
        balanceLabel: "Ваш Баланс",
        referralsLabel: "Реферали",
        friendsCame: "Друзів прийшло",
        totalVisits: "Всього сеансів",
        lifetimeVisits: "За весь час",
        giftForFriendTitle: "Подарунок за друга",
        giftHint: "Коли ваш друг зареєструється за цим кодом, ви ОБОЄ отримаєте цей подарунок!",
        inviteBtn: "ЗАПРОСИТИ",
        copied: "СКОПІЙОВАНО",
        invitedBy: "Запросив",
        loyaltyCardTitle: "Карта Лояльності",
        visitsCount: "Візитів",
        nextReward: "Наступний бонус",
        infoVisits: "Бонуси будуть нараховані та доступні для використання при наступному візиті. 💈",
        infoReferral: "Бонуси за запрошених друзів ви отримаєте після того, як ваш друг здійснить свій перший візит у барбершоп.",
        authError: "Невірний номер телефону або ПІН-код",
        regError: "Клієнт з таким номером вже зареєстрований",
        errorInvalidPhone: "Невірний формат польського номера",
        loading: "Зачекайте...",
        successRegTitle: "Готово!",
        successRegText: "Профіль створено. Ласкаво просимо до клубу!",
        celebrationSub: "Ви отримали свій супер-бонус",
        celebrationBtn: "ЗАБРАТИ БОНУС",
        inviteMessage: (reward, link) => `Запрошую тебе в Sirius Barbershop! ✂️\n\nЗареєструйся за моїм посиланням і ми ОБОЄ отримаємо "${reward}" на наступний візит! 🎁\n\nТвоє посилання: ${link}\n\nСтавай частиною клубу! 💈`,
    },
    pl: {
        welcomeTitle: "Witamy w Sirius",
        welcomeSubtitle: "System lojalnościowy najlepszego barbershopu",
        loginBtn: "Zaloguj",
        registerLink: "Dołącz",
        nameLabel: "Imię",
        phoneLabel: "Numer telefonu",
        pinLabel: "Kod PIN",
        pinHint: "4 cyfry",
        referralLabel: "Kod polecający (opcjonalnie)",
        submitRegister: "Zarejestruj",
        submitLogin: "Zaloguj się",
        backToLogin: "Masz konto? Zaloguj",
        logout: "Wyloguj się",
        logoutConfirmTitle: "Czy na pewno chcesz się wylogować?",
        logoutConfirmText: "Czy na pewno chcesz zakończyć sesję?",
        confirmBtn: "Tak, wyloguj",
        cancelBtn: "Anuluj",
        balanceLabel: "Twój Balans",
        referralsLabel: "Polecenia",
        friendsCame: "Zaproszeni znajomi",
        totalVisits: "Łącznie wizyt",
        lifetimeVisits: "Od początku",
        giftForFriendTitle: "Prezent za polecenie",
        giftHint: "Gdy Twój znajomy zarejestruje się z tym kodem, OBOJE otrzymacie ten prezent!",
        inviteBtn: "ZAPROŚ",
        copied: "SKOPIOWANO",
        invitedBy: "Zaprosił",
        loyaltyCardTitle: "Karta Lojalnościowa",
        visitsCount: "Wizyt",
        nextReward: "Następny bonus",
        infoVisits: "Bonusy zostaną naliczone i będą dostępne do wykorzystania przy następnej wizycie. 💈",
        infoReferral: "Bonusy za zaproszonych znajomych otrzymasz po tym, jak Twój znajomy odbędzie swoją pierwszą wizytę w barbershopie.",
        authError: "Nieprawidłowy numer telefonu lub kod PIN",
        regError: "Klient z tym numerem jest już zarejestrowany",
        errorInvalidPhone: "Nieprawidłowy format polskiego numeru",
        loading: "Proszę czekać...",
        successRegTitle: "Gotowe!",
        successRegText: "Profil został utworzony. Witamy w klubie!",
        celebrationSub: "Otrzymałeś swój super-bonus",
        celebrationBtn: "ODBIERZ BONUS",
        inviteMessage: (reward, link) => `Zapraszam Cię do Sirius Barbershop! ✂️\n\nZarejestruj się z mojego linku, a OBIE osoby otrzymają "${reward}" na masepną wizytę! 🎁\n\nTwój link: ${link}\n\nZostań częścią klubu! 💈`,
    }
};

export const translateReward = (reward, lang) => {
    if (!reward || lang === 'ua') return reward;
    
    const lowReward = reward.toLowerCase();
    
    if (lowReward.includes('знижка')) {
        return reward.replace(/знижка/gi, 'Zniżka');
    }
    if (lowReward.includes('стрижка')) {
        return reward.replace(/стрижка/gi, 'Strzyżenie');
    }
    if (lowReward.includes('бонус')) {
        return reward.replace(/бонус/gi, 'Bonus');
    }
    if (lowReward.includes('подарунок')) {
        return reward.replace(/подарунок/gi, 'Prezent');
    }
    
    return reward;
};
