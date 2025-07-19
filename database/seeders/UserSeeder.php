<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear usuario normal
        User::create([
            'name' => 'Usuario Normal',
            'email' => 'user@test.com',
            'password' => Hash::make('password'),
            'role' => 'user',
        ]);

        // Crear administrador
        User::create([
            'name' => 'Administrador',
            'email' => 'admin@test.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        // Crear otro usuario normal
        User::create([
            'name' => 'Juan Pérez',
            'email' => 'juan@test.com',
            'password' => Hash::make('password'),
            'role' => 'user',
        ]);
    }
} 