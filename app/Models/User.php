<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'api_token',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'api_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // Constantes para roles
    const ROLE_USER = 'user';
    const ROLE_ADMIN = 'admin';

    // Relación con préstamos
    public function loans(): HasMany
    {
        return $this->hasMany(Loan::class);
    }

    // Método para obtener préstamos activos
    public function activeLoans()
    {
        // Actualizar automáticamente el estado de préstamos vencidos
        \App\Observers\LoanObserver::updateOverdueLoans();
        
        return $this->loans()->whereIn('status', [Loan::STATUS_ACTIVE, Loan::STATUS_RENEWED])->get();
    }

    // Método para verificar si puede hacer más préstamos
    public function canBorrowMore(): bool
    {
        return $this->activeLoans()->count() < 3;
    }

    // Método para verificar si puede renovar un préstamo
    public function canRenewLoan(): bool
    {
        // Un usuario solo puede renovar UN libro a la vez
        $renewedLoans = $this->loans()
            ->where('status', Loan::STATUS_RENEWED)
            ->count();
        
        return $renewedLoans === 0;
    }

    // Método para obtener el préstamo renovado actual (si existe)
    public function getCurrentRenewedLoan()
    {
        return $this->loans()
            ->where('status', Loan::STATUS_RENEWED)
            ->first();
    }

    // Método para obtener préstamos vencidos
    public function overdueLoans()
    {
        // Actualizar automáticamente el estado de préstamos vencidos
        \App\Observers\LoanObserver::updateOverdueLoans();
        
        return $this->loans()->where('status', Loan::STATUS_OVERDUE)->get();
    }



    // Método para verificar si puede rentar un libro específico
    public function canRentBook(Book $book): bool
    {
        // Verificar si el libro está disponible
        if ($book->availability !== 'available') {
            return false;
        }

        // Verificar si puede hacer más préstamos
        if (!$this->canBorrowMore()) {
            return false;
        }

        // Verificar si ya tiene un préstamo vencido del mismo libro
        $overdueLoan = $this->loans()
            ->where('book_id', $book->id)
            ->where('status', Loan::STATUS_OVERDUE)
            ->first();

        if ($overdueLoan) {
            return false;
        }

        return true;
    }

    // Método para obtener razones por las que no puede rentar un libro
    public function getRentBookRestrictions(Book $book): array
    {
        $restrictions = [];

        // Verificar si el libro está disponible
        if ($book->availability !== 'available') {
            $restrictions[] = 'El libro no está disponible para renta';
        }

        // Verificar si puede hacer más préstamos
        if (!$this->canBorrowMore()) {
            $restrictions[] = 'Ya tienes el máximo de libros rentados (3)';
        }

        // Verificar si ya tiene un préstamo vencido del mismo libro
        $overdueLoan = $this->loans()
            ->where('book_id', $book->id)
            ->where('status', Loan::STATUS_OVERDUE)
            ->first();

        if ($overdueLoan) {
            $restrictions[] = 'Tienes un préstamo vencido de este libro. Debes devolverlo antes de poder rentarlo nuevamente.';
        }

        return $restrictions;
    }

    // Método para obtener préstamos próximos a vencer
    public function nearDueLoans()
    {
        return $this->loans()
            ->whereIn('status', [Loan::STATUS_ACTIVE, Loan::STATUS_RENEWED])
            ->where('due_date', '<=', now()->addDays(3))
            ->where('due_date', '>', now())
            ->get();
    }



    // Métodos para verificar roles
    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    public function isUser(): bool
    {
        return $this->role === self::ROLE_USER;
    }



    // Método para generar token de API
    public function generateApiToken(): string
    {
        $token = Str::random(60);
        $this->update(['api_token' => $token]);
        return $token;
    }

    // Método para limpiar token de API
    public function clearApiToken(): void
    {
        $this->update(['api_token' => null]);
    }
}
