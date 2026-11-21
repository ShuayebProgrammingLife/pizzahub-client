# PizzaHub — Client

PizzaHub is a high-performance, role-based artisan pizza ordering and kitchen delivery platform built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **ShadCN UI**, and **Motion** (Framer Motion). It pairs with the Express/MongoDB backend to deliver an immersive pizza discovery experience for customers, a kitchen management portal for restaurant vendors, and an audit console for platform administrators.

---

## Live Links & Repositories

* **Live Client Application**: `https://pizzahub-client.vercel.app` *(Replace with your live deployment URL)*
* **Client GitHub Repository**: `https://github.com/ShuayebProgrammingLife/pizzahub-client`
* **Server GitHub Repository**: `https://github.com/ShuayebProgrammingLife/PizzaHub-Pizza-Ordering-Delivery-Platform`

---

## Features by User Role

### 1. Customer Experience
* **Artisan Catalog Discovery**: Browse handcrafted pizzas with instant search, category filtering, location filtering, and price ascending/descending sorting.
* **Guarded Item Details**: Viewing full recipe descriptions, multi-image galleries, and chef details automatically requires authentication (redirects smoothly to `/sign-in`).
* **Order Placement**: Order forms auto-detect customer, restaurant vendor, and selected item; specify delivery date, delivery address, and custom kitchen instructions.
* **Order Tracking & Timeline**: Live order status timeline (`Pending` → `Accepted` / `Rejected` / `Cancelled`) on order details modal with ability to cancel pending orders.
* **Customer Dashboard**: Overview telemetry cards, status charts, recent orders feed, and customer profile management.

### 2. Vendor Partner Portal
* **Live Overview Telemetry**: Total menu items, active count, pending requests, accepted count, and subscription tier tracker.
* **Item Management (CRUD)**: Create new pizzas with ImgBB multi-image file uploads, edit ingredients/pricing, toggle availability, and track admin approval status (`pending`, `approved`, `rejected`).
* **Free vs. Premium Quotas**: Free accounts are capped at 3 active items. Upgrading to Premium unlocks unlimited active menu items and a verified "Premium" badge.
* **Incoming Order Processing**: One-click accept or reject on incoming customer orders. Only pending orders can be modified, and vendors cannot touch other vendors' orders.
* **Stripe Subscription Checkout**: Direct session dispatch to Stripe Checkout for subscription upgrades, with verified payment confirmation polling.

### 3. Administrator Console
* **Platform Metrics**: Total registered accounts, vendors, customers, catalog submissions, pending approvals, and subscription revenue.
* **User Management**: Search by name or email, filter by role (`vendor`, `customer`, `admin`), inspect order/item history, and toggle user block status.
* **Catalog Moderation**: Review pending vendor submissions with full item specs, approve items to publish live, reject unsuitable items, or delete violations.
* **Transaction Ledger**: Read-only financial ledger tracking Stripe subscription sessions, amounts, customer identifiers, and verified webhook states.

### 4. Cross-Cutting Design & UX
* **"Molten Hearth" Aesthetic**: Brutalist cast-iron charcoal surfaces (`#121110`), glowing molten amber accents (`#FFA000`), charred tomato alerts (`#D32F2F`), and fresh basil green indicators (`#4E7E47`).
* **Dark / Light Mode**: Instant toggle with theme persistence in `localStorage` without theme flash on page reload.
* **Zero-Reload Flash State**: Authenticated sessions and route guards gracefully await hydration to prevent bouncing to login on page reloads.
* **Sonner Toast Notifications**: Accessible feedback for all user actions (no native browser `alert()` popups).

---

## Technology Stack (Client)

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | Server-side rendering, layout groups, and routing |
| **Language** | TypeScript 5 / React 19 | Static typing and modern component composition |
| **Styling** | Tailwind CSS v4, tw-animate-css | Responsive fluid layouts and utility styling |
| **UI Components** | ShadCN UI / @base-ui/react | Headless dialogs, dropdowns, sheets, and forms |
| **Animation** | Motion (`motion/react`) | Scroll-driven reveals, hero animations, and smooth transitions |
| **Authentication** | Better Auth Client | Session hooks, email/password, and Google OAuth |
| **Visualizations** | Recharts | Multi-status donut and telemetry charts |
| **Icons** | Lucide React | High-contrast vector iconography |
| **Toasts** | Sonner | Accessible, non-blocking toast notifications |

---

## Environment Variables

Create a `.env.local` file in the `pizzahub-client` root directory:

```env
# URL of your Express API Server
NEXT_PUBLIC_API_URL=http://localhost:5000

# Better Auth Configuration
BETTER_AUTH_SECRET=your_better_auth_secret_minimum_32_characters
BETTER_AUTH_URL=http://localhost:3000

# MongoDB Database Connection (for Better Auth adapter)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
DB_NAME=pizzahub

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret

# ImgBB API Key for Menu & Avatar File Uploads
NEXT_PUBLIC_IMGBB_KEY=your_imgbb_api_key
```

> **Security Note**: Never commit `.env` or `.env.local` to GitHub. The `.gitignore` file is configured to exclude all environment files.

---

## Local Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ShuayebProgrammingLife/pizzahub-client.git
   cd pizzahub-client
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   Copy `.env.example` to `.env.local` and fill in the values:
   ```bash
   cp .env.example .env.local
   ```

4. **Seed Administrator Account (Optional)**:
   ```bash
   npm run seed:admin
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Challenge Implementations

### Challenge 1: Advanced Search, Filtering, and Sorting
* **Query Parameters**: The client binds input controls directly to URL search parameters: `search`, `category`, `location`, `sort`, and `page`.
* **Debounced Search**: Search input utilizes a 400ms debounce hook to prevent excessive API requests.
* **Price Sorting**: Supports `price_asc` (Low to High), `price_desc` (High to Low), `newest`, and `featured` (prioritizing Premium vendors).

### Challenge 2: JWT Verification & Role-Based Middleware
* **Seamless Token Attachment**: The custom API client (`lib/api.ts`) retrieves the active Better Auth session token and injects it into every outgoing request as an `Authorization: Bearer <token>` header.
* **Server Verification Flow**: Protected requests pass through backend `verifyJWT` and `requireRole("admin" | "vendor" | "customer")` middleware. 401 Unauthorized or 403 Forbidden responses trigger redirect or error states.

### Challenge 3: Visual Polish & "Molten Hearth" Aesthetic
* Expressive typography with **Bricolage Grotesque** headlines paired with monospaced tabular **Space Grotesk** for kitchen timers and prices.
* Consistent warm color contrast adhering to WCAG accessibility contrast ratios.
* Mobile-responsive collapsible navigation sheets and dashboard sidebars.

---

## Submission Details

* **Admin Email**: `admin@pizzahub.com`
* **Admin Password**: `Admin1234!` *(Created securely via server seed)*
* **Test Stripe Card**: `4242 4242 4242 4242` (Any future expiration date, CVC `123`, ZIP `10001`)
