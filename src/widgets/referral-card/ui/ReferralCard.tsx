// @/widgets/referral-card/ui/ReferralCard.tsx
import { ReferralWithBonusData } from '@/entities/referral';
import { CurrencyAmount } from '@/shared/ui/balance-amount';
import styles from './ReferralCard.module.scss';

interface ReferralCardProps {
    referral: ReferralWithBonusData;
}

export const ReferralCard = ({ referral }: ReferralCardProps) => {
    const bonus: number = +referral?.referrer_bonus || 0;
    const formattedBonus = bonus.toFixed(2);

    const getFallbackAvatarUrl = () => {
        const username = referral.username || `User${referral.referral_id}`;
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=cccccc&color=666666&size=100&rounded=true`;
    };

    return (
        <div className={styles.card}>
            <img
                className={styles.avatar}
                src={referral.avatar_url || getFallbackAvatarUrl()}
                width={100}
                height={100}
                alt={`Аватар ${referral.username}`}
                onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = getFallbackAvatarUrl();
                }}
            />

            <span className={styles.username}>{referral.username}</span>

            <CurrencyAmount className={styles.profit} variant="withdraw" iconSize={16}>
                +{formattedBonus}
            </CurrencyAmount>
        </div>
    );
};
