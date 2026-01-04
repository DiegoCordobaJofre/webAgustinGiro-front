# Configuración del Dominio agustingiro.com en Vercel

## Pasos para Configurar tu Dominio

### 1. Desplegar el Proyecto en Vercel

Primero, asegúrate de que tu proyecto esté desplegado en Vercel:

1. Ve a https://vercel.com
2. Importa tu repositorio
3. Despliega el proyecto
4. Verifica que funcione en la URL de Vercel (ej: `https://web-agustin-giro-front.vercel.app`)

### 2. Agregar el Dominio en Vercel

1. **Ve a tu proyecto en Vercel Dashboard**
2. **Click en `Settings` > `Domains`**
3. **Agrega tu dominio:**
   - Ingresa `agustingiro.com` (dominio raíz)
   - También agrega `www.agustingiro.com` (subdominio www)
4. **Vercel te mostrará las instrucciones de DNS**

### 3. Configurar DNS

Vercel te dará valores específicos, pero generalmente necesitas:

#### Opción A: Dominio Raíz (agustingiro.com)

**Si tu proveedor de DNS soporta ALIAS/ANAME (recomendado):**
```
Tipo: ALIAS o ANAME
Nombre: @
Valor: cname.vercel-dns.com
TTL: 3600 (o automático)
```

**Si NO soporta ALIAS, usa A Records:**
```
Tipo: A
Nombre: @
Valor: 76.76.21.21
TTL: 3600

Tipo: A
Nombre: @
Valor: 76.223.126.88
TTL: 3600
```

**Nota:** Los valores de IP pueden cambiar. Vercel te dará los valores exactos en el dashboard.

#### Opción B: Subdominio www (www.agustingiro.com)

```
Tipo: CNAME
Nombre: www
Valor: cname.vercel-dns.com
TTL: 3600
```

### 4. Verificar el Dominio

1. **Vercel verificará automáticamente** tu dominio (puede tardar unos minutos)
2. **Espera la propagación DNS** (puede tardar hasta 48 horas, pero generalmente es más rápido)
3. **SSL se configurará automáticamente** una vez verificado

### 5. Redirección (Opcional pero Recomendado)

Si agregaste tanto `agustingiro.com` como `www.agustingiro.com`, Vercel puede configurar automáticamente:
- Redirección de `agustingiro.com` → `www.agustingiro.com` (o viceversa)

Puedes elegir cuál prefieres como dominio principal en la configuración de Vercel.

## Configuración del Backend

### Actualizar CORS

Tu backend debe permitir requests desde `agustingiro.com`. Actualiza la configuración de CORS en tu backend Spring Boot:

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
                        "https://web-agustin-giro-front.vercel.app", // URL temporal de Vercel
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

### Verificar URL del Backend

Tu `environment.prod.ts` ya está configurado correctamente:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.agustingiro.com/api'
};
```

## Verificación Final

### Checklist:

- [ ] Proyecto desplegado en Vercel
- [ ] Dominio `agustingiro.com` agregado en Vercel
- [ ] Dominio `www.agustingiro.com` agregado en Vercel (opcional)
- [ ] DNS configurado correctamente
- [ ] Dominio verificado en Vercel
- [ ] SSL/HTTPS funcionando (automático en Vercel)
- [ ] CORS actualizado en el backend para incluir `agustingiro.com`
- [ ] Sitio accesible en `https://agustingiro.com`
- [ ] Backend accesible en `https://api.agustingiro.com/api`

### URLs Finales:

- **Frontend:** `https://agustingiro.com` (o `https://www.agustingiro.com`)
- **Backend API:** `https://api.agustingiro.com/api`
- **Admin Panel:** `https://agustingiro.com/admin/login`

## Troubleshooting

### El dominio no se verifica

1. **Espera más tiempo:** La propagación DNS puede tardar hasta 48 horas
2. **Verifica los registros DNS:** Usa herramientas como:
   - https://dnschecker.org
   - `dig agustingiro.com` en terminal
   - `nslookup agustingiro.com` en terminal
3. **Verifica que los valores sean correctos:** Compara con los que Vercel te dio

### SSL no se configura

- Vercel configura SSL automáticamente una vez que el dominio se verifica
- Si tarda, espera unos minutos después de la verificación del dominio

### El sitio carga pero hay errores de CORS

- Verifica que hayas actualizado CORS en el backend para incluir `https://agustingiro.com`
- Revisa la consola del navegador para ver el error exacto
- Asegúrate de que el backend esté accesible públicamente

### Redirección entre www y no-www

- Vercel puede configurar esto automáticamente
- O puedes configurarlo manualmente en `Settings` > `Domains` > `Redirects`

## Proveedores de DNS Comunes

### Cloudflare
1. Ve a tu dominio en Cloudflare
2. Click en `DNS` > `Records`
3. Agrega los registros según las instrucciones de Vercel
4. Cloudflare soporta ALIAS/ANAME, usa ese tipo si está disponible

### GoDaddy
1. Ve a `My Products` > `DNS`
2. Agrega los registros A o CNAME según las instrucciones
3. GoDaddy generalmente requiere A Records para el dominio raíz

### Namecheap
1. Ve a `Domain List` > Click en `Manage`
2. Ve a `Advanced DNS`
3. Agrega los registros según las instrucciones

### Google Domains
1. Ve a `DNS` en tu dominio
2. Agrega los registros según las instrucciones

## Comandos Útiles para Verificar

```bash
# Verificar DNS
dig agustingiro.com
nslookup agustingiro.com

# Verificar SSL
curl -I https://agustingiro.com

# Verificar que el sitio responde
curl https://agustingiro.com
```

## Soporte

Si tienes problemas:
1. Revisa los logs en Vercel Dashboard
2. Verifica la configuración DNS con herramientas online
3. Contacta el soporte de Vercel si el problema persiste

