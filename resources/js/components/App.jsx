import { useState, useEffect } from 'react';
import BookForm from './BookForm';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import UserLoans from './UserLoans';

function App() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showLoans, setShowLoans] = useState(false);
    const [user, setUser] = useState(null);
    const [authMode, setAuthMode] = useState('login'); // 'login' o 'register'
    const [showAuth, setShowAuth] = useState(false);
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        checkAuthStatus();
        fetchBooks();
    }, []);

    const checkAuthStatus = async () => {
        if (!token) {
            setUser(null);
            return;
        }

        try {
            const response = await fetch('/api/user', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
            } else if (response.status === 401) {
                // Token inválido, limpiar
                setUser(null);
                setToken(null);
                localStorage.removeItem('token');
            } else {
                console.error('Error checking auth status:', response.status);
                setUser(null);
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
            setUser(null);
        }
    };

    const fetchBooks = async () => {
        try {
            console.log('Iniciando fetchBooks...');
            const response = await fetch('/api/books');
            console.log('Respuesta de fetchBooks:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('Datos recibidos:', data);
                setBooks(data);
            } else {
                console.error('Error en la respuesta de libros:', response.status);
                setBooks([]);
            }
        } catch (error) {
            console.error('Error fetching books:', error);
            setBooks([]);
        } finally {
            setLoading(false);
        }
    };

    const handleBookCreated = (newBook) => {
        console.log('handleBookCreated llamado con:', newBook);
        fetchBooks();
        setShowForm(false);
    };

    const handleCancelForm = () => {
        setShowForm(false);
    };

    const handleLogin = (userData, authToken) => {
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('token', authToken);
        setShowAuth(false);
        setAuthMode('login');
    };

    const handleRegister = (userData, authToken) => {
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('token', authToken);
        setShowAuth(false);
        setAuthMode('login');
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            setUser(null);
            setToken(null);
            localStorage.removeItem('token');
        } catch (error) {
            console.error('Error logging out:', error);
            // Limpiar de todas formas
            setUser(null);
            setToken(null);
            localStorage.removeItem('token');
        }
    };

    const handleRentBook = async (bookId) => {
        try {
            const response = await fetch('/api/loans/rent', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ book_id: bookId })
            });

            const data = await response.json();

            if (response.ok) {
                alert('¡Libro rentado exitosamente!');
                // Recargar la lista de libros para actualizar disponibilidad
                fetchBooks();
            } else {
                alert(`Error: ${data.message || 'No se pudo rentar el libro'}`);
                if (data.errors) {
                    console.error('Errores:', data.errors);
                }
            }
        } catch (error) {
            console.error('Error renting book:', error);
            alert('Error al rentar el libro. Inténtalo de nuevo.');
        }
    };



    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        return `/storage/${imagePath}`;
    };

    // Si no hay usuario autenticado, mostrar formulario de autenticación
    if (!user) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center py-8">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-800 mb-2">
                            Biblioteca Digital
                        </h1>
                        <p className="text-gray-600">
                            Sistema de gestión de libros con Laravel y React
                        </p>
                    </div>
                    
                    {authMode === 'login' ? (
                        <LoginForm 
                            onLogin={handleLogin} 
                            onSwitchToRegister={() => setAuthMode('register')} 
                        />
                    ) : (
                        <RegisterForm 
                            onRegister={handleRegister} 
                            onSwitchToLogin={() => setAuthMode('login')} 
                        />
                    )}
                </div>
            </div>
        );
    }

    // Si está mostrando el formulario de libro (solo para admins)
    if (showForm && user.role === 'admin') {
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

    // Si está mostrando los préstamos del usuario
    if (showLoans) {
        return (
            <UserLoans token={token} onClose={() => setShowLoans(false)} />
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="container mx-auto px-4 py-8">
                <header className="text-center mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">
                                Bienvenido, {user.name}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-sm ${
                                user.role === 'admin' 
                                    ? 'bg-purple-100 text-purple-800' 
                                    : 'bg-blue-100 text-blue-800'
                            }`}>
                                {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            {user.role !== 'admin' && (
                                <button
                                    onClick={() => setShowLoans(true)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    Mis Préstamos
                                </button>
                            )}
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 text-gray-600 bg-red-400 rounded-md hover:bg-red-300 transition-colors"
                            >
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                    
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        Biblioteca Digital
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Sistema de gestión de libros con Laravel y React
                    </p>
                    
                    {user.role === 'admin' && (
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
                    )}
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
                                        
                                        {/* Botón de rentar solo para usuarios normales */}
                                        {user.role !== 'admin' && book.availability === 'available' && (
                                            <button 
                                                onClick={() => handleRentBook(book.id)}
                                                className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                            >
                                                Rentar Libro
                                            </button>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-12">
                                    <p className="text-gray-600 text-lg mb-4">
                                        No hay libros disponibles en este momento.
                                    </p>
                                    {user.role === 'admin' && (
                                        <button 
                                            onClick={() => setShowForm(true)}
                                            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                        >
                                            Agregar primer libro
                                        </button>
                                    )}
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