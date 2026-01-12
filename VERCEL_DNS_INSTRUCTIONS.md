# Instrucciones Específicas de DNS para agustingiro.com

## Resumen de lo que Vercel te pide

Según tu dashboard de Vercel, necesitas configurar:

### 1. Para agustingiro.com (Dominio Raíz)

**Cambiar Nameservers a:**
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

**Dónde hacerlo:**
- Ve a tu proveedor de dominio (donde compraste `agustingiro.com`)
- Busca la sección de "Nameservers" o "DNS Management"
- Reemplaza los nameservers actuales con los de Vercel

### 2. Para www.agustingiro.com (Subdominio www)

**Configurar CNAME:**
```
Tipo: CNAME
Nombre: www
Valor: ce04bfd484bfd910.vercel-dns-017.com.
```

**Dónde hacerlo:**
- Si cambiaste los nameservers a Vercel: Configúralo en Vercel Dashboard (pestaña "Vercel DNS")
- Si mantienes tus nameservers: Configúralo en tu proveedor de dominio actual

## Pasos Detallados

### Paso 1: Cambiar Nameservers (agustingiro.com)

1. **Identifica tu proveedor de dominio:**
   - ¿Dónde compraste `agustingiro.com`? (GoDaddy, Namecheap, Cloudflare, Google Domains, etc.)

2. **Accede al panel de control de tu dominio**

3. **Busca la sección de Nameservers:**
   - Puede llamarse "Nameservers", "DNS Management", "Name Servers", etc.

4. **Reemplaza los nameservers actuales:**
   - Elimina o reemplaza los nameservers actuales
   - Agrega:
     - `ns1.vercel-dns.com`
     - `ns2.vercel-dns.com`

5. **Guarda los cambios**

6. **Espera la propagación:**
   - Puede tardar desde minutos hasta 48 horas
   - Generalmente toma 1-4 horas

### Paso 2: Configurar CNAME (www.agustingiro.com)

**Opción A: Si cambiaste nameservers a Vercel**

1. En Vercel Dashboard, ve a tu proyecto
2. Settings > Domains
3. Click en `www.agustingiro.com`
4. Ve a la pestaña "Vercel DNS"
5. Agrega el registro CNAME:
   - Name: `www`
   - Value: `ce04bfd484bfd910.vercel-dns-017.com.`

**Opción B: Si mantienes tus nameservers actuales**

1. Ve a tu proveedor de dominio
2. Busca la sección de "DNS Records" o "DNS Management"
3. Agrega un nuevo registro:
   - Tipo: CNAME
   - Nombre/Host: `www`
   - Valor/Target: `ce04bfd484bfd910.vercel-dns-017.com.`
   - TTL: 3600 (o automático)
4. Guarda los cambios

### Paso 3: Verificar en Vercel

1. En Vercel Dashboard, ve a Settings > Domains
2. Click en el botón "Refresh" junto a cada dominio
3. Espera a que Vercel verifique la configuración
4. El estado cambiará de "Invalid Configuration" a "Valid Configuration"

## Notas Importantes

### ⚠️ Sobre cambiar Nameservers

- **Ventaja:** Vercel gestiona todo tu DNS, más fácil de administrar
- **Desventaja:** Si tienes otros subdominios (como `api.agustingiro.com`), deberás configurarlos también en Vercel
- **Alternativa:** Si tienes muchos subdominios configurados, puedes mantener tus nameservers actuales y solo configurar los registros específicos que Vercel necesita

### 📝 Sobre el CNAME de www

- El valor `ce04bfd484bfd910.vercel-dns-017.com.` es específico para tu proyecto
- Vercel menciona que los valores antiguos (`cname.vercel-dns.com`) seguirán funcionando, pero recomiendan usar los nuevos
- El punto (.) al final del valor es importante en algunos proveedores

### ⏱️ Tiempos de Propagación

- **Nameservers:** 1-48 horas (generalmente 1-4 horas)
- **CNAME:** Minutos a horas (generalmente más rápido)
- **SSL:** Se configura automáticamente después de la verificación (minutos)

## Verificar que Funciona

### Verificar Nameservers

```bash
# En terminal
dig NS agustingiro.com

# Deberías ver:
# ns1.vercel-dns.com
# ns2.vercel-dns.com
```

### Verificar CNAME

```bash
# En terminal
dig www.agustingiro.com CNAME

# Deberías ver:
# ce04bfd484bfd910.vercel-dns-017.com.
```

### Verificar que el sitio responde

```bash
# Espera a que Vercel verifique el dominio, luego:
curl -I https://agustingiro.com
curl -I https://www.agustingiro.com
```

## Troubleshooting

### El dominio sigue mostrando "Invalid Configuration"

1. **Verifica que los nameservers estén correctos:**
   ```bash
   dig NS agustingiro.com
   ```

2. **Espera más tiempo:** La propagación puede tardar hasta 48 horas

3. **Verifica en múltiples ubicaciones:**
   - Usa https://dnschecker.org para ver la propagación global

4. **Click en "Refresh" en Vercel:** A veces Vercel necesita que actualices manualmente

### El CNAME no se verifica

1. **Verifica que el valor sea exacto:**
   - Debe terminar con punto (.) en algunos proveedores
   - Copia y pega directamente desde Vercel

2. **Verifica que no haya otros registros conflictivos:**
   - No puede haber un registro A y CNAME para `www` al mismo tiempo
   - Elimina cualquier registro A existente para `www`

### Necesito mantener otros subdominios

Si tienes `api.agustingiro.com` u otros subdominios configurados en tu proveedor actual:

1. **Opción 1:** Cambia nameservers y configura todos los subdominios en Vercel
2. **Opción 2:** Mantén tus nameservers y solo configura los registros específicos que Vercel necesita

## Siguiente Paso

Una vez que ambos dominios estén verificados:
1. Vercel configurará SSL automáticamente
2. Tu sitio estará disponible en `https://agustingiro.com` y `https://www.agustingiro.com`
3. Asegúrate de actualizar CORS en tu backend para incluir estos dominios



