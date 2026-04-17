import './globals.css';

export const metadata = {
    title: 'Sirius Barbershop | Loyalty',
    description: 'Sirius Barbershop Loyalty Program',
    icons: {
        icon: '/favicon.png',
    },
};

import { LanguageProvider } from '@/context/LanguageContext';

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="antialiased font-sans bg-sirius-bg">
                <LanguageProvider>
                    {children}
                </LanguageProvider>
            </body>
        </html>
    );
}
