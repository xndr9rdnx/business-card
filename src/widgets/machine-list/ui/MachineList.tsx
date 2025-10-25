'use client';

// @/features/mining/ui/MachineList.tsx
import React from 'react';
import Link from 'next/link';
import { useMachines } from '@/entities/machine';
import { Neon } from '@/shared/ui/neon';
import { BuyMachineLink } from '@/widgets/by-machine-link';
import { MachineCard } from '@/widgets/machine-card';
import { MachineListProps } from '../model';
import styles from './MachineList.module.scss';

export const MachineList = ({ filterType = 'all', showBuyMoreCard = false }: MachineListProps) => {
    const { data: machines, isLoading, isError } = useMachines();

    // Показываем загрузку или null пока данные не загрузились
    if (isLoading) {
        return null;
    }

    // Если нет машин, показываем ссылку на покупку
    if (!machines || machines.length === 0) {
        return <BuyMachineLink />;
    }

    // Фильтрация по типу
    const filteredMachines = machines.filter(({ state_machine }) => {
        const status = state_machine?.status ?? 'not_purchased';
        switch (filterType) {
            case 'purchased':
                return status !== 'not_purchased';
            case 'not_purchased':
                return status === 'not_purchased';
            case 'all':
            default:
                return true;
        }
    });

    // Если фильтр по купленным машинам и нет купленных машин, показываем ссылку на покупку
    if (filterType === 'purchased' && filteredMachines.length === 0) {
        return <BuyMachineLink />;
    }

    // Сортировка от самой дешевой к самой дорогой
    const sortedMachines = [...filteredMachines].sort((a, b) => {
        return a.machine.price - b.machine.price;
    });

    const shouldShowBuyMore = showBuyMoreCard && filterType === 'purchased';

    return (
        <div className={styles.machineList}>
            {shouldShowBuyMore && (
                <div className={styles.cardWrapper}>
                    <Link href="/shop" className={styles.buyMoreCard}>
                        <div className={styles.plate} />
                        <span className={styles.add}>+</span>
                        <Neon className={styles.label} color="accent">
                            Купить ещё
                        </Neon>
                    </Link>
                </div>
            )}

            {sortedMachines.map((machineWithState) => {
                const { machine, state_machine } = machineWithState;
                const status = state_machine?.status ?? 'not_purchased';
                const isPurchased = status !== 'not_purchased';

                return (
                    <MachineCard
                        key={machine.id}
                        image={machine.image}
                        price={machine.price}
                        status={status}
                        isPurchased={isPurchased}
                        machineData={machineWithState}
                    />
                );
            })}
        </div>
    );
};
