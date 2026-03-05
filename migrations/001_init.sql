-- Election System Database Schema (v1.0)


-- Create ENUM type for user roles
CREATE TYPE user_role AS ENUM ('VOTER', 'EC');


-- 1. Admin (System Administrator)

CREATE TABLE "Admin" (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);


-- 2. Constituency (เขตเลือกตั้ง - Election District)

CREATE TABLE "Constituency" (
  id SERIAL PRIMARY KEY,
  province VARCHAR(255) NOT NULL,
  district_number INT NOT NULL,
  is_closed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(province, district_number)
);


-- 3. User (Voters & EC Staff)

CREATE TABLE "User" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  national_id VARCHAR(13) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  title VARCHAR(50) NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  role user_role DEFAULT 'VOTER',
  constituency_id INT NOT NULL REFERENCES "Constituency"(id) ON DELETE RESTRICT,
  created_at TIMESTAMP DEFAULT NOW()
);


-- 4. Party (พรรคการเมือง - Political Party)

CREATE TABLE "Party" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  logo_url VARCHAR(500) NOT NULL,
  policy TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);


-- 5. Candidate (ผู้สมัคร - Election Candidate)

CREATE TABLE "Candidate" (
  id SERIAL PRIMARY KEY,
  title VARCHAR(50) NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  number INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  party_id INT NOT NULL REFERENCES "Party"(id) ON DELETE RESTRICT,
  constituency_id INT NOT NULL REFERENCES "Constituency"(id) ON DELETE RESTRICT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(constituency_id, number)
);


-- 6. Vote (ผลคะแนน - Voting Record)

CREATE TABLE "Vote" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  candidate_id INT NOT NULL REFERENCES "Candidate"(id) ON DELETE RESTRICT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);


-- INDEXES FOR PERFORMANCE

CREATE INDEX idx_user_national_id ON "User"(national_id);
CREATE INDEX idx_user_constituency_id ON "User"(constituency_id);
CREATE INDEX idx_user_role ON "User"(role);
CREATE INDEX idx_candidate_constituency_id ON "Candidate"(constituency_id);
CREATE INDEX idx_candidate_party_id ON "Candidate"(party_id);
CREATE INDEX idx_vote_user_id ON "Vote"(user_id);
CREATE INDEX idx_vote_candidate_id ON "Vote"(candidate_id);
CREATE INDEX idx_vote_created_at ON "Vote"(created_at);


-- COMMENTS (Schema Documentation)

COMMENT ON TABLE "Admin" IS 'System administrators for election management';
COMMENT ON TABLE "User" IS 'Voters and election commission (EC) staff members';
COMMENT ON TABLE "Constituency" IS 'Election districts/constituencies (เขตเลือกตั้ง)';
COMMENT ON TABLE "Party" IS 'Political parties (พรรคการเมือง)';
COMMENT ON TABLE "Candidate" IS 'Candidates running in each constituency';
COMMENT ON TABLE "Vote" IS 'Voting records - each user votes once per constituency';
COMMENT ON COLUMN "User".role IS 'VOTER: citizen voter, EC: election commission staff';
COMMENT ON COLUMN "Constituency".is_closed IS 'true when voting is closed and results can be viewed';
COMMENT ON COLUMN "Vote".user_id IS 'Unique constraint: each user votes once';

