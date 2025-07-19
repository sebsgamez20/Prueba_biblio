<?php

namespace App\Observers;

use App\Models\Loan;

class LoanObserver
{
    /**
     * Handle the Loan "created" event.
     */
    public function created(Loan $loan): void
    {
        // Marcar libro como prestado
        $loan->book->update(['availability' => 'borrowed']);
    }

    /**
     * Handle the Loan "updated" event.
     */
    public function updated(Loan $loan): void
    {
        // Si el préstamo fue marcado como devuelto, marcar libro como disponible
        if ($loan->status === Loan::STATUS_RETURNED) {
            $loan->book->update(['availability' => 'available']);
        }
        
        // Si el préstamo fue marcado como vencido, actualizar disponibilidad
        if ($loan->status === Loan::STATUS_OVERDUE) {
            $loan->book->update(['availability' => 'borrowed']);
        }
    }

    /**
     * Handle the Loan "deleted" event.
     */
    public function deleted(Loan $loan): void
    {
        // Si el préstamo estaba activo, marcar libro como disponible
        if (in_array($loan->status, [Loan::STATUS_ACTIVE, Loan::STATUS_RENEWED, Loan::STATUS_OVERDUE])) {
            $loan->book->update(['availability' => 'available']);
        }
    }

    /**
     * Handle the Loan "restored" event.
     */
    public function restored(Loan $loan): void
    {
        // Marcar libro como prestado si se restaura un préstamo activo
        if (in_array($loan->status, ['active', 'renewed'])) {
            $loan->book->update(['availability' => 'borrowed']);
        }
    }

    /**
     * Handle the Loan "force deleted" event.
     */
    public function forceDeleted(Loan $loan): void
    {
        // Mismo comportamiento que deleted
        $this->deleted($loan);
    }

    /**
     * Actualizar automáticamente el estado de préstamos vencidos
     */
    public static function updateOverdueLoans(): void
    {
        $overdueLoans = Loan::whereIn('status', [Loan::STATUS_ACTIVE, Loan::STATUS_RENEWED])
            ->where('due_date', '<', now())
            ->get();

        foreach ($overdueLoans as $loan) {
            $loan->markAsOverdue();
        }
    }
} 