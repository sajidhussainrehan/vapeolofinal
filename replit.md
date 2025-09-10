# Overview

VAPEOLO is a comprehensive e-commerce platform for LAVIE vape products featuring a modern React frontend with an Express.js backend. The application serves as both a customer-facing store and an administrative dashboard for managing products, affiliates, and sales. The platform emphasizes a dark, neon-purple aesthetic inspired by modern youth culture and gaming aesthetics, targeting young adults with high-quality vaping products.

The system supports multiple user types including customers browsing products, potential affiliates applying for partnerships, and administrators managing the entire operation. The application handles product catalogs with multiple variants (CYBER, CUBE, ENERGY, TORCH, BAR models), affiliate program management with different tier levels, contact forms, and comprehensive admin controls.

# Recent Changes

**Shopping Cart System Implementation (September 2025):**
- Complete e-commerce shopping cart functionality implemented
- CartContext provides global state management for cart items, quantities, and totals
- CartModal component displays cart contents with quantity controls and checkout
- Header integration shows cart icon with item count badge
- ProductStore integration allows adding products to cart
- WhatsApp checkout integration for order processing
- Professional dark theme design with purple/blue gradients
- Full testing completed - cart functionality working end-to-end

**Previous Updates:**
- Complete website built with modern futuristic design using neon colors (purple, blue, black) and VAPEOLO branding
- PostgreSQL database configured with tables for admin users, affiliates, products, sales, and contact messages
- Backend APIs implemented for all CRUD operations and frontend forms successfully connected to backend
- Admin dashboard created with authentication, statistics display, and management interfaces

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client application uses a modern React stack built with Vite for optimal development and build performance. The UI is constructed using shadcn/ui components with Radix UI primitives, providing a consistent and accessible component library. The design system leverages Tailwind CSS with custom color schemes including neon purple, blue, and green accents for the LAVIE brand identity.

**State Management**: React Query (TanStack Query) handles server state management, caching, and API synchronization. Local component state uses React hooks for form handling and UI interactions.

**Routing**: Wouter provides lightweight client-side routing with support for admin panel routes and public pages.

**Styling**: Custom Tailwind configuration with brand-specific colors, gradients, and spacing. The design follows a dark theme with neon accents and glassmorphism effects.

## Backend Architecture
The server uses Express.js with TypeScript, providing RESTful API endpoints for frontend consumption. The architecture follows a modular approach with separated concerns for routing, storage, and database operations.

**API Structure**: Organized endpoints for public operations (product viewing, affiliate applications, contact forms) and protected admin operations (user management, affiliate approval, product management). Basic authentication middleware protects administrative routes.

**Storage Layer**: Abstracted storage interface providing methods for all database operations including CRUD operations for users, affiliates, products, sales, and contact messages.

**Error Handling**: Centralized error handling with proper HTTP status codes and JSON error responses.

## Data Storage Solutions
**Database**: PostgreSQL via Neon serverless with Drizzle ORM for type-safe database operations. The schema includes tables for users (admins), affiliates with approval workflow, products with multiple variants, sales tracking, and contact message management.

**Schema Design**: 
- Users table for admin authentication
- Affiliates table with status tracking (pending/approved/rejected) and tier levels
- Products table with flexible sabores array and pricing
- Sales table linking affiliates to products with commission tracking
- Contact messages table for customer inquiries

**Migration System**: Drizzle Kit handles database migrations and schema changes with version control.

## Authentication and Authorization
**Admin Authentication**: Basic HTTP authentication for admin panel access with session storage in localStorage. Admin users can manage all aspects of the platform including affiliate approvals and product management.

**Public Access**: No authentication required for customers browsing products or submitting affiliate applications and contact forms.

**Security**: Environment-based database connection strings and basic auth validation for protected routes.

## External Dependencies

### UI and Component Libraries
- **shadcn/ui with Radix UI**: Complete component library for forms, dialogs, navigation, and data display
- **Tailwind CSS**: Utility-first styling with custom brand configuration
- **Lucide React**: Icon library for consistent iconography
- **React Hook Form**: Form state management and validation

### Database and Backend Services
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle ORM**: Type-safe database operations and migrations
- **Express.js**: Web server framework with middleware support

### Development and Build Tools
- **Vite**: Fast development server and build tool with HMR
- **TypeScript**: Type safety across frontend and backend
- **React Query**: Server state management and caching
- **Wouter**: Lightweight routing solution

### Additional Libraries
- **date-fns**: Date manipulation and formatting
- **clsx/tailwind-merge**: Conditional CSS class handling
- **Embla Carousel**: Product image carousels (configured but not fully implemented)
- **class-variance-authority**: Component variant management