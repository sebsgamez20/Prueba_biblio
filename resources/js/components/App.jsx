import { useState, useEffect } from 'react';
import BookForm from './BookForm';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import UserLoans from './UserLoans';
import BookInfoModal from './BookInfoModal';

function App() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showLoans, setShowLoans] = useState(false);
    const [showBookInfo, setShowBookInfo] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [isRenting, setIsRenting] = useState(false);
    const [user, setUser] = useState(null);
    const [authMode, setAuthMode] = useState('login'); // 'login' o 'register'
    const [showAuth, setShowAuth] = useState(false);
    const [token, setToken] = useState(localStorage.getItem('token'));
    
    // Estados para edición y eliminación
    const [editingBook, setEditingBook] = useState(null);
    const [showEditForm, setShowEditForm] = useState(false);
    const [deletingBook, setDeletingBook] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        checkAuthStatus();
        fetchBooks();
    }, []);

    // Efecto para manejar la tecla ESC
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                if (showBookInfo) {
                    handleCloseBookInfo();
                }
                if (showLoans) {
                    setShowLoans(false);
                }
                if (showForm) {
                    setShowForm(false);
                }
                if (showEditForm) {
                    handleCancelEdit();
                }
                if (showDeleteConfirm) {
                    handleCancelDelete();
                }
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [showBookInfo, showLoans, showForm, showEditForm, showDeleteConfirm]);

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

    const handleShowBookInfo = (book) => {
        setSelectedBook(book);
        setShowBookInfo(true);
    };

    const handleCloseBookInfo = () => {
        setShowBookInfo(false);
        setSelectedBook(null);
    };

    // Función para manejar la edición de libros
    const handleEditBook = (book) => {
        setEditingBook(book);
        setShowEditForm(true);
    };

    // Función para manejar la cancelación de edición
    const handleCancelEdit = () => {
        setShowEditForm(false);
        setEditingBook(null);
    };

    // Función para manejar la actualización exitosa de un libro
    const handleBookUpdated = (updatedBook) => {
        setBooks(books.map(book => 
            book.id === updatedBook.id ? updatedBook : book
        ));
        setShowEditForm(false);
        setEditingBook(null);
    };

    // Función para manejar la eliminación de libros
    const handleDeleteBook = (book) => {
        setDeletingBook(book);
        setShowDeleteConfirm(true);
    };

    // Función para confirmar la eliminación
    const handleConfirmDelete = async () => {
        if (!deletingBook) return;

        try {
            const response = await fetch(`/api/books/${deletingBook.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                // Remover el libro de la lista
                setBooks(books.filter(book => book.id !== deletingBook.id));
                setShowDeleteConfirm(false);
                setDeletingBook(null);
            } else {
                const data = await response.json();
                alert(data.message || 'Error al eliminar el libro');
            }
        } catch (error) {
            console.error('Error deleting book:', error);
            alert('Error al eliminar el libro. Inténtalo de nuevo.');
        }
    };

    // Función para cancelar la eliminación
    const handleCancelDelete = () => {
        setShowDeleteConfirm(false);
        setDeletingBook(null);
    };

    const handleRentBook = async (bookId) => {
        setIsRenting(true);
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
                // Recargar la lista de libros para actualizar disponibilidad
                fetchBooks();
                // No cerrar el modal, el componente hijo manejará el éxito
                return Promise.resolve();
            } else {
                // Mostrar mensajes de error más detallados
                let errorMessage = data.message || 'No se pudo rentar el libro';
                
                if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
                    errorMessage = data.errors.join('\n• ');
                    errorMessage = 'No se pudo rentar el libro:\n• ' + errorMessage;
                }
                
                alert(errorMessage);
                if (data.errors) {
                    console.error('Errores:', data.errors);
                }
                return Promise.reject(new Error(errorMessage));
            }
        } catch (error) {
            console.error('Error renting book:', error);
            alert('Error al rentar el libro. Inténtalo de nuevo.');
            return Promise.reject(error);
        } finally {
            setIsRenting(false);
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



    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
            {/* Patrón de fondo decorativo sutil */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-96 h-96 bg-[#0000ab] rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#0000ab] rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{animationDelay: '3s'}}></div>
                <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-[#0000ab] rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{animationDelay: '6s'}}></div>
            </div>
            
            {/* Contenido principal */}
            <div className="relative z-10">
            {/* Header Moderno */}
            <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-lg sticky top-0 z-40">
                <div className="container mx-auto px-4 sm:px-6 py-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                        {/* Logo y Título */}
                        <div className="flex items-center space-x-3 sm:space-x-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#0000ab] to-[#0000ab]/80 rounded-lg flex items-center justify-center shadow-md">
                                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                                    Biblioteca Digital
                                </h1>
                                <p className="text-xs sm:text-sm text-gray-600">Explora, descubre, aprende</p>
                            </div>
                        </div>

                        {/* Información del Usuario y Botones */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                            <div className="text-left sm:text-right">
                                <p className="text-sm font-medium text-gray-800">{user.name}</p>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                    user.role === 'admin' 
                                        ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                                        : 'bg-[#0000ab]/20 text-[#0000ab] border border-[#0000ab]/30'
                                }`}>
                                    {user.role === 'admin' ? '👑 Administrador' : '👤 Usuario'}
                                </span>
                            </div>
                            
                            {/* Botones de Acción */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                                {user.role !== 'admin' && (
                                    <button
                                        onClick={() => setShowLoans(true)}
                                        className="w-full sm:w-auto px-4 py-2 bg-[#0000ab] text-white rounded-lg hover:bg-[#0000ab]/90 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center text-sm font-medium"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Mis préstamos 
                                    </button>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="w-full sm:w-auto px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium flex items-center justify-center"
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
                        <div className="bg-white/80 backdrop-blur-xl rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                                <div>
                                    <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Panel de Administración</h2>
                                    <p className="text-sm sm:text-base text-gray-600">Gestiona la colección de libros de la biblioteca</p>
                                </div>
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="w-full sm:w-auto px-6 py-3 bg-[#0000ab] text-white rounded-lg hover:bg-[#0000ab]/90 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center font-medium"
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
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Explorar Biblioteca</h2>
                            <p className="text-sm sm:text-base text-gray-600">Descubre nuestra colección de libros</p>
                        </div>
                        <div className="text-left sm:text-right">
                            <p className="text-sm text-gray-600">Total de libros</p>
                            <p className="text-xl sm:text-2xl font-bold text-[#0000ab]">{books.length}</p>
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
                                <div key={book.id} className="group bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden hover:border-[#0000ab]/30">
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
                                        <div className="absolute top-3 right-3">
                                            <span className={`px-2 py-1 text-xs font-medium ${
                                                book.availability === 'available' 
                                                    ? 'bg-green-100 text-green-700 border border-green-200' 
                                                    : book.availability === 'borrowed'
                                                    ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                                                    : 'bg-red-100 text-red-700 border border-red-200'
                                            }`}>
                                                {book.availability === 'available' ? 'Disponible' :
                                                 book.availability === 'borrowed' ? 'Prestado' : 'Mantenimiento'}
                                            </span>
                                        </div>

                                        {/* Badge de Género */}
                                        <div className="absolute top-3 left-3">
                                            <span className="px-2 py-1 bg-[#C4DFE6] text-[#07575B] border border-[#0000ab]/20 text-xs font-medium">
                                                {book.genre}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Contenido del Libro */}
                                    <div className="p-4 sm:p-6">
                                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-[#0000ab] transition-colors">
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
                                        {user.role !== 'admin' && (
                                            <button 
                                                onClick={() => handleShowBookInfo(book)}
                                                className={`w-full px-4 py-3 transition-all duration-200 shadow-sm hover:shadow-md font-medium flex items-center justify-center group ${
                                                    book.availability === 'available' 
                                                        ? 'bg-[#0000ab] text-white hover:bg-[#0000ab]/90' 
                                                        : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                                }`}
                                            >
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                Ver Info
                                            </button>
                                        )}

                                        {user.role === 'admin' && (
                                            <div className="flex space-x-2">
                                                <button 
                                                    onClick={() => handleEditBook(book)}
                                                    className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors text-sm font-medium flex items-center justify-center"
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    Editar
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteBook(book)}
                                                    className="flex-1 px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 transition-colors text-sm font-medium flex items-center justify-center"
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Eliminar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12 sm:py-20">
                                <div className="bg-white/80 backdrop-blur-xl rounded-xl p-6 sm:p-12 shadow-lg border border-gray-200">
                                    <svg className="w-16 h-16 sm:w-24 sm:h-24 text-[#0000ab] mx-auto mb-4 sm:mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Biblioteca Vacía</h3>
                                    <p className="text-gray-600 text-base sm:text-lg mb-6">
                                        No hay libros disponibles en este momento.
                                    </p>
                                    {user.role === 'admin' && (
                                        <button 
                                            onClick={() => setShowForm(true)}
                                            className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-[#0000ab] text-white hover:bg-[#0000ab]/90 transition-all duration-200 shadow-lg hover:shadow-xl font-medium flex items-center justify-center"
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

            {/* Modal de Préstamos */}
            {showLoans && (
                <UserLoans token={token} onClose={() => setShowLoans(false)} />
            )}

            {/* Modal de Formulario de Libro */}
            {showForm && (
                <BookForm 
                    onBookCreated={handleBookCreated}
                    onCancel={handleCancelForm}
                    token={token}
                />
            )}

            {/* Modal de Información del Libro */}
            {showBookInfo && selectedBook && (
                <BookInfoModal 
                    book={selectedBook}
                    onClose={handleCloseBookInfo}
                    onRent={handleRentBook}
                    isRenting={isRenting}
                />
            )}

            {/* Modal de Edición de Libro */}
            {showEditForm && editingBook && (
                <div 
                    className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300 overflow-y-auto"
                    onClick={(e) => e.target === e.currentTarget && handleCancelEdit()}
                >
                    <div 
                        className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-5xl w-full my-8 border border-white/20 animate-in zoom-in-95 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header del Modal */}
                        <div className="bg-gradient-to-r from-[#0000ab] to-[#0000ab]/80 text-white p-4 sm:p-6 rounded-t-3xl">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-bold">Editar Libro</h2>
                                        <p className="text-white/80 text-xs sm:text-sm">Modifica la información del libro</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleCancelEdit}
                                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Contenido del Modal */}
                        <div className="max-h-[calc(100vh-200px)] overflow-y-auto modal-scroll">                           
                            <BookForm 
                                book={editingBook}
                                onBookCreated={handleBookUpdated}
                                onCancel={handleCancelEdit}
                                isEditing={true}
                                token={token}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Confirmación de Eliminación */}
            {showDeleteConfirm && deletingBook && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                     onClick={(e) => e.target === e.currentTarget && handleCancelDelete()}>
                    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-300">
                        <div className="p-6 sm:p-8 text-center">
                            {/* Icono de advertencia */}
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>

                            <h3 className="text-xl font-bold text-gray-800 mb-2">Confirmar Eliminación</h3>
                            <p className="text-gray-600 mb-6">
                                ¿Estás seguro de que quieres eliminar el libro <strong>"{deletingBook.title}"</strong>?
                            </p>
                            <p className="text-sm text-red-600 mb-6">
                                Esta acción no se puede deshacer.
                            </p>

                            <div className="flex space-x-3">
                                <button
                                    onClick={handleCancelDelete}
                                    className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 font-medium"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App; 