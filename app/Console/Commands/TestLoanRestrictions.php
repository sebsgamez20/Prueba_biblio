<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Book;
use App\Models\Loan;
use Carbon\Carbon;

class TestLoanRestrictions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:loan-restrictions {user_id} {book_id}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test loan restrictions for a specific user and book';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $userId = $this->argument('user_id');
        $bookId = $this->argument('book_id');

        $user = User::find($userId);
        $book = Book::find($bookId);

        if (!$user) {
            $this->error("Usuario con ID {$userId} no encontrado");
            return 1;
        }

        if (!$book) {
            $this->error("Libro con ID {$bookId} no encontrado");
            return 1;
        }

        $this->info("=== Prueba de Restricciones de Préstamo ===");
        $this->info("Usuario: {$user->name} (ID: {$user->id})");
        $this->info("Libro: {$book->title} (ID: {$book->id})");
        $this->info("Disponibilidad del libro: {$book->availability}");
        $this->newLine();

        // Verificar si puede rentar el libro
        $canRent = $user->canRentBook($book);
        $restrictions = $user->getRentBookRestrictions($book);

        $this->info("¿Puede rentar el libro? " . ($canRent ? '✅ SÍ' : '❌ NO'));

        if (!$canRent) {
            $this->newLine();
            $this->warn("Restricciones encontradas:");
            foreach ($restrictions as $restriction) {
                $this->line("• {$restriction}");
            }
        }

        $this->newLine();

        // Mostrar información detallada
        $this->info("=== Información Detallada ===");
        
        // Préstamos activos
        $activeLoans = $user->activeLoans();
        $this->info("Préstamos activos: {$activeLoans->count()}/3");
        
        if ($activeLoans->count() > 0) {
            foreach ($activeLoans as $loan) {
                $this->line("  - {$loan->book->title} (Vence: {$loan->due_date->format('Y-m-d')})");
            }
        }

        // Préstamos vencidos
        $overdueLoans = $user->overdueLoans();
        $this->info("Préstamos vencidos: {$overdueLoans->count()}");
        
        if ($overdueLoans->count() > 0) {
            foreach ($overdueLoans as $loan) {
                $this->line("  - {$loan->book->title} (Vencido desde: {$loan->due_date->format('Y-m-d')})");
            }
        }

        // Verificar si tiene préstamo vencido del mismo libro
        $overdueSameBook = $user->loans()
            ->where('book_id', $book->id)
            ->where('status', Loan::STATUS_OVERDUE)
            ->first();

        if ($overdueSameBook) {
            $this->newLine();
            $this->error("⚠️  El usuario tiene un préstamo vencido del mismo libro:");
            $this->line("  - Libro: {$overdueSameBook->book->title}");
            $this->line("  - Vencido desde: {$overdueSameBook->due_date->format('Y-m-d')}");
            $this->line("  - Días de retraso: " . $overdueSameBook->due_date->diffInDays(now()));
        }

        $this->newLine();
        $this->info("=== Fin de la Prueba ===");

        return 0;
    }
}
