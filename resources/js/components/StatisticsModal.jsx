import { useState, useEffect } from 'react';

function StatisticsModal({ onClose, token }) {
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStatistics();
    }, []);

    const fetchStatistics = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/statistics', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Error al obtener estadísticas');
            }

            const data = await response.json();
            setStatistics(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        return `/storage/${imagePath}`;
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-6xl w-full my-8 border border-white/20 animate-in zoom-in-95 duration-300">
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0000ab] mx-auto mb-4"></div>
                            <p className="text-gray-600">Cargando estadísticas...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-6xl w-full my-8 border border-white/20 animate-in zoom-in-95 duration-300">
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Error</h3>
                            <p className="text-gray-600 mb-4">{error}</p>
                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-[#0000ab] text-white rounded-xl hover:bg-[#0000ab]/90 transition-all duration-200"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300 overflow-y-auto"
            onClick={onClose}
        >
            <div 
                className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-6xl w-full my-8 animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header del Modal */}
                <div className="bg-gradient-to-r from-[#0000ab] to-[#0000ab]/80 text-white p-4 sm:p-6 rounded-t-3xl">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold">Estadísticas de la Biblioteca</h2>
                                <p className="text-white/80 text-xs sm:text-sm">Análisis completo del sistema</p>
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
                <div className="max-h-[calc(100vh-200px)] overflow-y-auto modal-scroll p-6 sm:p-8">
                    {statistics && (
                        <div className="space-y-8">
                            {/* Estadísticas Generales */}
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-[#0000ab]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                    Estadísticas Generales
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 text-center">
                                        <div className="text-2xl font-bold text-blue-600">{statistics.general_stats.total_books}</div>
                                        <div className="text-sm text-blue-600 font-medium">Total Libros</div>
                                    </div>
                                    <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4 text-center">
                                        <div className="text-2xl font-bold text-green-600">{statistics.general_stats.available_books}</div>
                                        <div className="text-sm text-green-600 font-medium">Disponibles</div>
                                    </div>
                                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4 text-center">
                                        <div className="text-2xl font-bold text-purple-600">{statistics.general_stats.total_loans}</div>
                                        <div className="text-sm text-purple-600 font-medium">Total Préstamos</div>
                                    </div>
                                    <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-4 text-center">
                                        <div className="text-2xl font-bold text-red-600">{statistics.general_stats.overdue_loans}</div>
                                        <div className="text-sm text-red-600 font-medium">Vencidos</div>
                                    </div>
                                </div>
                            </div>

                            {/* Libros Más Rentados */}
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-[#0000ab]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    Libros Más Rentados
                                </h3>
                                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posición</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Libro</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Autor</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rentas</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {statistics.most_rented_books.map((book, index) => (
                                                    <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-4 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                                                    index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                                                    index === 1 ? 'bg-gray-100 text-gray-800' :
                                                                    index === 2 ? 'bg-orange-100 text-orange-800' :
                                                                    'bg-blue-100 text-blue-800'
                                                                }`}>
                                                                    {index + 1}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <div className="w-10 h-10 bg-gray-200 rounded-lg overflow-hidden mr-3">
                                                                    {getImageUrl(book.image) ? (
                                                                        <img 
                                                                            src={getImageUrl(book.image)} 
                                                                            alt={book.title}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                                                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                                            </svg>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-medium text-gray-900">{book.title}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {book.author}
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <span className="text-lg font-bold text-[#0000ab]">{book.rentals_count}</span>
                                                                <span className="text-sm text-gray-500 ml-1">rentas</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                book.availability === 'available' 
                                                                    ? 'bg-green-100 text-green-800' 
                                                                    : 'bg-red-100 text-red-800'
                                                            }`}>
                                                                {book.availability === 'available' ? 'Disponible' : 'No disponible'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Préstamos por Mes */}
                            {statistics.monthly_loans.length > 0 && (
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                        <svg className="w-5 h-5 mr-2 text-[#0000ab]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Préstamos por Mes (Últimos 6 meses)
                                    </h3>
                                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                                            {statistics.monthly_loans.map((month, index) => (
                                                <div key={index} className="text-center">
                                                    <div className="bg-gradient-to-br from-[#0000ab]/10 to-[#0000ab]/20 border border-[#0000ab]/30 rounded-xl p-4">
                                                        <div className="text-2xl font-bold text-[#0000ab]">{month.count}</div>
                                                        <div className="text-sm text-gray-600 font-medium">{month.month}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default StatisticsModal; 