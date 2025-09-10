# 🚀 Guía Completa de Deployment VAPEOLO - Hostinger

## ✅ Estado Actual del Proyecto
**¡Tu aplicación VAPEOLO está COMPLETAMENTE FUNCIONAL!** 

- ✅ Sitio web completo con diseño futurista
- ✅ Formularios de contacto y afiliación conectados y funcionando
- ✅ Dashboard administrativo completamente operativo
- ✅ APIs backend con validación y seguridad JWT
- ✅ Sistema de afiliados con 3 niveles implementado
- ✅ Base de datos PostgreSQL configurada

---

## 📋 Requisitos en Hostinger

### Plan Necesario:
- **Business Plan o Premium Plan** (con soporte Node.js)
- **Base de datos PostgreSQL disponible**
- **Dominio configurado**

---

## 🚀 Proceso de Deployment Completo

### Paso 1: Build Local de la Aplicación

```bash
# Ejecutar en Replit terminal:
npm run build
```

Esto genera:
- `dist/` - Frontend optimizado (cliente)
- `dist/index.js` - Servidor backend compilado

### Paso 2: Configurar Base de Datos PostgreSQL

1. **En hPanel de Hostinger:**
   - Ve a **"Bases de Datos" → "PostgreSQL"**
   - Crea nueva base de datos:
     - Nombre: `vapeolo_db`
     - Usuario: `vapeolo_user`  
     - Contraseña: [genera una segura]

2. **Anota esta información:**
```
Host: [tu-servidor].postgres.database.hostinger.com
Puerto: 5432
Base de datos: vapeolo_db
Usuario: vapeolo_user
Contraseña: [tu-contraseña-segura]
```

### Paso 3: Subir Código Completo a Hostinger

1. **En hPanel → "Administrador de Archivos":**
   - Ve a `public_html/`
   - **ELIMINA todo el contenido existente**
   - **SUBE TODOS los archivos de tu proyecto** incluyendo:
   ```
   public_html/
   ├── client/
   ├── server/
   ├── shared/
   ├── dist/          ← CRÍTICO: Debe incluir build fresco
   ├── package.json
   ├── node_modules/  ← Se creará en siguiente paso
   └── [todos los demás archivos]
   ```

### Paso 4: Configurar Node.js Application

1. **En hPanel → "Node.js":**
   - Selecciona tu dominio
   - **Versión Node.js:** 20.x (recomendado)
   - **Directorio de aplicación:** `/public_html`
   - **Archivo de entrada:** `dist/index.js` ← IMPORTANTE
   - **Script de inicio:** `start`

2. **Instalar dependencias:**
```bash
# Hostinger ejecutará automáticamente:
npm ci --production
```

### Paso 5: Variables de Entorno (CRÍTICO)

**En hPanel → "Node.js" → "Variables de Entorno":**

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://vapeolo_user:TU_CONTRASEÑA@tu-servidor.postgres.database.hostinger.com:5432/vapeolo_db
JWT_SECRET=tu_jwt_secret_super_seguro_minimo_32_caracteres_aqui
```

**⚠️ IMPORTANTE:** 
- Genera un `JWT_SECRET` único de al menos 32 caracteres
- Reemplaza `TU_CONTRASEÑA` con tu contraseña real de PostgreSQL
- Reemplaza `tu-servidor` con tu host real de Hostinger

### Paso 6: Inicializar Base de Datos

**Conecta a tu PostgreSQL via phpPgAdmin y ejecuta:**

```sql
-- 1. Habilitar UUID (OBLIGATORIO)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Crear tabla de usuarios administrativos
CREATE TABLE IF NOT EXISTS "users" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "username" text NOT NULL UNIQUE,
  "password" text NOT NULL,
  "role" text NOT NULL DEFAULT 'admin',
  "created_at" timestamp NOT NULL DEFAULT now()
);

-- 3. Crear tabla de afiliados
CREATE TABLE IF NOT EXISTS "affiliates" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "email" text NOT NULL UNIQUE,
  "phone" text NOT NULL,
  "level" text NOT NULL,
  "discount" decimal(5,2) NOT NULL,
  "minimum_purchase" decimal(10,2) NOT NULL,
  "status" text NOT NULL DEFAULT 'pending',
  "message" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "approved_at" timestamp,
  "approved_by" varchar REFERENCES "users"("id")
);

