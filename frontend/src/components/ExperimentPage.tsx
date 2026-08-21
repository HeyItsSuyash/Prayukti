"use client";

import { API_URL } from "@/lib/config";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SimulationRenderer from "@/components/simulation/SimulationRenderer";
import { ExecutionInsights } from "@/components/simulation/core/ExecutionInsights";
import CodeCompiler from "@/components/simulation/core/CodeCompiler";
import LabTest from "@/components/simulation/core/LabTest";
import { ChevronRight } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const getSubjectName = (id: string) => {
    const lower = id.toLowerCase();
    if (lower.startsWith('cn')) return "Computer Networks";
    if (lower.startsWith('dsa') || lower.startsWith('data')) return "Data Structures & Algorithms";
    if (lower.startsWith('dbms')) return "Database Management Systems";
    if (lower.startsWith('oops') || lower.startsWith('java')) return "Object Oriented Programming";
    if (lower.startsWith('dld') || lower.startsWith('digital')) return "Digital Logic Design";
    if (lower.startsWith('os')) return "Operating Systems";
    if (lower.startsWith('mpmc') || lower.startsWith('micro')) return "Microprocessors & Microcontrollers";
    if (lower.startsWith('daa')) return "Design & Analysis of Algorithms";
    if (lower.startsWith('pds')) return "Programming & Data Structures";
    if (lower.startsWith('cd')) return "Compiler Design";
    if (lower.startsWith('ot')) return "Optimization Techniques";
    if (lower.startsWith('bee')) return "Basic Electrical Engineering";
    if (lower.startsWith('coa') || lower.startsWith('aca')) return "Computer Organization & Architecture";
    if (lower.startsWith('error-detection')) return "Error Detection";
    return "Virtual Lab Assessment";
};

const SECTIONS = [
    { id: "aim", label: "Aim" },
    { id: "theory", label: "Theory" },
    { id: "simulation", label: "Simulation" },
    { id: "test", label: "Test" },
    { id: "references", label: "References" }
];


