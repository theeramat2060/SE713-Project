# SE713 Election System - Complete Endpoint Summary

## 📊 Overview

**Total Endpoints: 9 (Active)**
- Auth: 4 endpoints
- Public API: 5 endpoints
- Vote: 0 endpoints (Phase 9 - Not started)
- Admin: 0 endpoints (Phase 10 - Not started)
- EC Staff: 0 endpoints (Phase 11 - Not started)

**Base URL:** `http://localhost:3000/api`

---

## 🔐 Authentication Module (4 Endpoints)

### 1. User Registration
```
POST /api/auth/register
```
**Purpose:** Register a new user (voter)

**Request Body:**
```json
{
  "nationalId": "1234567890001",
  "password": "password123",
  "title": "Mr",
  "firstName": "John",
  "lastName": "Doe",
  "address": "123 Main St",
  "role": "VOTER",
  "constituencyId": 1
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": "1",
    "nationalId": "1234567890001",
    "title": "Mr",
    "firstName": "John",
    "lastName": "Doe",
    "role": "VOTER"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "User already exists"
}
```

**Status Codes:**
- 201: User registered successfully
- 400: Invalid input
- 409: User already exists
- 500: Server error

**Validation:**
- National ID: Must be unique, format validated
- Password: Minimum length required
- First/Last Name: Required, non-empty
- Constituency ID: Must exist in database
- Role: Default is "VOTER", can be "EC" or "ADMIN"

---

### 2. User Login
```
POST /api/auth/login
```
**Purpose:** Authenticate user and receive JWT token

**Request Body:**
```json
{
  "nationalId": "1234567890001",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": "1",
    "nationalId": "1234567890001",
    "title": "Mr",
    "firstName": "John",
    "lastName": "Doe",
    "role": "VOTER"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

**Status Codes:**
- 200: Login successful
- 400: Invalid input
- 401: Invalid credentials
- 500: Server error

**Token Details:**
- Format: JWT (JSON Web Token)
- Payload contains: user ID, role
- Expires: Based on tokenService configuration

---

### 3. Admin Registration
```
POST /api/auth/admin/register
```
**Purpose:** Register a new admin user

**Request Body:**
```json
{
  "username": "admin_user",
  "password": "secure_password_123"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "admin": {
    "id": 1,
    "username": "admin_user"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Admin already exists"
}
```

**Status Codes:**
- 201: Admin registered successfully
- 400: Invalid input
- 409: Admin already exists
- 500: Server error

**Validation:**
- Username: Must be unique, 3-50 characters
- Password: Minimum 8 characters required

---

### 4. Admin Login
```
POST /api/auth/admin/login
```
**Purpose:** Authenticate admin and receive JWT token

**Request Body:**
```json
{
  "username": "admin_user",
  "password": "secure_password_123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "admin": {
    "id": 1,
    "username": "admin_user"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

**Status Codes:**
- 200: Login successful
- 400: Invalid input
- 401: Invalid credentials
- 500: Server error

---

## 🌐 Public API Module (5 Endpoints)

### 5. Get All Constituencies
```
GET /api/public/constituencies
```
**Purpose:** List all constituencies (no auth required)

**Request Parameters:** None

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Bangkok 1",
      "province": "Bangkok",
      "status": "OPEN"
    },
    {
      "id": 2,
      "name": "Bangkok 2",
      "province": "Bangkok",
      "status": "CLOSED"
    }
  ]
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Unable to fetch constituencies"
}
```

**Status Codes:**
- 200: Success
- 500: Server error

**Data Returned:**
- ID: Constituency identifier
- Name: Constituency name
- Province: Which province
- Status: OPEN or CLOSED (voting status)

---

### 6. Get Constituency Results
```
GET /api/public/constituencies/:id/results
```
**Purpose:** Get voting results for a specific constituency

**Request Parameters:**
- `id` (path): Constituency ID (integer)

**Example:** `GET /api/public/constituencies/1/results`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "constituencyId": 1,
    "constituencyName": "Bangkok 3",
    "totalVotes": 150,
    "candidates": [
      {
        "id": 5,
        "name": "Alice Johnson",
        "party": "Progressive Party",
        "partyId": 2,
        "votes": 60,
        "percentage": 40.0
      },
      {
        "id": 6,
        "name": "Bob Smith",
        "party": "Democratic Party",
        "partyId": 1,
        "votes": 50,
        "percentage": 33.33
      }
    ]
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Invalid constituency ID"
}
```

