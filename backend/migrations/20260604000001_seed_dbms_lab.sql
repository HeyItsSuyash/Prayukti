-- Seed DBMS Subject
INSERT INTO subjects (id, title, description, icon, slug, subject_id, branch, semester)
VALUES (
    uuid_generate_v4(),
    'Database Management Systems',
    'Design, develop, and manipulate databases using SQL and relational algebra.',
    'dbms',
    'dbms',
    'BCS-503',
    'Common',
    5
)
ON CONFLICT (slug) DO NOTHING;

-- 1. Introduction to DBMS
INSERT INTO experiments (id, name, subject_id, slug, type, difficulty, theory, algorithm, language)
SELECT uuid_generate_v4(), 'Introduction to DBMS (DDL/DML)', id, 'dbms-exp-1', 'experimental', 'Easy', 'Learn SQL commands: CREATE, INSERT, SELECT, UPDATE, DELETE.', '1. CREATE TABLE\n2. INSERT INTO', 'SQL'
FROM subjects WHERE slug = 'dbms' ON CONFLICT (slug) DO NOTHING;

-- 2. Application Development
INSERT INTO experiments (id, name, subject_id, slug, type, difficulty, theory, algorithm, language)
SELECT uuid_generate_v4(), 'Application Development', id, 'dbms-exp-2', 'experimental', 'Hard', 'Develop database-driven applications connecting frontends to a DBMS.', '1. Connect DB\n2. Execute Queries', 'SQL'
FROM subjects WHERE slug = 'dbms' ON CONFLICT (slug) DO NOTHING;

-- 3. Relational Algebra
INSERT INTO experiments (id, name, subject_id, slug, type, difficulty, theory, algorithm, language)
SELECT uuid_generate_v4(), 'Relational Algebra Operations', id, 'dbms-exp-3', 'experimental', 'Medium', 'Select, Project, Union, and Join operations in relational databases.', '1. Select (σ)\n2. Project (π)', 'SQL'
FROM subjects WHERE slug = 'dbms' ON CONFLICT (slug) DO NOTHING;

-- 4. Normalization
INSERT INTO experiments (id, name, subject_id, slug, type, difficulty, theory, algorithm, language)
SELECT uuid_generate_v4(), 'Normalization', id, 'dbms-exp-4', 'learning', 'Hard', 'Normalize databases up to 3NF and BCNF to remove redundancies.', '1. Identify functional dependencies\n2. Decompose tables', 'SQL'
FROM subjects WHERE slug = 'dbms' ON CONFLICT (slug) DO NOTHING;

-- 5. Host Language
INSERT INTO experiments (id, name, subject_id, slug, type, difficulty, theory, algorithm, language)
SELECT uuid_generate_v4(), 'Host Language Integration', id, 'dbms-exp-5', 'experimental', 'Medium', 'Use PL/SQL or host languages to interact with the database.', '1. Declare variables\n2. Open cursors', 'SQL'
FROM subjects WHERE slug = 'dbms' ON CONFLICT (slug) DO NOTHING;
