## 🚀 Setup Instructions for Team Members

After cloning, team should run:

```bash
# 1. Install dependencies
npm install

# 2. Create .env file with database credentials
cat > .env << EOF
DATABASE_URL=postgresql://admin:password@localhost:5432/mydatabase
JWT_SECRET=your-secret-key-here
NODE_ENV=development
PORT=3000
EOF

# 3. Initialize database
npm run migrate

# 4. Populate test data
npm run seed

# 5. Start development
npm run dev
```
## Quick Start

### One-Command Setup (Recommended)
for resetting the database, seeding data, and starting the development server, run:
```bash
npm run db:reset
```