'use client';

// src/widgets/user-balance/ui/UserBalance.tsx
// Компонент показывает только баланс (депозит/вывод) и конвертацию в рубли.
import { useMemo } from 'react';
import clsx from 'clsx';
import { useUser } from '@/entities/user';
import { convertCurrency, useCurrencyConverter } from '@/features/currency-converter';
import { CurrencyAmount } from '@/shared/ui/balance-amount';
import styles from './UserBalance.module.scss';

type Props = { variant?: 'deposit' | 'withdraw'; className?: string };

export const UserBalance = ({ variant = 'deposit', className }: Props) => {
    const { data: user } = useUser();
    const { rates } = useCurrencyConverter();

    const parseBalanceA = (
        deposit_balance: string | number | bigint | undefined | null
    ): number => {
        if (typeof deposit_balance === 'number') return deposit_balance;
        if (typeof deposit_balance === 'string') return parseFloat(deposit_balance) || 0;
        if (typeof deposit_balance === 'bigint') return Number(deposit_balance);
        return 0;
    };

    const parseBalanceB = (
        withdrawal_balance: string | number | bigint | undefined | null
    ): number => {
        if (typeof withdrawal_balance === 'number') return withdrawal_balance;
        if (typeof withdrawal_balance === 'string') return parseFloat(withdrawal_balance) || 0;
        if (typeof withdrawal_balance === 'bigint') return Number(withdrawal_balance);
        return 0;
    };

    const deposit = parseBalanceA(user?.deposit_balance);
    const withdraw = parseBalanceB(user?.withdrawal_balance);
    const amount = variant === 'deposit' ? deposit : withdraw;

    const rub = useMemo(() => {
        if (!rates) return 0;
        return convertCurrency({ amount, from: 'USDT', to: 'RUB', rates });
    }, [amount, rates]);

    return (
        <div className={styles.balance}>
            <CurrencyAmount variant={variant} className={clsx(styles.amount, className)}>
                {amount.toFixed(2)}
            </CurrencyAmount>
            <div className={styles.convertRub}>≈ {rub.toFixed(2)} ₽</div>
        </div>
    );
};
