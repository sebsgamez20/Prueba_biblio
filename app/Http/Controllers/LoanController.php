<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Loan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class LoanController extends Controller
{
    /**
     * Rentar un libro
     */
    public function rentBook(Request $request): JsonResponse
    {
        try {
            // Obtener usuario autenticado
            $token = $request->header('Authorization');
            if (!$token) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no autenticado'
                ], 401);
            }

            $token = str_replace('Bearer ', '', $token);
            $user = User::where('api_token', $token)->first();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no autenticado'
                ], 401);
            }

            // Validar datos
            $request->validate([
                'book_id' => 'required|exists:books,id'
            ]);

            $book = Book::findOrFail($request->book_id);

            // Verificar si el usuario puede rentar el libro
            if (!$user->canRentBook($book)) {
                $restrictions = $user->getRentBookRestrictions($book);
                
                return response()->json([
                    'success' => false,
                    'message' => 'No puedes rentar este libro',
                    'errors' => $restrictions
                ], 400);
            }

            // Crear el préstamo
            $loan = Loan::create([
                'user_id' => $user->id,
                'book_id' => $book->id,
                'loan_date' => Carbon::now(),
                'due_date' => Carbon::now()->addDays(Loan::LOAN_DAYS),
                'status' => Loan::STATUS_ACTIVE,
                'renewal_count' => 0,
                'fine_amount' => 0.00,
            ]);

            // Marcar libro como rentado
            $book->update(['availability' => 'borrowed']);

            return response()->json([
                'success' => true,
                'message' => 'Libro rentado exitosamente',
                'loan' => [
                    'id' => $loan->id,
                    'book_title' => $book->title,
                    'loan_date' => $loan->loan_date->format('Y-m-d'),
                    'due_date' => $loan->due_date->format('Y-m-d'),
                    'days_remaining' => $loan->getDaysRemaining(),
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al rentar el libro',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Renovar un préstamo
     */
    public function renewLoan(Request $request, $loanId): JsonResponse
    {
        try {
            // Obtener usuario autenticado
            $token = $request->header('Authorization');
            if (!$token) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no autenticado'
                ], 401);
            }

            $token = str_replace('Bearer ', '', $token);
            $user = User::where('api_token', $token)->first();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no autenticado'
                ], 401);
            }

            $loan = Loan::where('id', $loanId)
                       ->where('user_id', $user->id)
                       ->first();

            if (!$loan) {
                return response()->json([
                    'success' => false,
                    'message' => 'Préstamo no encontrado'
                ], 404);
            }

            if (!$loan->canBeRenewed()) {
                $errors = [];

                if ($loan->isOverdue()) {
                    $errors[] = 'No puedes renovar un préstamo vencido';
                }

                if ($loan->renewal_count >= Loan::MAX_RENEWALS) {
                    $errors[] = 'Ya has renovado este préstamo el máximo de veces permitido';
                }

                // Verificar si el usuario ya tiene otro préstamo renovado
                $userRenewedLoans = $user->loans()
                    ->where('status', Loan::STATUS_RENEWED)
                    ->where('id', '!=', $loan->id)
                    ->get();

                if ($userRenewedLoans->count() > 0) {
                    $renewedBook = $userRenewedLoans->first()->book;
                    $errors[] = "Ya tienes un libro renovado: '{$renewedBook->title}'. Solo puedes renovar UN libro a la vez.";
                }

                return response()->json([
                    'success' => false,
                    'message' => 'No puedes renovar este préstamo',
                    'errors' => $errors
                ], 400);
            }

            if ($loan->renew()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Préstamo renovado exitosamente',
                    'loan' => [
                        'id' => $loan->id,
                        'book_title' => $loan->book->title,
                        'due_date' => $loan->due_date->format('Y-m-d'),
                        'days_remaining' => $loan->getDaysRemaining(),
                        'renewal_count' => $loan->renewal_count,
                    ]
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Error al renovar el préstamo'
            ], 500);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al renovar el préstamo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Devolver un libro
     */
    public function returnBook(Request $request, $loanId): JsonResponse
    {
        try {
            // Obtener usuario autenticado
            $token = $request->header('Authorization');
            if (!$token) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no autenticado'
                ], 401);
            }

            $token = str_replace('Bearer ', '', $token);
            $user = User::where('api_token', $token)->first();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no autenticado'
                ], 401);
            }

            $loan = Loan::where('id', $loanId)
                       ->where('user_id', $user->id)
                       ->first();

            if (!$loan) {
                return response()->json([
                    'success' => false,
                    'message' => 'Préstamo no encontrado'
                ], 404);
            }

            // Debug: Log información del préstamo
            \Log::info('Intentando devolver préstamo', [
                'loan_id' => $loan->id,
                'status' => $loan->status,
                'can_be_returned' => $loan->canBeReturned(),
                'is_active' => $loan->isActive(),
                'is_overdue' => $loan->isOverdue(),
                'due_date' => $loan->due_date,
                'return_date' => $loan->return_date,
            ]);

            if (!$loan->canBeReturned()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Este préstamo no puede ser devuelto',
                    'errors' => [
                        'El préstamo ya ha sido devuelto o no está en un estado válido para devolución',
                        'Estado actual: ' . $loan->status,
                        'Puede ser devuelto: ' . ($loan->canBeReturned() ? 'Sí' : 'No')
                    ]
                ], 400);
            }

            $loan->markAsReturned();

            return response()->json([
                'success' => true,
                'message' => 'Libro devuelto exitosamente',
                'loan' => [
                    'id' => $loan->id,
                    'book_title' => $loan->book->title,
                    'return_date' => $loan->return_date->format('Y-m-d'),
                    'fine_amount' => $loan->fine_amount,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al devolver el libro',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener préstamos del usuario
     */
    public function getUserLoans(Request $request): JsonResponse
    {
        try {
            // Obtener usuario autenticado
            $token = $request->header('Authorization');
            if (!$token) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no autenticado'
                ], 401);
            }

            $token = str_replace('Bearer ', '', $token);
            $user = User::where('api_token', $token)->first();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no autenticado'
                ], 401);
            }

            // Actualizar automáticamente el estado de préstamos vencidos
            \App\Observers\LoanObserver::updateOverdueLoans();

            $loans = $user->loans()
                         ->with('book')
                         ->whereIn('status', [Loan::STATUS_ACTIVE, Loan::STATUS_RENEWED, Loan::STATUS_OVERDUE])
                         ->orderBy('created_at', 'desc')
                         ->get()
                         ->map(function ($loan) {
                             return [
                                 'id' => $loan->id,
                                 'book_title' => $loan->book->title,
                                 'book_author' => $loan->book->author,
                                 'loan_date' => $loan->loan_date->format('Y-m-d'),
                                 'due_date' => $loan->due_date->format('Y-m-d'),
                                 'return_date' => $loan->return_date ? $loan->return_date->format('Y-m-d') : null,
                                 'status' => $loan->status,
                                 'days_remaining' => $loan->getDaysRemaining(),
                                 'renewal_count' => $loan->renewal_count,
                                 'fine_amount' => $loan->fine_amount,
                                 'is_overdue' => $loan->isOverdue(),
                                 'can_renew' => $loan->canBeRenewed(),
                                 'is_near_due' => $loan->isNearDue(),
                                 'days_overdue' => $loan->isOverdue() ? $loan->due_date->diffInDays(now()) : 0,
                                 'estimated_fine' => $loan->calculateFine(),
                             ];
                         });

            return response()->json([
                'success' => true,
                'loans' => $loans,
                'stats' => [
                    'active_loans' => $user->activeLoans()->count(),
                    'overdue_loans' => $user->overdueLoans()->count(),
                    'can_borrow_more' => $user->canBorrowMore(),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los préstamos',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
