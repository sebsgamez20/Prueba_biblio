<?php

use Illuminate\Support\Facades\Route;

// Ruta catch-all para React, pero excluyendo las rutas de la API
Route::get('/{any}', function () {
    return view('app');
})->where('any', '^(?!api).*$');
