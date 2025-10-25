'use client';

import { useUser } from '@/entities/user';
import styles from './UserName.module.scss';

export const UserName = () => {
    const { data: user } = useUser();

    return (
        <div className={styles.user}>
            <span className={styles.userName}>{user?.username}</span>
        </div>
    );
};
