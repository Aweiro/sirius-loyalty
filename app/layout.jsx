import './globals.css';

export const metadata = {
    title: 'Sirius Barbershop Loyalty',
    description: 'Premium Loyalty Program for Sirius Barbershop',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="antialiased">{children}</body>
        </html>
    );
}