**Status Codes:**
- 200: Success
- 400: Invalid ID format
- 404: Constituency not found
- 500: Server error

**Data Details:**
- Total votes cast in constituency
- List of all candidates with vote counts
- Vote percentages calculated
- Sorted by votes (highest first)

---

### 7. Get All Parties
```
GET /api/public/parties
```
**Purpose:** List all parties (no auth required)

**Request Parameters:** None

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Democratic Party",
      "logoUrl": "https://example.com/logo1.png",
      "founded": 1995,
      "headquarter": "Bangkok"
    },
    {
      "id": 2,
      "name": "Progressive Party",
      "logoUrl": "https://example.com/logo2.png",
      "founded": 2000,
      "headquarter": "Chiang Mai"
    }
  ]
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Unable to fetch parties"
}
```

**Status Codes:**
- 200: Success
- 500: Server error

**Data Returned:**
- Party ID
- Party name
- Logo URL
- Year founded
- Headquarter location

---

### 8. Get Party Details
```
GET /api/public/parties/:id
```
**Purpose:** Get details for a specific party including candidates

**Request Parameters:**
- `id` (path): Party ID (integer)

**Example:** `GET /api/public/parties/1`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Democratic Party",
    "logoUrl": "https://example.com/logo1.png",
    "founded": 1995,
    "headquarter": "Bangkok",
    "candidates": [
      {
        "id": 1,
        "name": "John Smith",
        "constituencyId": 1,
        "constituencyName": "Bangkok 1"
      },
      {
        "id": 3,
        "name": "Jane Doe",
        "constituencyId": 2,
        "constituencyName": "Bangkok 2"
      }
    ]
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Invalid party ID"
}
```

**Status Codes:**
- 200: Success
- 400: Invalid ID format
- 404: Party not found
- 500: Server error

**Data Details:**
- Party information
- All candidates from that party
- Which constituency each candidate is in

---

### 9. Get Party Overview
```
GET /api/public/party-overview
```
**Purpose:** Get aggregated party statistics with seat distribution

**Request Parameters:** None

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Democratic Party",
      "logoUrl": "https://example.com/logo1.png",
      "seats": 15
    },
    {
      "id": 2,
      "name": "Progressive Party",
      "logoUrl": "https://example.com/logo2.png",
      "seats": 12
    },
    {
      "id": 3,
      "name": "Peoples Coalition",
      "logoUrl": "https://example.com/logo3.png",
      "seats": 8
    }
  ]
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Unable to calculate overview"
}
```

**Status Codes:**
- 200: Success
- 500: Server error

**Data Details:**
- Each party's information
- Number of seats won (seats = won candidates count)
- Sorted by seats (highest first)
- Calculated from current voting results

---

## 🔧 System Endpoints (Not REST)

### Health Check
```
GET /start
```
**Purpose:** Check if server is running

**Response:**
```json
{
  "status": "ok"
}
```

**Status Codes:**
- 200: Server is running

---

## 📝 Database Structure

### Tables Referenced by Endpoints:

**User Table:**
- User registration & login
- Fields: id, national_id, password_hash, title, first_name, last_name, address, role, constituency_id

**Admin Table:**
- Admin registration & login
- Fields: id, username, password_hash

**Constituency Table:**
- Get constituencies
- Get constituency results
- Fields: id, name, province, status

**Party Table:**
- Get parties
- Get party details
- Get party overview
- Fields: id, name, logo_url, founded, headquarter

**Candidate Table:**
- Get party details
- Get constituency results
- Fields: id, name, party_id, constituency_id

**Vote Table:**
- Get constituency results
- Get party overview (seat calculation)
- Fields: id, user_id, candidate_id, constituency_id, timestamp

---

## 🔑 Authentication & Authorization

### Currently Implemented:
- ✅ User registration with validation
- ✅ User login with JWT token
- ✅ Admin registration
- ✅ Admin login with JWT token
- ✅ Public endpoints (no auth required)
- ✅ Wrapper functions for protected endpoints (withAuth, withUserRole, withAdmin)

### Not Yet Implemented:
- Token verification middleware on protected endpoints
- Role-based access control on protected endpoints
- Rate limiting (removed for MVP)
- Audit logging (removed for MVP)

---

## 📊 Phase Roadmap

### ✅ Phase 1-8: COMPLETE
- Auth module (4 endpoints)
- Public API (5 endpoints)
- Database schema
- Error handling
- Infrastructure

### 🔄 Phase 9: VOTING MODULE (Waiting)
**Planned Endpoints:**
- POST /api/vote/cast - Cast a vote
- GET /api/vote/my-votes - Get user's votes
- GET /api/vote/results - Get voting results
- POST /api/vote/validate - Validate vote
- GET /api/vote/statistics - Get vote statistics

### 📋 Phase 10: ADMIN MODULE (Queued)
**Planned Endpoints:**
- GET /api/admin/users - List users
- GET /api/admin/statistics - System statistics
- POST /api/admin/constituency/status - Update status
- DELETE /api/admin/users/:id - Remove user
- GET /api/admin/audit-log - View audit log

### 📋 Phase 11: EC STAFF MODULE (Queued)
**Planned Endpoints:**
- POST /api/ec/close-voting/:id - Close voting
- GET /api/ec/open-constituencies - List open constituencies
- POST /api/ec/declare-results/:id - Declare results
- GET /api/ec/reports - Generate reports

---

## 🧪 Testing Endpoints

### Using curl:

**User Registration:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nationalId": "1234567890001",
    "password": "password123",
    "title": "Mr",
    "firstName": "John",
    "lastName": "Doe",
    "address": "123 Main St",
    "constituencyId": 1
  }'
```

