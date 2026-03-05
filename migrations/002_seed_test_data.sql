-- Seed Data for Election System - Testing Public API

TRUNCATE TABLE "Vote" CASCADE;
TRUNCATE TABLE "Candidate" CASCADE;
TRUNCATE TABLE "User" CASCADE;
TRUNCATE TABLE "Party" CASCADE;
TRUNCATE TABLE "Constituency" CASCADE;
TRUNCATE TABLE "Admin" CASCADE;

-- Reset sequences to 1
ALTER SEQUENCE "Admin_id_seq" RESTART WITH 1;
ALTER SEQUENCE "Constituency_id_seq" RESTART WITH 1;
ALTER SEQUENCE "Party_id_seq" RESTART WITH 1;
ALTER SEQUENCE "Candidate_id_seq" RESTART WITH 1;


-- 1. INSERT CONSTITUENCIES (เขตเลือกตั้ง)

INSERT INTO "Constituency" (province, district_number, is_closed) VALUES
('Bangkok', 1, false),
('Bangkok', 2, false),
('Bangkok', 3, true),  
('Chiang Mai', 1, false),
('Chiang Mai', 2, true),  
('Phuket', 1, false);


-- 2. INSERT PARTIES (พรรคการเมือง)

INSERT INTO "Party" (name, policy, logo_url) VALUES
('Democratic Party', 'Focus on education and healthcare reforms', 'https://via.placeholder.com/150?text=Democratic'),
('Progressive Alliance', 'Economic development and infrastructure', 'https://via.placeholder.com/150?text=Progressive'),
('People First', 'Community-driven policies and transparency', 'https://via.placeholder.com/150?text=PeopleFirst'),
('Green Future', 'Environmental sustainability and climate action', 'https://via.placeholder.com/150?text=GreenFuture'),
('Unity Party', 'National stability and unity initiatives', 'https://via.placeholder.com/150?text=Unity');


-- 3. INSERT CANDIDATES (ผู้สมัคร)


-- Bangkok Constituency 1
INSERT INTO "Candidate" (title, first_name, last_name, number, image_url, party_id, constituency_id) VALUES
('Mr.', 'Somchai', 'Jiravantana', 1, 'https://via.placeholder.com/200?text=Somchai', 1, 1),
('Mr.', 'Niran', 'Suwannapong', 2, 'https://via.placeholder.com/200?text=Niran', 2, 1),
('Ms.', 'Pranee', 'Kaewbuasai', 3, 'https://via.placeholder.com/200?text=Pranee', 3, 1),
('Mr.', 'Anand', 'Ramnoi', 4, 'https://via.placeholder.com/200?text=Anand', 4, 1);

-- Bangkok Constituency 2
INSERT INTO "Candidate" (title, first_name, last_name, number, image_url, party_id, constituency_id) VALUES
('Mr.', 'Wanchai', 'Jittapong', 1, 'https://via.placeholder.com/200?text=Wanchai', 2, 2),
('Ms.', 'Siriporn', 'Nakornpol', 2, 'https://via.placeholder.com/200?text=Siriporn', 1, 2),
('Mr.', 'Teerawat', 'Mingkwan', 3, 'https://via.placeholder.com/200?text=Teerawat', 3, 2),
('Ms.', 'Nattaya', 'Ruamsuk', 4, 'https://via.placeholder.com/200?text=Nattaya', 5, 2);

-- Bangkok Constituency 3 (CLOSED)
INSERT INTO "Candidate" (title, first_name, last_name, number, image_url, party_id, constituency_id) VALUES
('Mr.', 'Pradit', 'Sangkot', 1, 'https://via.placeholder.com/200?text=Pradit', 1, 3),
('Mr.', 'Suphat', 'Kamang', 2, 'https://via.placeholder.com/200?text=Suphat', 2, 3),
('Ms.', 'Janya', 'Thepsan', 3, 'https://via.placeholder.com/200?text=Janya', 3, 3),
('Mr.', 'Kitti', 'Phongsai', 4, 'https://via.placeholder.com/200?text=Kitti', 4, 3);

-- Chiang Mai Constituency 1
INSERT INTO "Candidate" (title, first_name, last_name, number, image_url, party_id, constituency_id) VALUES
('Mr.', 'Damrong', 'Muangthai', 1, 'https://via.placeholder.com/200?text=Damrong', 3, 4),
('Mr.', 'Sarit', 'Jitmala', 2, 'https://via.placeholder.com/200?text=Sarit', 1, 4),
('Ms.', 'Oranuch', 'Chaiwasin', 3, 'https://via.placeholder.com/200?text=Oranuch', 2, 4),
('Mr.', 'Somkiat', 'Napaksin', 4, 'https://via.placeholder.com/200?text=Somkiat', 5, 4);

