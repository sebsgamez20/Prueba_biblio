<?php

namespace Database\Seeders;

use App\Models\Book;
use Illuminate\Database\Seeder;

class BookSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $books = [
            [
                'title' => 'El Señor de los Anillos',
                'author' => 'J.R.R. Tolkien',
                'genre' => 'Fantasía',
                'availability' => 'available',
                'description' => 'Una épica historia de fantasía sobre la lucha contra el mal.',
                'isbn' => '978-84-450-7179-3',
                'publication_year' => 1954,
            ],
            [
                'title' => 'Cien años de soledad',
                'author' => 'Gabriel García Márquez',
                'genre' => 'Realismo mágico',
                'availability' => 'available',
                'description' => 'La historia de la familia Buendía a lo largo de siete generaciones.',
                'isbn' => '978-84-397-2071-7',
                'publication_year' => 1967,
            ],
            [
                'title' => '1984',
                'author' => 'George Orwell',
                'genre' => 'Ciencia ficción',
                'availability' => 'available',
                'description' => 'Una distopía sobre una sociedad totalitaria controlada por el Gran Hermano.',
                'isbn' => '978-84-397-2072-4',
                'publication_year' => 1949,
            ],
            [
                'title' => 'Don Quijote de la Mancha',
                'author' => 'Miguel de Cervantes',
                'genre' => 'Novela clásica',
                'availability' => 'available',
                'description' => 'Las aventuras del ingenioso hidalgo Don Quijote y su fiel escudero Sancho Panza.',
                'isbn' => '978-84-376-0494-7',
                'publication_year' => 1605,
            ],
            [
                'title' => 'Harry Potter y la piedra filosofal',
                'author' => 'J.K. Rowling',
                'genre' => 'Fantasía juvenil',
                'availability' => 'available',
                'description' => 'El primer año de Harry Potter en la escuela de magia Hogwarts.',
                'isbn' => '978-84-9838-095-8',
                'publication_year' => 1997,
            ],
            [
                'title' => 'El Principito',
                'author' => 'Antoine de Saint-Exupéry',
                'genre' => 'Literatura infantil',
                'availability' => 'available',
                'description' => 'Una historia poética sobre la amistad, el amor y el sentido de la vida.',
                'isbn' => '978-84-397-2073-1',
                'publication_year' => 1943,
            ],
        ];

        foreach ($books as $book) {
            Book::create($book);
        }
    }
}
