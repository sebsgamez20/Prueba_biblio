<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Book extends Model
{
    protected $fillable = [
        'title',
        'author',
        'genre',
        'availability',
        'image',
        'description',
        'isbn',
        'publication_year',
    ];

    protected $casts = [
        'publication_year' => 'integer',
    ];

    // Relación con préstamos
    public function loans(): HasMany
    {
        return $this->hasMany(Loan::class);
    }

    // Método para verificar si el libro está disponible
    public function isAvailable(): bool
    {
        return $this->availability === 'available';
    }

    // Método para obtener el préstamo activo
    public function activeLoan()
    {
        return $this->loans()->where('status', 'active')->first();
    }

    // Método para marcar como prestado
    public function markAsBorrowed(): void
    {
        $this->update(['availability' => 'borrowed']);
    }

    // Método para marcar como disponible
    public function markAsAvailable(): void
    {
        $this->update(['availability' => 'available']);
    }
}
