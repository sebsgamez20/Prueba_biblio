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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Mis Préstamos</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{stats.active_loans || 0}</div>
                        <div className="text-sm text-blue-600">Préstamos Activos</div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{stats.overdue_loans || 0}</div>
                        <div className="text-sm text-red-600">Préstamos Vencidos</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                            {stats.can_borrow_more ? 'Sí' : 'No'}
                        </div>
                        <div className="text-sm text-green-600">Puede Rentar Más</div>
                    </div>
                </div>

                {/* Lista de préstamos */}
                {loans.length > 0 ? (
                    <div className="space-y-4">
                        {loans.map((loan) => (
                            <div key={loan.id} className="border rounded-lg p-4">
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
                                <div className="flex space-x-2">
                                    {loan.can_renew && (
                                        <button
                                            onClick={() => handleRenewLoan(loan.id)}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                                        >
                                            Renovar (7 días)
                                        </button>
                                    )}
                                    
                                    {loan.is_active && (
                                        <button
                                            onClick={() => handleReturnBook(loan.id)}
                                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                                        >
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
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <p className="text-gray-600 text-lg mb-4">
                            No tienes préstamos activos en este momento.
                        </p>
                        <p className="text-gray-500">
                            Ve a la biblioteca y renta algunos libros para comenzar.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserLoans; 