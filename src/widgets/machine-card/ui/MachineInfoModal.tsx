// @/widgets/machine-card/ui/MachineInfoModal.tsx
import { useState } from 'react';
import Image from 'next/image';
import { usePurchaseMachine } from '@/entities/machine';
import { useRefreshUser } from '@/entities/user';
import { Button, Modal } from '@/shared/ui';
import { CurrencyAmount } from '@/shared/ui/balance-amount';
import { Neon } from '@/shared/ui/neon';
import { MachineInfoModalProps } from '../model';
import styles from './MachineInfoModal.module.scss';

export const MachineInfoModal = ({ isOpen, onClose, machine, status }: MachineInfoModalProps) => {
    const { refresh: refreshUser } = useRefreshUser();
    const purchaseMutation = usePurchaseMachine();

    // --- Рассчитываем доход за активацию ---
    const earnings = Number(machine.machine.daily_payout || 0);
    const isPurchased = status !== 'not_purchased';

    // --- Состояния для обработки покупки ---
    const [purchaseError, setPurchaseError] = useState<string | null>(null);

    // --- Обработчик покупки внутри модалки ---
    const handleBuyFromModal = async () => {
        if (isPurchased || purchaseMutation.isPending) return;

        setPurchaseError(null);

        try {
            const success = await purchaseMutation.mutateAsync({ machine_id: machine.machine.id });

            if (success) {
                console.log(`Машина ${machine.machine.id} успешно куплена из модального окна.`);

                // Обновляем баланс пользователя
                try {
                    await refreshUser();
                    console.log('Баланс пользователя обновлён после покупки машины из модалки.');
                } catch (balanceError) {
                    console.error(
                        'Ошибка обновления баланса после покупки машины из модалки:',
                        balanceError
                    );
                }

                // Закрываем модалку с анимацией
                window.dispatchEvent(new CustomEvent('closeModalWithAnimation'));

                // Опционально: Отправляем кастомное событие
                window.dispatchEvent(
                    new CustomEvent('machinePurchased', {
                        detail: { machineId: machine.machine.id },
                    })
                );
            } else {
                setPurchaseError('Недостаточно средств на балансе.');
            }
        } catch (err: unknown) {
            console.error('Ошибка при покупке машины из модального окна:', err);
            const errorMessage = 'Недостаточно средств на балансе.';

            if (err instanceof Error) {
                const errorMessageLower = err.message.toLowerCase();
                if (
                    errorMessageLower.includes('insufficient funds') ||
                    errorMessageLower.includes('insufficient balance') ||
                    errorMessageLower.includes('not enough funds') ||
                    errorMessageLower.includes('недостаточно средств') ||
                    errorMessageLower.includes('баланс')
                ) {
                    // Можно оставить стандартное сообщение
                }
            }
            setPurchaseError(errorMessage);
        }
    };

    // --- Обработчик отмены ---
    const handleCancel = () => {
        window.dispatchEvent(new CustomEvent('closeModalWithAnimation'));
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className={styles.machineInfo}>
                <h2 className={styles.title}>{machine.machine.name}</h2>

                <Image
                    src={`/images/${machine.machine.image}`}
                    width={200}
                    height={200}
                    alt="Майнинг-машина"
                />

                <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                        <p className={styles.label}>Цена:</p>
                        <CurrencyAmount className={styles.value} variant="deposit" iconSize={16}>
                            {machine.machine.price}
                        </CurrencyAmount>
                    </div>

                    <div className={styles.infoItem}>
                        <p className={styles.label}>Заряды:</p>
                        <Neon color="orange" className={styles.value}>
                            {machine.machine.lifespan}
                        </Neon>
                    </div>

                    <div className={styles.infoItem}>
                        <p className={styles.label}>Время работы 1 заряда:</p>
                        <p className={styles.value}>24 часа</p>
                    </div>

                    <div className={styles.infoItem}>
                        <p className={styles.label}>Доход за 1 заряд:</p>
                        <CurrencyAmount className={styles.value} variant="withdraw" iconSize={16}>
                            +{earnings}
                        </CurrencyAmount>
                    </div>

                    {purchaseError && <div className={styles.error}>{purchaseError}</div>}

                    {!isPurchased && (
                        <div className={styles.actions}>
                            <Button label="Отменить" variant="secondary" onClick={handleCancel} />

                            <Button
                                label={purchaseMutation.isPending ? 'Покупка...' : 'Купить'}
                                onClick={handleBuyFromModal}
                                disabled={purchaseMutation.isPending}
                            />
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};
