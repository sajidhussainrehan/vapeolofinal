# ⚡ VAPEOLO - Quick Setup Guide for Hostinger

## 🚀 Your Project is 100% Ready!

### 📦 Download Your Project
1. In Replit: **Files** → **"..."** menu → **"Download as ZIP"**
2. Save the complete `project.zip` file

### 🌐 Hostinger Setup (5 Steps)

#### Step 1: Upload Files
- Go to **hPanel** → **File Manager** → **public_html/**
- Delete all existing content
- Upload **ALL** your project files (including `dist/` folder)

#### Step 2: Create Database
- **hPanel** → **Databases** → **PostgreSQL**
- Create: `vapeolo_db` with user `vapeolo_user`
- Save the connection details

#### Step 3: Configure Node.js
- **hPanel** → **Node.js**
- Entry file: `dist/index.js`
- Node version: 20.x
- Startup script: `start`

#### Step 4: Environment Variables
```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://vapeolo_user:PASSWORD@server.postgres.database.hostinger.com:5432/vapeolo_db
JWT_SECRET=your-32-character-secret-key-here
```

#### Step 5: Initialize Database
- Use **phpPgAdmin** to run the SQL setup (see full guide)

### ✅ Test Your Site
- **Frontend:** `https://your-domain.com`
- **Admin:** `https://your-domain.com/admin/login`
  - Username: `admin`
  - Password: `admin123` (change immediately!)

### 📚 Need Details?
See **HOSTINGER_DEPLOYMENT_GUIDE_EN.md** for complete instructions.

---
**Your VAPEOLO e-commerce is ready to generate sales!** 🎯