# 📘 Guía Rápida de Instalación

## En 5 minutos tendrás la app corriendo en tu celular

### Paso 1: Levantar el Backend (2 min)

```bash
cd /workspace/facturacion-app/backend
docker-compose up -d --build
```

Verifica que esté funcionando:
```bash
docker-compose ps
```

### Paso 2: Obtener tu IP (30 seg)

**Windows:**
```cmd
ipconfig
```
Busca "IPv4" en tu adaptador WiFi (ej: `192.168.1.100`)

**Linux/Mac:**
```bash
hostname -I
```

### Paso 3: Configurar la App (30 seg)

Edita `/workspace/facturacion-app/src/config/api.ts`:

```typescript
export const API_URL = 'http://192.168.1.100:3000/api';
// 👆 Cambia 192.168.1.100 por TU IP
```

### Paso 4: Iniciar la App (1 min)

```bash
cd /workspace/facturacion-app
npm install
npx expo start
```

### Paso 5: Probar en tu Celular (1 min)

1. **Instala Expo Go** desde Google Play Store
2. **Escanea el QR** que aparece en la terminal
3. **¡Listo!** La app se abre en tu celular

---

## Primeros Pasos en la App

### Credenciales de Admin
- Usuario: `admin`
- Contraseña: `admin123`

### Flujo Recomendado

1. ✅ Logueate como admin
2. 📦 Crea productos en "Inventario"
3. 👥 Crea clientes en "Clientes"
4. 🧾 Crea una factura de venta
5. 👤 Registra un usuario vendedor
6. 🔄 Prueba loguearte como vendedor

---

## Comandos Útiles

### Ver logs del backend
```bash
docker-compose logs -f backend
```

### Detener todo
```bash
docker-compose down
```

### Reiniciar servicios
```bash
docker-compose restart
```

---

## ¿Problemas?

### La app no conecta
- ✅ Laptop y celular en la misma red WiFi
- ✅ IP correcta en `api.ts`
- ✅ Firewall no bloquea puerto 3000
- ✅ Prueba: `curl http://TU_IP:3000/health`

### Error de Docker
```bash
docker-compose down -v
docker-compose up -d --build
```

---

## Generar APK (Opcional)

Para crear un APK instalable sin Expo Go:

```bash
npm install -g eas-cli
eas login
eas build --platform android
```

Descarga el APK e instálalo en tu celular.
