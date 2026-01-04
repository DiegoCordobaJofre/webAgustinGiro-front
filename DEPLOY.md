# Guía de Despliegue - Detallada

## Frontend en GitHub Pages

### Paso 1: Configurar GitHub Pages

1. Ve a tu repositorio en GitHub
2. Click en `Settings` > `Pages`
3. En la sección `Source`, selecciona `GitHub Actions`
4. Guarda los cambios

### Paso 2: Verificar el nombre del repositorio

El `baseHref` está configurado para `/webAgustinGiro-front/`. 

**Si tu repositorio tiene otro nombre:**
1. Abre `angular.json`
2. Busca la sección `configurations` > `production`
3. Cambia el `baseHref` a `/[nombre-de-tu-repo]/`

**Ejemplo:**
Si tu repositorio se llama `mi-portfolio`, el `baseHref` debe ser `/mi-portfolio/`

### Paso 3: Hacer push a main/master

```bash
git add .
git commit -m "Configuración para GitHub Pages"
git push origin main
```

El workflow de GitHub Actions se ejecutará automáticamente y desplegará tu aplicación.

### Paso 4: Verificar el despliegue

1. Ve a la pestaña `Actions` en tu repositorio
2. Verifica que el workflow se haya ejecutado correctamente
3. Visita: `https://[tu-usuario].github.io/webAgustinGiro-front/`

### Usar un dominio personalizado

Si quieres usar tu propio dominio (ej: `www.agustingiro.com`):

1. **En GitHub:**
   - Ve a `Settings` > `Pages`
   - En `Custom domain`, ingresa tu dominio
   - GitHub te dará una IP para configurar en tu DNS

2. **En angular.json:**
   - Cambia el `baseHref` de `/webAgustinGiro-front/` a `/`

3. **En tu proveedor de DNS:**
   - Configura un registro A o CNAME según las instrucciones de GitHub

## Backend - Guía de Despliegue

### Opción 1: Render (Recomendado)

1. **Crear cuenta en Render:**
   - Ve a https://render.com
   - Conecta tu cuenta de GitHub

2. **Crear nuevo Web Service:**
   - Click en `New` > `Web Service`
   - Selecciona tu repositorio del backend
   - Configuración:
     - **Name:** `agustin-giro-api` (o el nombre que prefieras)
     - **Environment:** `Java`
     - **Build Command:** `./mvnw clean package` (o el comando de build de tu proyecto)
     - **Start Command:** `java -jar target/[nombre-del-jar].jar`
     - **Plan:** `Free`

3. **Variables de entorno:**
   - Agrega las variables de entorno necesarias (base de datos, etc.)

4. **Desplegar:**
   - Click en `Create Web Service`
   - Render construirá y desplegará automáticamente

5. **Obtener la URL:**
   - Render te dará una URL como: `https://agustin-giro-api.onrender.com`
   - Actualiza `environment.prod.ts` con esta URL

### Opción 2: Railway

1. **Crear cuenta:**
   - Ve a https://railway.app
   - Conecta tu GitHub

2. **Nuevo proyecto:**
   - Click en `New Project`
   - Selecciona `Deploy from GitHub repo`
   - Elige tu repositorio del backend

3. **Configuración:**
   - Railway detectará automáticamente que es un proyecto Java
   - Ajusta el comando de inicio si es necesario

4. **Variables de entorno:**
   - Agrega las variables necesarias en la pestaña `Variables`

5. **Desplegar:**
   - Railway desplegará automáticamente
   - Obtendrás una URL como: `https://[proyecto].railway.app`

### Configurar CORS en el Backend

Tu backend Spring Boot debe permitir requests desde GitHub Pages. Asegúrate de tener configurado CORS:

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
                        "https://[tu-usuario].github.io",
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

## Verificación Final

### Checklist de despliegue:

- [ ] Frontend desplegado en GitHub Pages
- [ ] Backend desplegado en Render/Railway/otro servicio
- [ ] URL del backend actualizada en `environment.prod.ts`
- [ ] CORS configurado en el backend
- [ ] Frontend puede hacer requests al backend
- [ ] Login funciona correctamente
- [ ] CRUD de proyectos funciona

### URLs importantes:

- **Frontend:** `https://[usuario].github.io/webAgustinGiro-front/`
- **Backend API:** `https://[tu-backend-url]/api`
- **Admin Panel:** `https://[usuario].github.io/webAgustinGiro-front/admin/login`

## Troubleshooting

### El frontend no carga correctamente

- Verifica que el `baseHref` en `angular.json` coincida con el nombre de tu repositorio
- Asegúrate de que el workflow de GitHub Actions se haya ejecutado correctamente
- Revisa la consola del navegador para ver errores

### El frontend no puede conectarse al backend

- Verifica que la URL del backend en `environment.prod.ts` sea correcta
- Asegúrate de que CORS esté configurado en el backend
- Verifica que el backend esté funcionando (haz una petición directa a la API)

### Errores 404 en las rutas

- Angular usa routing del lado del cliente, GitHub Pages necesita una configuración especial
- El archivo `.nojekyll` ya está creado, esto debería solucionarlo
- Si persiste, considera usar HashLocationStrategy en lugar de PathLocationStrategy

