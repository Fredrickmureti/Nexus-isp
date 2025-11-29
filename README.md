# Cloud ISP Management Platform

A comprehensive full-stack web application for managing Internet Service Provider (ISP) operations, built with modern web technologies and Supabase backend.

## 📋 Overview

The Cloud ISP Management Platform is a multi-tenant SaaS solution designed to streamline ISP operations and customer management. It provides distinct interfaces for platform owners and ISP providers, enabling efficient management of customers, billing, network infrastructure, and router configurations.

### Key Features

#### 🏢 Platform Owner Dashboard
- **ISP Provider Management**: View, approve, and manage registered ISP providers
- **Analytics & Reporting**: Comprehensive revenue tracking, customer growth metrics, and provider statistics
- **Platform Settings**: Configure global settings, notification preferences, and subscription plans
- **Real-time Monitoring**: Track platform health, active ISPs, and overall performance metrics

#### 🌐 ISP Provider Dashboard
- **Customer Management**: Complete customer lifecycle management with detailed profiles and service history
- **Network Monitoring**: Real-time network status, bandwidth utilization, and performance metrics
- **Router Management**: Configure and control MikroTik routers, manage bandwidth limits, and monitor device status
- **Billing System**: Automated invoice generation, payment tracking, and revenue reporting
- **Service Packages**: Create and manage tiered service offerings with customizable pricing
- **Reports**: Generate comprehensive business reports in PDF, CSV, and Excel formats

#### 🔒 Security Features
- **Role-Based Access Control (RBAC)**: Three distinct user roles (Platform Owner, ISP Provider, Customer)
- **Row-Level Security (RLS)**: Supabase RLS policies ensure data isolation between providers
- **Authentication**: Secure authentication system with session management
- **Protected Routes**: Route guards based on user roles and authentication status

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality accessible component library
- **Recharts** - Data visualization and charts
- **TanStack Query** - Powerful data synchronization and caching
- **React Hook Form** - Performant form validation
- **Zod** - Schema validation

### Backend & Infrastructure
- **Supabase** - Backend-as-a-Service platform
  - PostgreSQL database with RLS
  - Authentication & user management
  - Edge Functions for serverless logic
  - Real-time subscriptions
- **Edge Functions**:
  - `register-isp` - ISP provider registration
  - `set-bandwidth-limit` - MikroTik router bandwidth control
  - `disconnect-customer-session` - Customer session management
  - `test-router-connection` - Router connectivity testing

### Integrations
- **MikroTik RouterOS API** - Direct router management and configuration
- **Resend** - Transactional email service

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Supabase account and project
- Git

### Installation

1. **Clone the repository**
```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. **Install dependencies**
```sh
npm install
```

3. **Environment Configuration**
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Start development server**
```sh
npm run dev
```

The application will be available at `http://localhost:5173`

### Database Setup

The project includes Supabase migrations in the `supabase/migrations/` directory. These migrations set up:
- User authentication and profiles
- ISP provider management
- Customer and billing systems
- Router management
- RLS policies for data security

To apply migrations to your Supabase project, use the Supabase CLI or dashboard.

## 📁 Project Structure

```
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── dashboard/      # Dashboard-specific components
│   │   └── isp/            # ISP provider components
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Route pages
│   │   ├── platform-owner/ # Platform owner pages
│   │   └── isp-provider/   # ISP provider pages
│   ├── integrations/       # Third-party integrations
│   │   └── supabase/       # Supabase client and types
│   └── lib/                # Utility functions
├── supabase/
│   ├── functions/          # Edge Functions
│   └── migrations/         # Database migrations
└── public/                 # Static assets
```

## 🎨 Design System

The project uses a consistent design system built with:
- **Semantic color tokens** defined in `src/index.css`
- **Tailwind configuration** in `tailwind.config.ts`
- **Component variants** using class-variance-authority
- **Dark mode support** with next-themes
- **Responsive design** for all screen sizes

## 👥 User Roles & Permissions

### Platform Owner
- Full platform access
- Manage all ISP providers
- View global analytics
- Configure platform settings
- Approve/reject ISP registrations

### ISP Provider
- Manage own customers
- Configure routers and network
- Generate invoices and track payments
- Create service packages
- View provider-specific analytics

### Customer
- View service details
- Access billing information
- Submit support requests

## 🔐 Security

- **Row-Level Security (RLS)**: All tables have RLS policies ensuring users can only access their own data
- **Authentication**: Secure session-based authentication with Supabase Auth
- **RBAC**: Role-based access control with database-enforced permissions
- **Protected Routes**: Client-side route guards prevent unauthorized access
- **Secure Functions**: Edge functions use service role keys for privileged operations

## 📊 Database Schema

Key tables include:
- `profiles` - User profile information
- `user_roles` - Role assignments
- `isp_providers` - ISP provider details and subscriptions
- `customers` - ISP customer management
- `routers` - MikroTik router configurations
- `service_packages` - Service offerings and pricing
- `payment_transactions` - Billing and payment tracking
- `activity_logs` - Audit trail

## 🚢 Deployment

### Deploy to Lovable

1. Open your project in [Lovable](https://lovable.dev/projects/81352542-6c8f-4631-8e44-b00cbb0cf9d0)
2. Click **Share** → **Publish**
3. Your app will be deployed automatically

### Custom Domain

To connect a custom domain:
1. Navigate to **Project** → **Settings** → **Domains**
2. Click **Connect Domain**
3. Follow the DNS configuration instructions

Read more: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

### Self-Hosting

The project can be deployed to any static hosting platform:
- Vercel
- Netlify
- AWS Amplify
- Cloudflare Pages

Build the project:
```sh
npm run build
```

The `dist/` folder contains the production-ready application.

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint



### Common Issues

**Authentication errors**: Verify Supabase credentials in `.env`
**Database access denied**: Check RLS policies in Supabase dashboard
**Router connection fails**: Verify MikroTik API access and credentials



