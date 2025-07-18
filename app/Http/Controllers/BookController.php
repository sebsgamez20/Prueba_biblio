<?php

namespace App\Http\Controllers;

use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class BookController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $books = Book::all();
        return response()->json($books);
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
                'isbn' => 'nullable|string|unique:books,isbn|max:20',
                'publication_year' => 'nullable|integer|min:1000|max:' . (date('Y') + 1),
                'image' => 'nullable|string',
                'availability' => 'sometimes|in:available,borrowed,maintenance'
            ]);

            $book = Book::create($validated);

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
                'isbn' => 'nullable|string|unique:books,isbn,' . $id . '|max:20',
                'publication_year' => 'nullable|integer|min:1000|max:' . (date('Y') + 1),
                'image' => 'nullable|string',
                'availability' => 'sometimes|in:available,borrowed,maintenance'
            ]);

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
    public function destroy(string $id): JsonResponse
    {
        try {
            $book = Book::findOrFail($id);
            
            // Verificar si el libro tiene préstamos activos
            if ($book->loans()->where('status', 'active')->exists()) {
                return response()->json([
                    'message' => 'No se puede eliminar el libro porque tiene préstamos activos'
                ], 400);
            }

            $book->delete();

            return response()->json([
                'message' => 'Libro eliminado exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al eliminar el libro',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
