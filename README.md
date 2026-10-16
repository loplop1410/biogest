# BioGest | Ingeniería Clínica

MVP local para gestionar equipamiento biomédico de una clínica en Perú. Interfaz en español, importes en soles y fechas DD/MM/AAAA. Desarrollado con React, Vite, JavaScript y lucide-react.

## Ejecución

Requiere Node.js 20.19+ o 22.12+ y npm.

```bash
npm install
npm run dev
```

Abre la dirección local que muestra Vite. Para compilar y previsualizar la versión de producción:

```bash
npm run build
npm run preview
```

Pruebas de las reglas de negocio:

```bash
npm test
```

## Recorrido de demostración — aproximadamente 2 minutos

1. En **Dashboard**, revisa indicadores, alertas y próximos mantenimientos.
2. En **Inventario biomédico**, abre **ECO-001 · Ecógrafo Doppler** y consulta su ficha e historial.
3. En **Mantenimientos y calibraciones**, completa el preventivo vencido del ECO-001: registra fecha de ejecución y resultado. La alerta desaparece y los indicadores se actualizan.
4. En **Solicitudes y adquisiciones**, abre la solicitud del segundo ecógrafo. Registra justificación técnica y presupuesto; avanza a Adquisición.
5. Registra proveedor, cotización, orden de compra y **aprobación gerencial simulada**. Avanza a Recepción.
6. Completa los cinco requisitos del checklist y los datos del equipo recibido. Confirma la recepción: **ECO-002** se incorpora al inventario automáticamente.
7. Abre su ficha para consultar la trazabilidad. En **Disposición final**, puedes registrar una baja con motivo y confirmación.

## Alcance y datos

### Versión para compartir sin instalación

Abre `entrega/BioGest.html` con Chrome o Edge. El archivo incluye la aplicación, los estilos y los iconos; funciona sin servidor, npm ni conexión a Internet. Puedes enviar solo ese HTML a tus compañeros. Cada persona empieza con los datos ficticios y guarda sus propios cambios en el navegador: los cambios no se comparten ni se incorporan al archivo HTML al enviarlo. Usa el mismo navegador y ubicación del archivo para conservar el almacenamiento local.

Para regenerar esta entrega después de modificar el código:

```bash
npm run build:html
```

- Inventario con registro, edición, búsqueda, filtros y ficha técnica; solicitudes por etapas; recepción validada; mantenimientos preventivos, correctivos y calibraciones; alertas dinámicas y baja definitiva.
- Los datos y operaciones se guardan en `localStorage` del navegador. Permanecen al recargar en el mismo origen y navegador. No se sincronizan entre dispositivos; borrar los datos del navegador elimina el almacenamiento local.
- Todos los equipos, proveedores y operaciones precargados son ficticios. El vencimiento del preventivo y la calibración del ecógrafo se calculan respecto al día en que se restablece la demostración. Las fechas de operación utilizan la zona horaria de Perú.
- La aprobación gerencial es una **simulación de demostración**; no constituye una autorización real. No hay autenticación, backend ni conexión con proveedores, autoridades o sistemas hospitalarios.
- **Restablecer datos de demostración** solicita confirmación y reemplaza los cambios locales por los datos iniciales.
- Los equipos dados de baja conservan su historial y no pueden reactivarse mediante edición ordinaria ni recibir nuevas intervenciones. No se eliminan registros definitivamente.

Esta demostración utiliza únicamente recursos locales una vez instaladas sus dependencias.
