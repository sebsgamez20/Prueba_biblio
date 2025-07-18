<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BookController;

// Ruta principal que sirve la aplicación React
Route::get('/{any?}', function () {
    return view('app');
})->where('any', '.*');

// Rutas de la API
Route::prefix('api')->group(function () {
    Route::get('/books', [BookController::class, 'index']);
    Route::post('/books', [BookController::class, 'store']);
    Route::get('/books/{book}', [BookController::class, 'show']);
    Route::put('/books/{book}', [BookController::class, 'update']);
    Route::delete('/books/{book}', [BookController::class, 'destroy']);
});
