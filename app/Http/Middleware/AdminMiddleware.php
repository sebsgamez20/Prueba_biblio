<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\User;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Obtener el token del header
        $token = $request->header('Authorization');
        if (!$token) {
            return response()->json([
                'message' => 'Token de autenticación requerido'
            ], 401);
        }

        $token = str_replace('Bearer ', '', $token);
        $user = User::where('api_token', $token)->first();

        if (!$user) {
            return response()->json([
                'message' => 'Token inválido'
            ], 401);
        }

        if ($user->role !== 'admin') {
            return response()->json([
                'message' => 'Acceso denegado. Se requieren permisos de administrador.'
            ], 403);
        }

        return $next($request);
    }
} 