**User Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "nationalId": "1234567890001",
    "password": "password123"
  }'
```

**Get Constituencies:**
```bash
curl http://localhost:3000/api/public/constituencies
```

**Get Constituency Results:**
```bash
curl http://localhost:3000/api/public/constituencies/1/results
```

**Get Parties:**
```bash
curl http://localhost:3000/api/public/parties
```

**Get Party Details:**
```bash
curl http://localhost:3000/api/public/parties/1
```

**Get Party Overview:**
```bash
curl http://localhost:3000/api/public/party-overview
```

---

## 📈 Request/Response Flow

```
CLIENT REQUEST
    ↓
VALIDATION MIDDLEWARE (if applicable)
    ↓
CONTROLLER
    ↓
SERVICE (Business Logic)
    ↓
REPOSITORY (Database Query)
    ↓
RESPONSE FORMATTER
    ↓
CLIENT RESPONSE (JSON)
```

---

## ⚡ Key Technical Details

### Error Handling:
- All errors return JSON with `success: false`
- Standard error format: `{success, error}`
- HTTP status codes follow REST conventions

### Data Validation:
- Input validation in middleware
- Type checking in controllers
- Database constraints enforced

### Response Format:
- Standard wrapper: `{success: boolean, data?: T, error?: string}`
- Consistent across all endpoints
- Type-safe in TypeScript

### Database:
- PostgreSQL via Supabase
- 6 tables: Admin, User, Party, Candidate, Constituency, Vote
- All table names singular with UpperCamelCase

---

## 🚀 Deployment Ready

**Build Status:** ✅ TypeScript compilation successful
**Database:** ✅ Schema created and seeded
**Endpoints:** ✅ 9 endpoints tested and working
**Error Handling:** ✅ Pure functional (no exceptions thrown)
**Code Quality:** ✅ Imperative style, clear logic flow

---

## 📞 Summary Statistics

| Metric | Count |
|--------|-------|
| Total Endpoints | 9 |
| Auth Endpoints | 4 |
| Public Endpoints | 5 |
| Protected Endpoints | 0 (Phase 9+) |
| Admin Endpoints | 0 (Phase 10) |
| EC Endpoints | 0 (Phase 11) |
| GET Requests | 5 |
| POST Requests | 4 |
| PUT Requests | 0 |
| DELETE Requests | 0 |
| Database Tables | 6 |
| Total Records | 26 (test data) |