const getFallbackData = (id: string) => {
    let title = "Experiment Simulation";
    let aim = "To study and analyze the core concepts of this experiment in detail.";
    let theory = "Detailed theory will be populated here.";
    
    // CN Experiments
    if (id === 'cn-exp-1') {
        title = 'OSI vs TCP/IP Reference Models';
        aim = 'To understand and compare the layers, protocols, and functionalities of the OSI and TCP/IP reference models comprehensively.';
        theory = 'The Open Systems Interconnection (OSI) model is a conceptual framework created by the International Organization for Standardization (ISO) which enables diverse communication systems to communicate using standard protocols.\n\nIt divides the communication process into seven abstract layers:\n1. Physical Layer: Deals with the physical connection and transmission of raw bits.\n2. Data Link Layer: Ensures node-to-node data transfer and handles error correction from the physical layer.\n3. Network Layer: Responsible for packet routing and logical addressing (IP).\n4. Transport Layer: Ensures complete data transfer and provides error recovery (TCP/UDP).\n5. Session Layer: Establishes, manages, and terminates connections.\n6. Presentation Layer: Formats, encrypts, and compresses data.\n7. Application Layer: Interacts directly with software applications.\n\nIn contrast, the TCP/IP model is a more concise and widely implemented framework with four layers: Network Access, Internet, Transport, and Application. The TCP/IP model was designed by the DoD to be highly robust and is the foundation of the modern internet. While OSI is an excellent theoretical tool for teaching and troubleshooting, TCP/IP is the practical standard for real-world networking.';
    } else if (id === 'cn-exp-2') {
        title = 'CSMA/CD Protocol Simulation';
        aim = 'To simulate the Carrier Sense Multiple Access with Collision Detection (CSMA/CD) protocol and deeply observe network collision handling and backoff mechanisms.';
        theory = 'CSMA/CD (Carrier Sense Multiple Access with Collision Detection) is a media access control method historically used in early half-duplex Ethernet networks.\n\nThe protocol operates on three fundamental principles:\n\n1. Carrier Sense: Before a node can transmit data, it must "listen" to the shared transmission medium to check if it is idle. If the channel is busy, the node waits until the transmission finishes.\n\n2. Multiple Access: Multiple nodes share the same physical medium (like a coaxial cable). Any node can attempt to transmit when it senses the medium is free.\n\n3. Collision Detection: Due to propagation delays, two nodes might sense an idle channel and transmit simultaneously, causing a "collision". When nodes are transmitting, they simultaneously monitor the medium. If the detected signal differs from the transmitted signal, a collision has occurred.\n\nUpon detecting a collision, transmitting nodes immediately abort their transmissions, broadcast a "jam signal" to ensure all other nodes recognize the collision, and then invoke a Truncated Binary Exponential Backoff algorithm. This algorithm forces nodes to wait for a random duration before attempting to retransmit, significantly reducing the probability of subsequent collisions.';
    } else if (id === 'cn-exp-3') {
        title = 'ARP Protocol Simulation';
        aim = 'To comprehensively understand how the Address Resolution Protocol (ARP) maps logical IP addresses to physical MAC addresses in a local area network.';
        theory = 'The Address Resolution Protocol (ARP) is a critical Layer 2 protocol used to map a known logical address (IPv4) to an unknown physical hardware address (MAC address).\n\nWhen a device (Host A) wants to communicate with another device (Host B) on the same local subnet, it knows Host B\'s IP address but needs Host B\'s MAC address to frame the Ethernet packets. Host A first checks its local ARP Cache. If the entry is missing, Host A broadcasts an ARP Request frame to the entire network. The request essentially asks, "Who has IP address X.X.X.X? Tell IP address Y.Y.Y.Y."\n\nEvery device on the local network receives this broadcast, but only the device with the matching IP address (Host B) processes it. Host B then replies with an ARP Reply, which is a unicast message sent directly back to Host A, containing its MAC address.\n\nOnce Host A receives the ARP Reply, it updates its ARP Cache and proceeds to transmit the actual data. Without ARP, modern IP networks operating over Ethernet would be entirely unable to deliver packets to their final physical destinations.';
    } else if (id === 'cn-exp-4') {
        title = 'Distance Vector Routing';
        aim = 'To simulate Distance Vector Routing protocols and rigorously observe how routing tables converge using the Bellman-Ford algorithm.';
        theory = 'Distance Vector Routing is a dynamic intra-domain routing protocol where each router maintains a routing table (a vector) that contains the best known distance (metric) to each destination network, along with the next-hop router to use to get there.\n\nIn this protocol, routers periodically broadcast their entire routing tables to their immediate, directly connected neighbors. Upon receiving a neighbor\'s table, a router uses the Bellman-Ford equation to calculate if a shorter path to a destination exists via that neighbor. If a better path is found, the router updates its own table.\n\nWhile Distance Vector protocols (like RIP - Routing Information Protocol) are simple to configure and require minimal processing power, they suffer from significant drawbacks, most notably slow convergence and the "count-to-infinity" problem where a routing loop causes metrics to increment endlessly. To mitigate these issues, techniques like Split Horizon, Route Poisoning, and Hold-down Timers are implemented to ensure network stability during topology changes.';
    } else if (id === 'cn-exp-5') {
        title = 'Selective Repeat Simulation';
        aim = 'To study the Selective Repeat ARQ protocol and deeply understand its efficiency in handling packet loss by selectively retransmitting only corrupted frames.';
        theory = 'Selective Repeat ARQ (Automatic Repeat reQuest) is a robust and highly efficient sliding window protocol used for reliable data transmission over unreliable networks.\n\nUnlike the simpler Go-Back-N protocol—which discards all subsequent frames if one is lost and forces the sender to retransmit the entire window—Selective Repeat only requests the retransmission of the specific frame that was lost or corrupted.\n\nTo achieve this, both the sender and the receiver must maintain independent windows of sequence numbers. The receiver is capable of buffering out-of-order frames within its window. When a frame arrives correctly but out of sequence, it is acknowledged (with an individual ACK, not cumulative) and buffered until the missing preceding frames arrive. If a frame is lost, a timer expires on the sender\'s side (or a NACK is sent by the receiver), prompting the sender to resend only that specific frame.\n\nThis mechanism drastically improves link utilization and throughput, especially on networks with high latency and significant error rates (like satellite links), at the cost of increased memory and logic complexity on both ends.';
    } else if (id === 'cn-exp-6') {
        title = 'Sliding Window Simulation';
        aim = 'To comprehensively demonstrate flow control and error control mechanisms using the Sliding Window protocol.';
        theory = 'The Sliding Window protocol is a fundamental flow control mechanism used in data link and transport layer protocols (most notably TCP) to ensure reliable, efficient, and orderly data transmission.\n\nIn a simple Stop-and-Wait protocol, the sender transmits one frame and waits idly for an acknowledgment before sending the next, severely underutilizing the network bandwidth. The Sliding Window protocol solves this by allowing the sender to transmit multiple frames (up to a specific "window size") before requiring an acknowledgment.\n\nThe "window" represents the maximum number of unacknowledged frames the sender is permitted to have in transit. As the receiver successfully processes frames and sends ACKs back, the sender\'s window "slides" forward, allowing new frames to be transmitted. This continuous flow keeps the network pipe full, maximizing throughput.\n\nThe window size is dynamically adjusted based on the receiver\'s capacity (Flow Control) and the network\'s current congestion levels (Congestion Control), ensuring that the sender never overwhelms the receiver or the intermediate network routers.';
    } else if (id === 'cn-exp-7') {
        title = 'Token Protocols Simulation';
        aim = 'To meticulously simulate Token Ring networks and understand the advantages of deterministic media access control using token passing.';
        theory = 'Token Passing is a deterministic media access control method predominantly used in Token Ring and FDDI networks. In these networks, computers are logically connected in a ring topology.\n\nTo prevent the collisions inherent in contention-based protocols like CSMA/CD, Token Ring uses a special three-byte control frame called a "token" that continuously circulates around the ring in one direction. When a station has data to transmit, it must wait for the free token to arrive. Upon receiving the token, it alters a bit to change it into a Start of Frame sequence, appends its data and destination address, and sends the frame down the ring.\n\nAs the frame circulates, the destination station recognizes its address, copies the data into its buffer, and marks the frame as received. The frame continues around the ring until it returns to the original sender. The sender verifies the delivery and then generates a new free token, releasing it back to the network so the next station can transmit.\n\nThis ensures fair, collision-free access with a guaranteed maximum wait time for every node on the network.';
    
    // DBMS
    } else if (id === 'dbms-exp-1') { 
        title = 'Introduction to DBMS'; 
        aim = 'To profoundly learn the fundamentals, architecture, and significance of Database Management Systems in modern applications.'; 
        theory = 'A Database Management System (DBMS) is highly sophisticated software that serves as an intermediary between end users, applications, and the database itself to securely capture, manage, and analyze data.\n\nBefore DBMS, data was stored in flat files, leading to severe issues like data redundancy, inconsistency, difficulty in access, and poor security. A modern DBMS provides a structured, relational way to store data, ensuring Data Integrity, Concurrency Control, and Crash Recovery.\n\nThe architecture of a DBMS is typically divided into three levels (the ANSI/SPARC architecture): the Internal Level (physical storage), the Conceptual Level (logical structure of the entire database), and the External Level (individual user views). This separation ensures data independence, meaning changes in the underlying storage do not affect the application logic.'; 
    }
    else if (id === 'dbms-exp-2') { 
        title = 'Application Development'; 
        aim = 'To develop comprehensive and robust database applications utilizing advanced SQL and backend integration techniques.'; 
        theory = 'Database application development involves creating front-end interfaces and backend APIs that interact seamlessly with a relational database using Structured Query Language (SQL).\n\nModern applications require complex operations beyond simple CRUD (Create, Read, Update, Delete). This includes handling database transactions with ACID properties (Atomicity, Consistency, Isolation, Durability) to ensure data validity even in the event of system failures.\n\nDevelopers must also utilize connection pooling, parameterized queries to prevent SQL injection attacks, and complex joins and subqueries to efficiently retrieve relational data. Understanding how to build these applications bridges the gap between raw data storage and actionable user interfaces.'; 
    }
    else if (id === 'dbms-exp-3') { 
        title = 'Relational Algebra'; 
        aim = 'To deeply study and mathematically analyze relational algebra operations and their execution in database engines.'; 
        theory = 'Relational algebra is a procedural query language forming the mathematical foundation of relational databases. It takes one or more relations (tables) as input and yields a new relation as output.\n\nThe fundamental operations include:\n1. Selection (σ): Extracts rows that satisfy a specified condition.\n2. Projection (π): Extracts specified columns, discarding others.\n3. Union (∪): Combines tuples from two relations, removing duplicates.\n4. Set Difference (-): Returns tuples present in the first relation but not the second.\n5. Cartesian Product (×): Combines every tuple of one relation with every tuple of another.\n\nUnderstanding relational algebra is critical because SQL queries are internally translated into relational algebra expressions by the database query optimizer to determine the most efficient execution plan.'; 
    }
    else if (id === 'dbms-exp-4') { 
        title = 'Normalization'; 
        aim = 'To master database normalization forms (1NF, 2NF, 3NF, BCNF) and apply them to eliminate data anomalies.'; 
        theory = 'Normalization is the systematic process of organizing data in a relational database to drastically reduce data redundancy and improve data integrity. Unnormalized tables often suffer from insertion, update, and deletion anomalies.\n\nThe normalization process involves dividing large tables into smaller, related tables according to specific rules:\n- First Normal Form (1NF): Ensures every attribute is atomic and there are no repeating groups.\n- Second Normal Form (2NF): Ensures it is in 1NF and all non-key attributes are fully functionally dependent on the primary key.\n- Third Normal Form (3NF): Ensures it is in 2NF and there are no transitive dependencies between non-key attributes.\n- Boyce-Codd Normal Form (BCNF): A stricter version of 3NF where every determinant must be a candidate key.\n\nProper normalization results in a robust, anomaly-free schema that scales efficiently.'; 
    }
    else if (id === 'dbms-exp-5') { 
        title = 'Host Language Integration'; 
        aim = 'To expertly integrate SQL with a host programming language to build enterprise-grade database-driven software.'; 
        theory = 'Host language integration allows powerful declarative SQL statements to be embedded within procedural programming languages like Java, C++, or Python. This is essential because SQL alone is not Turing-complete and cannot handle complex procedural logic or user interfaces.\n\nIntegration is typically achieved using standard APIs like JDBC (Java Database Connectivity) or ODBC. These APIs provide mechanisms to establish secure connections, execute parameterized pre-compiled SQL statements, and retrieve result sets.\n\nAdvanced integration also involves using Object-Relational Mapping (ORM) frameworks which map database tables to programming objects, abstracting away raw SQL and allowing developers to interact with the database using native programming paradigms while still leveraging the power of the underlying DBMS.'; 
    }
    
    // Others
    else if (id.startsWith('error-detection')) { 
        title = 'Error Detection Simulation'; 
        aim = 'To comprehensively study and simulate advanced error detection methods including CRC, Checksums, and Parity checking.'; 
        theory = 'Data transmitted over physical mediums is susceptible to noise and interference, leading to flipped bits and corrupted data. Error detection techniques are crucial to identify these corruptions and request retransmission.\n\n1. Parity Check: The simplest method, adding a single bit to ensure the total number of 1s is even or odd. It can only detect single-bit errors.\n2. Checksum: Groups data into blocks, adds them up, and appends the complement of the sum. Used heavily in TCP/IP headers.\n3. Cyclic Redundancy Check (CRC): A highly robust mathematical technique based on polynomial division. The sender divides the data bits by a predetermined divisor polynomial and appends the remainder (the CRC). The receiver performs the same division; if the remainder is zero, the data is intact. CRC is used in Ethernet and Wi-Fi networks due to its ability to detect burst errors.'; 
    }
    else if (id.startsWith('daa')) { 
        title = 'Algorithm Analysis'; 
        aim = 'To rigorously analyze and mathematically prove the time and space complexity of fundamental computer science algorithms.'; 
        theory = 'Algorithm analysis is the theoretical study of computer program performance and resource usage. It focuses on determining the computational complexity of an algorithm as the size of the input data (n) approaches infinity.\n\nWe use Asymptotic Notation (Big-O, Big-Omega, Big-Theta) to classify algorithms according to how their run time or space requirements grow:\n- Big-O (O) represents the upper bound or worst-case scenario.\n- Big-Omega (Ω) represents the lower bound or best-case scenario.\n- Big-Theta (Θ) represents the tight bound.\n\nBy analyzing loops, recursive calls, and data structure operations, we can determine if an algorithm operates in O(1) constant time, O(log n) logarithmic time, O(n) linear time, O(n log n) linearithmic time, or O(n²) quadratic time, allowing us to choose the most efficient solution for large-scale problems.'; 
    }
    else if (id.startsWith('mpmc')) { 
        title = '8086 Simulator'; 
        aim = 'To intricately simulate and execute 8086 microprocessor assembly instructions and understand low-level architecture.'; 
        theory = 'The Intel 8086 is a seminal 16-bit microprocessor that laid the foundation for the pervasive x86 architecture. It features a complex instruction set computer (CISC) design, 14 16-bit registers (including AX, BX, CX, DX for general purposes), and a 20-bit address bus capable of accessing 1MB of memory.\n\nUnderstanding the 8086 requires mastering its memory segmentation model, where physical addresses are calculated by shifting a segment register (like CS, DS) and adding an offset pointer (like IP, SI). Assembly language programming on the 8086 involves writing mnemonic instructions that manipulate these registers directly, manage the stack, and handle hardware interrupts.\n\nSimulating this environment allows students to visualize the execution of instructions, inspect the contents of registers and memory flags (Zero, Carry, Sign) in real-time, and deeply understand how software interfaces with hardware at the lowest level.'; 
    }
    // DLD
    else if (id === 'dld-exp-1') {
        title = 'Study and Verification of Logic Gates';
        aim = 'To meticulously study, design, and verify the truth tables of fundamental digital logic gates using digital ICs.';
        theory = 'Logic gates are the basic building blocks of any digital system. They operate on one or more binary inputs to produce a single binary output based on a specific boolean algebraic function.\n\nThe core gates include:\n1. AND Gate: Produces a high output (1) only if all inputs are high.\n2. OR Gate: Produces a high output if at least one input is high.\n3. NOT Gate (Inverter): Reverses the logical state of its input.\n\nUniversal gates (NAND and NOR) are exceptionally important because any other boolean function or gate can be implemented exclusively using them. XOR (Exclusive-OR) is also critical for arithmetic operations and parity generation. Verifying their truth tables against IC outputs confirms their theoretical behavior in physical circuits.';
    }
    else if (id === 'dld-exp-2') {
        title = 'Half Adder and Full Adder';
        aim = 'To construct and test Half Adder and Full Adder circuits to perform binary arithmetic addition.';
        theory = 'Adders are combinational logic circuits that perform the addition of binary numbers, forming the core of the Arithmetic Logic Unit (ALU) in microprocessors.\n\nA Half Adder adds two single-bit binary numbers (A and B), producing a Sum (S) and a Carry (C). It is constructed using an XOR gate for the Sum and an AND gate for the Carry. However, it cannot handle a carry-in from a previous less significant bit.\n\nA Full Adder overcomes this limitation by adding three bits: two significant bits (A and B) and a Carry-in (Cin). It produces a Sum and a Carry-out (Cout). Multiple Full Adders can be cascaded to add n-bit binary numbers (Ripple Carry Adder), which is fundamental for any computational device.';
    }
    else if (id === 'dld-exp-3') {
        title = 'Half Subtractor and Full Subtractor';
        aim = 'To architect and comprehensively test Half Subtractor and Full Subtractor circuits for binary arithmetic subtraction.';
        theory = 'Subtractors are combinational logic circuits designed to perform the subtraction of two binary numbers.\n\nA Half Subtractor performs the subtraction of two single bits (A - B), yielding a Difference (D) and a Borrow (Bout). The Difference is obtained using an XOR gate (similar to the Half Adder), but the Borrow requires an inverted A input ANDed with B (A\'B).\n\nA Full Subtractor handles three inputs: the minuend (A), the subtrahend (B), and a Borrow-in (Bin) from a previous less significant stage. It produces a Difference and a Borrow-out. In modern processors, subtraction is typically implemented using Adders and two\'s complement arithmetic rather than dedicated subtractor circuits, but studying them is crucial for understanding foundational combinational logic.';
    }
    else if (id === 'dld-exp-4') {
        title = 'Code Conversion (Binary to Gray)';
        aim = 'To design and implement a combinational logic circuit for converting Binary code to Gray code and vice versa.';
        theory = 'Code converters are digital circuits used to translate data from one discrete encoding scheme to another. \n\nGray Code (or reflected binary code) is an unweighted encoding scheme where two successive values differ by only a single bit (a Hamming distance of 1). This property makes it highly resilient to errors in electromechanical switches, rotary encoders, and digital communication protocols where multiple bits changing simultaneously could cause transient erroneous states.\n\nConverting standard binary to Gray code involves XORing adjacent bits of the binary number. The Most Significant Bit (MSB) remains identical, while subsequent bits are formed by XORing the current binary bit with the previous binary bit. Understanding this conversion highlights the practical applications of XOR logic.';
    }
    else if (id === 'dld-exp-5') {
        title = 'Combinational Logic Design (SOP)';
        aim = 'To systematically design and optimize combinational logic circuits using Sum of Products (SOP) expressions and Karnaugh Maps.';
        theory = 'Combinational logic circuits are systems whose outputs are determined entirely by the current combination of inputs, without any memory of previous states.\n\nAny complex boolean function can be expressed in canonical Sum of Products (SOP) form, which consists of multiple AND terms (minterms) that are ORed together. While a direct implementation of the SOP expression guarantees correct functionality, it often results in inefficient circuits with excessive gates.\n\nTo optimize these designs, tools like Karnaugh Maps (K-Maps) or the Quine-McCluskey algorithm are used. K-Maps provide a visual method of grouping adjacent minterms to eliminate redundant boolean variables, yielding a minimized SOP expression. This minimized expression translates to a simpler, faster, and cheaper physical circuit.';
    }
    else if (id === 'dld-exp-6') {
        title = 'Decoder and Encoder Circuits';
        aim = 'To design, verify, and understand the applications of Decoder and Encoder combinational circuits.';
        theory = 'Decoders and Encoders are complementary combinational circuits used extensively in memory addressing, data routing, and data compression.\n\nA Decoder takes an n-bit binary input and activates exactly one of its 2^n outputs. For example, a 3-to-8 decoder takes a 3-bit address and selects one of eight distinct memory chips or output lines. Decoders can also be used to implement arbitrary boolean functions by treating the outputs as minterms and tying them into an OR gate.\n\nConversely, an Encoder performs the reverse operation: it receives multiple input lines (where typically only one is active) and generates an n-bit binary code representing the active input. Priority Encoders are a specialized variant that resolve conflicts by assigning priority levels to inputs, ensuring that if multiple inputs are active, the highest priority input dictates the output code.';
    }
    else if (id === 'dld-exp-7') {
        title = 'Multiplexer and Demultiplexer';
        aim = 'To intricately design and verify Multiplexer (MUX) and Demultiplexer (DEMUX) circuits and their role in data routing.';
        theory = 'Multiplexers and Demultiplexers are combinational logic circuits acting as digitally controlled switches, essential for data routing in communications and processors.\n\nA Multiplexer (MUX) is a "data selector." It takes 2^n data input lines and routes exactly one of them to a single output line, based on the state of n selection lines. MUXes are heavily used in time-division multiplexing (TDM) and parallel-to-serial data conversion. Furthermore, a 2^n-to-1 MUX can implement any boolean function of n+1 variables without needing discrete logic gates.\n\nA Demultiplexer (DEMUX) is a "data distributor." It takes a single input line and routes it to one of 2^n output lines, again dictated by n selection lines. DEMUXes are critical in serial-to-parallel conversion and address decoding within memory architectures.';
    }
    else if (id === 'dld-exp-8') {
        title = 'Comparators (1-bit & 4-bit)';
        aim = 'To design and thoroughly test 1-bit and 4-bit magnitude comparators for relative arithmetic assessment.';
        theory = 'A Magnitude Comparator is a specialized combinational logic circuit that compares two binary numbers, A and B, and determines their relative magnitudes, asserting one of three outputs: A > B, A < B, or A = B.\n\nA 1-bit comparator uses XNOR gates for equality (outputting 1 if bits match) and a combination of AND/NOT gates for greater/less than conditions. \n\nFor larger words, such as a 4-bit comparator, the circuit evaluates the Most Significant Bits (MSBs) first. If the MSBs are different, the comparison is immediately resolved. If they are equal, the circuit cascades to the next significant bit, and so on. Understanding comparators is vital for conditional branching in CPUs, sorting algorithms, and digital control systems.';
    }
    else if (id === 'dld-exp-9') {
        title = 'Flip-Flops';
        aim = 'To empirically study and verify the truth tables and timing characteristics of various Flip-Flops (SR, D, JK, T).';
        theory = 'Unlike combinational logic, Sequential Logic circuits have state (memory). Their outputs depend on both current inputs and previous states. The fundamental building block of sequential logic is the Flip-Flop.\n\nA Flip-Flop is a bistable multivibrator capable of storing a single bit of data. They are typically edge-triggered by a clock signal:\n- SR (Set-Reset) Flip-Flop: Sets to 1 on S, resets to 0 on R. Invalid state when both are 1.\n- D (Data) Flip-Flop: Overcomes SR issues by ensuring S and R are never simultaneously high. It simply captures the value of D at the clock edge.\n- JK Flip-Flop: Versatile design that toggles its state when both J and K are high, eliminating the invalid SR state.\n- T (Toggle) Flip-Flop: Toggles its output if T is high at the clock edge.\n\nFlip-flops are the essential components for constructing registers, memory arrays, and finite state machines (FSMs).';
    }
    else if (id === 'dld-exp-10') {
        title = 'Synchronous and Asynchronous Counters';
        aim = 'To architect, simulate, and contrast the design and performance of Synchronous and Asynchronous (Ripple) counters.';
        theory = 'Counters are sequential logic circuits, constructed from cascaded flip-flops, designed to cycle through a specific sequence of states upon receiving clock pulses.\n\nAsynchronous (Ripple) Counters are simpler to design. The clock pulse is applied only to the first flip-flop, and the output of each flip-flop serves as the clock for the subsequent one. While simple, they suffer from cumulative propagation delay ("ripple delay"), limiting their maximum operating frequency and potentially causing transient incorrect states (glitches) during decoding.\n\nSynchronous Counters eliminate ripple delay by applying the same global clock signal simultaneously to all flip-flops in the sequence. The next state of each flip-flop is determined by combinational logic (usually AND gates) based on the current state of all preceding flip-flops. Though more complex to design, they offer vastly superior speed and reliability, making them the standard in high-frequency digital systems.';
    }
    else if (id.startsWith('oops')) { 
        title = 'Java Compiler'; 
        aim = 'To practically implement and master the core paradigms of Object-Oriented Programming (OOP) using the Java language.'; 
        theory = 'Object-Oriented Programming (OOP) is a programming paradigm based on the concept of "objects," which contain data (attributes/fields) and code (methods/functions). Java is a strictly object-oriented language that enforces four main pillars:\n\n1. Encapsulation: The bundling of data and methods that operate on that data into a single unit (class), restricting direct access to some components using access modifiers (private, protected).\n2. Abstraction: Hiding the complex implementation details and showing only the essential features of the object, often achieved via abstract classes and interfaces.\n3. Inheritance: The mechanism where one class acquires the properties and behaviors of another, promoting code reusability and establishing hierarchical relationships.\n4. Polymorphism: The ability of different objects to respond to the same method call in their own way, typically implemented through method overriding and overloading.\n\nMastering these concepts allows for the creation of modular, scalable, and maintainable software architectures.'; 
    }
    
    return { title, aim, theory };
};

