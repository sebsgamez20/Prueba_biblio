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
    ];

    protected $casts = [
        'loan_date' => 'date',
        'due_date' => 'date',
        'return_date' => 'date',
        'fine_amount' => 'decimal:2',
    ];

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
        return $this->status === 'active' && $this->due_date->isPast();
    }

    // Método para calcular multa
    public function calculateFine(): float
    {
        if (!$this->isOverdue()) {
            return 0.00;
        }

        $daysOverdue = Carbon::now()->diffInDays($this->due_date);
        return $daysOverdue * 1.00; // $1 por día
    }

    // Método para marcar como devuelto
    public function markAsReturned(): void
    {
        $this->update([
            'status' => 'returned',
            'return_date' => Carbon::now(),
            'fine_amount' => $this->calculateFine(),
        ]);

        // Marcar libro como disponible
        $this->book->markAsAvailable();
    }

    // Método para marcar como vencido
    public function markAsOverdue(): void
    {
        if ($this->isOverdue()) {
            $this->update([
                'status' => 'overdue',
                'fine_amount' => $this->calculateFine(),
            ]);
        }
    }
}
