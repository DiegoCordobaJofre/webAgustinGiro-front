# Web Agustín Giro - Frontend

Portfolio minimalista para arquitecto desarrollado con Angular 17.

## Características

- **Diseño minimalista** inspirado en sitios de referencia
- **Arquitectura modular** siguiendo principios SOLID
- **Dashboard de administración** con ruta protegida (`/admin`)
- **CRUD completo** para proyectos (crear, editar, eliminar)
- **Gestión de imágenes** para cada proyecto
- **Responsive design** para todos los dispositivos

## Estructura del Proyecto

```
src/
├── app/
│   ├── core/                    # Servicios singleton, guards, interceptors
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── services/
│   ├── shared/                   # Componentes reutilizables
│   │   └── components/
│   ├── features/                 # Módulos de features
│   │   ├── portfolio/           # Portfolio público
│   │   └── admin/               # Dashboard administrativo
│   ├── models/                   # Interfaces y modelos TypeScript
│   └── app.component.ts
├── environments/                 # Configuración de entornos
└── styles.scss                   # Estilos globales
```

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm start
```

La aplicación estará disponible en `http://localhost:4200`

## Build

```bash
npm run build
```

## Rutas

### Públicas
- `/` - Página de inicio (con banner hero e imagen destacada)
- `/proyectos` - Lista de proyectos
- `/proyectos/:id` - Detalle de proyecto
- `/sobre` - Información sobre el arquitecto
- `/contacto` - Formulario de contacto

### Administrativas (requieren autenticación)
- `/admin/login` - Inicio de sesión
- `/admin/dashboard` - Panel de administración
- `/admin/projects/new` - Crear nuevo proyecto
- `/admin/projects/:id/edit` - Editar proyecto

## Configuración del Backend

El proyecto está preparado para conectarse a un backend Spring Boot. Configura la URL del API en:

- `src/environments/environment.ts` (desarrollo)
- `src/environments/environment.prod.ts` (producción)

Por defecto apunta a: `http://localhost:8080/api`

## Arquitectura

### Principios SOLID aplicados

1. **Single Responsibility**: Cada componente y servicio tiene una responsabilidad única
2. **Open/Closed**: Extensible mediante interfaces y servicios inyectables
3. **Liskov Substitution**: Uso de interfaces para contratos claros
4. **Interface Segregation**: Interfaces específicas por dominio (Project, Auth)
5. **Dependency Inversion**: Dependencias inyectadas mediante DI de Angular

### Separación de responsabilidades

- **Core**: Servicios singleton, guards, interceptors
- **Shared**: Componentes reutilizables sin lógica de negocio
- **Features**: Módulos independientes por funcionalidad
- **Models**: Contratos de datos compartidos

## Tecnologías

- Angular 17
- TypeScript 5.2
- RxJS
- SCSS
- Standalone Components

## Imágenes

Para agregar imágenes al proyecto:

1. **Logo**: Coloca `logo.png` en `src/assets/` para que aparezca en el header
2. **Imagen Hero**: Coloca `hero-image.jpg` en `src/assets/` para la imagen principal de la página de inicio
3. **Proyectos**: Las imágenes de proyectos se gestionan desde el panel de administración

Ver `src/assets/README.md` para más detalles.

## Próximos pasos

Cuando el backend esté listo, conectar los servicios con las APIs reales. Los servicios ya están preparados para recibir las respuestas del backend Spring Boot.
