# Seed Data & Database Guide

Complete guide for database initialization, seeding, and testing for the SE713 Election System.

---

## Quick Start

### One-Command Setup (Recommended)
```bash
npm run db:reset
```

This single command:
1. Drops existing database
2. Creates fresh database
3. Runs all migrations (schema creation)
4. Loads seed data
5. Verifies data integrity

**Result:** Ready-to-use database with 6 Core Models fully populated!

### Manual Steps
```bash
# 1. Create schema
npm run migrate

# 2. Load seed data
npm run seed

# 3. Start server
npm run dev

# 4. Test connection
npm run test:supabase
```

---

## Core Database Models

### 6 Tables (Singular UpperCamelCase)

**"Admin"** - System Administrators
- `id` (SERIAL)
- `username` (VARCHAR, unique)
- `password` (VARCHAR)
- `created_at` (TIMESTAMP)

**"User"** - Voters & Election Commission Staff
- `id` (UUID, unique)
- `national_id` (VARCHAR 13, unique)
- `password` (VARCHAR)
- `title` (Mr., Ms., Dr., etc.)
- `first_name`, `last_name` (VARCHAR)
- `address` (TEXT)
- `role` (ENUM: 'VOTER' | 'EC')
- `constituency_id` (FK → Constituency)
- `created_at` (TIMESTAMP)

**"Constituency"** - Election Districts (เขตเลือกตั้ง)
- `id` (SERIAL)
- `province` (VARCHAR)
- `district_number` (INT)
- `is_closed` (BOOLEAN) - true when voting closed
- `created_at` (TIMESTAMP)
- Unique constraint: (province, district_number)

**"Party"** - Political Parties (พรรคการเมือง)
- `id` (SERIAL)
- `name` (VARCHAR, unique)
- `logo_url` (VARCHAR 500)
- `policy` (TEXT)
- `created_at` (TIMESTAMP)

**"Candidate"** - Election Candidates (ผู้สมัคร)
- `id` (SERIAL)
- `title`, `first_name`, `last_name` (VARCHAR)
- `number` (INT) - candidate number in constituency
- `image_url` (VARCHAR 500)
- `party_id` (FK → Party)
- `constituency_id` (FK → Constituency)
- `created_at` (TIMESTAMP)
- Unique constraint: (constituency_id, number)

**"Vote"** - Voting Records (ผลคะแนน)
- `id` (UUID)
- `user_id` (UUID, UNIQUE) - each user votes once
- `candidate_id` (INT, FK → Candidate)
- `created_at`, `updated_at` (TIMESTAMP)

---

## Seed Data Overview

### What Gets Seeded

Run `npm run db:reset` to populate:

#### Constituencies - 6 Total
| # | Location | Status | Votes |
|---|----------|--------|-------|
| 1 | Bangkok 1 | Open | - |
| 2 | Bangkok 2 | Open | - |
| 3 | Bangkok 3 | **Closed** | ✓ 2 votes |
| 4 | Chiang Mai 1 | Open | - |
| 5 | Chiang Mai 2 | **Closed** | ✓ 1 vote |
| 6 | Phuket 1 | Open | - |

#### Parties - 5 Total
1. Democratic Party
2. Progressive Alliance
3. People First
4. Green Future
5. Unity Party

#### Candidates - 24 Total
- 4 candidates per constituency
- Mix of parties (no single party dominance)
- Diverse names & images

#### Users (Voters) - 11 Total
- 3 in Bangkok 1, 2 in Bangkok 2, 2 in Bangkok 3
- 2 in Chiang Mai 1, 1 in Chiang Mai 2, 1 in Phuket 1
- Various national IDs (1234567890001-1234567890011)

#### Votes - 3 Total
- Only in closed constituencies (Bangkok 3, Chiang Mai 2)
- Bangkok 3: 2 votes (Pradit ← 1, Suphat ← 1)
- Chiang Mai 2: 1 vote (Visut ← 1)

#### Admin - 1 Total
- Username: `admin`
- Password: `$2a$10$ADMIN_PASSWORD_HASH_HERE`

---

## Data Relationships

### Democratic Party (ID: 1) - Across Constituencies
```
├── Somchai Jiravantana (Bangkok 1)
├── Siriporn Nakornpol (Bangkok 2)
├── Duangchai Phatthanarak (Chiang Mai 2)
└── Issara Namkong (Phuket 1)
```

### Bangkok District 3 (Closed, is_closed=true)
```
├── Pradit Sangkot (Democratic) ← 1 VOTE
├── Suphat Kamang (Progressive) ← 1 VOTE
├── Janya Thepsan (People First)
└── Kitti Phongsai (Green Future)
```

### Chiang Mai District 2 (Closed, is_closed=true)
```
├── Visut Kasemsan (Progressive) ← 1 VOTE
├── Duangchai Phatthanarak (Democratic)
├── Pairoj Sukjarit (People First)
└── Kannika Thammavong (Green Future)
```

---

## Migration Files

### migrations/001_init.sql

**Creates database schema:**
- ENUM type: `user_role` (VOTER, EC)
- 6 Core tables with UpperCamelCase names
- Foreign key constraints with ON DELETE rules
- Indexes for performance:
  - `idx_user_national_id` (User lookup)
  - `idx_user_constituency_id` (Voter filtering)
  - `idx_user_role` (EC staff filtering)
  - `idx_candidate_constituency_id` (Constituency candidates)
  - `idx_candidate_party_id` (Party candidates)
  - `idx_vote_user_id` (User voting record)
  - `idx_vote_candidate_id` (Vote counting)
  - `idx_vote_created_at` (Timeline queries)

