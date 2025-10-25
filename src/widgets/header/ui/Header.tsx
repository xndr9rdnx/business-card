import { useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { Arrow, Exchange, History, Invite } from '@/shared/assets/icons';
import { SegmentControls } from '@/shared/ui';
import { Neon } from '@/shared/ui/neon';
import { UserBalance } from '@/widgets/user-balance';
import { UserName } from '@/widgets/user-name';
import styles from './Header.module.scss';

export const Header = () => {
    const [mode, setMode] = useState<'deposit' | 'withdraw'>('deposit');

    return (
        <header className={styles.header}>
            <UserName />

            <SegmentControls
                options={[
                    { label: 'Инвестиции', value: 'deposit' },
                    { label: 'Заработок', value: 'withdraw' },
                ]}
                defaultValue={mode}
                onValueChange={(v) => setMode(v as 'deposit' | 'withdraw')}
            />

            <div className={clsx(styles.contentBlock, styles[mode])} key={mode}>
                <UserBalance variant={mode} />

                <div className={styles.actions} key={mode}>
                    {mode === 'deposit' ? (
                        <>
                            <Link href="/deposit" className={clsx(styles.action, styles.deposit)}>
                                <div className={styles.iconWrap}>
                                    <Arrow className={clsx(styles.icon, styles[mode])} />
                                </div>
                                <Neon className={clsx(styles.label, styles[mode])} color={'accent'}>
                                    Пополнить
                                </Neon>
                            </Link>
                            <Link href="/referral" className={clsx(styles.action, styles.referral)}>
                                <div className={styles.iconWrap}>
                                    <Invite className={clsx(styles.icon, styles[mode])} />
                                </div>
                                <Neon className={clsx(styles.label, styles[mode])} color={'accent'}>
                                    Пригласить
                                </Neon>
                            </Link>
                            <Link href="/history" className={clsx(styles.action, styles.referral)}>
                                <div className={styles.iconWrap}>
                                    <History className={clsx(styles.icon, styles[mode])} />
                                </div>
                                <Neon className={clsx(styles.label, styles[mode])} color={'accent'}>
                                    История
                                </Neon>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/withdraw" className={clsx(styles.action, styles.withdraw)}>
                                <div className={styles.iconWrap}>
                                    <Arrow className={clsx(styles.icon, styles[mode])} />
                                </div>
                                <Neon className={clsx(styles.label, styles[mode])} color={'accent'}>
                                    Вывести
                                </Neon>
                            </Link>
                            <Link href="/exchange" className={clsx(styles.action, styles.convert)}>
                                <div className={styles.iconWrap}>
                                    <Exchange className={clsx(styles.icon, styles[mode])} />
                                </div>
                                <Neon className={clsx(styles.label, styles[mode])} color={'accent'}>
                                    Обменять
                                </Neon>
                            </Link>
                            <Link href="/history" className={clsx(styles.action, styles.referral)}>
                                <div className={styles.iconWrap}>
                                    <History className={clsx(styles.icon, styles[mode])} />
                                </div>
                                <Neon className={clsx(styles.label, styles[mode])} color={'accent'}>
                                    История
                                </Neon>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};
