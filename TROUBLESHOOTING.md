# Solución de Problemas

## Error: EPERM (Permisos)

Si ves errores de permisos con npm, prueba estas soluciones:

### Solución 1: Limpiar caché de npm
```bash
npm cache clean --force
```

### Solución 2: Usar npx directamente
```bash
npx ng serve
```

### Solución 3: Verificar permisos de node_modules
```bash
sudo chown -R $(whoami) node_modules
```

### Solución 4: Reinstalar dependencias
```bash
rm -rf node_modules package-lock.json
npm install
```

## Error: Puerto 4200 en uso

Si el puerto 4200 está ocupado, Angular usará automáticamente el siguiente disponible (4201, 4202, etc.).

Para usar un puerto específico:
```bash
ng serve --port 4201
```

## Error: Cannot find module

Si ves errores de módulos no encontrados:
```bash
rm -rf node_modules
npm install
```

## Verificar que todo esté bien

1. Verifica Node.js:
   ```bash
   node --version  # Debe ser 18 o superior
   ```

2. Verifica npm:
   ```bash
   npm --version
   ```

3. Verifica Angular CLI:
   ```bash
   npx ng version
   ```

## Iniciar el servidor

Una vez resueltos los problemas:
```bash
npm start
```

O directamente:
```bash
npx ng serve
```

El servidor estará disponible en: **http://localhost:4200**








