import { ReservationStatus } from '@/entities/reservation';
import { Badge } from '@/shared/ui';

interface StatusBadgeProps {
  status: ReservationStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variantMap: Record<ReservationStatus, 'default' | 'success' | 'warning' | 'danger'> = {
    PENDING: 'warning',
    CONFIRMED: 'success',
    CANCELLED: 'danger',
  };

  return <Badge variant={variantMap[status]}>{status}</Badge>;
}
