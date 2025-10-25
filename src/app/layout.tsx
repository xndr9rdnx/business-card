// app/layout.tsx
import type { Metadata } from 'next';
import { Lato } from 'next/font/google';
import clsx from 'clsx';
import { FRONTEND_URL } from '@/shared/config';
import '@/shared/styles/global.scss';
import { AppProviders } from '../shared/lib/providers';
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
        default: 'RoboMine Сapital',
        template: '%s | RoboMine Сapital',
    },
    description: 'Зарабатывай на майнинге криптовалюты',
    metadataBase: new URL(FRONTEND_URL || 'Ошибка переменной URL'),
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
                    <AppProviders>{children}</AppProviders>
                </main>
            </body>
        </html>
    );
}
