'use client';

// @/widgets/machine-card/ui/MachineCard.tsx
import { useCallback, useEffect, useState } from 'react';
import { memo } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { useActivateMachine, useTransitionMachine } from '@/entities/machine';
import { useRefreshUser } from '@/entities/user';
import { ClaimAnimation } from '@/features/claim-animation';
import { useTimers } from '@/shared/lib/contexts/TimerContext';
import { InfoButton, ProgressBar } from '@/shared/ui';
import { CurrencyAmount } from '@/shared/ui/balance-amount';
import { Neon } from '@/shared/ui/neon';
import { MachineCardProps } from '../model';
import styles from './MachineCard.module.scss';
import { MachineInfoModal } from './MachineInfoModal';

export const MachineCard = memo(
    ({ status, price, image, machineData, onAction }: MachineCardProps) => {
        const { startTimer, stopTimer, getTimer, isTimerActive } = useTimers();
        const { refresh: refreshUser } = useRefreshUser();
        const activateMutation = useActivateMachine();
        const transitionMutation = useTransitionMachine();
        const [isModalOpen, setIsModalOpen] = useState(false);
        const [currentStatus, setCurrentStatus] = useState(status);
        const [lastUpdated, setLastUpdated] = useState<number | null>(null);
        const [actionError, setActionError] = useState<string | null>(null);
        const [isCollectingReward, setIsCollectingReward] = useState(false);
        const [showClaimAnimation, setShowClaimAnimation] = useState(false);

        const isPurchased = currentStatus !== 'not_purchased';

        const totalActivations = machineData?.machine?.lifespan ?? 0;
        const [remainingUses, setRemainingUses] = useState<number>(
            machineData?.state_machine?.remaining_uses ?? 0
        );

        // Получаем данные таймера для этой машины
        const timerData = getTimer(machineData?.machine?.id || 0);

        // Синхронизируем локальный статус и remainingUses с пропсами при их изменении
        useEffect(() => {
            setCurrentStatus(status);
            setRemainingUses(machineData?.state_machine?.remaining_uses ?? 0);
        }, [status, machineData?.state_machine?.remaining_uses]);

        // --- Рассчитываем доход за активацию ---
        const earnings = Number(machineData?.machine?.daily_payout || 0);

        // --- Получаем время работы (мемоизировано) ---
        const getWorkTime = useCallback((): number => {
            const workTime = Number(process.env.NEXT_PUBLIC_MACHINE_WORK_TIME);
            return isNaN(workTime) ? 24 : workTime;
        }, []);

        // --- Обновляем lastUpdated при изменении machineData ---
        useEffect(() => {
            if (machineData?.state_machine?.last_updated) {
                setLastUpdated(machineData.state_machine.last_updated);
            }
        }, [machineData?.state_machine?.last_updated]);

        // --- Управление таймером ---
        useEffect(() => {
            const machineId = machineData?.machine?.id;
            if (!machineId || !lastUpdated) return;

            if (currentStatus === 'in_progress') {
                // Запускаем таймер только если он еще не активен
                if (!isTimerActive(machineId)) {
                    startTimer(machineId, lastUpdated, getWorkTime());
                }
            } else {
                // Останавливаем таймер для других статусов
                if (currentStatus !== 'waiting_for_reward') {
                    stopTimer(machineId);
                }
            }

            return () => {
                // Не останавливаем таймер при размонтировании для статуса in_progress
                if (currentStatus !== 'in_progress') {
                    stopTimer(machineId);
                }
            };
        }, [
            currentStatus,
            lastUpdated,
            machineData?.machine?.id,
            startTimer,
            stopTimer,
            getWorkTime,
            isTimerActive,
        ]);

        // --- Обработчик завершения таймера ---
        useEffect(() => {
            const handleTimerFinished = (event: CustomEvent) => {
                if (event.detail.machineId === machineData?.machine?.id) {
                    setCurrentStatus('waiting_for_reward');
                }
            };

            window.addEventListener('machineTimerFinished', handleTimerFinished as EventListener);

            return () => {
                window.removeEventListener(
                    'machineTimerFinished',
                    handleTimerFinished as EventListener
                );
            };
        }, [machineData?.machine?.id]);

        // --- Обработчики событий ---
        const handleMachinePurchased = useCallback(
            (event: CustomEvent) => {
                if (event.detail.machineId === machineData?.machine?.id) {
                    setCurrentStatus('awaiting');
                    const totalLifespan = machineData?.machine?.lifespan || 0;
                    setRemainingUses(totalLifespan);
                }
            },
            [machineData?.machine?.id, machineData?.machine?.lifespan]
        );

        const handleMachineActivated = useCallback(
            (event: CustomEvent) => {
                if (event.detail.machineId === machineData?.machine?.id) {
                    setCurrentStatus('in_progress');
                    setLastUpdated(event.detail.lastUpdated || Math.floor(Date.now() / 1000));
                }
            },
            [machineData?.machine?.id]
        );

        useEffect(() => {
            window.addEventListener('machinePurchased', handleMachinePurchased as EventListener);
            window.addEventListener('machineActivated', handleMachineActivated as EventListener);

            return () => {
                window.removeEventListener(
                    'machinePurchased',
                    handleMachinePurchased as EventListener
                );
                window.removeEventListener(
                    'machineActivated',
                    handleMachineActivated as EventListener
                );
            };
        }, [handleMachinePurchased, handleMachineActivated]);

        // --- Обработчик активации ---
        const handleActivate = async () => {
            if (currentStatus !== 'awaiting') {
                console.warn('Попытка активации в неправильном статусе:', currentStatus);
                return;
            }

            if (activateMutation.isPending || !machineData?.machine?.id) return;

            setActionError(null);

            try {
                const result = await activateMutation.mutateAsync({
                    machine_id: machineData.machine.id,
                });

                if (result) {
                    console.log(`Машина ${machineData.machine.id} активирована.`);

                    const newRemainingUses = Math.max(0, remainingUses - 1);
                    setRemainingUses(newRemainingUses);

                    const newStatus = 'in_progress';
                    setCurrentStatus(newStatus);

                    const lastUpdated = Math.floor(Date.now() / 1000);
                    setLastUpdated(lastUpdated);

                    if (onAction) {
                        onAction('activated', machineData.machine.id);
                    }
                }
            } catch (err) {
                console.error('Ошибка активации:', err);
                setActionError('Ошибка активации машины');
            }
        };

        // --- Обработчик получения награды ---
        // --- Обработчик получения награды ---
        const handleCollectReward = async () => {
            if (currentStatus !== 'waiting_for_reward') {
                console.warn('Попытка получить награду в неправильном статусе:', currentStatus);
                return;
            }

            if (transitionMutation.isPending || !machineData?.state_machine?.id) return;

            setActionError(null);
            setIsCollectingReward(true);
            setShowClaimAnimation(true);

            try {
                const result = await transitionMutation.mutateAsync({
                    machine_to_user_id: machineData.state_machine.id,
                });

                if (result) {
                    console.log(`Награда получена для машины ${machineData.machine.id}.`);

                    // Обновляем состояние сразу для правильной работы логики
                    const newRemainingUses = Math.max(0, remainingUses - 1);
                    setRemainingUses(newRemainingUses);

                    const nextState = newRemainingUses > 0 ? 'awaiting' : 'completed';
                    setCurrentStatus(nextState);

                    // Закрываем анимацию и обновляем баланс
                    setTimeout(async () => {
                        setShowClaimAnimation(false);
                        setIsCollectingReward(false);

                        try {
                            await refreshUser();
                            console.log('Баланс пользователя обновлён после получения награды.');
                        } catch (balanceError) {
                            console.error('Ошибка обновления баланса:', balanceError);
                        }
                    }, 3000); // Длительность анимации
                }
            } catch (err) {
                console.error('Ошибка получения награды:', err);
                setActionError('Ошибка получения награды');
                setTimeout(() => {
                    setShowClaimAnimation(false);
                    setIsCollectingReward(false);
                }, 3000);
            }
        };

        // --- Получить текст для отображения вместо цены ---
        const getDisplayText = useCallback(() => {
            if (!isPurchased) {
                return (
                    <CurrencyAmount variant="deposit" iconSize={16}>
                        {price}
                    </CurrencyAmount>
                );
            }

            switch (currentStatus) {
                case 'awaiting':
                    return (
                        <CurrencyAmount variant="withdraw" iconSize={16}>
                            +{earnings}
                        </CurrencyAmount>
                    );
                case 'in_progress':
                    return (
                        <Neon className={styles.timer} color={'accent'}>
                            {timerData?.timeLeftFormatted || '24:00:00'}
                        </Neon>
                    );
                case 'waiting_for_reward':
                    return (
                        <CurrencyAmount variant="withdraw" iconSize={16}>
                            {earnings}
                        </CurrencyAmount>
                    );
                case 'completed':
                    return 'Завершена';
                default:
                    return (
                        <CurrencyAmount variant="deposit" iconSize={16}>
                            {price}
                        </CurrencyAmount>
                    );
            }
        }, [isPurchased, currentStatus, price, earnings, timerData?.timeLeftFormatted]);

        // --- Получить текст для статуса ---
        const getStatusText = useCallback(() => {
            if (!isPurchased) return <Neon color={'accent'}>Купить</Neon>;

            switch (currentStatus) {
                case 'awaiting':
                    return <Neon color={'accent'}>Активировать</Neon>;
                case 'in_progress':
                    return <ProgressBar progress={timerData?.progress || 0} />;
                case 'waiting_for_reward':
                    return <Neon color={'accent'}>Забрать</Neon>;
                case 'completed':
                    return <Neon color={'accent'}>Купить</Neon>;
                default:
                    return 'Куплена';
            }
        }, [isPurchased, currentStatus, timerData?.progress]);

        // --- Получить обработчик для события ---
        const getActionHandler = () => {
            if (!machineData?.machine?.id) return undefined;

            if (!isPurchased) {
                return () => setIsModalOpen(true);
            }

            switch (currentStatus) {
                case 'awaiting':
                    return handleActivate;
                case 'waiting_for_reward':
                    return handleCollectReward;
                default:
                    return () => setIsModalOpen(true);
            }
        };

        const actionHandler = getActionHandler();
        const isProcessing =
            activateMutation.isPending || transitionMutation.isPending || isCollectingReward;

        return (
            <>
                <div className={styles.cardWrapper}>
                    <button
                        className={clsx(styles.card)}
                        onClick={actionHandler}
                        type="button"
                        aria-label={`${machineData!.machine.name}`}
                        disabled={isProcessing && isPurchased}
                    >
                        <div className={styles.info}>
                            {isPurchased ? (
                                <Neon
                                    className={styles.activationsDisplay}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsModalOpen(true);
                                    }}
                                    color={'orange'}
                                >
                                    {remainingUses} / {totalActivations}
                                </Neon>
                            ) : (
                                <InfoButton
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsModalOpen(true);
                                    }}
                                />
                            )}
                        </div>

                        <div className={clsx(styles.plate, styles[`${currentStatus}`])} />

                        <Image
                            className={clsx(styles.image, { [styles.purchased]: isPurchased })}
                            src={`/images/${image}`}
                            width={100}
                            height={100}
                            alt="Майнинг-машина"
                        />

                        <span className={styles.machineName}>{machineData!.machine.name}</span>

                        {getDisplayText() && (
                            <Neon className={styles.displayText} color="blue">
                                {getDisplayText()}
                            </Neon>
                        )}

                        {!isCollectingReward ? (
                            <>
                                {getStatusText() && (
                                    <Neon className={styles.statusText} color="orange">
                                        {getStatusText()}
                                    </Neon>
                                )}
                            </>
                        ) : (
                            // Можно показать лоадер или просто ничего
                            <div className={styles.statusText}>
                                {/* Или какой-то индикатор загрузки */}
                            </div>
                        )}

                        {actionError && <div className={styles.buyError}>{actionError}</div>}
                    </button>

                    {showClaimAnimation && (
                        <ClaimAnimation
                            onAnimationComplete={() => {
                                setShowClaimAnimation(false);
                                setIsCollectingReward(false);
                            }}
                        />
                    )}
                </div>

                {machineData && (
                    <MachineInfoModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        machine={machineData}
                        status={currentStatus}
                    />
                )}
            </>
        );
    }
);

MachineCard.displayName = 'MachineCard';
