# 📚 Biblioteca Digital

Un sistema completo de gestión de biblioteca desarrollado con **Laravel 11** y **React**, que permite a los usuarios explorar, rentar y gestionar libros, mientras que los administradores pueden administrar la colección completa.

## 🚀 Características Principales

### 👥 Sistema de Usuarios
- **Registro y Login**: Sistema de autenticación completo
- **Roles**: Usuarios normales y Administradores
- **Perfil de Usuario**: Gestión de información personal

### 📖 Gestión de Libros
- **Catálogo Completo**: Exploración de todos los libros disponibles
- **Información Detallada**: Título, autor, género, descripción, año de publicación
- **Imágenes**: Soporte para portadas de libros (hasta 5MB)
- **Estados**: Disponible, Prestado, En mantenimiento

### 🔄 Sistema de Préstamos
- **Renta de Libros**: Proceso simple de un clic
- **Renovaciones**: Posibilidad de renovar préstamos (máximo 1 renovación)
- **Devoluciones**: Sistema de devolución automática
- **Límites**: Máximo 3 libros por usuario
- **Vencimientos**: Control automático de fechas de vencimiento

### 👑 Panel de Administración
- **Gestión de Libros**: Crear, editar, eliminar libros
- **Estadísticas**: Análisis completo del sistema
  - Libros más rentados
  - Estadísticas generales
  - Préstamos por mes
- **Gestión de Usuarios**: Crear administradores

### 📊 Estadísticas Avanzadas
- **Libros Más Rentados**: Top 10 de libros populares
- **Métricas Generales**: Total de libros, disponibles, préstamos
- **Análisis Temporal**: Préstamos por mes (últimos 6 meses)
- **Libro Más Popular**: Información del libro más rentado

## 🛠️ Tecnologías Utilizadas

### Backend
- **Laravel 11**: Framework PHP moderno
- **MySQL**: Base de datos principal
- **Eloquent ORM**: Gestión de modelos y relaciones
- **API RESTful**: Endpoints para comunicación frontend-backend

### Frontend
- **React 18**: Biblioteca de interfaz de usuario
- **Tailwind CSS**: Framework de estilos
- **Vite**: Herramienta de construcción
- **Hooks**: Gestión de estado y efectos

### Características Técnicas
- **Responsive Design**: Compatible con móviles y desktop
- **Modales Animados**: Interfaz moderna con transiciones
- **Validación**: Frontend y backend
- **Manejo de Errores**: Sistema robusto de errores

## 📋 Requisitos del Sistema

### Servidor
- **PHP**: 8.2 o superior
- **Composer**: Gestor de dependencias PHP
- **MySQL**: 8.0 o superior
- **Node.js**: 18 o superior
- **npm**: Gestor de paquetes Node.js

### Extensiones PHP
- BCMath PHP Extension
- Ctype PHP Extension
- cURL PHP Extension
- DOM PHP Extension
- Fileinfo PHP Extension
- JSON PHP Extension
- Mbstring PHP Extension
- OpenSSL PHP Extension
- PCRE PHP Extension
- PDO PHP Extension
- Tokenizer PHP Extension
- XML PHP Extension

## 🚀 Instalación

### 1. Clonar el Repositorio
```bash
git clone <url-del-repositorio>
cd Prueba_biblio
```

### 2. Instalar Dependencias PHP
```bash
composer install
```

### 3. Configurar Variables de Entorno
```bash
cp .env.example .env
php artisan key:generate
```

Editar el archivo `.env` con la configuración de tu base de datos:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nombre_de_tu_base_de_datos
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_contraseña
```

### 4. Configurar Base de Datos
```bash
php artisan migrate
php artisan db:seed
```

### 5. Crear Enlace Simbólico para Storage
```bash
php artisan storage:link
```

### 6. Instalar Dependencias JavaScript
```bash
npm install
```

### 7. Compilar Assets
```bash
npm run build
```

### 8. Iniciar el Servidor
```bash
php artisan serve
```

El proyecto estará disponible en `http://localhost:8000`

## 👤 Usuarios por Defecto

### Administrador
- **Email**: admin@biblioteca.com
- **Contraseña**: password
- **Rol**: Administrador

### Usuario Normal
- **Email**: user@biblioteca.com
- **Contraseña**: password
- **Rol**: Usuario

## 📁 Estructura del Proyecto

