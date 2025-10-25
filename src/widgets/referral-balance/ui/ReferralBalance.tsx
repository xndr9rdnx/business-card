'use client';

// src/widgets/balance/ui/Balance.tsx
import CountUp from 'react-countup';
import { useUser } from '@/entities/user';
import { convertCurrency, useCurrencyConverter } from '@/features/currency-converter';
import { CurrencyAmount } from '@/shared/ui/balance-amount';
import styles from './ReferralBalance.module.scss';

export const ReferralBalance = () => {
    const { data: user } = useUser();
    const { rates } = useCurrencyConverter();

    const userBalance =
        user?.referral_balance !== undefined && user?.referral_balance !== null
            ? Number(user.referral_balance)
            : 0;

    const balanceRub = rates
        ? convertCurrency({
              amount: userBalance,
              from: 'USDT',
              to: 'RUB',
              rates: rates,
          })
        : 0;

    const formattedBalanceRub = balanceRub.toFixed(2);
    const formattedBalanceUSDT = userBalance.toFixed(2);

    return (
        <div className={styles.balance}>
            <div className={styles.balanceUSDT}>
                <CurrencyAmount variant="withdraw">
                    <CountUp
                        end={parseFloat(formattedBalanceUSDT)} // Преобразуем в число
                        decimals={2}
                        duration={0.5} // Продолжительность анимации в секундах
                        separator=" " // Разделитель тысяч (если нужно)
                        decimal="."
                        prefix="" // Префикс (если нужен, например, "$")
                        suffix=" "
                        className={styles.value}
                    />
                </CurrencyAmount>
            </div>

            <div className={styles.balanceRUB}>
                ≈{' '}
                <CountUp
                    end={parseFloat(formattedBalanceRub)}
                    decimals={2}
                    duration={1}
                    separator=" "
                    decimal="."
                    prefix=""
                    suffix=" "
                />
                <span>₽</span>
            </div>
        </div>
    );
};
