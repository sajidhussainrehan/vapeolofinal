# 🚀 Guía de Deployment VAPEOLO a Hostinger

## ✅ Archivos generados para producción
- `ecosystem.config.js` - Configuración PM2
- `package-production.json` - Dependencies para producción
- Esta guía de deployment

## 📋 Pasos para publicar en Hostinger

### **1. Configurar Base de Datos PostgreSQL**
En tu panel de Hostinger:
1. Ve a **Databases** → **PostgreSQL**
2. Crea una nueva base de datos llamada `vapeolo_db`
3. Anota las credenciales: host, puerto, usuario, contraseña

### **2. Configurar Variables de Entorno**
En Hostinger, ve a tu aplicación Node.js y configura estas variables:
```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://usuario:password@host:puerto/vapeolo_db
PGHOST=tu_host_postgres
PGPORT=5432
PGDATABASE=vapeolo_db
PGUSER=tu_usuario
PGPASSWORD=tu_password
SESSION_SECRET=una_clave_secreta_muy_segura
ADMIN_EMAIL=admin@tudominio.com
ADMIN_PASSWORD=password_administrador_seguro
```

### **3. Preparar archivos para subir**
1. Descarga este proyecto como ZIP desde Replit
2. Extrae los archivos en tu computadora
3. Reemplaza `package.json` con `package-production.json`
4. Sube todos los archivos a Hostinger via File Manager o FTP

### **4. Instalar dependencias y compilar**
En el terminal SSH de Hostinger:
```bash
npm install
npm run build
```

### **5. Configurar PM2 (si está disponible)**
```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

### **6. Ejecutar migraciones de base de datos**
```bash
npm run migrate
```

### **7. Configurar dominio**
En Hostinger:
1. Ve a **Domains** → tu dominio
2. Apunta los DNS hacia tu aplicación Node.js
3. Configura SSL/HTTPS

### **8. Iniciar la aplicación**
```bash
npm start
```

## 🎯 ¡Listo!
Tu sitio VAPEOLO estará disponible en tu dominio con:
- ✅ E-commerce completo con carrito
- ✅ Sistema de afiliados
- ✅ Panel administrativo
- ✅ Base de datos PostgreSQL
- ✅ WhatsApp integration
- ✅ SSL/HTTPS seguro

## 🔧 Comandos útiles
- Reiniciar: `pm2 restart vapeolo-app`
- Ver logs: `pm2 logs vapeolo-app`
- Monitorear: `pm2 monit`