```
Prueba_biblio/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── AuthController.php      # Autenticación
│   │   │   ├── BookController.php      # Gestión de libros
│   │   │   └── LoanController.php      # Gestión de préstamos
│   │   └── Middleware/
│   │       └── AdminMiddleware.php     # Middleware de admin
│   ├── Models/
│   │   ├── Book.php                    # Modelo de libros
│   │   ├── Loan.php                    # Modelo de préstamos
│   │   └── User.php                    # Modelo de usuarios
│   └── Observers/
│       └── LoanObserver.php            # Observador de préstamos
├── resources/
│   ├── js/
│   │   ├── components/
│   │   │   ├── App.jsx                 # Componente principal
│   │   │   ├── BookForm.jsx            # Formulario de libros
│   │   │   ├── BookInfoModal.jsx       # Modal de información
│   │   │   ├── LoginForm.jsx           # Formulario de login
│   │   │   ├── RegisterForm.jsx        # Formulario de registro
│   │   │   ├── StatisticsModal.jsx     # Modal de estadísticas
│   │   │   └── UserLoans.jsx           # Gestión de préstamos
│   │   └── app.jsx                     # Punto de entrada React
│   └── views/
│       └── app.blade.php               # Vista principal
├── routes/
│   └── api.php                         # Rutas de la API
└── database/
    ├── migrations/                     # Migraciones de BD
    └── seeders/                        # Datos de prueba
```

## 🔧 Configuración Adicional

### Configuración de Archivos
El sistema está configurado para aceptar imágenes de hasta **5MB**:
- Validación backend: `max:5120` (5MB)
- Validación frontend: `5 * 1024 * 1024` bytes
- Configuración PHP: `upload_max_filesize 10M`

### Configuración de Base de Datos
Las migraciones crean las siguientes tablas:
- `users`: Usuarios del sistema
- `books`: Catálogo de libros
- `loans`: Registro de préstamos

## 📊 API Endpoints

### Autenticación
- `POST /api/register` - Registro de usuarios
- `POST /api/login` - Inicio de sesión
- `POST /api/logout` - Cerrar sesión
- `GET /api/user` - Información del usuario

### Libros
- `GET /api/books` - Listar todos los libros
- `POST /api/books` - Crear nuevo libro
- `GET /api/books/{id}` - Obtener libro específico
- `PUT /api/books/{id}` - Actualizar libro
- `DELETE /api/books/{id}` - Eliminar libro

### Préstamos
- `POST /api/loans/rent` - Rentar libro
- `GET /api/loans/user` - Préstamos del usuario
- `POST /api/loans/{id}/renew` - Renovar préstamo
- `POST /api/loans/{id}/return` - Devolver libro

### Estadísticas
- `GET /api/statistics` - Estadísticas del sistema

## 🎨 Características de la Interfaz

### Diseño Responsivo
- **Mobile First**: Optimizado para dispositivos móviles
- **Breakpoints**: Adaptable a tablets y desktop
- **Grid System**: Layout flexible con Tailwind CSS

### Componentes Interactivos
- **Modales**: Overlays con animaciones suaves
- **Formularios**: Validación en tiempo real
- **Tablas**: Datos organizados y filtrables
- **Gráficos**: Visualización de estadísticas

### Paleta de Colores
- **Primario**: Azul (#0000ab)
- **Secundario**: Variaciones de gris
- **Acentos**: Verde, rojo, amarillo para estados

## 🔒 Seguridad

### Autenticación
- **Tokens**: Sistema de autenticación basado en tokens
- **Middleware**: Protección de rutas sensibles
- **Validación**: Sanitización de datos de entrada

### Validación
- **Frontend**: Validación en tiempo real con JavaScript
- **Backend**: Validación robusta con Laravel
- **Archivos**: Validación de tipos y tamaños


## 🚀 Despliegue en Render

### Requisitos Previos
- Cuenta en [Render](https://dashboard.render.com/)
- Repositorio en GitHub
- Base de datos PostgreSQL

### Pasos de Despliegue
1. **Preparar Repositorio**:
   ```bash
   git add .
   git commit -m "Configuración para Render"
   git push origin main
   ```

2. **Crear Servicio Web en Render**:
   - Ve a [Render Dashboard](https://dashboard.render.com/)
   - Crea un nuevo "Web Service"
   - Conecta tu repositorio de GitHub
   - Configura como servicio PHP

3. **Configurar Variables de Entorno**:
   ```env
   APP_ENV=production
   APP_DEBUG=false
   APP_URL=https://tu-app.onrender.com
   DB_CONNECTION=pgsql
   ```

4. **Crear Base de Datos PostgreSQL**:
   - Crea un nuevo servicio PostgreSQL en Render
   - Conecta la base de datos al servicio web

5. **Desplegar**:
   - Render ejecutará automáticamente el script de construcción
   - La aplicación estará disponible en la URL proporcionada

### Archivos de Configuración
- `render.yaml`: Configuración automática del despliegue
- `render-build.sh`: Script de construcción personalizado
- `Procfile`: Configuración del servidor web

## 👨‍💻 Autor

Desarrollado como prueba tecnica para JR por Juan Sebastian Rodriguez Gamez :D.

---

**¡Disfruta explorando la Biblioteca Digital! 📚✨**
