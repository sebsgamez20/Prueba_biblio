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
        return $this->loans()->where('status', 'active')->get();
    }

    // Método para verificar si puede hacer más préstamos
    public function canBorrowMore(): bool
    {
        return $this->activeLoans()->count() < 3;
    }

    // Método para obtener préstamos vencidos
    public function overdueLoans()
    {
        return $this->loans()->where('status', 'overdue')->get();
    }

    // Método para calcular multa total
    public function totalFines(): float
    {
        return $this->loans()->sum('fine_amount');
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

    // Método para verificar si tiene multas pendientes
    public function hasPendingFines(): bool
    {
        return $this->totalFines() > 0;
    }

    // Método para verificar si puede rentar (sin multas y menos de 3 libros)
    public function canRent(): bool
    {
        return !$this->hasPendingFines() && $this->canBorrowMore();
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
