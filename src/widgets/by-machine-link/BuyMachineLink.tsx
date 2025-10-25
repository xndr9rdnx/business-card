// @/widgets/machine-card/ui/BuyMoreCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Neon } from '@/shared/ui/neon';
import styles from './BuyMachineLink.module.scss';

export const BuyMachineLink = () => {
    return (
        <Link className={styles.shopLink} href="/shop">
            <div className={styles.imageWrapper}>
                <Image
                    src="/images/mascot.webp"
                    width={100}
                    height={100}
                    alt="Робот"
                    className={styles.mascotImage}
                    priority
                />
            </div>
            <Neon className={styles.label} color="orange">
                Купить майнинг-машину
            </Neon>
        </Link>
    );
};