-- 4. Crear tabla de productos
CREATE TABLE IF NOT EXISTS "products" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "puffs" integer NOT NULL,
  "price" decimal(10,2) NOT NULL,
  "image" text,
  "sabores" text[] NOT NULL DEFAULT ARRAY[]::text[],
  "description" text,
  "popular" boolean NOT NULL DEFAULT false,
  "active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp NOT NULL DEFAULT now()
);

-- 5. Crear tabla de ventas
CREATE TABLE IF NOT EXISTS "sales" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "affiliate_id" varchar REFERENCES "affiliates"("id"),
  "product_id" varchar NOT NULL REFERENCES "products"("id"),
  "quantity" integer NOT NULL,
  "unit_price" decimal(10,2) NOT NULL,
  "discount" decimal(5,2),
  "total_amount" decimal(10,2) NOT NULL,
  "customer_name" text,
  "customer_email" text,
  "customer_phone" text,
  "status" text NOT NULL DEFAULT 'pending',
  "created_at" timestamp NOT NULL DEFAULT now()
);

-- 6. Crear tabla de mensajes de contacto
CREATE TABLE IF NOT EXISTS "contact_messages" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "email" text NOT NULL,
  "message" text NOT NULL,
  "status" text NOT NULL DEFAULT 'unread',
  "created_at" timestamp NOT NULL DEFAULT now()
);

-- 7. Crear usuario administrador (OBLIGATORIO)
INSERT INTO "users" (username, password, role) 
VALUES ('admin', '$2b$10$8K1p/a0dBxQyQeq0HFO1HO8bOCHp0NDc2g2C2HtQ0KqzKlE6E3.9a', 'admin')
ON CONFLICT (username) DO NOTHING;

-- 8. Insertar productos de ejemplo
INSERT INTO "products" (name, puffs, price, sabores, description, popular, active) VALUES
('CYBER VAPE 2500', 2500, 65.00, ARRAY['Menta Fresca', 'Frutas del Bosque', 'Mango Tropical'], 'Vape futurista de alta tecnología', true, true),
('CUBE MINI 1000', 1000, 35.00, ARRAY['Sandía', 'Uva', 'Limón'], 'Diseño compacto y potente', false, true),
('ENERGY BOOST 3000', 3000, 85.00, ARRAY['Energy Drink', 'Café', 'Cola'], 'Para momentos de máxima energía', true, true),
('TORCH FIRE 4000', 4000, 95.00, ARRAY['Canela', 'Vainilla', 'Chocolate'], 'Experiencia intensa y duradera', false, true),
('BAR CLASSIC 800', 800, 25.00, ARRAY['Tabaco', 'Menta', 'Cereza'], 'El clásico que nunca falla', false, true)
ON CONFLICT DO NOTHING;
```

### Paso 7: Iniciar la Aplicación

1. **En hPanel → "Node.js":**
   - **Restart** la aplicación
   - Verificar estado: **"Running"**
   - Verificar logs para errores

### Paso 8: Configurar SSL/HTTPS

1. **En hPanel → "SSL/TLS":**
   - Activa **"Let's Encrypt SSL"** 
   - Habilita **"Forzar HTTPS"**

---

## 🔐 Credenciales de Administrador

### Acceso al Panel Administrativo:
```
URL: https://tu-dominio.com/admin/login
Usuario: admin
Contraseña: admin123
```

**⚠️ CAMBIAR CONTRASEÑA INMEDIATAMENTE** después del primer login

---

## ✅ Lista de Verificación Post-Deployment

### 1. Verificar Sitio Principal ✅
```
✅ URL: https://tu-dominio.com
✅ Página principal carga correctamente
✅ Productos se muestran (5 categorías)
✅ Formulario contacto funciona
✅ Formulario afiliación funciona  
✅ Diseño responsive correcto
```

### 2. Verificar APIs Backend ✅
```bash
# Probar estas URLs en el navegador o Postman:

✅ GET https://tu-dominio.com/api/products
   → Debe devolver lista de productos

