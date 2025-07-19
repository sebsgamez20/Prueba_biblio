import { useState, useEffect } from 'react';

function UserLoans({ token, onClose }) {
    const [loans, setLoans] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    
    // Estados para el modal de renovación
    const [modalState, setModalState] = useState('list'); // 'list', 'renewing', 'success', 'error', 'returning', 'return-success', 'return-error'
    const [renewingLoan, setRenewingLoan] = useState(null);
    const [renewalResult, setRenewalResult] = useState(null);
    const [renewalError, setRenewalError] = useState(null);
    
    // Estados para el modal de devolución
    const [returningLoan, setReturningLoan] = useState(null);
    const [returnResult, setReturnResult] = useState(null);
    const [returnError, setReturnError] = useState(null);

    useEffect(() => {
        fetchUserLoans();
    }, []);

    // Cerrar modal con tecla Escape y focus trap
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        // Deshabilitar scroll del body cuando el modal está abierto
        document.body.style.overflow = 'hidden';

        document.addEventListener('keydown', handleEscape);
        
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [onClose]);

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
        // Buscar el préstamo
        const loan = loans.find(l => l.id === loanId);
        
        if (!loan) {
            setRenewalError('Error: No se encontró el préstamo');
            setModalState('error');
            return;
        }

        // Cambiar a estado de renovación
        setRenewingLoan(loan);
        setModalState('renewing');

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
                // Éxito - cambiar a estado de éxito
                setRenewalResult(data.loan);
                setModalState('success');
                
                // Recargar préstamos después de un delay para mostrar la animación
                setTimeout(() => {
                    fetchUserLoans();
                }, 2000);
            } else {
                // Error - cambiar a estado de error
                let errorMessage = data.message || 'No se pudo renovar el préstamo';
                
                if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
                    errorMessage = data.errors.join('\n• ');
                }
                
                setRenewalError(errorMessage);
                setModalState('error');
            }
        } catch (error) {
            console.error('Error renewing loan:', error);
            setRenewalError('Error al renovar el préstamo. Inténtalo de nuevo.');
            setModalState('error');
        }
    };

    const handleBackToList = () => {
        setModalState('list');
        setRenewingLoan(null);
        setRenewalResult(null);
        setRenewalError(null);
        setReturningLoan(null);
        setReturnResult(null);
        setReturnError(null);
    };

    const handleReturnBook = async (loanId) => {
        // Buscar el préstamo
        const loan = loans.find(l => l.id === loanId);
        
        if (!loan) {
            setReturnError('Error: No se encontró el préstamo');
            setModalState('return-error');
            return;
        }

        // Cambiar a estado de devolución
        setReturningLoan(loan);
        setModalState('returning');

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
                // Éxito - cambiar a estado de éxito
                setReturnResult(data.loan);
                setModalState('return-success');
                
                // Recargar préstamos después de un delay para mostrar la animación
                setTimeout(() => {
                    fetchUserLoans();
                }, 2000);
            } else {
                // Error - cambiar a estado de error
                let errorMessage = data.message || 'No se pudo devolver el libro';
                
                if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
                    errorMessage = data.errors.join('\n• ');
                }
                
                setReturnError(errorMessage);
                setModalState('return-error');
            }
        } catch (error) {
            console.error('Error returning book:', error);
            setReturnError('Error al devolver el libro. Inténtalo de nuevo.');
            setModalState('return-error');
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
            <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4">
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 text-center animate-in zoom-in-95 duration-300">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
                    <p className="text-gray-700 font-medium">Cargando préstamos...</p>
                </div>
            </div>
        );
    }

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-300"
            onClick={onClose}
        >
            <div 
                className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-5xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header del Modal */}
                <div className="bg-gradient-to-r from-[#0000ab] to-[#0000ab]/80 text-white p-4 sm:p-6 rounded-t-3xl">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold">Mis Préstamos Activos</h2>
                                <p className="text-white/80 text-xs sm:text-sm">Gestiona tus libros actualmente prestados</p>
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
                <div className="p-4 sm:p-6 max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-120px)] overflow-y-auto modal-scroll">
                    {modalState === 'list' && (
                        <>
                            {/* Estadísticas */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 sm:mb-8">
                                <div className="bg-gradient-to-br from-[#0000ab]/10 to-[#0000ab]/20 p-4 sm:p-6 rounded-2xl">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#0000ab] rounded-xl flex items-center justify-center">
                                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="text-2xl sm:text-3xl font-bold text-[#0000ab]">{stats.active_loans || 0}</div>
                                            <div className="text-xs sm:text-sm text-[#0000ab] font-medium">Préstamos Vigentes</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-red-200 to-red-100 p-4 sm:p-6 rounded-2xl border border-red-200">
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
                                <div className="bg-gradient-to-br from-green-200 to-green-100 p-4 sm:p-6 rounded-2xl border border-green-200">
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

                            {/* Lista de préstamos activos */}
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
                                                <div className="flex flex-col items-end space-y-1">
                                                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(loan.status)}`}>
                                                        {getStatusText(loan.status)}
                                                    </span>
                                                    {loan.status === 'overdue' && (
                                                        <span className="text-xs text-red-600 font-medium">
                                                            ⚠️ Requiere devolución
                                                        </span>
                                                    )}
                                                </div>
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

                                            {/* Información adicional para préstamos vencidos */}
                                            {loan.is_overdue && (
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                                                    <div>
                                                        <span className="font-medium text-red-700">Días de retraso:</span>
                                                        <p className="text-red-600 font-semibold">{loan.days_overdue || 0} días</p>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-red-700">Multa estimada:</span>
                                                        <p className="text-red-600 font-semibold">${loan.estimated_fine || 0.00}</p>
                                                    </div>
                                                    <div className="md:col-span-1">
                                                        <span className="font-medium text-red-700">Estado:</span>
                                                        <p className="text-red-600 font-semibold">Vencido</p>
                                                    </div>
                                                </div>
                                            )}

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
                                                
                                                {/* Mostrar información cuando no se puede renovar */}
                                                {!loan.can_renew && loan.status === 'active' && loan.renewal_count < 1 && (
                                                    <div className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium flex items-center">
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                                        </svg>
                                                        Ya tienes un libro renovado
                                                    </div>
                                                )}
                                                
                                                {loan.status === 'active' && loan.renewal_count >= 1 && (
                                                    <div className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium flex items-center">
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                                        </svg>
                                                        Máximo de renovaciones alcanzado
                                                    </div>
                                                )}
                                                
                                                {(loan.status === 'active' || loan.status === 'renewed' || loan.status === 'overdue') && (
                                                    <button
                                                        onClick={() => handleReturnBook(loan.id)}
                                                        className={`px-6 py-3 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center ${
                                                            loan.status === 'overdue' 
                                                                ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800' 
                                                                : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                                                        }`}
                                                    >
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        {loan.status === 'overdue' ? 'Devolver (Vencido)' : 'Devolver Libro'}
                                                    </button>
                                                )}
                                            </div>

                                            {/* Alertas */}
                                            {loan.is_overdue && (
                                                <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded-lg">
                                                    <div className="text-red-700 text-sm">
                                                        <p className="font-medium mb-2">
                                                            ⚠️ Este préstamo está vencido. Por favor devuelve el libro lo antes posible.
                                                        </p>
                                                        <div className="space-y-1 text-xs">
                                                            <p><strong>Días de retraso:</strong> {loan.days_overdue || 0} días</p>
                                                            <p><strong>Multa estimada:</strong> ${loan.estimated_fine || 0.00}</p>
                                                            <p className="text-red-600 font-medium">
                                                                💡 Devolver el libro ahora evitará que la multa siga aumentando.
                                                            </p>
                                                        </div>
                                                    </div>
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
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">¿No has rentado un libro?</h3>
                                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <p className="text-blue-700 text-sm">
                                                💡 Ve a la biblioteca y renta algunos libros para comenzar.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Vista de Renovación en Proceso */}
                    {modalState === 'renewing' && renewingLoan && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            {/* Animación de renovación */}
                            <div className="relative mb-8">
                                <div className="w-32 h-40 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-2xl transform transition-all duration-1000 animate-pulse">
                                    {/* Páginas del libro girando */}
                                    <div className="absolute inset-2 bg-white rounded-sm opacity-90 animate-spin"></div>
                                    <div className="absolute inset-3 bg-gray-100 rounded-sm opacity-80 animate-spin" style={{animationDelay: '0.2s'}}></div>
                                    <div className="absolute inset-4 bg-gray-200 rounded-sm opacity-70 animate-spin" style={{animationDelay: '0.4s'}}></div>
                                    
                                    {/* Icono de renovación */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <svg className="w-12 h-12 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-blue-600">Renovando Préstamo</h2>
                                <p className="text-lg text-gray-700">
                                    Procesando renovación de <strong>"{renewingLoan.book_title}"</strong>
                                </p>
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 max-w-md">
                                    <div className="flex items-center space-x-3">
                                        <svg className="w-6 h-6 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div className="text-left">
                                            <p className="text-blue-800 font-medium">Procesando...</p>
                                            <p className="text-blue-600">Por favor espera</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Vista de Éxito de Renovación */}
                    {modalState === 'success' && renewalResult && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            {/* Animación de éxito */}
                            <div className="relative mb-8">
                                <div className="w-32 h-40 bg-gradient-to-br from-green-600 to-green-700 rounded-lg shadow-2xl transform transition-all duration-1000">
                                    {/* Páginas volando */}
                                    <div className="absolute -top-2 -left-2 w-8 h-10 bg-white rounded-sm opacity-80 animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                    <div className="absolute -top-1 -right-1 w-6 h-8 bg-gray-100 rounded-sm opacity-70 animate-bounce" style={{animationDelay: '0.3s'}}></div>
                                    <div className="absolute top-2 left-4 w-4 h-6 bg-gray-200 rounded-sm opacity-60 animate-bounce" style={{animationDelay: '0.5s'}}></div>
                                    
                                    {/* Libro principal */}
                                    <div className="absolute inset-2 bg-white rounded-sm opacity-90"></div>
                                    <div className="absolute inset-3 bg-gray-100 rounded-sm opacity-80"></div>
                                    <div className="absolute inset-4 bg-gray-200 rounded-sm opacity-70"></div>
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
                                <h2 className="text-3xl font-bold text-green-600">¡Préstamo Renovado!</h2>
                                <p className="text-xl text-gray-700">
                                    <strong>"{renewalResult.book_title}"</strong> ha sido renovado exitosamente
                                </p>
                                
                                {/* Información de la renovación */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                        <div className="text-2xl font-bold text-green-600">+7</div>
                                        <div className="text-sm text-green-600 font-medium">Días agregados</div>
                                    </div>
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                        <div className="text-2xl font-bold text-blue-600">{renewalResult.renewal_count}</div>
                                        <div className="text-sm text-blue-600 font-medium">Renovaciones usadas</div>
                                    </div>
                                </div>

                                {/* Nueva fecha de vencimiento */}
                                <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-4 max-w-md">
                                    <div className="flex items-center space-x-3">
                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <div className="text-left">
                                            <p className="text-green-800 font-medium">Nueva fecha de vencimiento</p>
                                            <p className="text-green-600 font-semibold">{renewalResult.due_date}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Botón para volver */}
                                <button
                                    onClick={handleBackToList}
                                    className="mt-6 px-8 py-3 bg-[#0000ab] text-white rounded-xl hover:bg-[#0000ab]/90 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
                                >
                                    Volver a Mis Préstamos
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Vista de Error de Renovación */}
                    {modalState === 'error' && renewalError && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            {/* Icono de error */}
                            <div className="relative mb-8">
                                <div className="w-32 h-32 bg-gradient-to-br from-red-500 to-red-600 rounded-full shadow-2xl flex items-center justify-center">
                                    <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                            </div>

                            {/* Mensaje de error */}
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-red-600">Error en la Renovación</h2>
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 max-w-md">
                                    <p className="text-red-700 whitespace-pre-line">{renewalError}</p>
                                </div>

                                {/* Botones de acción */}
                                <div className="flex space-x-3">
                                    <button
                                        onClick={handleBackToList}
                                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 font-medium"
                                    >
                                        Volver a Mis Préstamos
                                    </button>
                                    {renewingLoan && (
                                        <button
                                            onClick={() => handleRenewLoan(renewingLoan.id)}
                                            className="px-6 py-3 bg-[#0000ab] text-white rounded-xl hover:bg-[#0000ab]/90 transition-all duration-200 font-medium"
                                        >
                                            Intentar de Nuevo
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Vista de Devolución en Proceso */}
                    {modalState === 'returning' && returningLoan && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            {/* Animación de devolución */}
                            <div className="relative mb-8">
                                <div className="w-32 h-40 bg-gradient-to-br from-green-600 to-green-700 rounded-lg shadow-2xl transform transition-all duration-1000 animate-pulse">
                                    {/* Libro con flecha de devolución */}
                                    <div className="absolute inset-2 bg-white rounded-sm opacity-90"></div>
                                    <div className="absolute inset-3 bg-gray-100 rounded-sm opacity-80"></div>
                                    <div className="absolute inset-4 bg-gray-200 rounded-sm opacity-70"></div>
                                    
                                    {/* Flecha de devolución */}
                                    <div className="absolute -right-8 top-1/2 transform -translate-y-1/2">
                                        <svg className="w-8 h-8 text-green-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </div>
                                    
                                    {/* Icono de biblioteca */}
                                    <div className="absolute -right-16 top-1/2 transform -translate-y-1/2">
                                        <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-green-600">Devolviendo Libro</h2>
                                <p className="text-lg text-gray-700">
                                    Procesando devolución de <strong>"{returningLoan.book_title}"</strong>
                                </p>
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4 max-w-md">
                                    <div className="flex items-center space-x-3">
                                        <svg className="w-6 h-6 text-green-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div className="text-left">
                                            <p className="text-green-800 font-medium">Procesando devolución...</p>
                                            <p className="text-green-600">Calculando multa si aplica</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Vista de Éxito de Devolución */}
                    {modalState === 'return-success' && returnResult && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            {/* Animación de éxito de devolución */}
                            <div className="relative mb-8">
                                <div className="w-32 h-40 bg-gradient-to-br from-green-600 to-green-700 rounded-lg shadow-2xl transform transition-all duration-1000">
                                    {/* Libro cerrado con check */}
                                    <div className="absolute inset-2 bg-white rounded-sm opacity-90"></div>
                                    <div className="absolute inset-3 bg-gray-100 rounded-sm opacity-80"></div>
                                    <div className="absolute inset-4 bg-gray-200 rounded-sm opacity-70"></div>
                                    
                                    {/* Línea de cierre del libro */}
                                    <div className="absolute inset-y-2 left-1/2 transform -translate-x-1/2 w-0.5 bg-gray-400"></div>
                                </div>
                                
                                {/* Icono de check flotante */}
                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                
                                {/* Icono de biblioteca */}
                                <div className="absolute -right-16 top-1/2 transform -translate-y-1/2">
                                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center animate-pulse">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Mensaje de éxito */}
                            <div className="space-y-4">
                                <h2 className="text-3xl font-bold text-green-600">¡Libro Devuelto!</h2>
                                <p className="text-xl text-gray-700">
                                    <strong>"{returnResult.book_title}"</strong> ha sido devuelto exitosamente
                                </p>
                                
                                {/* Información de la devolución */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {returnResult.return_date ? 'Completado' : 'En proceso'}
                                        </div>
                                        <div className="text-sm text-blue-600 font-medium">Estado</div>
                                    </div>
                                </div>

                                {/* Fecha de devolución */}
                                <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-4 max-w-md">
                                    <div className="flex items-center space-x-3">
                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <div className="text-left">
                                            <p className="text-green-800 font-medium">Fecha de devolución</p>
                                            <p className="text-green-600 font-semibold">{returnResult.return_date || 'Hoy'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Botón para volver */}
                                <button
                                    onClick={handleBackToList}
                                    className="mt-6 px-8 py-3 bg-[#0000ab] text-white rounded-xl hover:bg-[#0000ab]/90 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
                                >
                                    Volver a Mis Préstamos
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Vista de Error de Devolución */}
                    {modalState === 'return-error' && returnError && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            {/* Icono de error */}
                            <div className="relative mb-8">
                                <div className="w-32 h-32 bg-gradient-to-br from-red-500 to-red-600 rounded-full shadow-2xl flex items-center justify-center">
                                    <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                            </div>

                            {/* Mensaje de error */}
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-red-600">Error en la Devolución</h2>
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 max-w-md">
                                    <p className="text-red-700 whitespace-pre-line">{returnError}</p>
                                </div>

                                {/* Botones de acción */}
                                <div className="flex space-x-3">
                                    <button
                                        onClick={handleBackToList}
                                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 font-medium"
                                    >
                                        Volver a Mis Préstamos
                                    </button>
                                    {returningLoan && (
                                        <button
                                            onClick={() => handleReturnBook(returningLoan.id)}
                                            className="px-6 py-3 bg-[#0000ab] text-white rounded-xl hover:bg-[#0000ab]/90 transition-all duration-200 font-medium"
                                        >
                                            Intentar de Nuevo
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UserLoans; 