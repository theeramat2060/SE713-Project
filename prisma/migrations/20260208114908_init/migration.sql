-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('VOTER', 'EC');

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Candidate" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(50) NOT NULL,
    "first_name" VARCHAR(255) NOT NULL,
    "last_name" VARCHAR(255) NOT NULL,
    "number" INTEGER NOT NULL,
    "image_url" VARCHAR(500) NOT NULL,
    "party_id" INTEGER NOT NULL,
    "constituency_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Constituency" (
    "id" SERIAL NOT NULL,
    "province" VARCHAR(255) NOT NULL,
    "district_number" INTEGER NOT NULL,
    "is_closed" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Constituency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Party" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "logo_url" VARCHAR(500) NOT NULL,
    "policy" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Party_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "national_id" VARCHAR(13) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "title" VARCHAR(50) NOT NULL,
    "first_name" VARCHAR(255) NOT NULL,
    "last_name" VARCHAR(255) NOT NULL,
    "address" TEXT NOT NULL,
    "role" "user_role" DEFAULT 'VOTER',
    "constituency_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "candidate_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- CreateIndex
CREATE INDEX "idx_candidate_constituency_id" ON "Candidate"("constituency_id");

-- CreateIndex
CREATE INDEX "idx_candidate_party_id" ON "Candidate"("party_id");

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_constituency_id_number_key" ON "Candidate"("constituency_id", "number");

-- CreateIndex
CREATE UNIQUE INDEX "Constituency_province_district_number_key" ON "Constituency"("province", "district_number");

-- CreateIndex
CREATE UNIQUE INDEX "Party_name_key" ON "Party"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_national_id_key" ON "User"("national_id");

-- CreateIndex
CREATE INDEX "idx_user_constituency_id" ON "User"("constituency_id");

-- CreateIndex
CREATE INDEX "idx_user_national_id" ON "User"("national_id");

-- CreateIndex
CREATE INDEX "idx_user_role" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_user_id_key" ON "Vote"("user_id");

-- CreateIndex
CREATE INDEX "idx_vote_candidate_id" ON "Vote"("candidate_id");

-- CreateIndex
CREATE INDEX "idx_vote_created_at" ON "Vote"("created_at");

-- CreateIndex
CREATE INDEX "idx_vote_user_id" ON "Vote"("user_id");

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_constituency_id_fkey" FOREIGN KEY ("constituency_id") REFERENCES "Constituency"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "Party"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_constituency_id_fkey" FOREIGN KEY ("constituency_id") REFERENCES "Constituency"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "Candidate"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
