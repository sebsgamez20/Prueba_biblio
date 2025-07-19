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
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
                {/* Patrón de fondo decorativo */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
                    <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{animationDelay: '4s'}}></div>
                </div>
                
                {/* Contenido principal */}
                <div className="relative z-10 py-8">
                    <div className="container mx-auto px-4">
                        <div className="mb-6">
                            <button
                                onClick={() => setShowForm(false)}
                                className="flex items-center text-white hover:text-blue-200 transition-colors font-medium"
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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
            {/* Patrón de fondo decorativo */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
                <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{animationDelay: '4s'}}></div>
            </div>
            
            {/* Contenido principal */}
            <div className="relative z-10">
            {/* Header Moderno */}
            <header className="bg-black/20 backdrop-blur-xl border-b border-white/10 shadow-2xl sticky top-0 z-40">
                <div className="container mx-auto px-4 sm:px-6 py-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                        {/* Logo y Título */}
                        <div className="flex items-center space-x-3 sm:space-x-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                                    Biblioteca Digital
                                </h1>
                                <p className="text-xs sm:text-sm text-blue-200">Explora, descubre, aprende</p>
                            </div>
                        </div>

                        {/* Información del Usuario y Botones */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                            <div className="text-left sm:text-right">
                                <p className="text-sm font-medium text-white">{user.name}</p>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                    user.role === 'admin' 
                                        ? 'bg-purple-500/20 text-purple-200 border border-purple-400/30' 
                                        : 'bg-blue-500/20 text-blue-200 border border-blue-400/30'
                                }`}>
                                    {user.role === 'admin' ? '👑 Administrador' : '👤 Usuario'}
                                </span>
                            </div>
                            
                            {/* Botones de Acción */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                                {user.role !== 'admin' && (
                                    <button
                                        onClick={() => setShowLoans(true)}
                                        className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center text-sm font-medium"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Mis Préstamos
                                    </button>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium flex items-center justify-center"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Salir
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Contenido Principal */}
            <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
                {/* Sección de Acciones del Admin */}
                {user.role === 'admin' && (
                    <div className="mb-8">
                        <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-4 sm:p-6 shadow-2xl border border-white/10">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                                <div>
                                    <h2 className="text-lg sm:text-xl font-bold text-white mb-2">Panel de Administración</h2>
                                    <p className="text-sm sm:text-base text-blue-200">Gestiona la colección de libros de la biblioteca</p>
                                </div>
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center font-medium"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Agregar Nuevo Libro
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sección de Libros */}
                <div className="mb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Explorar Biblioteca</h2>
                            <p className="text-sm sm:text-base text-blue-200">Descubre nuestra colección de libros</p>
                        </div>
                        <div className="text-left sm:text-right">
                            <p className="text-sm text-blue-200">Total de libros</p>
                            <p className="text-xl sm:text-2xl font-bold text-white">{books.length}</p>
                        </div>
                    </div>
                </div>

                {/* Grid de Libros */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                            <p className="mt-4 text-gray-600 text-lg">Cargando biblioteca...</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                        {books.length > 0 ? (
                            books.map((book) => (
                                <div key={book.id} className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-white/20 hover:scale-105">
                                    {/* Imagen del Libro */}
                                    <div className="relative h-48 sm:h-56 lg:h-64 overflow-hidden">
                                        {book.image ? (
                                            <img 
                                                src={getImageUrl(book.image)} 
                                                alt={book.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
                                                <svg className="w-16 h-16 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                </svg>
                                            </div>
                                        )}
                                        
                                        {/* Badge de Disponibilidad */}
                                        <div className="absolute top-4 right-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${
                                                book.availability === 'available' 
                                                    ? 'bg-green-500 text-white' 
                                                    : book.availability === 'borrowed'
                                                    ? 'bg-yellow-500 text-white'
                                                    : 'bg-red-500 text-white'
                                            }`}>
                                                {book.availability === 'available' ? '📖 Disponible' :
                                                 book.availability === 'borrowed' ? '📚 Prestado' : '🔧 Mantenimiento'}
                                            </span>
                                        </div>

                                        {/* Badge de Género */}
                                        <div className="absolute top-4 left-4">
                                            <span className="px-3 py-1 bg-blue-500/90 backdrop-blur-sm text-white rounded-full text-xs font-semibold shadow-lg">
                                                {book.genre}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Contenido del Libro */}
                                    <div className="p-4 sm:p-6">
                                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                            {book.title}
                                        </h3>
                                        
                                        <div className="space-y-2 mb-4">
                                            <p className="text-gray-600 text-sm">
                                                <span className="font-semibold text-gray-700">Autor:</span> {book.author}
                                            </p>
                                            {book.publication_year && (
                                                <p className="text-gray-600 text-sm">
                                                    <span className="font-semibold text-gray-700">Año:</span> {book.publication_year}
                                                </p>
                                            )}
                                        </div>

                                        {book.description && (
                                            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                                {book.description}
                                            </p>
                                        )}

                                        {/* Botón de Acción */}
                                        {user.role !== 'admin' && book.availability === 'available' && (
                                            <button 
                                                onClick={() => handleRentBook(book.id)}
                                                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center justify-center group"
                                            >
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                                Rentar Libro
                                            </button>
                                        )}

                                        {user.role === 'admin' && (
                                            <div className="flex space-x-2">
                                                <button className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                                                    Editar
                                                </button>
                                                <button className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium">
                                                    Eliminar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12 sm:py-20">
                                <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-6 sm:p-12 shadow-2xl border border-white/10">
                                    <svg className="w-16 h-16 sm:w-24 sm:h-24 text-blue-300 mx-auto mb-4 sm:mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">Biblioteca Vacía</h3>
                                    <p className="text-blue-200 text-base sm:text-lg mb-6">
                                        No hay libros disponibles en este momento.
                                    </p>
                                    {user.role === 'admin' && (
                                        <button 
                                            onClick={() => setShowForm(true)}
                                            className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium flex items-center justify-center"
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Agregar Primer Libro
                                        </button>
                                    )}
                                </div>
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