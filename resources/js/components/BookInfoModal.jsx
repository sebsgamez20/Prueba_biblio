import { useState } from 'react';

function BookInfoModal({ book, onClose, onRent, isRenting = false }) {
    // Agregar estilos CSS para el scroll del modal
    const modalStyles = {
        scrollbarWidth: 'thin',
        scrollbarColor: '#0000ab #f3f4f6',
    };

    const scrollbarStyles = `
        .modal-scroll::-webkit-scrollbar {
            width: 6px;
        }
        .modal-scroll::-webkit-scrollbar-track {
            background: #f3f4f6;
            border-radius: 3px;
        }
        .modal-scroll::-webkit-scrollbar-thumb {
            background: #0000ab;
            border-radius: 3px;
        }
        .modal-scroll::-webkit-scrollbar-thumb:hover {
            background: #0000ab/80;
        }
    `;
    const [rentSuccess, setRentSuccess] = useState(false);

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        return `/storage/${imagePath}`;
    };

    const handleRentClick = async () => {
        try {
            await onRent(book.id);
            setRentSuccess(true);
        } catch (error) {
            // El error se maneja en el componente padre
        }
    };

    return (
        <>
            <style>{scrollbarStyles}</style>
            <div 
                className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300 overflow-y-auto"
                onClick={onClose}
            >
                <div 
                    className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-4xl w-full my-8 border border-white/20 animate-in zoom-in-95 duration-300"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header del Modal */}
                    <div className="bg-gradient-to-r from-[#0000ab] to-[#0000ab]/80 text-white p-4 sm:p-6 rounded-t-3xl">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold">Información del Libro</h2>
                                    <p className="text-white/80 text-xs sm:text-sm">Detalles completos del libro</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Contenido del Modal */}
                    <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto modal-scroll" style={modalStyles}>
                        {rentSuccess ? (
                            // Vista de éxito
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                {/* Animación del libro abriéndose */}
                                <div className="relative mb-8">
                                    <div className="w-32 h-40 bg-gradient-to-br from-[#0000ab] to-[#0000ab]/80 rounded-lg shadow-2xl transform transition-all duration-1000 animate-pulse">
                                        {/* Páginas del libro */}
                                        <div className="absolute inset-2 bg-white rounded-sm opacity-90"></div>
                                        <div className="absolute inset-3 bg-gray-100 rounded-sm opacity-80"></div>
                                        <div className="absolute inset-4 bg-gray-200 rounded-sm opacity-70"></div>
                                        
                                        {/* Líneas de texto simuladas */}
                                        <div className="absolute inset-6 space-y-1">
                                            <div className="h-1 bg-gray-300 rounded w-3/4"></div>
                                            <div className="h-1 bg-gray-300 rounded w-1/2"></div>
                                            <div className="h-1 bg-gray-300 rounded w-5/6"></div>
                                            <div className="h-1 bg-gray-300 rounded w-2/3"></div>
                                        </div>
                                    </div>
                                    
                                    {/* Icono de check flotante */}
                                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Mensaje de éxito */}
                                <div className="space-y-4">
                                    <h2 className="text-3xl font-bold text-green-600">¡Libro Rentado!</h2>
                                    <p className="text-xl text-gray-700">
                                        <strong>"{book.title}"</strong> ha sido rentado exitosamente
                                    </p>
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 max-w-md">
                                        <div className="flex items-center space-x-3">
                                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <div className="text-left">
                                                <p className="text-green-800 font-medium">Fecha de devolución</p>
                                                <p className="text-green-600">15 días desde hoy</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Información adicional */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
                                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                            <div className="text-2xl font-bold text-blue-600">1</div>
                                            <div className="text-sm text-blue-600 font-medium">Renovación permitida</div>
                                        </div>
                                        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                                            <div className="text-2xl font-bold text-purple-600">3</div>
                                            <div className="text-sm text-purple-600 font-medium">Libros máximo</div>
                                        </div>
                                    </div>

                                    {/* Botón para cerrar */}
                                    <button
                                        onClick={onClose}
                                        className="mt-6 px-8 py-3 bg-[#0000ab] text-white rounded-xl hover:bg-[#0000ab]/90 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
                                    >
                                        Continuar Explorando
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // Vista normal del libro
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Portada del libro - 1/3 del ancho */}
                                <div className="lg:col-span-1">
                                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200 shadow-lg">
                                        <div className="aspect-[3/4] bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                                            {getImageUrl(book.image) ? (
                                                <img 
                                                    src={getImageUrl(book.image)} 
                                                    alt={book.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Estado de disponibilidad */}
                                        <div className="mt-4 text-center">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                                book.availability === 'available' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                <svg className={`w-4 h-4 mr-1 ${
                                                    book.availability === 'available' ? 'text-green-500' : 'text-red-500'
                                                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                                                        book.availability === 'available' 
                                                            ? "M5 13l4 4L19 7" 
                                                            : "M6 18L18 6M6 6l12 12"
                                                    } />
                                                </svg>
                                                {book.availability === 'available' ? 'Disponible' : 'No disponible'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Información del libro - 2/3 del ancho */}
                                <div className="lg:col-span-2">
                                    <div className="space-y-6">
                                        {/* Título y autor */}
                                        <div>
                                            <h1 className="text-3xl font-bold text-gray-800 mb-2">{book.title}</h1>
                                            <p className="text-xl text-gray-600">por {book.author}</p>
                                        </div>

                                        {/* Detalles del libro */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="bg-gray-50 rounded-xl p-4">
                                                <h3 className="font-semibold text-gray-700 mb-2">Género</h3>
                                                <p className="text-gray-600">{book.genre || 'No especificado'}</p>
                                            </div>
                                            <div className="bg-gray-50 rounded-xl p-4">
                                                <h3 className="font-semibold text-gray-700 mb-2">Año de publicación</h3>
                                                <p className="text-gray-600">{book.publication_year || 'No especificado'}</p>
                                            </div>
                                        </div>

                                        {/* Descripción */}
                                        {book.description && (
                                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                                                <h3 className="font-semibold text-blue-800 mb-2">Descripción</h3>
                                                <p className="text-blue-700 leading-relaxed">{book.description}</p>
                                            </div>
                                        )}

                                        {/* Información adicional */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div className="text-center bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-4">
                                                <div className="text-2xl font-bold text-green-600">15</div>
                                                <div className="text-sm text-green-600 font-medium">Días de préstamo</div>
                                            </div>
                                            <div className="text-center bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl p-4">
                                                <div className="text-2xl font-bold text-purple-600">1</div>
                                                <div className="text-sm text-purple-600 font-medium">Renovación permitida</div>
                                            </div>
                                        </div>

                                        {/* Botón de rentar */}
                                        <div className="pt-4">
                                            {book.availability === 'available' ? (
                                                <button
                                                    onClick={handleRentClick}
                                                    disabled={isRenting}
                                                    className="w-full px-8 py-4 bg-gradient-to-r from-[#0000ab] to-[#0000ab]/90 text-white rounded-xl hover:from-[#0000ab]/90 hover:to-[#0000ab] transition-all duration-200 shadow-lg hover:shadow-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                                >
                                                    {isRenting ? (
                                                        <>
                                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            Rentando...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                            </svg>
                                                            Rentar Libro
                                                        </>
                                                    )}
                                                </button>
                                            ) : (
                                                <div className="w-full px-8 py-4 bg-gray-100 text-gray-500 rounded-xl font-semibold text-lg flex items-center justify-center">
                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                                    </svg>
                                                    Libro no disponible
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default BookInfoModal; 