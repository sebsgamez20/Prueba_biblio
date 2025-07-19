import { useState, useEffect } from 'react';

function BookForm({ onBookCreated, onCancel, book, isEditing = false }) {
    const [formData, setFormData] = useState({
        title: book?.title || '',
        author: book?.author || '',
        genre: book?.genre || '',
        description: book?.description || '',
        publication_year: book?.publication_year || '',
        availability: book?.availability || 'available'
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Efecto para actualizar el formulario cuando cambie el libro a editar
    useEffect(() => {
        if (book && isEditing) {
            setFormData({
                title: book.title || '',
                author: book.author || '',
                genre: book.genre || '',
                description: book.description || '',
                publication_year: book.publication_year || '',
                availability: book.availability || 'available'
            });
            
            // Si el libro tiene imagen, mostrar preview
            if (book.image) {
                setImagePreview(`/storage/${book.image}`);
            }
        }
    }, [book, isEditing]);

    const genres = [
        'Fantasía', 'Ciencia ficción', 'Misterio', 'Romance', 'Terror',
        'Histórica', 'Biografía', 'Autobiografía', 'Ensayo', 'Poesía',
        'Teatro', 'Infantil', 'Juvenil', 'Novela clásica', 'Realismo mágico',
        'Distopía', 'Aventura', 'Policíaca', 'Thriller', 'Otros'
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Limpiar error del campo cuando el usuario empiece a escribir
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            
            // Crear preview de la imagen
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'El título es obligatorio';
        }

        if (!formData.author.trim()) {
            newErrors.author = 'El autor es obligatorio';
        }

        if (!formData.genre) {
            newErrors.genre = 'El género es obligatorio';
        }

        if (formData.publication_year && (formData.publication_year < 1000 || formData.publication_year > new Date().getFullYear() + 1)) {
            newErrors.publication_year = 'El año de publicación debe ser válido';
        }

        if (imageFile && imageFile.size > 5 * 1024 * 1024) { // 5MB
            newErrors.image = 'La imagen no debe superar 5MB';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const formDataToSend = new FormData();
            
            // Agregar campos del formulario
            Object.keys(formData).forEach(key => {
                if (formData[key] !== '') {
                    formDataToSend.append(key, formData[key]);
                }
            });

            // Agregar imagen si existe
            if (imageFile) {
                formDataToSend.append('image', imageFile);
            }

            // Agregar método PUT para edición
            if (isEditing) {
                formDataToSend.append('_method', 'PUT');
            }

            console.log('Enviando datos:', Object.fromEntries(formDataToSend));

            const url = isEditing ? `/api/books/${book.id}` : '/api/books';
            const method = isEditing ? 'POST' : 'POST'; // POST con _method para PUT

            const headers = {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            };

            const response = await fetch(url, {
                method: method,
                headers: headers,
                body: formDataToSend
            });

            const data = await response.json();
            console.log('Respuesta del servidor:', data);
            console.log('Status de la respuesta:', response.status);

            if (response.ok) {
                // Limpiar formulario solo si no es edición
                if (!isEditing) {
                    setFormData({
                        title: '',
                        author: '',
                        genre: '',
                        description: '',
                        publication_year: '',
                        availability: 'available'
                    });
                    setImageFile(null);
                    setImagePreview(null);
                }
                setErrors({});
                
                // Notificar al componente padre
                if (onBookCreated && data.book) {
                    console.log(isEditing ? 'Libro actualizado exitosamente:' : 'Libro creado exitosamente:', data.book);
                    onBookCreated(data.book);
                } else {
                    console.error('No se recibió el libro en la respuesta:', data);
                }
            } else {
                console.error('Error en la respuesta:', data);
                if (data.errors) {
                    setErrors(data.errors);
                } else {
                    setErrors({ general: data.message || `Error al ${isEditing ? 'actualizar' : 'crear'} el libro` });
                }
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            setErrors({ general: 'Error de conexión. Inténtalo de nuevo.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`${isEditing ? 'w-full' : 'max-w-4xl mx-auto bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-200 overflow-hidden'}`}>
            {/* Header del Formulario - Solo mostrar si no es edición */}
            {!isEditing && (
                <div className="bg-gradient-to-r from-[#0000ab] to-[#0000ab]/80 text-white p-4 sm:p-6 lg:p-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold">
                                Registrar Nuevo Libro
                            </h2>
                            <p className="text-sm sm:text-base text-white/90">
                                Completa la información del libro para agregarlo a la biblioteca
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Contenido del Formulario */}
            <div className={`${isEditing ? 'p-6 sm:p-8' : 'p-4 sm:p-6 lg:p-8'}`}>
                {errors.general && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                        <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium">{errors.general}</span>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Título 
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0000ab]/50 focus:border-[#0000ab] text-gray-800 placeholder-gray-500 transition-all duration-200 ${
                                errors.title ? 'border-red-400' : 'border-gray-300'
                            }`}
                            placeholder="Ingresa el título del libro"
                        />
                        {errors.title && (
                            <p className="text-red-600 text-sm mt-2 flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {errors.title}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Autor 
                        </label>
                        <input
                            type="text"
                            name="author"
                            value={formData.author}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0000ab]/50 focus:border-[#0000ab] text-gray-800 placeholder-gray-500 transition-all duration-200 ${
                                errors.author ? 'border-red-400' : 'border-gray-300'
                            }`}
                            placeholder="Ingresa el nombre del autor"
                        />
                        {errors.author && (
                            <p className="text-red-600 text-sm mt-2 flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {errors.author}
                            </p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Género  
                        </label>
                        <select
                            name="genre"
                            value={formData.genre}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0000ab]/50 focus:border-[#0000ab] text-gray-800 transition-all duration-200 ${
                                errors.genre ? 'border-red-400' : 'border-gray-300'
                            }`}
                        >
                            <option value="" className="bg-white text-gray-800">Selecciona un género</option>
                            {genres.map(genre => (
                                <option key={genre} value={genre} className="bg-white text-gray-800">{genre}</option>
                            ))}
                        </select>
                        {errors.genre && (
                            <p className="text-red-600 text-sm mt-2 flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {errors.genre}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Año de Publicación
                        </label>
                        <input
                            type="number"
                            name="publication_year"
                            value={formData.publication_year}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0000ab]/50 focus:border-[#0000ab] text-gray-800 placeholder-gray-500 transition-all duration-200 ${
                                errors.publication_year ? 'border-red-400' : 'border-gray-300'
                            }`}
                            placeholder="Ej: 2020"
                            min="1000"
                            max={new Date().getFullYear() + 1}
                        />
                        {errors.publication_year && (
                            <p className="text-red-600 text-sm mt-2 flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {errors.publication_year}
                            </p>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descripción
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0000ab]/50 focus:border-[#0000ab] text-gray-800 placeholder-gray-500 transition-all duration-200 resize-none"
                        placeholder="Breve descripción del libro..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Imagen de Portada
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-[#0000ab] transition-colors duration-200">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0000ab]/50 focus:border-[#0000ab] text-gray-800 transition-all duration-200 ${
                                errors.image ? 'border-red-400' : 'border-gray-300'
                            }`}
                        />
                        <p className="text-sm text-gray-600 mt-2">
                                                                    Formatos permitidos: JPG, PNG, GIF. Máximo 5MB.
                        </p>
                        {errors.image && (
                            <p className="text-red-600 text-sm mt-2 flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {errors.image}
                            </p>
                        )}
                        
                        {imagePreview && (
                            <div className="mt-4">
                                <p className="text-sm text-gray-600 mb-2">Vista previa:</p>
                                <img 
                                    src={imagePreview} 
                                    alt="Preview" 
                                    className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200 shadow-md"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="w-full sm:w-auto px-6 py-3 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 hover:border-gray-400 transition-all duration-200 font-medium"
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-8 py-3 bg-[#0000ab] text-white rounded-lg hover:bg-[#0000ab]/90 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Guardando...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isEditing ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" : "M5 13l4 4L19 7"} />
                                </svg>
                                <span>{isEditing ? 'Actualizar Libro' : 'Registrar Libro'}</span>
                            </>
                        )}
                    </button>
                </div>
                </form>
            </div>
        </div>
    );
}

export default BookForm; 