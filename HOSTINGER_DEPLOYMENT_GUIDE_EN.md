# 🚀 VAPEOLO - Complete Hostinger Deployment Guide

## ✅ Project Status
**Your VAPEOLO application is FULLY FUNCTIONAL and ready for deployment!**

- ✅ Complete e-commerce website with futuristic design
- ✅ Working contact and affiliate forms with backend integration
- ✅ Fully operational admin dashboard
- ✅ Secure backend APIs with JWT authentication
- ✅ 3-tier affiliate system implemented
- ✅ PostgreSQL database configured
- ✅ Shopping cart system with WhatsApp checkout

---

## 📋 Hostinger Requirements

### Required Plan:
- **Business Plan or Premium Plan** (with Node.js support)
- **PostgreSQL database available**
- **Configured domain**

---

## 🚀 Complete Deployment Process

### Step 1: Build Your Application

```bash
# Already executed - your dist/ folder is ready
npm run build
```

This generates:
- `dist/public/` - Optimized frontend (client)
- `dist/index.js` - Compiled backend server

### Step 2: Set Up PostgreSQL Database

1. **In Hostinger hPanel:**
   - Go to **"Databases" → "PostgreSQL"**
   - Create new database:
     - Name: `vapeolo_db`
     - User: `vapeolo_user`  
     - Password: [generate a secure one]

2. **Save this information:**
```
Host: [your-server].postgres.database.hostinger.com
Port: 5432
Database: vapeolo_db
User: vapeolo_user
Password: [your-secure-password]
```

### Step 3: Upload Complete Project to Hostinger

1. **Download your project from Replit:**
   - Go to **Files** → click **"..."** menu → **"Download as ZIP"**
   - Save `project.zip`

2. **In hPanel → "File Manager":**
   - Navigate to `public_html/`
   - **DELETE all existing content**
   - **UPLOAD ALL project files** including:
   ```
   public_html/
   ├── client/
   ├── server/
   ├── shared/
   ├── dist/          ← CRITICAL: Must include fresh build
   ├── package.json
   ├── node_modules/  ← Will be created in next step
   └── [all other files]
   ```

### Step 4: Configure Node.js Application

1. **In hPanel → "Node.js":**
   - Select your domain
   - **Node.js Version:** 20.x (recommended)
   - **Application Directory:** `/public_html`
   - **Entry File:** `dist/index.js` ← IMPORTANT
   - **Startup Script:** `start`

2. **Install dependencies:**
```bash
# Hostinger will automatically run:
npm ci --production
```

### Step 5: Environment Variables (CRITICAL)

**In hPanel → "Node.js" → "Environment Variables":**

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://vapeolo_user:YOUR_PASSWORD@your-server.postgres.database.hostinger.com:5432/vapeolo_db
JWT_SECRET=your_super_secure_jwt_secret_minimum_32_characters_here
```

**⚠️ IMPORTANT:** 
- Generate a unique `JWT_SECRET` of at least 32 characters
- Replace `YOUR_PASSWORD` with your actual PostgreSQL password
- Replace `your-server` with your actual Hostinger host

### Step 6: Initialize Database

**Connect to your PostgreSQL via phpPgAdmin and execute:**

```sql
-- 1. Enable UUID (REQUIRED)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Create admin users table
CREATE TABLE IF NOT EXISTS "users" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "username" text NOT NULL UNIQUE,
  "password" text NOT NULL,
  "role" text NOT NULL DEFAULT 'admin',
  "created_at" timestamp NOT NULL DEFAULT now()
);

-- 3. Create affiliates table
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

-- 4. Create products table
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
  "show_on_homepage" boolean NOT NULL DEFAULT true,
  "inventory" integer NOT NULL DEFAULT 0,
  "reserved_inventory" integer NOT NULL DEFAULT 0,
  "low_stock_threshold" integer NOT NULL DEFAULT 10,
  "created_at" timestamp NOT NULL DEFAULT now()
);

