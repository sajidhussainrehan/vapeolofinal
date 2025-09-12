# 🚀 VAPEOLO - Instrucciones para Hostinger

## ✅ ¡TU PROYECTO ESTÁ LISTO PARA HOSTINGER!

### 📁 Archivos Importantes:
- **DEPLOYMENT_GUIDE_HOSTINGER.md** - Guía completa paso a paso
- **package-production.json** - Configuración para producción  
- **dist/** - Archivos compilados (frontend + backend)
- **ecosystem.config.js** - Configuración PM2

### 📋 Pasos Rápidos:

#### 1. **Requisitos en Hostinger:**
- Plan Business o Premium (con Node.js)
- Base de datos PostgreSQL
- Dominio configurado

#### 2. **Subir Archivos:**
1. Descarga TODO el proyecto
2. Sube TODO a `public_html/` en Hostinger
3. **IMPORTANTE:** Incluye la carpeta `dist/` (archivos compilados)

#### 3. **Configurar Node.js en hPanel:**
- **Archivo de entrada:** `dist/index.js`
- **Script de inicio:** `start`
- **Versión Node.js:** 20.x

#### 4. **Variables de Entorno CRÍTICAS:**
```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://usuario:contraseña@servidor.postgres.database.hostinger.com:5432/basedatos
JWT_SECRET=tu-secreto-jwt-super-seguro-minimo-32-caracteres
```

#### 5. **Configurar Base de Datos:**
- Crear PostgreSQL en hPanel
- Ejecutar SQL del archivo DEPLOYMENT_GUIDE_HOSTINGER.md
- Configurar DATABASE_URL

#### 6. **Credenciales Admin:**
```
URL: https://tu-dominio.com/admin/login
Usuario: admin
Contraseña: admin123
```

### 🔧 Si Algo No Funciona:

1. **Verificar logs en hPanel → Node.js → Logs**
2. **Comprobar que dist/index.js existe**
3. **Verificar variables de entorno**
4. **Confirmar base de datos PostgreSQL activa**

### 📚 Documentación Completa:
Ver archivo **DEPLOYMENT_GUIDE_HOSTINGER.md** para instrucciones detalladas.

---
**¡Tu aplicación VAPEOLO está lista para generar ventas!** 🌟