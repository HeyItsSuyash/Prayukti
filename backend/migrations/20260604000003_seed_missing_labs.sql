-- DLD
INSERT INTO experiments (id, name, subject_id, slug, type, difficulty, theory, algorithm, language)
SELECT uuid_generate_v4(), 'Half Adder and Full Adder', id, 'dld-exp-2', 'experimental', 'Medium', 'Design and verification of Half Adder and Full Adder circuits.', '1. Follow steps\n2. Execute', 'Universal'
FROM subjects WHERE slug = 'dld' ON CONFLICT (slug) DO NOTHING;

INSERT INTO experiments (id, name, subject_id, slug, type, difficulty, theory, algorithm, language)
SELECT uuid_generate_v4(), 'Half Subtractor and Full Subtractor', id, 'dld-exp-3', 'experimental', 'Medium', 'Design and verification of Half Subtractor and Full Subtractor circuits.', '1. Follow steps\n2. Execute', 'Universal'
FROM subjects WHERE slug = 'dld' ON CONFLICT (slug) DO NOTHING;

INSERT INTO experiments (id, name, subject_id, slug, type, difficulty, theory, algorithm, language)
SELECT uuid_generate_v4(), 'Code Conversion (Binary to Gray & Gray to Binary)', id, 'dld-exp-4', 'experimental', 'Hard', 'Design 4-bit Binary to Gray and Gray to Binary code converters.', '1. Follow steps\n2. Execute', 'Universal'
FROM subjects WHERE slug = 'dld' ON CONFLICT (slug) DO NOTHING;

INSERT INTO experiments (id, name, subject_id, slug, type, difficulty, theory, algorithm, language)
SELECT uuid_generate_v4(), 'Combinational Logic Design (SOP & POS)', id, 'dld-exp-5', 'experimental', 'Medium', 'Design and verify combinational logic in SOP and POS forms.', '1. Follow steps\n2. Execute', 'Universal'
FROM subjects WHERE slug = 'dld' ON CONFLICT (slug) DO NOTHING;

INSERT INTO experiments (id, name, subject_id, slug, type, difficulty, theory, algorithm, language)
SELECT uuid_generate_v4(), 'Decoder and Encoder Circuits', id, 'dld-exp-6', 'experimental', 'Medium', 'Realization of 2:4 Decoder and 4:2 Encoder circuits.', '1. Follow steps\n2. Execute', 'Universal'
FROM subjects WHERE slug = 'dld' ON CONFLICT (slug) DO NOTHING;

INSERT INTO experiments (id, name, subject_id, slug, type, difficulty, theory, algorithm, language)
SELECT uuid_generate_v4(), 'Multiplexer and Demultiplexer', id, 'dld-exp-7', 'experimental', 'Medium', 'Design and verify 4:1 Multiplexer and 1:4 Demultiplexer.', '1. Follow steps\n2. Execute', 'Universal'
FROM subjects WHERE slug = 'dld' ON CONFLICT (slug) DO NOTHING;

INSERT INTO experiments (id, name, subject_id, slug, type, difficulty, theory, algorithm, language)
SELECT uuid_generate_v4(), 'Comparators (1-bit & 4-bit)', id, 'dld-exp-8', 'experimental', 'Medium', 'Design 1-bit comparator and study 4-bit comparator (IC 7485).', '1. Follow steps\n2. Execute', 'Universal'
FROM subjects WHERE slug = 'dld' ON CONFLICT (slug) DO NOTHING;

INSERT INTO experiments (id, name, subject_id, slug, type, difficulty, theory, algorithm, language)
SELECT uuid_generate_v4(), 'Flip-Flops and Shift Registers', id, 'dld-exp-9', 'experimental', 'Hard', 'Verify SR, D, JK, T Flip-Flops and Shift Registers.', '1. Follow steps\n2. Execute', 'Universal'
FROM subjects WHERE slug = 'dld' ON CONFLICT (slug) DO NOTHING;

INSERT INTO experiments (id, name, subject_id, slug, type, difficulty, theory, algorithm, language)
SELECT uuid_generate_v4(), 'Synchronous and Asynchronous Counters', id, 'dld-exp-10', 'experimental', 'Hard', 'Design and verify Asynchronous (Mod-n) and Synchronous counters.', '1. Follow steps\n2. Execute', 'Universal'
FROM subjects WHERE slug = 'dld' ON CONFLICT (slug) DO NOTHING;

