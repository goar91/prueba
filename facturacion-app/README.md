# Guía de Despliegue - Sistema de Facturación

## Arquitectura
- **Backend**: Node.js + Express + PostgreSQL (en Docker)
- **Frontend**: React Native + Expo (app móvil Android)
- **Base de datos**: PostgreSQL 15

## Requisitos Previos
- Docker y Docker Compose instalados en tu laptop
- Node.js 18+ instalado
- Celular Android con Expo Go instalado (desde Play Store)
- Laptop y celular en la misma red WiFi

---

## PASO 1: Desplegar Backend con Docker

### 1.1 Navega al directorio del backend
```bash
cd /workspace/facturacion-app/backend
```

### 1.2 Construir y levantar los contenedores
```bash
docker-compose up -d --build
```

Esto creará:
- Contenedor `facturacion_db`: PostgreSQL
- Contenedor `facturacion_backend`: API REST

### 1.3 Verificar que todo esté funcionando
```bash
docker-compose ps
```

Deberías ver ambos contenedores con estado "Up".

### 1.4 Obtener la IP de tu laptop
**Windows:**
```cmd
ipconfig
```
Busca "Dirección IPv4" en tu adaptador WiFi (ej: 192.168.1.100)

**Linux/Mac:**
```bash
hostname -I
# o
ifconfig
```

---

## PASO 2: Configurar la App Móvil

### 2.1 Instalar dependencias de la app
```bash
cd /workspace/facturacion-app
npm install
```

### 2.2 Configurar la URL del backend
Edita el archivo `src/services/api.ts` y reemplaza:
```typescript
const API_URL = 'http://TU_IP_AQUI:3000/api';
```
Por ejemplo: `http://192.168.1.100:3000/api`

### 2.3 Iniciar Expo
```bash
npx expo start
```

Verás un código QR en la terminal.

---

## PASO 3: Instalar y Probar en el Celular

### 3.1 Instalar Expo Go
En tu celular Android:
1. Abre Google Play Store
2. Busca "Expo Go"
3. Instala la app de Expo

### 3.2 Escanear el código QR
1. Abre Expo Go en tu celular
2. Toca "Scan QR Code"
3. Escanea el código QR que aparece en tu laptop

La app se cargará automáticamente en tu celular.

---

## PASO 4: Primer Uso

### Credenciales por defecto
- **Usuario**: `admin`
- **Contraseña**: `admin123`

### Flujo recomendado:
1. Inicia sesión con el usuario admin
2. Crea productos en el inventario
3. Crea clientes
4. Crea un usuario vendedor para probar roles
5. Prueba crear facturas de venta, compra y cotización

---

## Generar APK para Producción

Si quieres un APK instalable sin Expo Go:

### Opción A: Usar EAS Build (Recomendado)
```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android
```

Esto generará un APK en la nube que podrás descargar e instalar.

### Opción B: Build local (requiere Android Studio)
```bash
eas build --platform android --local
```

---

## Comandos Útiles de Docker

### Ver logs del backend
```bash
docker-compose logs -f backend
```

### Ver logs de la base de datos
```bash
docker-compose logs -f postgres
```

### Detener todo
```bash
docker-compose down
```

### Reiniciar servicios
```bash
docker-compose restart
```

### Acceder a la base de datos
```bash
docker exec -it facturacion_db psql -U facturacion_user -d facturacion_db
```

---

## Solución de Problemas

### La app no se conecta al backend
1. Verifica que laptop y celular estén en la misma red WiFi
2. Asegúrate de usar la IP correcta en `api.ts`
3. Verifica que el puerto 3000 no esté bloqueado por el firewall
4. Prueba: `curl http://TU_IP:3000/health` desde otro dispositivo

### Error de conexión a PostgreSQL
```bash
docker-compose logs postgres
```

### Reiniciar desde cero
```bash
docker-compose down -v  # Elimina volúmenes (¡pierde datos!)
docker-compose up -d --build
```

---

## Endpoints de la API

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| POST | `/api/auth/login` | Login | Todos |
| POST | `/api/auth/register` | Registrar usuario | Admin |
| GET | `/api/customers` | Listar clientes | Todos |
| POST | `/api/customers` | Crear cliente | Todos |
| PUT | `/api/customers/:id` | Editar cliente | Admin |
| DELETE | `/api/customers/:id` | Eliminar cliente | Admin |
| GET | `/api/products` | Listar productos | Todos |
| POST | `/api/products` | Crear producto | Admin |
| PUT | `/api/products/:id` | Editar producto | Admin |
| DELETE | `/api/products/:id` | Eliminar producto | Admin |
| GET | `/api/invoices` | Listar facturas | Todos |
| POST | `/api/invoices` | Crear factura | Todos |
| PATCH | `/api/invoices/:id/anular` | Anular factura | Admin |

---

## Seguridad

⚠️ **IMPORTANTE**: Cambia estas credenciales antes de producción:
- `JWT_SECRET` en `docker-compose.yml`
- Contraseña de PostgreSQL
- Usuario admin por defecto
