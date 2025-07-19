import { useState, useEffect } from 'react';

function UserLoans({ token, onClose }) {
    const [loans, setLoans] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserLoans();
    }, []);

    const fetchUserLoans = async () => {
        try {
            const response = await fetch('/api/loans/user', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setLoans(data.loans);
                setStats(data.stats);
            } else {
                console.error('Error fetching loans:', response.status);
            }
        } catch (error) {
            console.error('Error fetching loans:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRenewLoan = async (loanId) => {
        try {
            const response = await fetch(`/api/loans/${loanId}/renew`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (response.ok) {
                alert('¡Préstamo renovado exitosamente!');
                fetchUserLoans(); // Recargar préstamos
            } else {
                alert(`Error: ${data.message || 'No se pudo renovar el préstamo'}`);
                if (data.errors) {
                    console.error('Errores:', data.errors);
                }
            }
        } catch (error) {
            console.error('Error renewing loan:', error);
            alert('Error al renovar el préstamo. Inténtalo de nuevo.');
        }
    };

    const handleReturnBook = async (loanId) => {
        try {
            const response = await fetch(`/api/loans/${loanId}/return`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (response.ok) {
                alert('¡Libro devuelto exitosamente!');
                fetchUserLoans(); // Recargar préstamos
            } else {
                alert(`Error: ${data.message || 'No se pudo devolver el libro'}`);
            }
        } catch (error) {
            console.error('Error returning book:', error);
            alert('Error al devolver el libro. Inténtalo de nuevo.');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'renewed':
                return 'bg-blue-100 text-blue-800';
            case 'overdue':
                return 'bg-red-100 text-red-800';
            case 'returned':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'active':
                return 'Activo';
            case 'renewed':
                return 'Renovado';
            case 'overdue':
                return 'Vencido';
            case 'returned':
                return 'Devuelto';
            default:
                return status;
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="mt-2 text-gray-600">Cargando préstamos...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl max-w-5xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden border border-white/20">
                {/* Header del Modal */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 sm:p-6 rounded-t-3xl">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold">Mis Préstamos</h2>
                                <p className="text-blue-100 text-xs sm:text-sm">Gestiona tus libros prestados</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all duration-200"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Contenido del Modal */}
                <div className="p-4 sm:p-6 max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-120px)] overflow-y-auto">

                {/* Estadísticas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 sm:mb-8">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-6 rounded-2xl border border-blue-200">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.active_loans || 0}</div>
                                <div className="text-xs sm:text-sm text-blue-600 font-medium">Préstamos Activos</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 sm:p-6 rounded-2xl border border-red-200">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500 rounded-xl flex items-center justify-center">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-2xl sm:text-3xl font-bold text-red-600">{stats.overdue_loans || 0}</div>
                                <div className="text-xs sm:text-sm text-red-600 font-medium">Préstamos Vencidos</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 sm:p-6 rounded-2xl border border-green-200">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-xl flex items-center justify-center">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-2xl sm:text-3xl font-bold text-green-600">
                                    {stats.can_borrow_more ? 'Sí' : 'No'}
                                </div>
                                <div className="text-xs sm:text-sm text-green-600 font-medium">Puede Rentar Más</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lista de préstamos */}
                {loans.length > 0 ? (
                    <div className="space-y-6">
                        {loans.map((loan) => (
                            <div key={loan.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800">
                                            {loan.book_title}
                                        </h3>
                                        <p className="text-gray-600">Autor: {loan.book_author}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(loan.status)}`}>
                                        {getStatusText(loan.status)}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-700">Fecha de préstamo:</span>
                                        <p className="text-gray-600">{loan.loan_date}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Fecha de vencimiento:</span>
                                        <p className="text-gray-600">{loan.due_date}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Días restantes:</span>
                                        <p className={`font-semibold ${loan.days_remaining <= 3 ? 'text-red-600' : 'text-gray-600'}`}>
                                            {loan.days_remaining}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Renovaciones:</span>
                                        <p className="text-gray-600">{loan.renewal_count}/1</p>
                                    </div>
                                </div>

                                {loan.return_date && (
                                    <div className="mb-4 text-sm">
                                        <span className="font-medium text-gray-700">Fecha de devolución:</span>
                                        <p className="text-gray-600">{loan.return_date}</p>
                                    </div>
                                )}



                                {/* Botones de acción */}
                                <div className="flex space-x-3 mt-4">
                                    {loan.can_renew && (
                                        <button
                                            onClick={() => handleRenewLoan(loan.id)}
                                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            Renovar (7 días)
                                        </button>
                                    )}
                                    
                                    {loan.is_active && (
                                        <button
                                            onClick={() => handleReturnBook(loan.id)}
                                            className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Devolver Libro
                                        </button>
                                    )}
                                </div>

                                {/* Alertas */}
                                {loan.is_overdue && (
                                    <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded-lg">
                                        <p className="text-red-700 text-sm font-medium">
                                            ⚠️ Este préstamo está vencido. Por favor devuelve el libro lo antes posible.
                                        </p>
                                    </div>
                                )}

                                {loan.is_near_due && !loan.is_overdue && (
                                    <div className="mt-3 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                                        <p className="text-yellow-700 text-sm font-medium">
                                            ⏰ Este préstamo vence pronto. Considera renovarlo si necesitas más tiempo.
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200">
                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Sin Préstamos Activos</h3>
                            <p className="text-gray-600 mb-4">
                                No tienes préstamos activos en este momento.
                            </p>
                            <p className="text-gray-500">
                                Ve a la biblioteca y renta algunos libros para comenzar.
                            </p>
                        </div>
                    </div>
                )}
                </div>
            </div>
        </div>
    );
}

export default UserLoans; 