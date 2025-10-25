'use client';

// app/page.tsx
import { Header } from '@/widgets/header';
import { MachineList } from '@/widgets/machine-list';
import styles from './Home.module.scss';

export default function HomePage() {
    return (
        <div className={styles.homePage}>
            <Header />

            <MachineList filterType="purchased" showBuyMoreCard={true} />
        </div>
    );
}
