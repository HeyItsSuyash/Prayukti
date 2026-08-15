-- Seed Computer Networks Subject
INSERT INTO subjects (id, title, description, icon, slug, subject_id, branch, semester)
VALUES (
    uuid_generate_v4(),
    'Computer Networks',
    'Explore the architecture of the internet, networking protocols, and OSI models.',
    'cn',
    'cn',
    'BCS-502',
    'Common',
    5
)
ON CONFLICT (slug) DO NOTHING;

-- 1. OSI vs TCP/IP
INSERT INTO experiments (id, name, subject_id, slug, type, difficulty, theory, algorithm, language)
SELECT uuid_generate_v4(), 'OSI vs TCP/IP Reference Models', id, 'cn-exp-1', 'learning', 'Easy', 'OSI has 7 layers, TCP/IP has 4. Study the encapsulation process and protocol suites.', '1. Select Model\n2. View Layer Details', 'Universal'
FROM subjects WHERE slug = 'cn' ON CONFLICT (slug) DO NOTHING;

-- 2. CSMA/CD
INSERT INTO experiments (id, name, subject_id, slug, type, difficulty, theory, algorithm, language)
SELECT uuid_generate_v4(), 'CSMA/CD Protocol Simulation', id, 'cn-exp-2', 'experimental', 'Medium', 'Carrier Sense Multiple Access with Collision Detection is a network protocol for carrier transmission.', '1. Check if channel is idle\n2. Transmit data', 'Universal'
FROM subjects WHERE slug = 'cn' ON CONFLICT (slug) DO NOTHING;

-- 3. ARP
INSERT INTO experiments (id, name, subject_id, slug, type, difficulty, theory, algorithm, language)
SELECT uuid_generate_v4(), 'ARP Protocol Simulation', id, 'cn-exp-3', 'experimental', 'Medium', 'Address Resolution Protocol resolves IP addresses to MAC addresses.', '1. Broadcast ARP Request\n2. Wait for ARP Reply', 'Universal'
FROM subjects WHERE slug = 'cn' ON CONFLICT (slug) DO NOTHING;

-- 4. Distance Vector Routing
INSERT INTO experiments (id, name, subject_id, slug, type, difficulty, theory, algorithm, language)
SELECT uuid_generate_v4(), 'Distance Vector Routing', id, 'cn-exp-4', 'experimental', 'Hard', 'Distance Vector Routing (DVR) calculates the shortest path based on distance.', '1. Initialize routing tables\n2. Share with neighbors', 'Universal'
FROM subjects WHERE slug = 'cn' ON CONFLICT (slug) DO NOTHING;

-- 5. Selective Repeat
INSERT INTO experiments (id, name, subject_id, slug, type, difficulty, theory, algorithm, language)
SELECT uuid_generate_v4(), 'Selective Repeat Simulation', id, 'cn-exp-5', 'experimental', 'Hard', 'Selective Repeat ARQ protocol retransmits only the lost frames.', '1. Send frames in window\n2. NAK triggers specific retransmission', 'Universal'
FROM subjects WHERE slug = 'cn' ON CONFLICT (slug) DO NOTHING;

-- 6. Sliding Window
INSERT INTO experiments (id, name, subject_id, slug, type, difficulty, theory, algorithm, language)
SELECT uuid_generate_v4(), 'Sliding Window Simulation', id, 'cn-exp-6', 'experimental', 'Hard', 'Sliding window protocols allow multiple frames to be in transit.', '1. Maintain sender and receiver windows\n2. Advance window on ACK', 'Universal'
FROM subjects WHERE slug = 'cn' ON CONFLICT (slug) DO NOTHING;

-- 7. Token Protocols
INSERT INTO experiments (id, name, subject_id, slug, type, difficulty, theory, algorithm, language)
SELECT uuid_generate_v4(), 'Token Protocols Simulation', id, 'cn-exp-7', 'experimental', 'Medium', 'Token ring protocols use a token to control access to the shared medium.', '1. Pass token\n2. Capture to transmit data', 'Universal'
FROM subjects WHERE slug = 'cn' ON CONFLICT (slug) DO NOTHING;
