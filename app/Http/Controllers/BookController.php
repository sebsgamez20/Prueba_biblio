<?php

namespace App\Http\Controllers;

use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Storage;

class BookController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Book::query();
        
        // Búsqueda por título, autor o descripción
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                  ->orWhere('author', 'LIKE', "%{$search}%")
                  ->orWhere('description', 'LIKE', "%{$search}%");
            });
        }
        
        // Filtro por género
        if ($request->has('genre') && !empty($request->genre)) {
            $query->where('genre', $request->genre);
        }
        
        // Filtro por disponibilidad
        if ($request->has('availability') && !empty($request->availability)) {
            $query->where('availability', $request->availability);
        }
        
        $books = $query->get();
        
        // Verificar y corregir disponibilidad de cada libro
        foreach ($books as $book) {
            $book->checkAndFixAvailability();
        }
        
        // Recargar los libros para obtener la disponibilidad actualizada
        $books = $query->get();
        
        return response()->json($books);
    }

    /**
     * Get all available genres for filtering
     */
    public function getGenres(): JsonResponse
    {
        try {
            $genres = Book::distinct()->pluck('genre')->filter()->values()->sort();
            
            // Log para debugging
            \Log::info('Géneros obtenidos:', $genres->toArray());
            
            return response()->json($genres);
        } catch (\Exception $e) {
            \Log::error('Error obteniendo géneros: ' . $e->getMessage());
            return response()->json(['error' => 'Error al obtener géneros'], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'author' => 'required|string|max:255',
                'genre' => 'required|string|max:100',
                'description' => 'nullable|string',
                'publication_year' => 'nullable|integer|min:1000|max:' . (date('Y') + 1),
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
                'availability' => 'sometimes|in:available,borrowed,maintenance'
            ]);

            // Manejar la subida de imagen
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('books', 'public');
                $validated['image'] = $imagePath;
            }

            $book = Book::create($validated);

            // Log para debugging
            \Log::info('Libro creado:', $book->toArray());

            return response()->json([
                'message' => 'Libro creado exitosamente',
                'book' => $book
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al crear el libro',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $book = Book::findOrFail($id);
            return response()->json($book);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Libro no encontrado'
            ], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $book = Book::findOrFail($id);

            $validated = $request->validate([
                'title' => 'sometimes|required|string|max:255',
                'author' => 'sometimes|required|string|max:255',
                'genre' => 'sometimes|required|string|max:100',
                'description' => 'nullable|string',
                'publication_year' => 'nullable|integer|min:1000|max:' . (date('Y') + 1),
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
                'availability' => 'sometimes|in:available,borrowed,maintenance'
            ]);

            // Manejar la subida de imagen
            if ($request->hasFile('image')) {
                // Eliminar imagen anterior si existe
                if ($book->image && Storage::disk('public')->exists($book->image)) {
                    Storage::disk('public')->delete($book->image);
                }
                
                $imagePath = $request->file('image')->store('books', 'public');
                $validated['image'] = $imagePath;
            }

            $book->update($validated);

            return response()->json([
                'message' => 'Libro actualizado exitosamente',
                'book' => $book
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al actualizar el libro',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Book $book)
    {
        try {
            $book->delete();
            return response()->json(['message' => 'Libro eliminado exitosamente']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al eliminar el libro'], 500);
        }
    }

    public function getStatistics()
    {
        try {
            // Obtener libros más rentados
            $mostRentedBooks = Book::withCount('loans')
                ->orderBy('loans_count', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($book) {
                    return [
                        'id' => $book->id,
                        'title' => $book->title,
                        'author' => $book->author,
                        'rentals_count' => $book->loans_count,
                        'availability' => $book->availability,
                        'image' => $book->image
                    ];
                });

            // Obtener estadísticas generales
            $totalBooks = Book::count();
            $availableBooks = Book::where('availability', 'available')->count();
            $totalLoans = \App\Models\Loan::count();
            $mostRentedBook = Book::withCount('loans')->orderBy('loans_count', 'desc')->first();
            $overdueLoans = \App\Models\Loan::where('status', 'overdue')->count();

            // Obtener préstamos por mes (últimos 6 meses) - versión simplificada
            $monthlyLoans = [];
            try {
                $monthlyLoans = \App\Models\Loan::selectRaw('MONTH(created_at) as month, YEAR(created_at) as year, COUNT(*) as count')
                    ->where('created_at', '>=', now()->subMonths(6))
                    ->groupBy('year', 'month')
                    ->orderBy('year', 'desc')
                    ->orderBy('month', 'desc')
                    ->get()
                    ->map(function ($item) {
                        $date = \Carbon\Carbon::createFromDate($item->year, $item->month, 1);
                        return [
                            'month' => $date->format('M Y'),
                            'count' => $item->count
                        ];
                    });
            } catch (\Exception $e) {
                // Si falla la consulta de meses, usar array vacío
                \Log::error('Error en consulta de préstamos por mes: ' . $e->getMessage());
                $monthlyLoans = [];
            }

            return response()->json([
                'most_rented_books' => $mostRentedBooks,
                'general_stats' => [
                    'total_books' => $totalBooks,
                    'available_books' => $availableBooks,
                    'total_loans' => $totalLoans,
                    'most_rented_book' => $mostRentedBook ? [
                        'title' => $mostRentedBook->title,
                        'rentals_count' => $mostRentedBook->loans_count
                    ] : null,
                    'overdue_loans' => $overdueLoans
                ],
                'monthly_loans' => $monthlyLoans
            ]);
        } catch (\Exception $e) {
            \Log::error('Error en getStatistics: ' . $e->getMessage());
            return response()->json(['error' => 'Error al obtener estadísticas: ' . $e->getMessage()], 500);
        }
    }
}