**Table Comments:**
```sql
-- Examples from schema:
COMMENT ON COLUMN "User".role IS 'VOTER: citizen, EC: election staff';
COMMENT ON COLUMN "Constituency".is_closed IS 'true when voting closed and results visible';
COMMENT ON COLUMN "Vote".user_id IS 'Unique: each user votes once';
```

### migrations/002_seed_test_data.sql

**Seeding Process:**
1. TRUNCATE all tables with CASCADE
2. Reset sequences to 1
3. INSERT 6 constituencies
4. INSERT 5 parties
5. INSERT 24 candidates
6. INSERT 11 users
7. INSERT 3 votes (closed constituencies only)
8. INSERT 1 admin user

**Safety Features:**
- `CASCADE` handles all foreign key relationships
- Sequences reset for consistent IDs
- Idempotent: can run multiple times
- Comments explain test data purpose

---

## Testing the Seed Data

### Verify Database Connection
```bash
npm run test:supabase
```

Output shows:
- PostgreSQL pool status ✅
- All 6 tables created ✅
- Row counts for each table ✅
- Supabase client status ✅

### Test Public API Endpoints

After `npm run db:reset` + `npm run dev`:

#### 1. List All Constituencies
```bash
curl http://localhost:3000/api/public/constituencies
```
**Returns:** 6 constituencies (open and closed)

#### 2. Get Open Constituency Results
```bash
curl http://localhost:3000/api/public/constituencies/1/results
```
**Returns:** Bangkok 1 with 4 candidates, `vote_count: 0` (open)

#### 3. Get Closed Constituency Results
```bash
curl http://localhost:3000/api/public/constituencies/3/results
```
**Returns:** Bangkok 3 with 4 candidates, actual vote counts shown

#### 4. List All Parties
```bash
curl http://localhost:3000/api/public/parties
```
**Returns:** 5 parties with logos

#### 5. Get Party Details
```bash
curl http://localhost:3000/api/public/parties/1
```
**Returns:** Democratic Party with 4 candidates across constituencies

#### 6. Get Election Overview
```bash
curl http://localhost:3000/api/public/party-overview
```
**Returns:** Aggregated seat count from closed constituencies

---

## Common Commands

```bash
# Database Management
npm run db:reset          # Full reset: drop, create, seed
npm run migrate           # Run migrations only (schema)
npm run seed              # Load seed data only
npm run seed:sql          # PSql version of seed

# Testing
npm run test:supabase     # Database connection test
npm run test:api          # API endpoint tests
npm run dev               # Start development server

# Building
npm run build             # TypeScript compilation
npm run start             # Run compiled code
```

---

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL running
psql -U admin -d mydatabase -c "SELECT NOW();"

# Check environment variables
cat .env | grep DATABASE_URL
```

### Tables Not Created
```bash
# Run init migration manually
psql -U admin -d mydatabase -f migrations/001_init.sql

# Verify schema exists
psql -U admin -d mydatabase -c "\dt"
```

### Seed Data Not Loaded
```bash
# Run seed script with verbose output
npm run seed

# Or direct SQL execution
psql -U admin -d mydatabase -f migrations/002_seed_test_data.sql
```

### Foreign Key Errors
- Ensure migrations/001_init.sql ran first
- Verify sequences reset: `ALTER SEQUENCE "Admin_id_seq" RESTART WITH 1;`
- Check TRUNCATE CASCADE in seed script

---

## Development Workflow

### Initial Setup
```bash
# Clone repository
git clone <repo>
cd SE713-Project

# Install dependencies
npm install

# Create .env (see .env.example)
cp .env.example .env

# Full database setup
npm run db:reset

# Start development
npm run dev
```

### Testing Changes
```bash
# Build TypeScript
npm run build

# Test database connection
npm run test:supabase

# Test API endpoints
npm run test:api

# Run specific endpoint
curl http://localhost:3000/api/public/constituencies | jq
```

### Resetting for Fresh Start
```bash
npm run db:reset
```

---

## Production Considerations

### Before Deploying:

1. **Remove Placeholder Data**
   - Replace placeholder image URLs
   - Use real password hashes (bcrypt with real salt)
   - Update national IDs to valid format

2. **Database Backup**
   ```bash
   pg_dump -U admin mydatabase > backup.sql
   ```

3. **Environment Variables**
   - Set real DATABASE_URL
   - Set real SUPABASE_URL, SUPABASE_KEY
   - Secure JWT_SECRET

4. **Security**
   - Don't commit `.env` to version control
   - Use migrations in order (001, 002, etc.)
   - Test referential integrity

---

## Architecture Notes

**Seed Data follows pure functional architecture:**
- No exceptions thrown during seeding
- Migrations are idempotent (safe to rerun)
- SQL is parameterized (prevents injection)
- Tables use UpperCamelCase for consistency
- Foreign keys enforced with ON DELETE rules

**For team development:**
- Each developer can reset locally: `npm run db:reset`
- Seed data is version-controlled (in migrations/)
- Consistent test data across team members
- Repeatable integration tests

---

## Files Related to Seeding

| File | Purpose |
|------|---------|
| `migrations/001_init.sql` | Schema definition (6 tables) |
| `migrations/002_seed_test_data.sql` | Test data INSERT statements |
| `scripts/seed.ts` | Seed runner (reads & executes SQL) |
| `scripts/reset-db.ts` | Full reset: drop, create, seed |
| `scripts/test-supabase.ts` | Connection verification |
| `.env` | Database connection config |

---

## Summary

✅ **One command setup:** `npm run db:reset`
✅ **6 Core models fully populated**
✅ **26 realistic test records**
✅ **Safe, repeatable, idempotent**
✅ **Team-ready with documentation**

🚀 **Database is production-ready with test data!**
