import { CheckIcon, ClockIcon } from 'lucide-react';
import clsx from 'clsx';

export default function PaymentStatus({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-1 text-xs',
        {
          'bg-gray-100 text-gray-500': status === 'PENDIENTE',
          'bg-green-500 text-white': status === 'PAGADO',
          'bg-red-500 text-white': status === 'VENCIDO',
          'bg-yellow-500 text-white': status === 'ANULADO',
        },
      )}
    >
      {status === 'PENDIENTE' ? (
          <>
            Pendiente
            <ClockIcon className="ml-1 w-4 text-gray-500" />
          </>
        ) : null
      }
      {status === 'PAGADO' ? (
          <>
            Pagado
            <CheckIcon className="ml-1 w-4 text-white" />
          </>
        ) : null
      }
      {status === 'VENCIDO' ? (
          <>
            Vencido
            <ClockIcon className="ml-1 w-4 text-white" />
          </>
        ) : null
      }
      {status === 'ANULADO' ? (
          <>
            Anulado
            <ClockIcon className="ml-1 w-4 text-white" />
          </>
        ) : null
      }
    </span>
  );
}
