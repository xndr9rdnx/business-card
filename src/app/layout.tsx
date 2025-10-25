// app/layout.tsx
import type { Metadata } from 'next';
import { Lato } from 'next/font/google';
import clsx from 'clsx';
import styles from './layout.module.scss';

// Подключаем шрифт Lato
const latoSans = Lato({
    weight: ['100', '300', '400', '700', '900'],
    variable: '--font-lato',
    subsets: ['latin', 'latin-ext'],
    display: 'swap',
});

export const metadata: Metadata = {
    title: {
        default: 'Торты Ваганян',
        template: '%s | RoboMine Сapital',
    },
    description: ',
    // metadataBase: new URL(FRONTEND_URL || 'Ошибка переменной URL'),
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ru" suppressHydrationWarning>
            <head>
                <script src="https://telegram.org/js/telegram-web-app.js" async></script>
            </head>
            <body className={clsx(styles.layout, latoSans.variable)}>
                <main className={styles.content}>
                    {children}
                </main>
            </body>
        </html>
    );
}
