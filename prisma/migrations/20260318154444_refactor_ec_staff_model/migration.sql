-- Create ec_status enum
CREATE TYPE "ec_status" AS ENUM ('ACTIVE', 'INACTIVE');

-- Create ECStaff table
CREATE TABLE "ECStaff" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "admin_id" INTEGER NOT NULL,
    "national_id" VARCHAR(13) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "title" VARCHAR(50) NOT NULL,
    "first_name" VARCHAR(255) NOT NULL,
    "last_name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "constituency_id" INTEGER NOT NULL,
    "status" "ec_status" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ECStaff_pkey" PRIMARY KEY ("id")
);

-- Create indexes for ECStaff
CREATE UNIQUE INDEX "ECStaff_national_id_key" ON "ECStaff"("national_id");
CREATE INDEX "idx_ecstaff_admin_id" ON "ECStaff"("admin_id");
CREATE INDEX "idx_ecstaff_national_id" ON "ECStaff"("national_id");
CREATE INDEX "idx_ecstaff_constituency_id" ON "ECStaff"("constituency_id");
CREATE INDEX "idx_ecstaff_status" ON "ECStaff"("status");

-- Add foreign key constraints
ALTER TABLE "ECStaff" ADD CONSTRAINT "ECStaff_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "ECStaff" ADD CONSTRAINT "ECStaff_constituency_id_fkey" FOREIGN KEY ("constituency_id") REFERENCES "Constituency"("id") ON UPDATE NO ACTION;

-- Drop role index from User table if it exists
DROP INDEX IF EXISTS "idx_user_role";

-- Drop role column from User table
ALTER TABLE "User" DROP COLUMN IF EXISTS "role";
