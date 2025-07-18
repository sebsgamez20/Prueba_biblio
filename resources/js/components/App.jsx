import React, { useState, useEffect } from 'react';
import BookForm from './BookForm';

function App() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
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

    const handleBookCreated = (newBook) => {
        setBooks(prev => [...prev, newBook]);
        setShowForm(false);
    };

    const handleCancelForm = () => {
        setShowForm(false);
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        return `/storage/${imagePath}`;
    };

    if (showForm) {
        return (
            <div className="min-h-screen bg-gray-100 py-8">
                <div className="container mx-auto px-4">
                    <div className="mb-6">
                        <button
                            onClick={() => setShowForm(false)}
                            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Volver a la lista
                        </button>
                    </div>
                    <BookForm onBookCreated={handleBookCreated} onCancel={handleCancelForm} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="container mx-auto px-4 py-8">
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        Biblioteca Digital
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Sistema de gestión de libros con Laravel y React
                    </p>
                    
                    <div className="flex justify-center space-x-4">
                        <button
                            onClick={() => setShowForm(true)}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Registrar Libro
                        </button>
                    </div>
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
                                        {book.image && (
                                            <div className="mb-4">
                                                <img 
                                                    src={getImageUrl(book.image)} 
                                                    alt={book.title}
                                                    className="w-full h-48 object-cover rounded-md"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                        )}
                                        
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                            {book.title}
                                        </h3>
                                        <p className="text-gray-600 mb-2">
                                            <strong>Autor:</strong> {book.author}
                                        </p>
                                        <p className="text-gray-600 mb-2">
                                            <strong>Año:</strong> {book.publication_year || 'N/A'}
                                        </p>
                                        {book.description && (
                                            <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                                                {book.description}
                                            </p>
                                        )}
                                        <div className="flex justify-between items-center">
                                            <span className={`px-3 py-1 rounded-full text-sm ${
                                                book.availability === 'available' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : book.availability === 'borrowed'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {book.availability === 'available' ? 'Disponible' :
                                                 book.availability === 'borrowed' ? 'Prestado' : 'Mantenimiento'}
                                            </span>
                                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                                {book.genre}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-12">
                                    <p className="text-gray-600 text-lg mb-4">
                                        No hay libros disponibles en este momento.
                                    </p>
                                    <button 
                                        onClick={() => setShowForm(true)}
                                        className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                    >
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