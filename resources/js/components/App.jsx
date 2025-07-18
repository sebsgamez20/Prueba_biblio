import React, { useState, useEffect } from 'react';

function App() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Aquí puedes hacer llamadas a la API de Laravel
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            const response = await fetch('/api/books');
            const data = await response.json();
            setBooks(data);
        } catch (error) {
            console.error('Error fetching books:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="container mx-auto px-4 py-8">
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        Biblioteca Digital
                    </h1>
                    <p className="text-gray-600">
                        Sistema de gestión de libros con Laravel y React
                    </p>
                </header>

                <main>
                    {loading ? (
                        <div className="text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="mt-2 text-gray-600">Cargando libros...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {books.length > 0 ? (
                                books.map((book) => (
                                    <div key={book.id} className="bg-white rounded-lg shadow-md p-6">
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                            {book.title}
                                        </h3>
                                        <p className="text-gray-600 mb-2">
                                            <strong>Autor:</strong> {book.author}
                                        </p>
                                        <p className="text-gray-600 mb-4">
                                            <strong>Año:</strong> {book.publication_year}
                                        </p>
                                        <div className="flex justify-between items-center">
                                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                                {book.genre}
                                            </span>
                                            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                                                Ver detalles
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-12">
                                    <p className="text-gray-600 text-lg">
                                        No hay libros disponibles en este momento.
                                    </p>
                                    <button className="mt-4 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                                        Agregar primer libro
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default App; 