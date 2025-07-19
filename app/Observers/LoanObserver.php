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
        // Marcar libro como prestado cuando se crea un préstamo
        $loan->book->update(['availability' => 'borrowed']);
    }

    /**
     * Handle the Loan "updated" event.
     */
    public function updated(Loan $loan): void
    {
        // Si el préstamo se marca como devuelto, marcar libro como disponible
        if ($loan->status === 'returned' && $loan->wasChanged('status')) {
            $loan->book->update(['availability' => 'available']);
        }
    }

    /**
     * Handle the Loan "deleted" event.
     */
    public function deleted(Loan $loan): void
    {
        // Verificar si hay otros préstamos activos para este libro
        $activeLoans = Loan::where('book_id', $loan->book_id)
                          ->whereIn('status', ['active', 'renewed'])
                          ->count();
        
        // Si no hay préstamos activos, marcar libro como disponible
        if ($activeLoans === 0) {
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
} 