-- 5. Create product flavors table
CREATE TABLE IF NOT EXISTS "product_flavors" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "product_id" varchar NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "inventory" integer NOT NULL DEFAULT 0,
  "reserved_inventory" integer NOT NULL DEFAULT 0,
  "low_stock_threshold" integer NOT NULL DEFAULT 5,
  "active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp NOT NULL DEFAULT now()
);

-- 6. Create sales table
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

-- 7. Create contact messages table
CREATE TABLE IF NOT EXISTS "contact_messages" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "email" text NOT NULL,
  "message" text NOT NULL,
  "status" text NOT NULL DEFAULT 'unread',
  "created_at" timestamp NOT NULL DEFAULT now()
);

-- 8. Create homepage content table
CREATE TABLE IF NOT EXISTS "homepage_content" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "section" text NOT NULL UNIQUE,
  "title" text NOT NULL,
  "subtitle" text,
  "description" text,
  "button_text" text,
  "button_url" text,
  "content" text,
  "active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

-- 9. Insert admin user (REQUIRED)
INSERT INTO "users" (username, password, role) 
VALUES ('admin', '$2b$10$8K1p/a0dBxQyQeq0HFO1HO8bOCHp0NDc2g2C2HtQ0KqzKlE6E3.9a', 'admin')
ON CONFLICT (username) DO NOTHING;

-- 10. Insert sample products
INSERT INTO "products" (name, puffs, price, sabores, description, popular, active, show_on_homepage, inventory) VALUES
('CYBER', 20000, 240.00, ARRAY['Mango Ice', 'Blueberry', 'Cola', 'Grape', 'Sandía Chill'], 'Premium CYBER vape with 20,000 puffs and variety of refreshing flavors. Perfect for extended sessions with superior quality.', true, true, true, 25),
('CUBE', 20000, 220.00, ARRAY['Strawberry Kiwi', 'Menta', 'Cola', 'Frutas Tropicales', 'Piña'], 'CUBE vape with modern design and 20,000 puffs. Perfect balance between flavor and duration with unique tastes.', false, true, true, 25),
('ENERGY', 15000, 170.00, ARRAY['Blue Razz', 'Mango Chill', 'Fresa', 'Cereza', 'Uva'], 'ENERGY vape with 15,000 puffs and intense flavors. Designed to give you the energy you need all day long.', false, true, true, 25),
('TORCH', 6000, 125.00, ARRAY['Menta', 'Banana Ice', 'Frutos Rojos', 'Chicle', 'Limonada'], 'Compact TORCH vape with 6,000 puffs. Perfect to carry with you with fresh and vibrant flavors.', false, true, true, 25),
('BAR', 800, 65.00, ARRAY['Sandía', 'Uva', 'Cola', 'Mango', 'Piña Colada'], 'Economic BAR vape with 800 puffs. Ideal for those seeking an accessible option without compromising flavor quality.', false, true, true, 25)
ON CONFLICT DO NOTHING;