✅ POST https://tu-dominio.com/api/contact
   → Debe aceptar: {name, email, message}

✅ POST https://tu-dominio.com/api/affiliates  
   → Debe aceptar: {name, email, phone, level, message}
```

### 3. Verificar Dashboard Administrativo ✅
```
✅ URL: https://tu-dominio.com/admin/login
✅ Login con admin/admin123 funciona
✅ Dashboard muestra estadísticas reales
✅ Gestión de afiliados accesible
✅ Administración de productos funcional
✅ Mensajes de contacto visibles
```

### 4. Verificar Base de Datos ✅
```
✅ Tablas creadas correctamente
✅ Productos aparecen en el sitio
✅ Formularios guardan datos en BD
✅ Admin puede ver datos en dashboard
```

---

## 🛠️ Solución de Problemas

### ❌ **"Cannot find module" o "App crashed"**
```bash
# Verificar en hPanel → Node.js → Logs:
1. Confirmar que dist/index.js existe
2. Verificar que npm ci se ejecutó
3. Comprobar NODE_ENV=production
4. Verificar script de inicio: "start"
```

### ❌ **"JWT must be provided"**
```bash
# En Variables de Entorno:
1. Verificar JWT_SECRET está configurado
2. Longitud mínima 32 caracteres
3. Reiniciar aplicación después de cambios
```

### ❌ **"Database connection failed"**
```bash
1. Verificar DATABASE_URL completa y correcta
2. Comprobar credenciales PostgreSQL
3. Confirmar que pgcrypto está habilitado
4. Probar conexión desde phpPgAdmin
```

### ❌ **"Admin login failed"**
```bash
1. Verificar usuario 'admin' existe en tabla users
2. Confirmar tabla users tiene columna 'username' 
3. Verificar contraseña hash correcta
4. Comprobar JWT_SECRET configurado
```

### ❌ **"Static files not loading"**
```bash
1. Confirmar dist/ contiene archivos del build
2. Verificar Express sirve estáticos desde dist/
3. Comprobar que npm run build se ejecutó correctamente
```

---

## 🎯 Funcionalidades Operativas

### ✅ **Frontend Público:**
- Hero banner futurista con efectos
- Catálogo por categorías (CYBER, CUBE, ENERGY, TORCH, BAR)  
- Programa de afiliación (Agente 10-12%, Distribuidor 25-30%, Socio 45-50%)
- Formularios funcionales con validación Zod
- Diseño responsive y moderno

### ✅ **Backend APIs Seguras:**
- `POST /api/contact` - Mensajes de contacto
- `POST /api/affiliates` - Solicitudes de afiliación
- `GET /api/products` - Catálogo público  
- `POST /api/admin/login` - Autenticación admin
- `GET /api/admin/dashboard` - Estadísticas
- `GET /api/admin/affiliates` - Gestión afiliados
- Rate limiting y validación en todas las rutas

### ✅ **Dashboard Administrativo:**
- Autenticación JWT segura
- Estadísticas en tiempo real
- Gestión completa de afiliados (aprobar/rechazar)
- Administración de productos (crear/editar)
- Control de mensajes de contacto
- Sistema de ventas

---

## 🎉 ¡Tu E-commerce VAPEOLO está LISTO!

**Tu aplicación VAPEOLO incluye:**
- ✅ **Sitio web profesional** listo para ventas
- ✅ **Sistema de afiliación automatizado** con 3 niveles
- ✅ **Dashboard administrativo completo**
- ✅ **APIs backend seguras y escalables**
- ✅ **Base de datos PostgreSQL robusta**

## 🔒 Recomendaciones de Seguridad

1. **Cambiar contraseña admin** inmediatamente
2. **Configurar backup automático** de base de datos
3. **Monitorear logs** regularmente  
4. **Mantener Node.js actualizado**
5. **Usar HTTPS siempre**

## 📞 Soporte Técnico

Para problemas específicos de Hostinger:
- **Soporte 24/7:** Chat en vivo en hPanel
- **Documentación Node.js:** Tutorial en hPanel
- **phpPgAdmin:** Gestión de base de datos

---

**¡Comienza a vender y administrar tu negocio VAPEOLO ahora!** 🚀💨