function ExperimentPageContent({ id }: { id: string }) {
    const [experiment, setExperiment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // IDE state
    const [output, setOutput] = useState<any>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [code, setCode] = useState("");
    const [currentLanguage, setCurrentLanguage] = useState("c");
    const [compilerError, setCompilerError] = useState<string | null>(null);
    const [customInput, setCustomInput] = useState("");
    const [complexityData, setComplexityData] = useState<any>(null);

    // Sidebar state
    const [activeSection, setActiveSection] = useState("aim");
    const [simulationStarted, setSimulationStarted] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const intent = sessionStorage.getItem("openTab");
            if (intent) {
                // Map 'test' intent to test
                if (intent === 'test') setActiveSection('test');
                else setActiveSection(intent);
                sessionStorage.removeItem("openTab");
            }
        }
    }, []);

    useEffect(() => {
        if (output?.status?.description === "Accepted" && !isCompleted) {
            setIsCompleted(true);
        }
    }, [output, isCompleted]);

    useEffect(() => {
        const fetchExperiment = async () => {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 2000);
                const res = await fetch(`${API_URL}/api/experiments/${id}`, { signal: controller.signal });
                clearTimeout(timeoutId);
                const data = await res.ok ? await res.json() : null;
                
                const applyFallback = () => {
                    console.warn("[VLAB] Backend unreachable or missing data, using fallback experiment data for ID:", id);
                    const { title, aim, theory } = getFallbackData(id);
                    setExperiment({
                        id,
                        title,
                        description: "Interactive Simulation Environment",
                        compilerEnabled: false,
                        theory,
                        aim,
                        algorithm: "1. Follow on-screen instructions.\n2. Observe output."
                    });
                    setError(null);
                };

                if (data && !data.error) {
                    // Override any backend theory/aim with our detailed frontend definitions
                    const richData = getFallbackData(id);
                    data.theory = richData.theory;
                    data.aim = richData.aim;

                    setExperiment(data);
                    setCode(data.codeTemplate || data.defaultCode || "");
                    setCurrentLanguage(data.language || "c");
                } else {
                    applyFallback();
                }
            } catch (err) {
                console.warn("[VLAB] Network Error fetching experiment, applying fallback for ID:", id);
                const { title, aim, theory } = getFallbackData(id);
                setExperiment({
                    id,
                    title,
                    description: "Interactive Simulation Environment",
                    compilerEnabled: false,
                    theory,
                    aim,
                    algorithm: "1. Follow on-screen instructions.\n2. Observe output."
                });
                setError(null);
            } finally {
                setLoading(false);
            }
        };
        fetchExperiment();
    }, [id]);

    const handleRun = async () => {
        setIsRunning(true);
        setCompilerError(null);
        setOutput(null);
        setComplexityData(null);

        try {
            const res = await fetch(`${API_URL}/api/code/run`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, language: currentLanguage.toLowerCase(), input: customInput })
            });

            const data = await res.json();
            if (res.ok) setOutput(data);
            else setCompilerError(data.error || "Execution failed");
        } catch (err) {
            setCompilerError("Network Error: Could not connect to compiler service.");
        } finally {
            setIsRunning(false);
        }
    };

    const handleAnalyzeComplexity = async () => {
        setIsRunning(true);
        setCompilerError(null);
        try {
            const inputs = [
                { label: "N=1,000", size: 1000, input: "1000" },
                { label: "N=10,000", size: 10000, input: "10000" },
                { label: "N=50,000", size: 50000, input: "50000" },
                { label: "N=100,000", size: 100000, input: "100000" }
            ];
            const res = await fetch(`${API_URL}/api/code/complexity`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, language: currentLanguage.toLowerCase(), inputs })
            });
            const data = await res.json();
            if (res.ok) setComplexityData(data);
            else setCompilerError(data.error || "Complexity analysis failed");
        } catch (err) {
            setCompilerError("Network Error: Could not connect to complexity service.");
        } finally {
            setIsRunning(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen items-center justify-center bg-transparent">
                <i className="bx bx-loader2 h-10 w-10 animate-spin text-primary mb-4" />
            </div>
        );
    }

    if (error || !experiment) {
        return (
            <div className="flex flex-col min-h-screen items-center justify-center bg-background p-4 text-center">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                    <i className="bx bx-info h-10 w-10 text-red-500" />
                </div>
                <h1 className="text-3xl font-black uppercase tracking-tighter mb-2 text-foreground">Experiment Not Found</h1>
                <p className="text-muted-foreground max-w-md mb-8">The experiment you are looking for might have been moved or deleted.</p>
                <a href="/dashboard">
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 rounded-xl font-bold uppercase tracking-widest text-xs">
                        Back to Dashboard
                    </Button>
                </a>
            </div>
        );
    }

    const isProgrammingLab = experiment.compilerEnabled === true || !!experiment.codeTemplate;

    if (isProgrammingLab) {
        return (
            <div className="hidden md:flex flex-col h-screen bg-background selection:bg-primary selection:text-primary-foreground overflow-hidden">
                <header className="h-12 bg-background border-b border-border flex items-center justify-between px-4 z-50">
                    <div className="flex items-center gap-4">
                        <a href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
                            <div className="p-1.5 rounded-lg group-hover:bg-accent">
                                <i className="bx bx-arrowleft h-3.5 w-3.5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest">Dashboard</span>
                        </a>
                        <div className="h-3 w-[1px] bg-border" />
                        <div className="flex items-center gap-2">
                            <Badge className="bg-primary hover:bg-primary text-[9px] font-black tracking-widest px-1.5 py-0 text-primary-foreground">EXP {experiment.experimentNumber || "01"}</Badge>
                            <h1 className="text-xs font-black text-foreground uppercase tracking-tight truncate max-w-[300px]">{experiment.title}</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-muted rounded-full border border-border">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Auto-Saving Active</span>
                        </div>
                        <Badge variant="outline" className="border-primary/50 text-primary text-[9px] font-black uppercase px-2 py-0.5 rounded-full mr-2">Pro Lab Mode</Badge>

                        <Button
                            size="sm"
                            onClick={handleRun}
                            disabled={isRunning}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground h-8 px-4 font-black text-[10px] uppercase tracking-widest rounded-lg"
                        >
                            {isRunning ? <i className="bx bx-loader2 h-3 w-3 animate-spin mr-2" /> : <i className="bx bx-play-circle h-3 w-3 mr-2" />}
                            {isRunning ? 'Compiling' : 'Run Experiment'}
                        </Button>
                        <ThemeToggle />
                    </div>
                </header>

                <div className="h-1 w-full bg-muted relative group cursor-help">
                    <div className="h-full bg-primary duration-1000 ease-in-out" style={{ width: isCompleted ? '100%' : '65%' }} />
                </div>

                <main className="flex-1 flex overflow-hidden">
                    <div className="flex-1 flex flex-col bg-[#1e1e1e] relative z-10 overflow-hidden border-x border-black/10">
                        <CodeCompiler
                            labId={experiment._id}
                            code={code}
                            setCode={setCode}
                            currentLanguage={currentLanguage}
                            setLanguage={setCurrentLanguage}
                            output={output}
                            setOutput={setOutput}
                            isRunning={isRunning}
                            setIsRunning={setIsRunning}
                            handleRun={handleRun}
                            error={compilerError}
                            setError={setCompilerError}
                            customInput={customInput}
                            setCustomInput={setCustomInput}
                        />
                    </div>
                    <ExecutionInsights output={output} isRunning={isRunning} complexityData={complexityData} onAnalyzeComplexity={handleAnalyzeComplexity} />
                </main>
            </div>
        );
    }

    const simLabId = experiment.slug || experiment.id || experiment._id;
    const subjectName = getSubjectName(simLabId);

    const renderContent = () => {
        switch (activeSection) {
            case "aim":
                return (
                    <div className="p-8 max-w-4xl">
                        <h2 className="text-2xl font-bold mb-6 underline decoration-primary/50 underline-offset-8">Aim</h2>
                        
                        <div className="mb-8">
                            <h3 className="text-lg font-bold mb-2">Estimated Time</h3>
                            <p className="text-muted-foreground">1 hour</p>
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-bold mb-2">Learning Objective of the Experiment</h3>
                            <p className="text-muted-foreground whitespace-pre-wrap">{experiment.aim || "To study and analyze the core concepts of this experiment."}</p>
                        </div>
                    </div>
                );
            case "theory":
                return (
                    <div className="p-8 max-w-4xl">
                        <h2 className="text-2xl font-bold mb-6 underline decoration-primary/50 underline-offset-8">Theory</h2>
                        <div className="prose dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
                            {experiment.theory || "Detailed theory will be populated here."}
                        </div>
                    </div>
                );
            case "procedure":
                return (
                    <div className="p-8 max-w-4xl">
                        <h2 className="text-2xl font-bold mb-6 underline decoration-primary/50 underline-offset-8">Procedure</h2>
                        <div className="prose dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
                            {experiment.algorithm || "1. Read the theory carefully.\n2. Proceed to the simulation section.\n3. Interact with the simulation environment.\n4. Complete the posttest to evaluate your learning."}
                        </div>
                    </div>
                );
            case "simulation":
                if (!simulationStarted) {
                    return (
                        <div className="flex flex-col items-center min-h-full bg-background text-muted-foreground select-none overflow-y-auto pb-12 w-full">
                            <div className="w-full max-w-4xl mt-8">
                                <div className="bg-gradient-to-br from-[#021D24] to-[#059669] rounded-t-2xl p-8 text-white relative overflow-hidden">
                                    <div className="relative z-10 flex items-start gap-4">
                                        <div className="bg-card/20 p-3 rounded-xl backdrop-blur-sm">
                                            <i className="bx bx-play-circle text-3xl text-white"></i>
                                        </div>
                                        <div>
                                            <p className="text-white/80 font-bold tracking-widest text-xs uppercase mb-1">{subjectName}</p>
                                            <h1 className="text-4xl font-bold text-white mb-3">{experiment.title}</h1>
                                            <p className="text-white/80 text-sm">Interactive Simulation Overview</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-card rounded-b-2xl shadow-none-none border border-border p-6 mb-6">
                                    <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Simulation Details</h2>
                                    <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                                        {experiment.description || "In this interactive simulation, you will be able to visualize and interact with the concepts discussed in the theory section. Follow the provided algorithm and observe the outcomes closely."}
                                    </p>
                                </div>

                                <button
                                    onClick={() => setSimulationStarted(true)}
                                    className="w-full mt-4 py-4 bg-primary hover:bg-primary text-white font-bold rounded-xl text-lg shadow-none-none active:scale-[0.98]"
                                >
                                    START SIMULATION
                                </button>
                            </div>
                        </div>
                    );
                }
                return (
                    <div className="flex-1 flex flex-col h-full bg-background min-h-[600px] w-full">
                        <SimulationRenderer labId={simLabId} initialCode={experiment.codeTemplate} language={experiment.language} />
                    </div>
                );
            case "test":
                return (
                    <div className="flex-1 flex flex-col h-full">
                        <LabTest labId={simLabId} labTitle={experiment.title} />
                    </div>
                );
            default:
                return (
                    <div className="p-8 max-w-4xl">
                        <h2 className="text-2xl font-bold mb-6 underline decoration-primary/50 underline-offset-8 capitalize">{activeSection}</h2>
                        <p className="text-muted-foreground italic">Content for {activeSection} is currently being updated for {experiment.title}.</p>
                    </div>
                );
        }
    };

    return (
        <div className="hidden md:flex flex-col h-screen bg-background overflow-hidden font-sans">
            {activeSection === "simulation" && simulationStarted ? (
                <div className="flex-1 flex flex-col h-screen bg-background overflow-hidden relative">
                    <div className="h-10 bg-card border-b border-border flex items-center justify-between px-4 z-50 flex-shrink-0">
                        <button
                            onClick={() => setSimulationStarted(false)}
                            className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors bg-muted/60 hover:bg-muted px-3 py-1.5 rounded-lg"
                        >
                            <i className="bx bx-arrow-back text-sm" />
                            <span>Exit Simulation / Back to Lab</span>
                        </button>
                        <div className="flex items-center gap-4">
                            <div className="text-xs font-semibold text-muted-foreground truncate hidden sm:block">
                                {experiment.title} • Interactive Simulation Mode
                            </div>
                            <ThemeToggle />
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
                        <SimulationRenderer labId={simLabId} initialCode={experiment.codeTemplate} language={experiment.language} />
                    </div>
                </div>
            ) : (
                <>
                    <header className="h-14 bg-background border-b border-border flex items-center justify-between px-6 z-50 flex-shrink-0">
                        <div className="flex items-center text-sm font-medium text-muted-foreground">
                            <a href="/dashboard" className="hover:text-primary transition-colors">Dashboard</a>
                            <ChevronRight className="w-4 h-4 mx-2" />
                            <span className="hover:text-primary transition-colors cursor-pointer">{subjectName}</span>
                            <ChevronRight className="w-4 h-4 mx-2" />
                            <span className="text-foreground font-semibold">Experiments</span>
                        </div>
                        <ThemeToggle />
                    </header>

                    <div className="flex flex-1 overflow-hidden">
                        <aside className="w-64 bg-card border-r border-border flex flex-col flex-shrink-0 overflow-y-auto">
                            <div className="py-4">
                                {SECTIONS.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`w-full text-left px-8 py-4 text-base font-semibold transition-colors ${
                                            activeSection === section.id 
                                                ? "text-primary border-l-4 border-primary bg-primary/10" 
                                                : "text-muted-foreground hover:bg-muted border-l-4 border-transparent hover:border-primary/30"
                                        }`}
                                    >
                                        {section.label}
                                    </button>
                                ))}
                            </div>
                        </aside>

                        <main className="flex-1 flex flex-col overflow-y-auto bg-background">
                            {/* Common Title Header for non-fullscreen tabs */}
                            {["simulation", "test"].includes(activeSection) ? null : (
                                <div className="w-full text-center py-8 bg-card border-b border-border">
                                    <h1 className="text-3xl font-black uppercase tracking-tighter text-primary">{subjectName}</h1>
                                    <p className="text-muted-foreground font-semibold mt-2 text-lg">Experiment {experiment.experimentNumber || "01"} • {experiment.title}</p>
                                </div>
                            )}
                            
                            <div className="flex-1 flex flex-col">
                                {renderContent()}
                            </div>
                        </main>
                    </div>
                </>
            )}
        </div>
    );
}


export default function ExperimentPage({ id }: { id: string }) {
    return (
        <>
            <div className="flex md:hidden flex-col items-center justify-center h-screen bg-background p-6 text-center z-[9999] relative">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <i className="bx bx-laptop text-4xl text-primary"></i>
                </div>
                <h1 className="text-2xl font-black uppercase tracking-tighter mb-3 text-foreground">Larger Screen Required</h1>
                <p className="text-muted-foreground text-sm max-w-[280px] mb-8">
                    Smaller device widths are not able to load experiment interfaces properly. Please open this page on a tablet or desktop.
                </p>
                <a href="/dashboard">
                    <Button className="bg-primary hover:bg-primary text-primary-foreground font-bold uppercase tracking-widest text-xs px-8 py-6 rounded-xl shadow-none">
                        Back to Dashboard
                    </Button>
                </a>
            </div>
            <div className="hidden md:block h-full w-full">
                <ExperimentPageContent id={id} />
            </div>
        </>
    );
}
