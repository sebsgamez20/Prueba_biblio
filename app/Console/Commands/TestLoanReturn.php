<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Book;
use App\Models\Loan;
use Carbon\Carbon;

class TestLoanReturn extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:loan-return {loan_id}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test loan return functionality for a specific loan';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $loanId = $this->argument('loan_id');

        $loan = Loan::with(['user', 'book'])->find($loanId);

        if (!$loan) {
            $this->error("Préstamo con ID {$loanId} no encontrado");
            return 1;
        }

        $this->info("=== Prueba de Devolución de Préstamo ===");
        $this->info("Préstamo ID: {$loan->id}");
        $this->info("Usuario: {$loan->user->name}");
        $this->info("Libro: {$loan->book->title}");
        $this->info("Estado: {$loan->status}");
        $this->info("Fecha de préstamo: {$loan->loan_date->format('Y-m-d')}");
        $this->info("Fecha de vencimiento: {$loan->due_date->format('Y-m-d')}");
        $this->info("Fecha de devolución: " . ($loan->return_date ? $loan->return_date->format('Y-m-d') : 'No devuelto'));
        $this->newLine();

        // Verificar métodos del modelo
        $this->info("=== Verificación de Métodos ===");
        $this->info("isActive(): " . ($loan->isActive() ? '✅ SÍ' : '❌ NO'));
        $this->info("isOverdue(): " . ($loan->isOverdue() ? '✅ SÍ' : '❌ NO'));
        $this->info("canBeReturned(): " . ($loan->canBeReturned() ? '✅ SÍ' : '❌ NO'));
        $this->info("getDaysRemaining(): {$loan->getDaysRemaining()} días");
        $this->info("calculateFine(): $" . $loan->calculateFine());
        $this->newLine();

        // Verificar si puede ser devuelto
        if ($loan->canBeReturned()) {
            $this->info("✅ El préstamo PUEDE ser devuelto");
            
            // Simular devolución
            $this->info("Simulando devolución...");
            $originalStatus = $loan->status;
            $originalReturnDate = $loan->return_date;
            
            try {
                $loan->markAsReturned();
                $loan->refresh();
                
                $this->info("✅ Devolución exitosa!");
                $this->info("Estado anterior: {$originalStatus}");
                $this->info("Estado actual: {$loan->status}");
                $this->info("Fecha de devolución: " . ($loan->return_date ? $loan->return_date->format('Y-m-d H:i:s') : 'No establecida'));
                $this->info("Multa aplicada: $" . $loan->fine_amount);
                $this->info("Disponibilidad del libro: {$loan->book->availability}");
                
                // Revertir para no afectar los datos reales
                $loan->update([
                    'status' => $originalStatus,
                    'return_date' => $originalReturnDate,
                    'fine_amount' => 0.00,
                ]);
                $loan->book->update(['availability' => 'borrowed']);
                
                $this->info("🔄 Cambios revertidos para mantener integridad de datos");
                
            } catch (\Exception $e) {
                $this->error("❌ Error durante la devolución: " . $e->getMessage());
            }
        } else {
            $this->error("❌ El préstamo NO puede ser devuelto");
            $this->info("Razón: El préstamo ya ha sido devuelto o no está en un estado válido");
        }

        $this->newLine();
        $this->info("=== Fin de la Prueba ===");

        return 0;
    }
} 