-- OOPS
INSERT INTO experiments (id, name, subject_id, slug, type, difficulty, theory, algorithm, language)
SELECT uuid_generate_v4(), 'Implementation of Inheritance', id, 'oops-exp-2', 'experimental', 'Medium', 'Learn how to establish parent-child relationships between classes.', '1. Follow steps\n2. Execute', 'java'
FROM subjects WHERE slug = 'oops' ON CONFLICT (slug) DO NOTHING;

INSERT INTO experiments (id, name, subject_id, slug, type, difficulty, theory, algorithm, language)
SELECT uuid_generate_v4(), 'Demonstration of Polymorphism', id, 'oops-exp-3', 'experimental', 'Medium', 'Explore method overriding and overloading concepts.', '1. Follow steps\n2. Execute', 'java'
FROM subjects WHERE slug = 'oops' ON CONFLICT (slug) DO NOTHING;

INSERT INTO experiments (id, name, subject_id, slug, type, difficulty, theory, algorithm, language)
SELECT uuid_generate_v4(), 'Data Encapsulation and Abstraction', id, 'oops-exp-4', 'experimental', 'Hard', 'Master information hiding and abstract class design.', '1. Follow steps\n2. Execute', 'java'
FROM subjects WHERE slug = 'oops' ON CONFLICT (slug) DO NOTHING;

-- MPMC
INSERT INTO experiments (id, name, subject_id, slug, type, difficulty, theory, algorithm, language)
SELECT uuid_generate_v4(), 'Hexadecimal Addition & Subtraction', id, 'mpmc-exp-2', 'experimental', 'Easy', '8-bit hexadecimal arithmetic operations.', '1. Follow steps\n2. Execute', 'Assembly'
FROM subjects WHERE slug = 'mpmc' ON CONFLICT (slug) DO NOTHING;

INSERT INTO experiments (id, name, subject_id, slug, type, difficulty, theory, algorithm, language)
SELECT uuid_generate_v4(), 'Addition & Subtraction of Two BCD Numbers', id, 'mpmc-exp-3', 'experimental', 'Hard', 'Advanced BCD operations with carry/borrow handling.', '1. Follow steps\n2. Execute', 'Assembly'
FROM subjects WHERE slug = 'mpmc' ON CONFLICT (slug) DO NOTHING;

INSERT INTO experiments (id, name, subject_id, slug, type, difficulty, theory, algorithm, language)
SELECT uuid_generate_v4(), 'Multiplication & Division of Two 8-bit Numbers', id, 'mpmc-exp-4', 'experimental', 'Medium', 'Repeated addition and repeated subtraction methods.', '1. Follow steps\n2. Execute', 'Assembly'
FROM subjects WHERE slug = 'mpmc' ON CONFLICT (slug) DO NOTHING;

INSERT INTO experiments (id, name, subject_id, slug, type, difficulty, theory, algorithm, language)
SELECT uuid_generate_v4(), 'Find Largest & Smallest Number in an Array', id, 'mpmc-exp-5', 'experimental', 'Medium', 'Array traversal and comparison logic.', '1. Follow steps\n2. Execute', 'Assembly'
FROM subjects WHERE slug = 'mpmc' ON CONFLICT (slug) DO NOTHING;

INSERT INTO experiments (id, name, subject_id, slug, type, difficulty, theory, algorithm, language)
SELECT uuid_generate_v4(), 'Arrange Array in Ascending Order', id, 'mpmc-exp-6', 'experimental', 'Hard', 'Bubble sort implementation on 8085.', '1. Follow steps\n2. Execute', 'Assembly'
FROM subjects WHERE slug = 'mpmc' ON CONFLICT (slug) DO NOTHING;

INSERT INTO experiments (id, name, subject_id, slug, type, difficulty, theory, algorithm, language)
SELECT uuid_generate_v4(), 'Arrange Array in Descending Order', id, 'mpmc-exp-7', 'experimental', 'Hard', 'Selection/Bubble sort for descending order.', '1. Follow steps\n2. Execute', 'Assembly'
FROM subjects WHERE slug = 'mpmc' ON CONFLICT (slug) DO NOTHING;

INSERT INTO experiments (id, name, subject_id, slug, type, difficulty, theory, algorithm, language)
SELECT uuid_generate_v4(), 'Hexadecimal to ASCII & Vice Versa', id, 'mpmc-exp-8', 'experimental', 'Medium', 'Character encoding and data conversion.', '1. Follow steps\n2. Execute', 'Assembly'
FROM subjects WHERE slug = 'mpmc' ON CONFLICT (slug) DO NOTHING;

