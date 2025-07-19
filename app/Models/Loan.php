<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class Loan extends Model
{
    protected $fillable = [
        'user_id',
        'book_id',
        'loan_date',
        'due_date',
        'return_date',
        'status',
        'fine_amount',
        'notes',
        'renewal_count',
        'renewal_date',
    ];

    protected $casts = [
        'loan_date' => 'date',
        'due_date' => 'date',
        'return_date' => 'date',
        'renewal_date' => 'date',
        'fine_amount' => 'decimal:2',
    ];

    // Constantes para estados
    const STATUS_ACTIVE = 'active';
    const STATUS_OVERDUE = 'overdue';
    const STATUS_RETURNED = 'returned';
    const STATUS_RENEWED = 'renewed';

    // Constantes para tiempo de renta
    const LOAN_DAYS = 15;
    const RENEWAL_DAYS = 7;
    const MAX_RENEWALS = 1;

    // Relación con usuario
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Relación con libro
    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class);
    }

    // Método para verificar si está vencido
    public function isOverdue(): bool
    {
        return $this->status === self::STATUS_ACTIVE && $this->due_date->isPast();
    }

    // Método para verificar si puede ser renovado
    public function canBeRenewed(): bool
    {
        return in_array($this->status, [self::STATUS_ACTIVE, self::STATUS_RENEWED]) && 
               $this->renewal_count < self::MAX_RENEWALS &&
               !$this->isOverdue();
    }

    // Método para renovar préstamo
    public function renew(): bool
    {
        if (!$this->canBeRenewed()) {
            return false;
        }

        $this->update([
            'status' => self::STATUS_RENEWED,
            'renewal_count' => $this->renewal_count + 1,
            'renewal_date' => Carbon::now(),
            'due_date' => $this->due_date->addDays(self::RENEWAL_DAYS),
        ]);

        return true;
    }

    // Método para calcular multa (mantenemos el concepto aunque no cobremos)
    public function calculateFine(): float
    {
        if (!$this->isOverdue()) {
            return 0.00;
        }

        $daysOverdue = Carbon::now()->diffInDays($this->due_date);
        return $daysOverdue * 1.00; // $1 por día (conceptual)
    }

    // Método para marcar como devuelto
    public function markAsReturned(): void
    {
        $this->update([
            'status' => self::STATUS_RETURNED,
            'return_date' => Carbon::now(),
            'fine_amount' => $this->calculateFine(),
        ]);

        // Marcar libro como disponible
        $this->book->update(['availability' => 'available']);
    }

    // Método para marcar como vencido
    public function markAsOverdue(): void
    {
        if ($this->isOverdue()) {
            $this->update([
                'status' => self::STATUS_OVERDUE,
                'fine_amount' => $this->calculateFine(),
            ]);
        }
    }

    // Método para verificar si está activo
    public function isActive(): bool
    {
        return in_array($this->status, [self::STATUS_ACTIVE, self::STATUS_RENEWED]);
    }

    // Método para obtener días restantes
    public function getDaysRemaining(): int
    {
        if (!$this->isActive()) {
            return 0;
        }

        return max(0, Carbon::now()->diffInDays($this->due_date, false));
    }

    // Método para verificar si está próximo a vencer (3 días antes)
    public function isNearDue(): bool
    {
        if (!$this->isActive()) {
            return false;
        }

        return $this->getDaysRemaining() <= 3;
    }
}