-- 11. Insert homepage content
INSERT INTO "homepage_content" (section, title, subtitle, description, content, active) VALUES
('hero', 'VAPEOLO:', 'Where experience and flavor merge', '15 years designing the best electronic cigarettes in the market', '{"features": [{"icon": "🌟", "text": "More than 25 unique flavors"}, {"icon": "⚡", "text": "Up to 20,000 puffs duration"}, {"icon": "🚚", "text": "Fast shipping nationwide"}], "buttons": {"primary": "View Products", "secondary": "Join as Affiliate"}}', true),
('about', 'Who are we?', 'VAPEOLO is official distributor of LAVIE, a brand with more than 15 years of innovation in vape design and manufacturing.', 'Our mission: redefine vaping in Latin America', '{"title": "Who are we?", "subtitle": "Your official LAVIE distributor in Guatemala", "description": "We are VAPEOLO, official distributors of LAVIE brand in Guatemala. We specialize in offering the highest quality vapes with unique flavors and durable devices. Our commitment is to provide authentic products and exceptional service to all our customers.", "features": [{"title": "Authentic Products", "description": "We only sell original and certified LAVIE products"}, {"title": "Secure Shipping", "description": "We deliver throughout Guatemala with secure packaging"}, {"title": "Personalized Attention", "description": "Specialized advice for each customer"}]}', true),
('contact', 'Contact', 'We are here to help you', '', '{"formTitle": "Contact Us", "formLabels": {"name": "Full name", "email": "Email address", "message": "Message"}, "formPlaceholders": {"name": "Your full name", "email": "your@email.com", "message": "Tell us how we can help you..."}, "formButton": "Send message", "contactInfo": [{"title": "WhatsApp", "description": "Immediate response", "value": "+502 1234-5678", "action": "Chat"}, {"title": "Email", "description": "General inquiries", "value": "info@vapeolo.com", "action": "Write"}, {"title": "Location", "description": "Guatemala City", "value": "Guatemala, Central America", "action": "View map"}], "shippingInfo": [{"title": "Free Shipping", "description": "On purchases over Q200"}, {"title": "Fast Delivery", "description": "1-3 business days"}, {"title": "Secure Payment", "description": "Multiple payment methods"}], "paymentMethods": ["Cash", "Transfer", "Card", "Check"], "shippingNotice": "Shipping throughout Guatemala with secure packaging"}', true),
('navigation', 'Navigation', 'Main site menu', 'Navigation and menu configuration', '{"logoAlt": "VAPEOLO Logo - Official LAVIE distributor", "menuItems": {"home": "Home", "products": "Products", "affiliates": "Affiliates", "contact": "Contact"}, "buttons": {"cart": "Shopping cart", "login": "Login", "mobileMenu": "Menu"}}', true),
('footer', 'Footer', 'Page footer', 'Footer information', '{"brandName": "VAPEOLO", "brandDescription": "Official LAVIE distributor with more than 15 years of experience in the vaping market. Quality, innovation and guaranteed flavor.", "columns": {"products": {"title": "Products", "links": [{"name": "Disposable Vapes", "href": "#products"}, {"name": "LAVIE Series", "href": "#products"}, {"name": "Popular Flavors", "href": "#products"}, {"name": "Special Offers", "href": "#products"}]}, "company": {"title": "Company", "links": [{"name": "About Us", "href": "#about-us"}, {"name": "Distributors", "href": "/affiliates"}, {"name": "Quality", "href": "#quality"}, {"name": "Contact", "href": "#contact"}]}, "support": {"title": "Support", "links": [{"name": "FAQ", "href": "#faq"}, {"name": "Shipping Policy", "href": "#shipping"}, {"name": "Warranty", "href": "#warranty"}, {"name": "Returns", "href": "#returns"}]}}, "copyright": "© {currentYear} VAPEOLO. All rights reserved.", "legalLinks": [{"name": "Privacy Policy", "href": "#privacy"}, {"name": "Terms and Conditions", "href": "#terms"}, {"name": "Cookies", "href": "#cookies"}], "ageWarning": "Only for people over 18 years old. Vaping can be harmful to health."}', true),
('testimonials', 'Testimonials', 'What our customers and partners say', '', '{"socialPrompt": "Follow us on social media", "socialPlatforms": [{"platform": "Instagram", "handle": "@lavievapes.gt", "followers": "45.2K"}, {"platform": "TikTok", "handle": "@lavievapes", "followers": "32.8K"}, {"platform": "Facebook", "handle": "LAVIE Vapes Guatemala", "followers": "28.1K"}], "ctaPrompt": "Follow us for exclusive content", "ctaFeatures": "📸 Customer photos • 🎥 Reviews and unboxing • 🎁 Promos and giveaways"}', true)
ON CONFLICT (section) DO NOTHING;
```

### Step 7: Start the Application

1. **In hPanel → "Node.js":**
   - **Restart** the application
   - Verify status: **"Running"**
   - Check logs for errors

### Step 8: Configure SSL/HTTPS

1. **In hPanel → "SSL/TLS":**
   - Enable **"Let's Encrypt SSL"** 
   - Enable **"Force HTTPS"**

---

## 🔐 Admin Credentials

### Admin Panel Access:
```
URL: https://your-domain.com/admin/login
Username: admin
Password: admin123
```

**⚠️ CHANGE PASSWORD IMMEDIATELY** after first login

---

## ✅ Post-Deployment Checklist

### 1. Verify Main Site ✅
```
✅ URL: https://your-domain.com
✅ Homepage loads correctly
✅ Products display (5 categories)
✅ Contact form works
✅ Affiliate form works  
✅ Responsive design correct
✅ Shopping cart functional
```

### 2. Verify Backend APIs ✅
```bash
# Test these URLs in browser or Postman:

✅ GET https://your-domain.com/api/products
   → Should return product list

✅ GET https://your-domain.com/api/homepage-content
   → Should return homepage content

✅ POST https://your-domain.com/api/contact
   → Should accept: {name, email, message}

✅ POST https://your-domain.com/api/affiliates  
   → Should accept: {name, email, phone, level, message}
```

### 3. Verify Admin Dashboard ✅
```
✅ URL: https://your-domain.com/admin/login
✅ Login with admin/admin123 works
✅ Dashboard shows real statistics
✅ Affiliate management accessible
✅ Product administration functional
✅ Contact messages visible
```

### 4. Verify Database ✅
```
✅ Tables created correctly
✅ Products appear on site
✅ Forms save data to DB
✅ Admin can view data in dashboard
```

---

## 🛠️ Troubleshooting

### ❌ **"Cannot find module" or "App crashed"**
```bash
# Check in hPanel → Node.js → Logs:
1. Confirm dist/index.js exists
2. Verify npm ci executed
3. Check NODE_ENV=production
4. Verify startup script: "start"
```

### ❌ **"JWT must be provided"**
```bash
# In Environment Variables:
1. Verify JWT_SECRET is configured
2. Minimum length 32 characters
3. Restart application after changes
```

### ❌ **"Database connection failed"**
```bash
1. Verify complete and correct DATABASE_URL
2. Check PostgreSQL credentials
3. Confirm pgcrypto is enabled
4. Test connection from phpPgAdmin
```

### ❌ **"Admin login failed"**
```bash
1. Verify user 'admin' exists in users table
2. Confirm users table has 'username' column 
3. Verify correct password hash
4. Check JWT_SECRET configured
```

### ❌ **"Static files not loading"**
```bash
1. Confirm dist/ contains build files
2. Verify Express serves static from dist/
3. Check npm run build executed correctly
```

---

## 🎯 Operational Features

### ✅ **Public Frontend:**
- Futuristic hero banner with effects
- Category catalog (CYBER, CUBE, ENERGY, TORCH, BAR)  
- Affiliate program (Agent 10-12%, Distributor 25-30%, Partner 45-50%)
- Functional forms with Zod validation
- Responsive and modern design
- Shopping cart with WhatsApp checkout

### ✅ **Secure Backend APIs:**
- `POST /api/contact` - Contact messages
- `POST /api/affiliates` - Affiliate applications
- `GET /api/products` - Public catalog  
- `GET /api/homepage-content` - Homepage content
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/dashboard` - Statistics
- `GET /api/admin/affiliates` - Affiliate management
- Rate limiting and validation on all routes

### ✅ **Admin Dashboard:**
- Secure JWT authentication
- Real-time statistics
- Complete affiliate management (approve/reject)
- Product administration (create/edit)
- Contact message control
- Sales system
- Homepage content management

---

## 🎉 Your VAPEOLO E-commerce is READY!

**Your VAPEOLO application includes:**
- ✅ **Professional website** ready for sales
- ✅ **Automated affiliate system** with 3 levels
- ✅ **Complete admin dashboard**
- ✅ **Secure and scalable backend APIs**
- ✅ **Robust PostgreSQL database**
- ✅ **Shopping cart with WhatsApp integration**

## 🔒 Security Recommendations

1. **Change admin password** immediately
2. **Configure automatic database backup**
3. **Monitor logs** regularly  
4. **Keep Node.js updated**
5. **Always use HTTPS**

## 📞 Technical Support

For Hostinger-specific issues:
- **24/7 Support:** Live chat in hPanel
- **Node.js Documentation:** Tutorial in hPanel
- **phpPgAdmin:** Database management

---

**Start selling and managing your VAPEOLO business now!** 🚀💨