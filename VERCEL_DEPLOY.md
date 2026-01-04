# Guía de Despliegue en Vercel

## ¿Por qué Vercel?

Vercel es la plataforma más simple y rápida para desplegar aplicaciones Angular:
- ✅ Despliegue automático desde GitHub
- ✅ SSL/HTTPS gratuito
- ✅ CDN global incluido
- ✅ Dominios personalizados gratuitos
- ✅ Preview deployments para cada PR
- ✅ Configuración mínima requerida

## Configuración Rápida

### Paso 1: Crear cuenta en Vercel

1. Ve a https://vercel.com
2. Click en `Sign Up`
3. Conecta tu cuenta de GitHub (recomendado)

### Paso 2: Importar proyecto

1. En el Dashboard de Vercel, click en `Add New` > `Project`
2. Selecciona tu repositorio de GitHub
3. Vercel detectará automáticamente que es un proyecto Angular

### Paso 3: Configurar el proyecto

Vercel ya tiene la configuración correcta gracias a `vercel.json`, pero puedes verificar:

- **Framework Preset:** Angular
- **Build Command:** `npm run build:vercel`
- **Output Directory:** `dist/web-agustin-giro-front/browser`
- **Install Command:** `npm install`
- **Root Directory:** `./` (raíz del proyecto)

### Paso 4: Variables de entorno (opcional)

Si tu aplicación necesita variables de entorno:

1. En la configuración del proyecto, ve a `Environment Variables`
2. Agrega las variables necesarias
3. Ejemplo:
   - `NODE_ENV` = `production`
   - `API_URL` = `https://api.agustingiro.com/api` (si necesitas pasarla como variable)

### Paso 5: Desplegar

1. Click en `Deploy`
2. Espera a que Vercel construya y despliegue (2-3 minutos)
3. ¡Listo! Tu aplicación estará disponible en `https://[tu-proyecto].vercel.app`

## Despliegue Automático

Una vez configurado, Vercel desplegará automáticamente:

- **Cada push a `main` o `master`:** Despliegue de producción
- **Cada Pull Request:** Preview deployment (URL única para revisar cambios)
- **Cada commit en otras ramas:** Preview deployment opcional

## Dominio Personalizado

### Agregar dominio en Vercel

1. Ve a tu proyecto en Vercel Dashboard
2. Click en `Settings` > `Domains`
3. Ingresa tu dominio (ej: `www.agustingiro.com`)
4. Click en `Add`

### Configurar DNS

Vercel te dará instrucciones específicas, pero generalmente:

**Opción 1: CNAME (Recomendado para subdominios)**
```
Tipo: CNAME
Nombre: www
Valor: cname.vercel-dns.com
```

**Opción 2: A Record (Para dominio raíz)**
```
Tipo: A
Nombre: @
Valor: 76.76.21.21 (IP de Vercel - verifica en el dashboard)
```

**Opción 3: ALIAS/ANAME (Si tu proveedor lo soporta)**
```
Tipo: ALIAS
Nombre: @
Valor: cname.vercel-dns.com
```

### Verificar dominio

1. Vercel verificará automáticamente tu dominio
2. Puede tardar unos minutos en propagarse
3. Una vez verificado, SSL se configurará automáticamente

## Configuración del Backend

### Actualizar CORS en el Backend

Tu backend Spring Boot debe permitir requests desde Vercel y tu dominio personalizado. Actualiza la configuración de CORS:

```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins(
                        "https://agustingiro.com",
                        "https://www.agustingiro.com",
                        "https://[tu-proyecto].vercel.app", // URL temporal de Vercel
                        "http://localhost:4200" // Para desarrollo local
                    )
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .allowedHeaders("*")
                    .allowCredentials(true);
            }
        };
    }
}
```

**Nota:** Si ya tienes el dominio `agustingiro.com` configurado, asegúrate de incluir tanto `agustingiro.com` como `www.agustingiro.com` en los allowedOrigins.

### Verificar URL del Backend

Asegúrate de que `environment.prod.ts` tenga la URL correcta:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.agustingiro.com/api' // Tu URL del backend
};
```

## Comandos Útiles

### Desplegar desde CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar (primera vez)
vercel

# Desplegar a producción
vercel --prod

# Ver logs
vercel logs

# Listar deployments
vercel ls
```

### Build local para probar

```bash
# Compilar como lo haría Vercel
npm run build:vercel

# Servir localmente (requiere http-server o similar)
npx http-server dist/web-agustin-giro-front/browser -p 8080
```

## Troubleshooting

### El build falla

1. **Verifica los logs en Vercel Dashboard:**
   - Ve a `Deployments` > Click en el deployment fallido
   - Revisa los logs de build

2. **Problemas comunes:**
   - Dependencias faltantes: Verifica `package.json`
   - Errores de TypeScript: Revisa `tsconfig.json`
   - Memoria insuficiente: Vercel tiene límites, optimiza el build

### Las rutas no funcionan (404)

El archivo `vercel.json` ya está configurado con rewrites para manejar el routing de Angular. Si persisten problemas:

1. Verifica que `vercel.json` esté en la raíz del proyecto
2. Asegúrate de que el `outputDirectory` en `vercel.json` sea correcto
3. Verifica que el build genere los archivos en la ubicación esperada

### No se conecta al backend

1. **Verifica CORS:**
   - Asegúrate de que tu backend permita requests desde tu dominio de Vercel
   - Revisa la consola del navegador para errores de CORS

2. **Verifica la URL del backend:**
   - Revisa `environment.prod.ts`
   - Asegúrate de que la URL sea accesible públicamente

3. **Verifica variables de entorno:**
   - Si usas variables de entorno para la URL del API, asegúrate de configurarlas en Vercel

### El sitio carga pero está en blanco

1. **Revisa la consola del navegador:**
   - Abre DevTools (F12)
   - Ve a la pestaña `Console`
   - Busca errores de JavaScript

2. **Verifica el baseHref:**
   - Para Vercel, debe ser `/` (ya configurado en `angular.json`)

3. **Verifica los assets:**
   - Asegúrate de que las rutas de imágenes y assets sean correctas
   - Verifica que los assets se copien correctamente en el build

## Comparación: Vercel vs GitHub Pages

| Característica | Vercel | GitHub Pages |
|---------------|--------|--------------|
| Despliegue automático | ✅ Sí | ✅ Sí (con Actions) |
| SSL/HTTPS | ✅ Gratis | ✅ Gratis |
| CDN | ✅ Global | ⚠️ Limitado |
| Dominio personalizado | ✅ Gratis | ✅ Gratis |
| Preview deployments | ✅ Automático | ❌ Manual |
| Configuración | ⚡ Muy simple | ⚙️ Requiere setup |
| Routing SPA | ✅ Automático | ⚙️ Requiere config |
| Velocidad de build | ⚡ Rápido | 🐌 Más lento |

## Próximos Pasos

1. ✅ Desplegar en Vercel
2. ✅ Configurar dominio personalizado (opcional)
3. ✅ Verificar que el backend esté desplegado
4. ✅ Actualizar CORS en el backend
5. ✅ Probar todas las funcionalidades
6. ✅ Configurar analytics (opcional)

## Recursos

- [Documentación de Vercel](https://vercel.com/docs)
- [Guía de Angular en Vercel](https://vercel.com/guides/deploying-angular-with-vercel)
- [Soporte de Vercel](https://vercel.com/support)

