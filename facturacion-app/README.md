# Sistema de Facturación para Android

Aplicación móvil de facturación desarrollada con React Native y Expo para dispositivos Android.

## Características Principales

### Autenticación y Roles
- **Login**: Sistema de autenticación con email
- **Roles**:
  - **Administrador**: Acceso completo a todas las funcionalidades
  - **Vendedor**: Acceso limitado a facturación, consulta de inventario y gestión básica de clientes

### Gestión de Clientes
- Formulario de creación de clientes
- Búsqueda por nombre y apellidos
- Búsqueda por CI (Cédula de Identidad)
- Edición y eliminación (solo administradores)
- Campos: nombre, apellidos, CI, dirección, teléfono, email

### Inventario / Productos
- Catálogo de productos con código, nombre, descripción
- Control de precios (compra y venta)
- Gestión de stock y stock mínimo
- Categorización de productos
- Actualización automática del stock según compras y ventas

### Facturas de Compra
- Registro de compras a proveedores
- Entrada de productos al inventario
- Múltiples métodos de pago (efectivo, tarjeta, transferencia)
- Cálculo automático de totales e impuestos

### Facturas de Venta
- **Tipos de factura**:
  - Factura normal (con cliente registrado)
  - Consumidor final
  - Cotización (no afecta stock)
- **Métodos de pago**:
  - Efectivo
  - Tarjeta
  - Mixto (combinación de efectivo y tarjeta)
- Cálculo automático de subtotal, descuento, impuesto y total
- Reducción automática de stock
- Posibilidad de anular facturas (revierte stock)

### Seguridad y Permisos
- Los vendedores solo pueden:
  - Crear facturas de venta
  - Consultar inventario
  - Crear clientes
  - NO pueden eliminar clientes ni modificar productos
- Los administradores tienen acceso completo

## Estructura del Proyecto

```
facturacion-app/
├── src/
│   ├── screens/          # Pantallas de la aplicación
│   │   ├── LoginScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── ClientesScreen.tsx
│   │   ├── CrearClienteScreen.tsx
│   │   ├── InventarioScreen.tsx
│   │   ├── CrearVentaScreen.tsx
│   │   └── PlaceholderScreens.tsx
│   ├── components/       # Componentes reutilizables
│   ├── navigation/       # Configuración de navegación
│   │   └── AppNavigator.tsx
│   ├── context/          # Contextos de React
│   │   └── AppContext.tsx
│   ├── services/         # Servicios y base de datos
│   │   └── database.ts
│   ├── types/            # Tipos TypeScript
│   │   └── index.ts
│   └── utils/            # Utilidades
├── App.tsx
├── app.json
├── package.json
└── babel.config.js
```

## Instalación y Ejecución

### Requisitos Previos
- Node.js (versión 18 o superior)
- npm o yarn
- Expo CLI
- Android Studio (para emulador) o dispositivo Android físico
- Expo Go app (para pruebas en dispositivo físico)

### Pasos de Instalación

1. **Navegar al directorio del proyecto**:
```bash
cd facturacion-app
```

2. **Instalar dependencias**:
```bash
npm install
```

3. **Iniciar el servidor de desarrollo**:
```bash
npm start
```

4. **Ejecutar en Android**:
   - Presionar `a` en la terminal para abrir en emulador Android
   - O escanear el código QR con Expo Go en tu dispositivo físico

### Credenciales de Demostración

**Administrador**:
- Email: `admin@facturacion.com`
- Contraseña: cualquier valor

**Vendedor**:
- Email: `vendedor@facturacion.com`
- Contraseña: cualquier valor

## Tecnologías Utilizadas

- **React Native**: Framework para aplicaciones móviles
- **Expo**: Plataforma de desarrollo React Native
- **TypeScript**: Tipado estático
- **React Navigation**: Navegación entre pantallas
- **AsyncStorage**: Almacenamiento local persistente
- **Context API**: Gestión de estado global

## Funcionalidades Futuras (Recomendadas)

1. **Exportación a PDF**: Generar facturas en formato PDF
2. **Impresión térmica**: Conexión con impresoras Bluetooth
3. **Códigos QR**: Generar y leer códigos QR para productos
4. **Backup en la nube**: Sincronización con servidor remoto
5. **Reportes avanzados**: Gráficos y estadísticas detalladas
6. **Múltiples usuarios**: Gestión de más usuarios desde la app
7. **Notificaciones push**: Alertas de stock bajo

## Notas Importantes

- Esta aplicación usa almacenamiento local (AsyncStorage). Para producción, se recomienda implementar una API REST con base de datos en la nube.
- Los datos se persisten en el dispositivo pero se pierden si se desinstala la app.
- La aplicación está optimizada para tablets y teléfonos Android.

## Licencia

Este proyecto es de uso libre para fines educativos y comerciales.
