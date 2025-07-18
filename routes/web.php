<?php

use Illuminate\Support\Facades\Route;

// Ruta principal que sirve la aplicación React
Route::get('/', function () {
    return view('app');
});

// Ruta catch-all para el SPA (Single Page Application)
Route::get('/{any}', function () {
    return view('app');
})->where('any', '^(?!api).*$');
