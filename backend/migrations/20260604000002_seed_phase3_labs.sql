-- Seed Phase 3 Subjects

-- DAA
INSERT INTO subjects (id, title, description, icon, slug, subject_id, branch, semester)
VALUES (uuid_generate_v4(), 'Design and Analysis of Algorithms', 'Analyze algorithms and their complexities.', 'daa', 'daa', 'BCS-408', 'Common', 4)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO experiments (id, name, subject_id, slug, type, difficulty, theory, algorithm, language)
SELECT uuid_generate_v4(), 'Algorithm Analysis Compiler', id, 'daa-exp-1', 'experimental', 'Medium', 'Analyze time and space complexity.', '1. Write algorithm\n2. Analyze', 'cpp'
FROM subjects WHERE slug = 'daa' ON CONFLICT (slug) DO NOTHING;


-- DLD
INSERT INTO subjects (id, title, description, icon, slug, subject_id, branch, semester)
VALUES (uuid_generate_v4(), 'Digital Logic Design', 'Design and simulate digital circuits.', 'dld', 'dld', 'BCS-302', 'Common', 3)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO experiments (id, name, subject_id, slug, type, difficulty, theory, algorithm, language)
SELECT uuid_generate_v4(), 'Circuit Canvas Simulator', id, 'dld-exp-1', 'experimental', 'Medium', 'Simulate logic gates and circuits.', '1. Drag components\n2. Connect wires', 'Universal'
FROM subjects WHERE slug = 'dld' ON CONFLICT (slug) DO NOTHING;


-- MPMC
INSERT INTO subjects (id, title, description, icon, slug, subject_id, branch, semester)
VALUES (uuid_generate_v4(), 'Microprocessors and Microcontrollers', 'Write assembly code and interface with 8086.', 'mpmc', 'mpmc', 'BCS-506', 'Common', 5)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO experiments (id, name, subject_id, slug, type, difficulty, theory, algorithm, language)
SELECT uuid_generate_v4(), '8086 Simulator Trainer Kit', id, 'mpmc-exp-1', 'experimental', 'Hard', 'Simulate 8086 microprocessor instructions.', '1. Write Assembly\n2. Step Execution', 'Assembly'
FROM subjects WHERE slug = 'mpmc' ON CONFLICT (slug) DO NOTHING;


-- OOPS
INSERT INTO subjects (id, title, description, icon, slug, subject_id, branch, semester)
VALUES (uuid_generate_v4(), 'Object Oriented Programming', 'Learn Java and Object-Oriented principles.', 'oops', 'oops', 'BCS-306', 'Common', 3)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO experiments (id, name, subject_id, slug, type, difficulty, theory, algorithm, language)
SELECT uuid_generate_v4(), 'OOPS Java Compiler', id, 'oops-exp-1', 'experimental', 'Easy', 'Write and compile Java code.', '1. Create Classes\n2. Compile', 'java'
FROM subjects WHERE slug = 'oops' ON CONFLICT (slug) DO NOTHING;


-- Error Detection
INSERT INTO subjects (id, title, description, icon, slug, subject_id, branch, semester)
VALUES (uuid_generate_v4(), 'Error Detection', 'Simulate network error detection protocols.', 'error-detection', 'error-detection', 'BCS-507', 'Common', 5)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO experiments (id, name, subject_id, slug, type, difficulty, theory, algorithm, language)
SELECT uuid_generate_v4(), 'CRC Simulation', id, 'error-detection-exp-1', 'experimental', 'Medium', 'Cyclic Redundancy Check.', '1. Generate Polynomial\n2. Divide', 'Universal'
FROM subjects WHERE slug = 'error-detection' ON CONFLICT (slug) DO NOTHING;

INSERT INTO experiments (id, name, subject_id, slug, type, difficulty, theory, algorithm, language)
SELECT uuid_generate_v4(), 'Checksum Simulation', id, 'error-detection-exp-2', 'experimental', 'Medium', 'Checksum error detection.', '1. Add segments\n2. Complement', 'Universal'
FROM subjects WHERE slug = 'error-detection' ON CONFLICT (slug) DO NOTHING;

INSERT INTO experiments (id, name, subject_id, slug, type, difficulty, theory, algorithm, language)
SELECT uuid_generate_v4(), 'Hamming Code Simulation', id, 'error-detection-exp-3', 'experimental', 'Medium', 'Hamming codes for error correction.', '1. Calculate Parity bits\n2. Detect error bit', 'Universal'
FROM subjects WHERE slug = 'error-detection' ON CONFLICT (slug) DO NOTHING;

INSERT INTO experiments (id, name, subject_id, slug, type, difficulty, theory, algorithm, language)
SELECT uuid_generate_v4(), 'Parity Check Simulation', id, 'error-detection-exp-4', 'experimental', 'Easy', 'Even or Odd Parity checking.', '1. Count 1s\n2. Append parity bit', 'Universal'
FROM subjects WHERE slug = 'error-detection' ON CONFLICT (slug) DO NOTHING;
