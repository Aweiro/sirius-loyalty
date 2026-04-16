import './globals.css';

export const metadata = {
    title: 'Sirius Barbershop | Loyalty',
    description: 'Sirius Barbershop Loyalty Program',
    icons: {
        icon: '/favicon.png',
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="antialiased">{children}</body>
        </html>
    );
}