-- Chiang Mai Constituency 2 (CLOSED)
INSERT INTO "Candidate" (title, first_name, last_name, number, image_url, party_id, constituency_id) VALUES
('Mr.', 'Visut', 'Kasemsan', 1, 'https://via.placeholder.com/200?text=Visut', 2, 5),
('Ms.', 'Duangchai', 'Phatthanarak', 2, 'https://via.placeholder.com/200?text=Duangchai', 1, 5),
('Mr.', 'Pairoj', 'Sukjarit', 3, 'https://via.placeholder.com/200?text=Pairoj', 3, 5),
('Ms.', 'Kannika', 'Thammavong', 4, 'https://via.placeholder.com/200?text=Kannika', 4, 5);

-- Phuket Constituency 1
INSERT INTO "Candidate" (title, first_name, last_name, number, image_url, party_id, constituency_id) VALUES
('Mr.', 'Prawit', 'Khaimuk', 1, 'https://via.placeholder.com/200?text=Prawit', 4, 6),
('Mr.', 'Sasithorn', 'Namchoo', 2, 'https://via.placeholder.com/200?text=Sasithorn', 2, 6),
('Ms.', 'Issara', 'Namkong', 3, 'https://via.placeholder.com/200?text=Issara', 1, 6),
('Mr.', 'Khanit', 'Saithong', 4, 'https://via.placeholder.com/200?text=Khanit', 5, 6);


-- 4. INSERT TEST USERS (VOTERS)

INSERT INTO "User" (national_id, password, title, first_name, last_name, address, role, constituency_id) VALUES
-- Bangkok Constituency 1 voters
('1234567890001', '$2a$10$SALT_HASH_PASSWORD_HERE_1', 'Mr.', 'John', 'Voter1', '123 Sukhumvit Rd, Bangkok', 'VOTER', 1),
('1234567890002', '$2a$10$SALT_HASH_PASSWORD_HERE_2', 'Ms.', 'Jane', 'Voter2', '456 Sukhumvit Rd, Bangkok', 'VOTER', 1),
('1234567890003', '$2a$10$SALT_HASH_PASSWORD_HERE_3', 'Mr.', 'Bob', 'Voter3', '789 Sukhumvit Rd, Bangkok', 'VOTER', 1),

-- Bangkok Constituency 2 voters
('1234567890004', '$2a$10$SALT_HASH_PASSWORD_HERE_4', 'Ms.', 'Alice', 'Voter4', '111 Rama Rd, Bangkok', 'VOTER', 2),
('1234567890005', '$2a$10$SALT_HASH_PASSWORD_HERE_5', 'Mr.', 'Charlie', 'Voter5', '222 Rama Rd, Bangkok', 'VOTER', 2),

-- Bangkok Constituency 3 voters
('1234567890006', '$2a$10$SALT_HASH_PASSWORD_HERE_6', 'Ms.', 'Diana', 'Voter6', '333 Silom Rd, Bangkok', 'VOTER', 3),
('1234567890007', '$2a$10$SALT_HASH_PASSWORD_HERE_7', 'Mr.', 'Edward', 'Voter7', '444 Silom Rd, Bangkok', 'VOTER', 3),

-- Chiang Mai Constituency 1 voters
('1234567890008', '$2a$10$SALT_HASH_PASSWORD_HERE_8', 'Mr.', 'Frank', 'Voter8', '555 Nimmanhaemin Rd, Chiang Mai', 'VOTER', 4),
('1234567890009', '$2a$10$SALT_HASH_PASSWORD_HERE_9', 'Ms.', 'Grace', 'Voter9', '666 Nimmanhaemin Rd, Chiang Mai', 'VOTER', 4),

-- Chiang Mai Constituency 2 voters
('1234567890010', '$2a$10$SALT_HASH_PASSWORD_HERE_10', 'Mr.', 'Henry', 'Voter10', '777 Changphueak Rd, Chiang Mai', 'VOTER', 5),

-- Phuket Constituency 1 voters
('1234567890011', '$2a$10$SALT_HASH_PASSWORD_HERE_11', 'Ms.', 'Ivy', 'Voter11', '888 Thalang Rd, Phuket', 'VOTER', 6);


-- 5. INSERT TEST VOTES (for closed constituencies)


-- Bangkok Constituency 3 votes
INSERT INTO "Vote" (user_id, candidate_id) VALUES
-- Results: Pradit (1) wins with 1 vote, Suphat (2) gets 1 vote
((SELECT id FROM "User" WHERE national_id = '1234567890006'), (SELECT id FROM "Candidate" WHERE first_name = 'Pradit' AND constituency_id = 3)),
((SELECT id FROM "User" WHERE national_id = '1234567890007'), (SELECT id FROM "Candidate" WHERE first_name = 'Suphat' AND constituency_id = 3));

-- Chiang Mai Constituency 2 votes
INSERT INTO "Vote" (user_id, candidate_id) VALUES
-- Results: Visut (1) wins with 1 vote
((SELECT id FROM "User" WHERE national_id = '1234567890010'), (SELECT id FROM "Candidate" WHERE first_name = 'Visut' AND constituency_id = 5));


-- 6. INSERT ADMIN USER

INSERT INTO "Admin" (username, password) VALUES
('admin', '$2a$10$ADMIN_PASSWORD_HASH_HERE');



