<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BookController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\LoanController;




// Rutas de autenticación
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::get('/user', [AuthController::class, 'user']);

// Ruta para crear administradores
Route::post('/create-admin', [AuthController::class, 'createAdmin']);

// Rutas de la API para libros
Route::prefix('books')->group(function () {
    Route::get('/', [BookController::class, 'index']);
    Route::get('/genres', [BookController::class, 'getGenres']);
    Route::post('/', [BookController::class, 'store']);
    Route::get('/{book}', [BookController::class, 'show']);
    Route::put('/{book}', [BookController::class, 'update']);
    Route::delete('/{book}', [BookController::class, 'destroy']);
});

// Ruta para estadísticas
Route::get('/statistics', [BookController::class, 'getStatistics']);

// Rutas de la API para préstamos
Route::prefix('loans')->group(function () {
    Route::post('/rent', [LoanController::class, 'rentBook']);
    Route::get('/user', [LoanController::class, 'getUserLoans']);
    Route::post('/{loan}/renew', [LoanController::class, 'renewLoan']);
    Route::post('/{loan}/return', [LoanController::class, 'returnBook']);
}); 