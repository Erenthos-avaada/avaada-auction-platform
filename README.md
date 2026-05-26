# Avaada Reverse Auction Platform

A cloud-based reverse auction platform for Avaada Group procurement.

## Tech Stack
- **Frontend + API:** Next.js 14 (App Router)
- **Database:** Neon PostgreSQL + Prisma ORM
- **Auth:** NextAuth.js (JWT)
- **File Storage:** Vercel Blob
- **Email:** Resend
- **Deployment:** Vercel
- **CI/CD:** GitHub Actions

## Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/Erenthos-avaada/avaada-auction-platform
cd avaada-auction-platform
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
```bash
cp .env.example .env.local
# Fill in your Neon DB URL, NextAuth secret, Vercel Blob token, Resend API key
```

### 4. Set up the database
```bash
npx prisma db push
npx prisma generate
```

### 5. Run locally
```bash
npm run dev
```

## Roles
| Role | Access |
|---|---|
| `ADMIN` | Manage vendors, users, all auctions |
| `PROCUREMENT` | Create & manage auctions, view all bids |
| `VENDOR` | View invited auctions, place bids |

## Development Phases
- **Phase 1:** Auth, Vendor registration & approval, Auction creation
- **Phase 2:** Bidding engine, Real-time updates, Auto-extend
- **Phase 3:** Dashboards, Notifications, Email alerts
- **Phase 4:** Document management, Reports, Vendor management
