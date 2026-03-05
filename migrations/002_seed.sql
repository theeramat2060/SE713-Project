-- Insert admin user (password: admin123 - should be hashed in production)
INSERT INTO admins (username, password)
VALUES ('admin', '$2a$10$rQnM1VYvhQ5tQHJXzNJQOOJXz5X5X5X5X5X5X5X5X5X5X5X5X5X');

-- Insert constituencies
INSERT INTO constituencies (province, district_number) VALUES
('Bangkok', 1),
('Bangkok', 2),
('Bangkok', 3),
('Chiang Mai', 1),
('Chiang Mai', 2),
('Phuket', 1);

-- Insert parties
INSERT INTO parties (name, logo_url, policy) VALUES
('Democratic Party', 'https://placeholder.com/logo-a.png', 'Democratic values and equality'),
('Progressive Alliance', 'https://placeholder.com/logo-b.png', 'Progress and innovation'),
('Peoples Movement', 'https://placeholder.com/logo-c.png', 'Community-based development');
