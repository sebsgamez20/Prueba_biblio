<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Observers\LoanObserver;

class UpdateOverdueLoans extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'loans:update-overdue';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Actualizar automáticamente el estado de préstamos vencidos';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Actualizando préstamos vencidos...');
        
        try {
            LoanObserver::updateOverdueLoans();
            $this->info('✅ Préstamos vencidos actualizados correctamente.');
        } catch (\Exception $e) {
            $this->error('❌ Error al actualizar préstamos vencidos: ' . $e->getMessage());
            return 1;
        }

        return 0;
    }
}
