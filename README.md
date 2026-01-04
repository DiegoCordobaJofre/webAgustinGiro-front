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

## Despliegue

### Frontend en Vercel (Recomendado) ⚡

Vercel es la opción más simple y rápida para desplegar Angular. El proyecto ya está configurado para Vercel.

#### Opción 1: Despliegue desde GitHub (Recomendado)

1. **Conecta tu repositorio a Vercel:**
   - Ve a https://vercel.com
   - Crea una cuenta o inicia sesión con GitHub
   - Click en `Add New` > `Project`
   - Importa tu repositorio de GitHub
   - Vercel detectará automáticamente que es un proyecto Angular

2. **Configuración del proyecto:**
   - **Framework Preset:** Angular (debería detectarse automáticamente)
   - **Build Command:** `npm run build:vercel` (ya configurado)
   - **Output Directory:** `dist/web-agustin-giro-front/browser` (ya configurado)
   - **Install Command:** `npm install`

3. **Variables de entorno (si las necesitas):**
   - Agrega variables de entorno en la sección `Environment Variables` si tu app las requiere

4. **Desplegar:**
   - Click en `Deploy`
   - Vercel construirá y desplegará automáticamente
   - Obtendrás una URL como: `https://web-agustin-giro-front.vercel.app`

#### Opción 2: Despliegue desde CLI

```bash
# 1. Instala Vercel CLI globalmente
npm i -g vercel

# 2. En la raíz del proyecto, ejecuta:
vercel

# 3. Sigue las instrucciones:
# - ¿Set up and deploy? Yes
# - ¿Which scope? (selecciona tu cuenta)
# - ¿Link to existing project? No
# - ¿Project name? web-agustin-giro-front
# - ¿Directory? ./
# - Vercel detectará la configuración automáticamente
```

#### Despliegue automático

Cada vez que hagas push a la rama `main` o `master`, Vercel desplegará automáticamente una nueva versión.

#### Dominio personalizado (agustingiro.com)

Si ya tienes el dominio `agustingiro.com`:

1. Ve a tu proyecto en Vercel Dashboard
2. Click en `Settings` > `Domains`
3. Agrega `agustingiro.com` y `www.agustingiro.com`
4. Sigue las instrucciones de DNS que Vercel te proporciona
5. Espera la verificación (puede tardar unos minutos)
6. SSL se configurará automáticamente

**📖 Ver guía detallada:** `DOMAIN_SETUP.md` para instrucciones paso a paso con tu dominio específico.

### Frontend en GitHub Pages

El proyecto está configurado para desplegarse automáticamente en GitHub Pages usando GitHub Actions.

#### Configuración inicial (solo una vez)

1. **Habilita GitHub Pages en tu repositorio:**
   - Ve a `Settings` > `Pages` en tu repositorio de GitHub
   - En `Source`, selecciona `GitHub Actions`
   - Guarda los cambios

2. **Asegúrate de que el nombre del repositorio coincida:**
   - El `baseHref` en `angular.json` está configurado como `/webAgustinGiro-front/`
   - Si tu repositorio tiene otro nombre, actualiza el `baseHref` en `angular.json` (configuración `production`)

#### Despliegue automático

Cada vez que hagas push a la rama `main` o `master`, GitHub Actions:
1. Compilará el proyecto en modo producción
2. Desplegará automáticamente a GitHub Pages

La URL de tu sitio será: `https://[tu-usuario].github.io/webAgustinGiro-front/`

#### Despliegue manual

Si prefieres desplegar manualmente:

```bash
# 1. Compilar el proyecto
npm run build:prod

# 2. Subir la carpeta dist/web-agustin-giro-front/browser a la rama gh-pages
# O usar la herramienta angular-cli-ghpages:
npx angular-cli-ghpages --dir=dist/web-agustin-giro-front/browser
```

### Backend - Opciones de Despliegue

**⚠️ IMPORTANTE:** GitHub Pages solo sirve archivos estáticos (HTML, CSS, JS). **NO puede ejecutar backends** (Spring Boot, Node.js, Python, etc.).

Para desplegar tu backend Spring Boot, necesitas usar un servicio de hosting que soporte aplicaciones Java. Opciones recomendadas:

#### 1. **Render** (Recomendado - Gratis)
- URL: https://render.com
- Soporta Spring Boot gratis
- Despliegue automático desde GitHub
- Configuración simple

#### 2. **Railway**
- URL: https://railway.app
- Plan gratuito disponible
- Despliegue automático
- Muy fácil de usar

#### 3. **Heroku**
- URL: https://www.heroku.com
- Plan gratuito limitado
- Requiere configuración adicional

#### 4. **AWS/Azure/GCP**
- Más complejo pero más control
- Requiere configuración de servidores

#### Configuración del Backend

Una vez que tengas tu backend desplegado, actualiza la URL en:

```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://tu-backend-url.com/api'  // Cambia esta URL
};
```

**Nota:** Ya tienes configurado `https://api.agustingiro.com/api` en `environment.prod.ts`. Si ese es tu backend, solo asegúrate de que esté desplegado y funcionando.

### Verificación

Después del despliegue:

1. **Frontend (Vercel):** Visita `https://[tu-proyecto].vercel.app`
2. **Frontend (GitHub Pages):** Visita `https://[tu-usuario].github.io/webAgustinGiro-front/`
3. **Backend:** Verifica que la API responda en la URL configurada
4. **CORS:** Asegúrate de que tu backend tenga configurado CORS para permitir requests desde tu dominio:
   - Si usas Vercel: `https://[tu-proyecto].vercel.app`
   - Si usas GitHub Pages: `https://[tu-usuario].github.io`

## Próximos pasos

Cuando el backend esté listo, conectar los servicios con las APIs reales. Los servicios ya están preparados para recibir las respuestas del backend Spring Boot.
