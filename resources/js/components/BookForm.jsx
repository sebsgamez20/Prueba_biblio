import React, { useState } from 'react';

function BookForm({ onBookCreated, onCancel }) {
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        genre: '',
        description: '',
        publication_year: '',
        availability: 'available'
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

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

        if (imageFile && imageFile.size > 2 * 1024 * 1024) { // 2MB
            newErrors.image = 'La imagen no debe superar 2MB';
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

            const response = await fetch('/api/books', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: formDataToSend
            });

            const data = await response.json();

            if (response.ok) {
                // Limpiar formulario
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
                setErrors({});
                
                // Notificar al componente padre
                if (onBookCreated) {
                    onBookCreated(data.book);
                }
            } else {
                if (data.errors) {
                    setErrors(data.errors);
                } else {
                    setErrors({ general: data.message || 'Error al crear el libro' });
                }
            }
        } catch (error) {
            setErrors({ general: 'Error de conexión. Inténtalo de nuevo.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Registrar Nuevo Libro</h2>
            
            {errors.general && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {errors.general}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Título *
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.title ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Ingresa el título del libro"
                        />
                        {errors.title && (
                            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Autor *
                        </label>
                        <input
                            type="text"
                            name="author"
                            value={formData.author}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.author ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Ingresa el nombre del autor"
                        />
                        {errors.author && (
                            <p className="text-red-500 text-sm mt-1">{errors.author}</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Género *
                        </label>
                        <select
                            name="genre"
                            value={formData.genre}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.genre ? 'border-red-500' : 'border-gray-300'
                            }`}
                        >
                            <option value="">Selecciona un género</option>
                            {genres.map(genre => (
                                <option key={genre} value={genre}>{genre}</option>
                            ))}
                        </select>
                        {errors.genre && (
                            <p className="text-red-500 text-sm mt-1">{errors.genre}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Año de Publicación
                        </label>
                        <input
                            type="number"
                            name="publication_year"
                            value={formData.publication_year}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.publication_year ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Ej: 2020"
                            min="1000"
                            max={new Date().getFullYear() + 1}
                        />
                        {errors.publication_year && (
                            <p className="text-red-500 text-sm mt-1">{errors.publication_year}</p>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Breve descripción del libro..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Imagen de Portada
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.image ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                        Formatos permitidos: JPG, PNG, GIF. Máximo 2MB.
                    </p>
                    {errors.image && (
                        <p className="text-red-500 text-sm mt-1">{errors.image}</p>
                    )}
                    
                    {imagePreview && (
                        <div className="mt-3">
                            <img 
                                src={imagePreview} 
                                alt="Preview" 
                                className="w-32 h-32 object-cover rounded-md border"
                            />
                        </div>
                    )}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? 'Guardando...' : 'Registrar Libro'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default BookForm; 