<div align="center">
  <h1>🚀 ME Webapp - Sales & Inventory Management</h1>
  
  <p>
    <strong>A premium, full-scale business management suite designed to centralize and simplify your company's operations.</strong>
  </p>

  [![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase)](https://supabase.com/)

  ![Dashboard Preview](https://raw.githubusercontent.com/Sufiyan-Shiraj/me-webapp/main/public/placeholder.png)
</div>

---

## 📖 Overview

The **ME Webapp** replaces scattered spreadsheets and manual tracking by combining Point of Sale (POS) features, deep inventory management, customer tracking, and real-time analytics into one beautiful, lightning-fast web application. Built to run the daily operations of a modern retail, wholesale, or distribution business.

---

## ✨ Key Features

### 📊 Dashboard & Analytics
The nerve center of the webapp. As soon as you log in, you are greeted with a high-level overview of your business health.
- **Real-Time Metrics:** Instantly see Total Sales, Total Orders, Active Customers, and Total Inventory Valuation.
- **Interactive Charts:** Dive into visual graphs powered by *Recharts* to spot trends over time (e.g., Sales per month, Top selling categories).
- **Low Stock Alerts:** The dashboard automatically flags items that are running dangerously low on stock so you can reorder immediately.

### 📦 Advanced Inventory Management
Stop guessing what you have in the back room. The Inventory module tracks every single item you sell.
- **Categorization:** Organize items by types/categories (e.g., Electronics, Clothing, Spares).
- **Stock Tracking:** Track the exact quantity, cost price, and selling price of every SKU.
- **Dynamic Updates:** Whenever a sale is made, the inventory is automatically deducted. When new stock arrives, you simply update the quantity and your valuation adjusts instantly.

### 🛒 Sales & Order Processing
The core engine of your business revenue. This module lets you act as a digital cashier and order fulfillment center.
- **Create Orders:** Select a customer, pick items from your live inventory, set quantities, and the system instantly calculates the total bill.
- **Stock Validation:** The webapp prevents you from selling items you don't have, ensuring your inventory never goes negative.
- **Order History:** A complete, searchable ledger of every transaction ever made, including who bought what, when, and for how much.

### 👥 Customer & Place Management
Keep your Rolodex fully digitized.
- **Customer Profiles:** Store contact details, purchase histories, and associate them with specific "Places".
- **Place Management:** Perfect for businesses that operate in multiple territories, letting you categorize sales by location.

### 🔐 User Roles & Security
- **Secure Authentication:** Military-grade login system powered by Supabase.
- **Access Control:** Manage which of your staff can log into the system. You can easily revoke access for former employees.

### 💾 Settings: Backup & Restore
Data is the lifeblood of your business. The Webapp includes a custom-built, highly secure database backup wizard.
- **One-Click Snapshots:** Download your entire business history (customers, orders, inventory, sales) into a single `.json` file.
- **Intelligent Diff Viewer:** Mathematically compares your backup file to the live database and shows you exactly how many items will be Added, Modified, or Deleted in a beautiful tabbed browser before restoring.
- **Admin Password Protection:** Destructive actions like restoring a database are locked behind a master "Admin Restore Password".

---

## 🛠️ Tech Stack & Libraries

### Core
- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **UI Library:** React 19
- **Styling:** Tailwind CSS, PostCSS, and Vanilla CSS Modules

### Backend & State
- **Database & Authentication:** [Supabase](https://supabase.com/)
- **Data Fetching:** [SWR](https://swr.vercel.app/) (stale-while-revalidate for real-time UI)

### UI & Utilities
- **Data Visualization:** [Recharts](https://recharts.org/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** Lucide React
- **Utilities:** `clsx`, `tailwind-merge`, `date-fns`, `xlsx` (Excel exports), `ua-parser-js`, `jose`

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or above recommended)
- A [Supabase](https://supabase.com/) account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sufiyan-Shiraj/me-webapp.git
   cd me-webapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Copy `.env.example` to `.env` (or create a `.env.local` file) and populate your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the app**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Structure

```text
sales-and-inventory/
├── app/                  # Next.js App Router
│   ├── (auth)/           # Authentication pages (login, signup)
│   ├── (dashboard)/      # Main app (analytics, inventory, orders, sales, users)
│   ├── api/              # Backend API routes
│   └── actions/          # Next.js Server Actions
├── components/           # Reusable UI components (Tailwind + CSS Modules)
├── context/              # React context providers for global state
├── lib/                  # Shared utility functions and database clients
├── config/               # Application configuration
└── public/               # Static assets (images, fonts)
```

---

<div align="center">
  <i>Built to bring enterprise-level management to modern businesses.</i>
</div>
