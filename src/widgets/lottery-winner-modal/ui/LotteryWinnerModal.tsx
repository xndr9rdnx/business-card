// widgets/lottery-winner-modal/ui/LotteryWinnerModal.tsx
import Image from 'next/image';
import { useMarkWinnerNotified } from '@/entities/lottery/api/lottery.queries';
import { Button, Modal } from '@/shared/ui';
import styles from './LotteryWinnerModal.module.scss';

interface LotteryWinnerModalProps {
    isOpen: boolean;
    machine?: {
        id: number;
        name: string;
        image: string;
    };
    prizeDate?: string;
    onAcknowledge: () => void;
    onClose: () => void;
}

export const LotteryWinnerModal = ({
    isOpen,
    onClose,
    prizeDate,
    onAcknowledge,
}: LotteryWinnerModalProps) => {
    const markNotifiedMutation = useMarkWinnerNotified();

    const handleAcknowledge = async () => {
        try {
            await markNotifiedMutation.mutateAsync();
            onAcknowledge();
        } catch (error) {
            console.error('Ошибка при подтверждении уведомления:', error);
            onAcknowledge(); // Закрываем даже при ошибке
        }
    };

    // Функция для обработки закрытия через крестик
    const handleClose = async () => {
        try {
            await markNotifiedMutation.mutateAsync();
        } catch (error) {
            console.error('Ошибка при закрытии уведомления:', error);
        } finally {
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <div className={styles.winnerModal}>
                <h1 className={styles.title}>Поздравляем!</h1>

                <p className={styles.message}>
                    Вы стали победителем розыгрыша RoboMine Capital! Ваш приз:
                </p>

                <Image
                    src={`/images/machine2.webp`}
                    alt={'машина'}
                    width={200}
                    height={200}
                    className={styles.image}
                />
                <p className={styles.machineName}>DragonMint T1</p>

                {prizeDate && (
                    <p className={styles.date}>
                        Дата розыгрыша: {new Date(prizeDate).toLocaleDateString('ru-RU')}
                    </p>
                )}

                <p className={styles.info}>
                    Машина уже добавлена на вашу ферму и готова к использованию!
                </p>

                <Button
                    className={styles.button}
                    onClick={handleAcknowledge}
                    disabled={markNotifiedMutation.isPending}
                >
                    {markNotifiedMutation.isPending ? 'Закрытие...' : 'Отлично!'}
                </Button>
            </div>
        </Modal>
    );
};
