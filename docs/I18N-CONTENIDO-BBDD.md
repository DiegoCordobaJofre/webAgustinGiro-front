# Cómo tener el carrusel (y proyectos) en varios idiomas

El **carrusel** y la **lista/detalle de proyectos** muestran lo que viene de la base de datos: `title`, `description`, `category`, `status`. Tienes dos opciones.

---

## Opción 1: Un solo idioma en la BBDD (lo que tienes ahora)

- Subes cada proyecto **una vez**, en el idioma que quieras (p. ej. español).
- **No cambias** el backend.
- Lo que **sí cambia** con el selector de idioma es toda la **interfaz** (menú, botones, “Cargando…”, “Volver a proyectos”, estados traducidos como “En ejecución” / “In progress”, etc.).
- Los textos del **contenido** (título y descripción del proyecto) **se quedan** en ese único idioma para todos los usuarios.

**Ventaja:** Cero cambios en backend y no duplicar contenido.  
**Inconveniente:** El carrusel y las fichas de proyecto no cambian de idioma.

---

## Opción 2: Contenido en varios idiomas (carrusel y proyectos traducidos)

Para que el **carrusel** (y el resto de proyectos) cambie con el idioma:

1. **Backend:** Guardar por cada proyecto traducciones por idioma, por ejemplo:
   - Campos por idioma: `titleEs`, `titleEn`, `titlePt`, `descriptionEs`, `descriptionEn`, `descriptionPt`, y si quieres `category` por idioma igual.
   - O un objeto: `translations: { es: { title, description, category }, en: { ... }, pt: { ... } }`.

2. **API:** Que el backend pueda devolver el contenido en el idioma elegido:
   - **A)** Enviando el idioma desde el front (header `Accept-Language` o query `?lang=en`). El backend responde con `title`, `description`, `category` ya en ese idioma.
   - **B)** O que el backend devuelva **todas** las traducciones y el front elige en el cliente según el idioma actual (p. ej. `title[currentLang]`).

3. **Subir contenido:** Sí, en este caso **tienes que “subir” (o editar) el contenido en todos los idiomas** que quieras ofrecer. Es decir:
   - En el panel de administración tendrías campos para título/descripción (y categoría si aplica) en ES, EN, PT.
   - O importar/rellenar en BBDD los campos `titleEn`, `titlePt`, etc., según el modelo que elijas.

**Resumen:** Para que el **carrusel** cambie de idioma, el contenido **tiene que estar guardado en todos los idiomas** (en BBDD o vía API que devuelva traducciones). No hay forma de “traducir automáticamente” el contenido de la BBDD solo desde el front sin tener esas traducciones en backend o en archivos de idioma.

---

## Qué está preparado en el front

- El **selector de idioma** y las **traducciones de la UI** (textos de la web) ya funcionan.
- El **estado del proyecto** (`status`) en el carrusel y listados **sí se traduce** en el front (En ejecución / In progress / Em execução, etc.) usando las claves de i18n.
- Si en el futuro tu API devuelve contenido por idioma (opción 2), el front puede adaptarse para:
  - Enviar `Accept-Language` o `?lang=xx` en las peticiones de proyectos.
  - O usar un modelo con `translations.es`, `translations.en`, etc., y mostrar `title`/`description` según el idioma actual.

Si me dices cómo quieres el backend (A: idioma en la petición y respuesta en un idioma; B: respuesta con todos los idiomas), te indico los cambios exactos en el servicio y componentes del front.
