use sqlx::PgPool;
use uuid::Uuid;
use crate::models::video_tutor::{
    VideoLesson, VideoLessonResponse, LessonScript, LessonSlide, LessonDiagram,
    LessonAnimation, LessonQuiz, LearningProfile, StudentProgress, CompleteLessonPayload
};

// Generates simulated lesson payload based on topic, mode, avatar, voice, and language
pub async fn generate_lesson(
    db: &PgPool,
    student_id: Uuid,
    topic: &str,
    mode: &str,
    avatar: &str,
    voice: &str,
    language: &str,
) -> Result<CompleteLessonPayload, sqlx::Error> {
    // 1. Create the base video lesson record
    let lesson_id = Uuid::new_v4();
    let duration_seconds = 300; // Simulated 5-minute video lesson

    let lesson = sqlx::query_as::<_, VideoLesson>(
        r#"
        INSERT INTO video_lessons (id, student_id, topic, mode, avatar, voice, language, duration_seconds, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'completed')
        RETURNING *
        "#
    )
    .bind(lesson_id)
    .bind(student_id)
    .bind(topic)
    .bind(mode)
    .bind(avatar)
    .bind(voice)
    .bind(language)
    .bind(duration_seconds)
    .fetch_one(db)
    .await?;

    // 2. Fetch or initialize Student Learning Profile (and adapt)
    let profile = sqlx::query_as::<_, LearningProfile>(
        "SELECT * FROM learning_profiles WHERE student_id = $1"
    )
    .bind(student_id)
    .bind(student_id) // placeholder
    .fetch_optional(db)
    .await?;

    let learning_speed = match &profile {
        Some(p) => p.learning_speed.clone(),
        None => {
            // Seed profile
            sqlx::query!(
                "INSERT INTO learning_profiles (student_id, learning_speed) VALUES ($1, 'normal')",
                student_id
            )
            .execute(db)
            .await?;
            "normal".to_string()
        }
    };

    // Calculate dynamic slide duration factors based on user learning speed
    let speed_multiplier = match learning_speed.as_str() {
        "slow" => 1.3,
        "fast" => 0.8,
        _ => 1.0,
    };

    // 3. Assemble script segments, slides, diagrams, animations, and quizzes based on the topic
    let normalized_topic = topic.to_lowercase();
    let is_half_adder = normalized_topic.contains("half adder");
    let is_bst = normalized_topic.contains("bst") || normalized_topic.contains("binary search tree");
    let is_tcp = normalized_topic.contains("tcp") || normalized_topic.contains("handshake");
    let _is_joins = normalized_topic.contains("joins") || normalized_topic.contains("sql join");

    let is_hindi = language.to_lowercase() == "hindi";

    let mut scripts = Vec::new();
    let mut slides = Vec::new();
    let mut diagrams = Vec::new();
    let mut animations = Vec::new();
    let mut quizzes = Vec::new();

    if is_half_adder {
        if is_hindi {
            // Half Adder Content (Hindi)
            // Scripts
            scripts = vec![
                LessonScript { id: Uuid::new_v4(), lesson_id, section_name: "intro".to_string(), narration_text: "स्वागत है! आज हम हाफ एडर को समझेंगे और उसका डिज़ाइन देखेंगे, जो सभी डिजिटल अंकगणितीय सर्किट सिस्टम का मूल आधार है। यह दो सिंगल-बिट इनपुट्स को जोड़ता है और सम तथा कैरी आउटपुट्स की गणना करता है।".to_string(), avatar_animation: "explaining".to_string(), sequence_order: 1 },
                LessonScript { id: Uuid::new_v4(), lesson_id, section_name: "concept".to_string(), narration_text: "एक हाफ एडर दो इनपुट बिट्स, A और B लेता है। यह जोड़ की प्रक्रिया करता है जहाँ सम बिट की गणना एक XOR लॉजिक गेट द्वारा की जाती है, और कैरी बिट की गणना AND गेट द्वारा की जाती है।".to_string(), avatar_animation: "pointing".to_string(), sequence_order: 2 },
                LessonScript { id: Uuid::new_v4(), lesson_id, section_name: "diagram".to_string(), narration_text: "अपनी स्क्रीन पर सर्किट रेखाचित्र को देखें। इनपुट्स दोनों गेट्स में समानांतर रूप से जाते हैं। सम का मान XOR है: A XOR B, और कैरी का मान AND है: A AND B।".to_string(), avatar_animation: "gesturing".to_string(), sequence_order: 3 },
                LessonScript { id: Uuid::new_v4(), lesson_id, section_name: "visualization".to_string(), narration_text: "आइए सिग्नल प्रवाह को एनिमेट करें। जब A का मान एक और B का मान शून्य होता है, तो XOR गेट हाई हो जाता है जिससे सम एक प्राप्त होता है, जबकि AND गेट लो रहता है जिससे कैरी शून्य रहता है। यदि दोनों इनपुट एक हैं, तो सम शून्य और कैरी एक हो जाता है।".to_string(), avatar_animation: "nodding".to_string(), sequence_order: 4 },
                LessonScript { id: Uuid::new_v4(), lesson_id, section_name: "application".to_string(), narration_text: "हाफ एडर सीपीयू के अर्थमेटिक लॉजिक यूनिट यानी ALU में हर जगह पाए जाते हैं। हालांकि, इनमें कैरी-इन पोर्ट नहीं होता है। मल्टी-बिट गणना के लिए, हम इन्हें जोड़कर फुल एडर बनाते हैं।".to_string(), avatar_animation: "explaining".to_string(), sequence_order: 5 },
            ];

            // Slides
            slides = vec![
                LessonSlide { id: Uuid::new_v4(), lesson_id, title: "हाफ एडर क्या है?".to_string(), bullet_points: vec!["संयोजन लॉजिक सर्किट".to_string(), "दो 1-बिट बाइनरी इनपुट्स (A, B) को जोड़ता है".to_string(), "सम (Sum) और कैरी (Carry) आउटपुट देता है".to_string()], duration_seconds: (45.0 * speed_multiplier) as i32, sequence_order: 1 },
                LessonSlide { id: Uuid::new_v4(), lesson_id, title: "गणितीय समीकरण".to_string(), bullet_points: vec!["Sum (S) = A ⊕ B (XOR गेट)".to_string(), "Carry (C) = A · B (AND गेट)".to_string(), "बाइनरी जोड़ का मूल आधार".to_string()], duration_seconds: (45.0 * speed_multiplier) as i32, sequence_order: 2 },
                LessonSlide { id: Uuid::new_v4(), lesson_id, title: "ट्रुथ टेबल का सारांश".to_string(), bullet_points: vec!["A=0, B=0 => S=0, C=0".to_string(), "A=1, B=0 => S=1, C=0".to_string(), "A=1, B=1 => S=0, C=1".to_string()], duration_seconds: (45.0 * speed_multiplier) as i32, sequence_order: 3 },
                LessonSlide { id: Uuid::new_v4(), lesson_id, title: "वास्तविक अनुप्रयोग".to_string(), bullet_points: vec!["ALU आर्किटेक्चर का मुख्य तत्व".to_string(), "मल्टी-बिट रिपल-कैरी एडर बनाने में प्रयुक्त".to_string(), "बाइनरी डिजिटल क्लॉक काउंटर्स में उपयोग".to_string()], duration_seconds: (45.0 * speed_multiplier) as i32, sequence_order: 4 },
            ];

            // Diagram
            diagrams = vec![
                LessonDiagram {
                    id: Uuid::new_v4(),
                    lesson_id,
                    diagram_type: "logic_circuit".to_string(),
                    mermaid_code: r#"graph LR
A[इनपुट A] --> XOR((XOR गेट))
B[इनपुट B] --> XOR
A --> AND((AND गेट))
B --> AND
XOR --> S[सम आउटपुट S]
AND --> C[कैरी आउटपुट C]
classDef default fill:#f9f9f9,stroke:#333,stroke-width:2px;
classDef gate fill:#e0e7ff,stroke:#4f46e5,stroke-width:2px;
class XOR,AND gate;"#.to_string(),
                    sequence_order: 1
                }
            ];

            // Animations
            animations = vec![
                LessonAnimation {
                    id: Uuid::new_v4(),
                    lesson_id,
                    animation_type: "signal_flow".to_string(),
                    config_json: serde_json::json!({
                        "inputs": [{"name": "A", "val": 1}, {"name": "B", "val": 0}],
                        "gates": [
                            {"type": "XOR", "inputs": [1, 0], "output": 1},
                            {"type": "AND", "inputs": [1, 0], "output": 0}
                        ],
                        "signals": [
                            {"from": "A", "to": "XOR", "active": true},
                            {"from": "B", "to": "XOR", "active": false},
                            {"from": "A", "to": "AND", "active": true},
                            {"from": "B", "to": "AND", "active": false}
                        ]
                    }),
                    sequence_order: 1
                }
            ];

            // Quizzes
            quizzes = vec![
                LessonQuiz { id: Uuid::new_v4(), lesson_id, question: "हाफ एडर का सम (Sum) आउटपुट कौन सा लॉजिक गेट प्रदान करता है?".to_string(), options: vec!["AND गेट".to_string(), "OR गेट".to_string(), "XOR गेट".to_string(), "NAND गेट".to_string()], correct_option: 2, explanation: "सम (Sum) बिट जोड़ के परिणाम को दर्शाता है, जो XOR लॉजिक के समान है (जब इनपुट अलग होते हैं तब हाई होता है)।".to_string() },
                LessonQuiz { id: Uuid::new_v4(), lesson_id, question: "जब इनपुट्स A=1 और B=1 हों, तो सम (Sum) और कैरी (Carry) के मान क्या होंगे?".to_string(), options: vec!["Sum = 1, Carry = 1".to_string(), "Sum = 0, Carry = 1".to_string(), "Sum = 1, Carry = 0".to_string(), "Sum = 0, Carry = 0".to_string()], correct_option: 1, explanation: "बाइनरी में 1 + 1 का मान 2 होता है, जिसे बाइनरी '10' लिखा जाता है (सम = 0, कैरी = 1)।".to_string() },
                LessonQuiz { id: Uuid::new_v4(), lesson_id, question: "मल्टी-बिट नंबर्स को जोड़ने के लिए केवल हाफ एडर काफी क्यों नहीं है?".to_string(), options: vec!["यह पिछली कॉलम जोड़ से कैरी (Carry) मान नहीं ले सकता".to_string(), "यह डिजिटल रजिस्टर्स में बहुत धीमा चलता है".to_string(), "इसमें XOR गेट का कॉन्फ़िगरेशन नहीं होता".to_string(), "यह अत्यधिक बिजली की खपत करता है".to_string()], correct_option: 0, explanation: "हाफ एडर केवल दो इनपुट जोड़ता है और इसमें पिछले स्टेज के कैरी (Carry) बिट के लिए कोई इनपुट पोर्ट नहीं होता। इसके लिए फुल एडर चाहिए।".to_string() },
            ];
        } else {
            // Half Adder Content
            // Scripts
            scripts = vec![
                LessonScript { id: Uuid::new_v4(), lesson_id, section_name: "intro".to_string(), narration_text: "Welcome! Today, we will design and understand the Half Adder, the fundamental building block of all digital arithmetic circuit systems. It adds two single-bit inputs and computes Sum and Carry outputs.".to_string(), avatar_animation: "explaining".to_string(), sequence_order: 1 },
                LessonScript { id: Uuid::new_v4(), lesson_id, section_name: "concept".to_string(), narration_text: "A Half Adder takes two input bits, A and B. It performs addition where the Sum bit is computed using an XOR logic gate, and the Carry bit is computed using an AND gate.".to_string(), avatar_animation: "pointing".to_string(), sequence_order: 2 },
                LessonScript { id: Uuid::new_v4(), lesson_id, section_name: "diagram".to_string(), narration_text: "Observe the circuit schematic on your screen. The inputs feed in parallel to both gates. Sum is XOR: A times B-bar plus A-bar times B. Carry is AND: A times B.".to_string(), avatar_animation: "gesturing".to_string(), sequence_order: 3 },
                LessonScript { id: Uuid::new_v4(), lesson_id, section_name: "visualization".to_string(), narration_text: "Let's animate signal flow. When A equals one and B equals zero, the XOR gate triggers high, producing Sum equals one, while the AND gate stays low, producing Carry equals zero. If both are one, Sum is zero and Carry is one.".to_string(), avatar_animation: "nodding".to_string(), sequence_order: 4 },
                LessonScript { id: Uuid::new_v4(), lesson_id, section_name: "application".to_string(), narration_text: "Half Adders are found everywhere inside the CPU's Arithmetic Logic Unit, or ALU. However, they lack a carry-in port. For multi-bit arithmetic, we chain them to form Full Adders.".to_string(), avatar_animation: "explaining".to_string(), sequence_order: 5 },
            ];

            // Slides
            slides = vec![
                LessonSlide { id: Uuid::new_v4(), lesson_id, title: "What is a Half Adder?".to_string(), bullet_points: vec!["Combinational logic circuit".to_string(), "Adds two 1-bit binary inputs (A, B)".to_string(), "Outputs Sum (S) and Carry (C)".to_string()], duration_seconds: (45.0 * speed_multiplier) as i32, sequence_order: 1 },
                LessonSlide { id: Uuid::new_v4(), lesson_id, title: "Mathematical Equations".to_string(), bullet_points: vec!["Sum (S) = A ⊕ B (XOR Gate)".to_string(), "Carry (C) = A · B (AND Gate)".to_string(), "Basis for binary addition arithmetic".to_string()], duration_seconds: (45.0 * speed_multiplier) as i32, sequence_order: 2 },
                LessonSlide { id: Uuid::new_v4(), lesson_id, title: "Truth Table Summary".to_string(), bullet_points: vec!["A=0, B=0 => S=0, C=0".to_string(), "A=1, B=0 => S=1, C=0".to_string(), "A=1, B=1 => S=0, C=1".to_string()], duration_seconds: (45.0 * speed_multiplier) as i32, sequence_order: 3 },
                LessonSlide { id: Uuid::new_v4(), lesson_id, title: "Real-World Applications".to_string(), bullet_points: vec!["Core element in ALU architectures".to_string(), "Cascaded to build multi-bit ripple-carry adders".to_string(), "Used in binary digital clock counting circuits".to_string()], duration_seconds: (45.0 * speed_multiplier) as i32, sequence_order: 4 },
            ];

            // Diagram
            diagrams = vec![
                LessonDiagram {
                    id: Uuid::new_v4(),
                    lesson_id,
                    diagram_type: "logic_circuit".to_string(),
                    mermaid_code: r#"graph LR
A[Input A] --> XOR((XOR Gate))
B[Input B] --> XOR
A --> AND((AND Gate))
B --> AND
XOR --> S[Sum Output]
AND --> C[Carry Output]
classDef default fill:#f9f9f9,stroke:#333,stroke-width:2px;
classDef gate fill:#e0e7ff,stroke:#4f46e5,stroke-width:2px;
class XOR,AND gate;"#.to_string(),
                    sequence_order: 1
                }
            ];

            // Animations
            animations = vec![
                LessonAnimation {
                    id: Uuid::new_v4(),
                    lesson_id,
                    animation_type: "signal_flow".to_string(),
                    config_json: serde_json::json!({
                        "inputs": [{"name": "A", "val": 1}, {"name": "B", "val": 0}],
                        "gates": [
                            {"type": "XOR", "inputs": [1, 0], "output": 1},
                            {"type": "AND", "inputs": [1, 0], "output": 0}
                        ],
                        "signals": [
                            {"from": "A", "to": "XOR", "active": true},
                            {"from": "B", "to": "XOR", "active": false},
                            {"from": "A", "to": "AND", "active": true},
                            {"from": "B", "to": "AND", "active": false}
                        ]
                    }),
                    sequence_order: 1
                }
            ];

            // Quizzes
            quizzes = vec![
                LessonQuiz { id: Uuid::new_v4(), lesson_id, question: "Which logic gate computes the Sum output of a Half Adder?".to_string(), options: vec!["AND gate".to_string(), "OR gate".to_string(), "XOR gate".to_string(), "NAND gate".to_string()], correct_option: 2, explanation: "The Sum bit represents the additions modulo 2, which matches XOR logic (high only if input bits differ).".to_string() },
                LessonQuiz { id: Uuid::new_v4(), lesson_id, question: "What are the Sum and Carry values when inputs are A=1 and B=1?".to_string(), options: vec!["Sum = 1, Carry = 1".to_string(), "Sum = 0, Carry = 1".to_string(), "Sum = 1, Carry = 0".to_string(), "Sum = 0, Carry = 0".to_string()], correct_option: 1, explanation: "1 + 1 in binary equals 2 (decimal), which is represented as binary '10' (Sum = 0, Carry = 1).".to_string() },
                LessonQuiz { id: Uuid::new_v4(), lesson_id, question: "Why is a Half Adder insufficient for adding multi-bit numbers like 8-bit registers?".to_string(), options: vec!["It cannot handle carrying values from previous column additions".to_string(), "It is too slow to execute in digital registers".to_string(), "It lacks an XOR gate configuration".to_string(), "It draws excessive electrical power".to_string()], correct_option: 0, explanation: "A Half Adder only adds two inputs and has no input port for a previous stage's Carry bit. A Full Adder is needed for carrying.".to_string() },
            ];
        }
    } else if is_bst {
        if is_hindi {
            // Binary Search Tree Content (Hindi)
            scripts = vec![
                LessonScript { id: Uuid::new_v4(), lesson_id, section_name: "intro".to_string(), narration_text: "नमस्कार सभी को! आज हम बाइनरी सर्च ट्री यानी BST का अध्ययन करेंगे। BST एक नोड-आधारित बाइनरी ट्री डेटा संरचना है जहाँ प्रत्येक नोड के अधिकतम दो बच्चे हो सकते हैं।".to_string(), avatar_animation: "explaining".to_string(), sequence_order: 1 },
                LessonScript { id: Uuid::new_v4(), lesson_id, section_name: "concept".to_string(), narration_text: "BST की सबसे महत्वपूर्ण विशेषता इसका क्रम है। किसी भी नोड के लिए, उसके बाएं सबट्री के सभी नोड्स का मान उस नोड से छोटा होता है, और दाएं सबट्री के सभी नोड्स का मान उस नोड से बड़ा होता है।".to_string(), avatar_animation: "pointing".to_string(), sequence_order: 2 },
                LessonScript { id: Uuid::new_v4(), lesson_id, section_name: "diagram".to_string(), narration_text: "डायग्राम को देखें। रूट आठ है। इसका बायां बच्चा तीन है, जो छोटा है, और दायां बच्चा दस है, जो बड़ा है। यह नियम पुनरावर्ती रूप से सभी सब-नोड्स पर लागू होता है।".to_string(), avatar_animation: "gesturing".to_string(), sequence_order: 3 },
                LessonScript { id: Uuid::new_v4(), lesson_id, section_name: "visualization".to_string(), narration_text: "आइए इंसर्शन एनीमेशन देखें। पाँच को सम्मिलित करते समय, हम आठ से शुरू करते हैं, बाएं जाकर तीन पर पहुँचते हैं, फिर दाएं जाते हैं क्योंकि पाँच तीन से बड़ा है, जिससे तीन का एक दायां बच्चा बन जाता है।".to_string(), avatar_animation: "nodding".to_string(), sequence_order: 4 },
                LessonScript { id: Uuid::new_v4(), lesson_id, section_name: "application".to_string(), narration_text: "BST तेज़ सर्च, इंसर्शन और डिलीशन प्रदान करता है, जिसमें औसतन O(log N) समय लगता है। हालांकि, यदि नोड्स को सॉर्टेड क्रम में डाला जाए, तो ट्री एक लीनियर लिस्ट में बदल जाता है।".to_string(), avatar_animation: "explaining".to_string(), sequence_order: 5 },
            ];

            slides = vec![
                LessonSlide { id: Uuid::new_v4(), lesson_id, title: "बाइनरी सर्च ट्री की विशेषताएं".to_string(), bullet_points: vec!["बाइनरी ट्री संरचना".to_string(), "बाएं सबट्री के मान < पैरेंट का मान".to_string(), "दाएं सबट्री के मान > पैरेंट का मान".to_string()], duration_seconds: (45.0 * speed_multiplier) as i32, sequence_order: 1 },
                LessonSlide { id: Uuid::new_v4(), lesson_id, title: "समय जटिलता (Time Complexities)".to_string(), bullet_points: vec!["औसत सर्च समय: O(log n)".to_string(), "औसत इंसर्शन समय: O(log n)".to_string(), "सबसे खराब स्थिति (Skewed Tree): O(n)".to_string()], duration_seconds: (45.0 * speed_multiplier) as i32, sequence_order: 2 },
                LessonSlide { id: Uuid::new_v4(), lesson_id, title: "इन-ऑर्डर ट्रैवर्सल (In-Order Traversal)".to_string(), bullet_points: vec!["पहले बायां सबट्री, फिर पैरेंट, फिर दायां सबट्री".to_string(), "तत्वों को बढ़ते क्रम में सॉर्टेड रूप में देता है".to_string(), "रिकर्सिव डेप्थ-फर्स्ट दृष्टिकोण".to_string()], duration_seconds: (45.0 * speed_multiplier) as i32, sequence_order: 3 },
            ];

            diagrams = vec![
                LessonDiagram {
                    id: Uuid::new_v4(),
                    lesson_id,
                    diagram_type: "tree_topology".to_string(),
                    mermaid_code: r#"graph TD
root((8)) --> left1((3))
root --> right1((10))
left1 --> left2((1))
left1 --> right2((6))
right1 --> right3((14))
right2 --> right2_left((4))
right2 --> right2_right((7))
classDef default fill:#f9f9f9,stroke:#333,stroke-width:2px;
classDef rootNode fill:#e0e7ff,stroke:#4f46e5,stroke-width:2px;
class root rootNode;"#.to_string(),
                    sequence_order: 1
                }
            ];

            animations = vec![
                LessonAnimation {
                    id: Uuid::new_v4(),
                    lesson_id,
                    animation_type: "traversal".to_string(),
                    config_json: serde_json::json!({
                        "nodes": [8, 3, 10, 1, 6, 14],
                        "highlight_sequence": [1, 3, 6, 8, 10, 14],
                        "action": "inorder_sort_print"
                    }),
                    sequence_order: 1
                }
            ];

            quizzes = vec![
                LessonQuiz { id: Uuid::new_v4(), lesson_id, question: "BST में सर्च करने की औसत समय जटिलता क्या है?".to_string(), options: vec!["O(1)".to_string(), "O(log n)".to_string(), "O(n)".to_string(), "O(n log n)".to_string()], correct_option: 1, explanation: "चूंकि एक संतुलित ट्री प्रत्येक चरण में खोज के क्षेत्र को आधा कर देता है, इसलिए खोज की गहराई लॉगरिथमिक होती है।".to_string() },
                LessonQuiz { id: Uuid::new_v4(), lesson_id, question: "BST का कौन सा ट्रैवर्सल नोड के मानों को बढ़ते क्रम में सॉर्ट करके देता है?".to_string(), options: vec!["प्री-ऑर्डर ट्रैवर्सल".to_string(), "पोस्ट-ऑर्डर ट्रैवर्सल".to_string(), "इन-ऑर्डर ट्रैवर्सल".to_string(), "लेवल-ऑर्डर ट्रैवर्सल".to_string()], correct_option: 2, explanation: "इन-ऑर्डर ट्रैवर्सल नोड्स को बाएं-रूट-दाएं क्रम में देखता है, जिससे BST में हमेशा सॉर्टेड परिणाम मिलता है।".to_string() },
            ];
        } else {
            // Binary Search Tree Content
            scripts = vec![
                LessonScript { id: Uuid::new_v4(), lesson_id, section_name: "intro".to_string(), narration_text: "Hello everyone! Today we examine the Binary Search Tree, or BST. A BST is a node-based binary tree data structure where each node has at most two children.".to_string(), avatar_animation: "explaining".to_string(), sequence_order: 1 },
                LessonScript { id: Uuid::new_v4(), lesson_id, section_name: "concept".to_string(), narration_text: "The key property of a BST is ordering. For any node, all node keys in its left subtree are smaller than its key, and all node keys in its right subtree are greater than its key.".to_string(), avatar_animation: "pointing".to_string(), sequence_order: 2 },
                LessonScript { id: Uuid::new_v4(), lesson_id, section_name: "diagram".to_string(), narration_text: "Look at the diagram. The root is eight. Its left child is three, which is smaller, and its right child is ten, which is larger. This holds recursively for all sub-nodes.".to_string(), avatar_animation: "gesturing".to_string(), sequence_order: 3 },
                LessonScript { id: Uuid::new_v4(), lesson_id, section_name: "visualization".to_string(), narration_text: "Let's watch an insertion animation. Inserting five, we start at eight, go left to three, then go right because five is greater than three, creating a right child at three.".to_string(), avatar_animation: "nodding".to_string(), sequence_order: 4 },
                LessonScript { id: Uuid::new_v4(), lesson_id, section_name: "application".to_string(), narration_text: "BSTs provide fast search, insertion, and deletion times, taking big-O log N time on average. However, if keys are inserted in sorted order, the tree degenerates into a linear list.".to_string(), avatar_animation: "explaining".to_string(), sequence_order: 5 },
            ];

            slides = vec![
                LessonSlide { id: Uuid::new_v4(), lesson_id, title: "Binary Search Tree Properties".to_string(), bullet_points: vec!["Binary tree structure".to_string(), "Left subtree keys < Parent key".to_string(), "Right subtree keys > Parent key".to_string()], duration_seconds: (45.0 * speed_multiplier) as i32, sequence_order: 1 },
                LessonSlide { id: Uuid::new_v4(), lesson_id, title: "Time Complexities".to_string(), bullet_points: vec!["Average Search: O(log n)".to_string(), "Average Insertion: O(log n)".to_string(), "Worst-case (Skewed Tree): O(n)".to_string()], duration_seconds: (45.0 * speed_multiplier) as i32, sequence_order: 2 },
                LessonSlide { id: Uuid::new_v4(), lesson_id, title: "In-Order Traversal".to_string(), bullet_points: vec!["Visit left subtree, then parent, then right".to_string(), "Yields elements in strictly sorted order".to_string(), "Recursive depth-first approach".to_string()], duration_seconds: (45.0 * speed_multiplier) as i32, sequence_order: 3 },
            ];

            diagrams = vec![
                LessonDiagram {
                    id: Uuid::new_v4(),
                    lesson_id,
                    diagram_type: "tree_topology".to_string(),
                    mermaid_code: r#"graph TD
root((8)) --> left1((3))
root --> right1((10))
left1 --> left2((1))
left1 --> right2((6))
right1 --> right3((14))
right2 --> right2_left((4))
right2 --> right2_right((7))
classDef default fill:#f9f9f9,stroke:#333,stroke-width:2px;
classDef rootNode fill:#e0e7ff,stroke:#4f46e5,stroke-width:2px;
class root rootNode;"#.to_string(),
                    sequence_order: 1
                }
            ];

            animations = vec![
                LessonAnimation {
                    id: Uuid::new_v4(),
                    lesson_id,
                    animation_type: "traversal".to_string(),
                    config_json: serde_json::json!({
                        "nodes": [8, 3, 10, 1, 6, 14],
                        "highlight_sequence": [1, 3, 6, 8, 10, 14],
                        "action": "inorder_sort_print"
                    }),
                    sequence_order: 1
                }
            ];

            quizzes = vec![
                LessonQuiz { id: Uuid::new_v4(), lesson_id, question: "What is the average-case time complexity of searching in a BST?".to_string(), options: vec!["O(1)".to_string(), "O(log n)".to_string(), "O(n)".to_string(), "O(n log n)".to_string()], correct_option: 1, explanation: "Because a balanced tree halves the search space at each step, the search depth is logarithmic.".to_string() },
                LessonQuiz { id: Uuid::new_v4(), lesson_id, question: "Which traversal of a BST visits node values in ascending sorted order?".to_string(), options: vec!["Pre-order traversal".to_string(), "Post-order traversal".to_string(), "In-order traversal".to_string(), "Level-order traversal".to_string()], correct_option: 2, explanation: "In-order traversal visits nodes in Left-Root-Right sequence, naturally outputting sorted elements in a BST.".to_string() },
            ];
        }
    } else if is_tcp {
        if is_hindi {
            // TCP 3-Way Handshake (Hindi)
            scripts = vec![
                LessonScript { id: Uuid::new_v4(), lesson_id, section_name: "intro".to_string(), narration_text: "वापस स्वागत है! आज हम ट्रांसमिशन कंट्रोल प्रोटोकॉल यानी TCP के 3-वे हैंडशेक को समझेंगे। यह क्लाइंट और सर्वर के बीच एक विश्वसनीय कनेक्शन स्थापित करने की प्रक्रिया है।".to_string(), avatar_animation: "explaining".to_string(), sequence_order: 1 },
                LessonScript { id: Uuid::new_v4(), lesson_id, section_name: "concept".to_string(), narration_text: "हैंडशेक में तीन पैकेट्स होते हैं: SYN, SYN-ACK और ACK। SYN कनेक्शन शुरू करता है, SYN-ACK पैकेट SYN की पुष्टि करता है, और ACK लिंक सेटअप को पूरा करता है।".to_string(), avatar_animation: "pointing".to_string(), sequence_order: 2 },
                LessonScript { id: Uuid::new_v4(), lesson_id, section_name: "diagram".to_string(), narration_text: "अनुक्रम प्रवाह को देखें। सबसे पहले, क्लाइंट सीक्वेंस नंबर X के साथ SYN भेजता है। इसके बाद, सर्वर इसे प्राप्त कर SYN-ACK भेजता है जिसमें ACK नंबर X+1 और सीक्वेंस Y होता है। अंत में, क्लाइंट ACK भेजता है।".to_string(), avatar_animation: "gesturing".to_string(), sequence_order: 3 },
                LessonScript { id: Uuid::new_v4(), lesson_id, section_name: "visualization".to_string(), narration_text: "पैकेट एनीमेशन देखें। नेटवर्क इंटरफ़ेस नोड्स के बीच जाने वाले पैकेट फ़्लैग्स पर ध्यान दें। यह प्रक्रिया विश्वसनीय पैरामीटर्स स्थापित करती है ताकि बाद के डेटा चरणों में कोई भ्रम न हो।".to_string(), avatar_animation: "nodding".to_string(), sequence_order: 4 },
                LessonScript { id: Uuid::new_v4(), lesson_id, section_name: "application".to_string(), narration_text: "HTTP, FTP, SMTP और SSH सभी TCP हैंडशेक का उपयोग करते हैं। इसके बिना पैकेट लॉस रिकवरी, कंजेशन कंट्रोल और डेटा फ्लो सीमाएं संभव नहीं होंगी।".to_string(), avatar_animation: "explaining".to_string(), sequence_order: 5 },
            ];

            slides = vec![
                LessonSlide { id: Uuid::new_v4(), lesson_id, title: "TCP हैंडशेक क्यों ज़रूरी है?".to_string(), bullet_points: vec!["प्रारंभिक सीक्वेंस नंबर्स स्थापित करना".to_string(), "विंडो फ्लो-कंट्रोल पैरामीटर्स को सिंक करना".to_string(), "दोनों तरफ सॉकेट की उपलब्धता सुनिश्चित करना".to_string()], duration_seconds: (45.0 * speed_multiplier) as i32, sequence_order: 1 },
                LessonSlide { id: Uuid::new_v4(), lesson_id, title: "3 चरण (The 3 Stages)".to_string(), bullet_points: vec!["SYN: क्लाइंट द्वारा कनेक्शन की शुरुआत".to_string(), "SYN-ACK: सर्वर द्वारा जवाब और पावती (Acknowledgment)".to_string(), "ACK: क्लाइंट द्वारा अंतिम पुष्टि".to_string()], duration_seconds: (45.0 * speed_multiplier) as i32, sequence_order: 2 },
            ];

            diagrams = vec![
                LessonDiagram {
                    id: Uuid::new_v4(),
                    lesson_id,
                    diagram_type: "sequence_flow".to_string(),
                    mermaid_code: r#"sequenceDiagram
Client->>Server: 1. SYN [Seq=X]
Server->>Client: 2. SYN-ACK [Seq=Y, Ack=X+1]
Client->>Server: 3. ACK [Seq=X+1, Ack=Y+1]"#.to_string(),
                    sequence_order: 1
                }
            ];

            animations = vec![
                LessonAnimation {
                    id: Uuid::new_v4(),
                    lesson_id,
                    animation_type: "packet_transmission".to_string(),
                    config_json: serde_json::json!({
                        "stages": [
                            {"from": "Client", "to": "Server", "label": "SYN", "seq": 100, "ack": 0},
                            {"from": "Server", "to": "Client", "label": "SYN-ACK", "seq": 500, "ack": 101},
                            {"from": "Client", "to": "Server", "label": "ACK", "seq": 101, "ack": 501}
                        ]
                    }),
                    sequence_order: 1
                }
            ];

            quizzes = vec![
                LessonQuiz { id: Uuid::new_v4(), lesson_id, question: "TCP हैंडशेक में पैकेट फ़्लैग्स का सही क्रम क्या है?".to_string(), options: vec!["SYN, ACK, SYN-ACK".to_string(), "SYN, SYN-ACK, ACK".to_string(), "ACK, SYN, SYN-ACK".to_string(), "SYN-ACK, SYN, ACK".to_string()], correct_option: 1, explanation: "क्लाइंट पहले SYN भेजता है, सर्वर SYN-ACK से उत्तर देता है, और क्लाइंट ACK के साथ पुष्टि करता है।".to_string() },
            ];
        } else {
            // TCP 3-Way Handshake
            scripts = vec![
                LessonScript { id: Uuid::new_v4(), lesson_id, section_name: "intro".to_string(), narration_text: "Welcome back! Today we examine the Transmission Control Protocol, or TCP, 3-way handshake. It is the sequence used to establish a reliable connection between client and server.".to_string(), avatar_animation: "explaining".to_string(), sequence_order: 1 },
                LessonScript { id: Uuid::new_v4(), lesson_id, section_name: "concept".to_string(), narration_text: "Handshake consists of three packets: SYN, SYN-ACK, and ACK. SYN initiates connection, SYN-ACK acknowledges SYN and adds server parameters, and ACK completes link setup.".to_string(), avatar_animation: "pointing".to_string(), sequence_order: 2 },
                LessonScript { id: Uuid::new_v4(), lesson_id, section_name: "diagram".to_string(), narration_text: "Look at the sequence flow. First, Client transmits SYN with sequence number X. Next, Server receives it and transmits SYN-ACK with ACK number X-plus-one and sequence Y. Finally, Client transmits ACK.".to_string(), avatar_animation: "gesturing".to_string(), sequence_order: 3 },
                LessonScript { id: Uuid::new_v4(), lesson_id, section_name: "visualization".to_string(), narration_text: "Watch the packet animation. Notice the packet flags moving across the network interface nodes. Reliable parameters are established, ensuring no packet confusion during later data phases.".to_string(), avatar_animation: "nodding".to_string(), sequence_order: 4 },
                LessonScript { id: Uuid::new_v4(), lesson_id, section_name: "application".to_string(), narration_text: "HTTP, FTP, SMTP and SSH all use TCP connection handshakes. Without this, packet loss recovery, congestion controls, and data flow bounds wouldn't be possible.".to_string(), avatar_animation: "explaining".to_string(), sequence_order: 5 },
            ];

            slides = vec![
                LessonSlide { id: Uuid::new_v4(), lesson_id, title: "Why TCP Handshakes?".to_string(), bullet_points: vec!["Establish initial sequence numbers".to_string(), "Sync window flow-control parameters".to_string(), "Confirm socket availability on both sides".to_string()], duration_seconds: (45.0 * speed_multiplier) as i32, sequence_order: 1 },
                LessonSlide { id: Uuid::new_v4(), lesson_id, title: "The 3 Stages".to_string(), bullet_points: vec!["SYN: Active Open from Client".to_string(), "SYN-ACK: Acknowledge and Respond from Server".to_string(), "ACK: Final Acknowledgment from Client".to_string()], duration_seconds: (45.0 * speed_multiplier) as i32, sequence_order: 2 },
            ];

            diagrams = vec![
                LessonDiagram {
                    id: Uuid::new_v4(),
                    lesson_id,
                    diagram_type: "sequence_flow".to_string(),
                    mermaid_code: r#"sequenceDiagram
Client->>Server: 1. SYN [Seq=X]
Server->>Client: 2. SYN-ACK [Seq=Y, Ack=X+1]
Client->>Server: 3. ACK [Seq=X+1, Ack=Y+1]"#.to_string(),
                    sequence_order: 1
                }
            ];

            animations = vec![
                LessonAnimation {
                    id: Uuid::new_v4(),
                    lesson_id,
                    animation_type: "packet_transmission".to_string(),
                    config_json: serde_json::json!({
                        "stages": [
                            {"from": "Client", "to": "Server", "label": "SYN", "seq": 100, "ack": 0},
                            {"from": "Server", "to": "Client", "label": "SYN-ACK", "seq": 500, "ack": 101},
                            {"from": "Client", "to": "Server", "label": "ACK", "seq": 101, "ack": 501}
                        ]
                    }),
                    sequence_order: 1
                }
            ];

            quizzes = vec![
                LessonQuiz { id: Uuid::new_v4(), lesson_id, question: "What is the correct order of flag packages in a TCP Handshake?".to_string(), options: vec!["SYN, ACK, SYN-ACK".to_string(), "SYN, SYN-ACK, ACK".to_string(), "ACK, SYN, SYN-ACK".to_string(), "SYN-ACK, SYN, ACK".to_string()], correct_option: 1, explanation: "Client sends SYN, Server replies with SYN-ACK, and Client confirms with ACK.".to_string() },
            ];
        }
    } else {
        if is_hindi {
            // Default / SQL Joins or Fallback content (Hindi)
            scripts = vec![
                LessonScript { id: Uuid::new_v4(), lesson_id, section_name: "intro".to_string(), narration_text: format!("आइए {} के बारे में सीखें। यह एक महत्वपूर्ण शैक्षिक अवधारणा है जो मानक संरचनाओं और संचालन को कवर करती है।", topic).to_string(), avatar_animation: "explaining".to_string(), sequence_order: 1 },
                LessonScript { id: Uuid::new_v4(), lesson_id, section_name: "concept".to_string(), narration_text: "विषय को समझने और जटिल समस्याओं में इसे लागू करने के लिए इसके मूल सिद्धांतों और सूत्रों को जानना आवश्यक है।".to_string(), avatar_animation: "pointing".to_string(), sequence_order: 2 },
                LessonScript { id: Uuid::new_v4(), lesson_id, section_name: "diagram".to_string(), narration_text: "यह आरेख दिखाता है कि नोड्स, गुण और संबंध सिस्टम मॉडल के भीतर कैसे काम करते हैं।".to_string(), avatar_animation: "gesturing".to_string(), sequence_order: 3 },
                LessonScript { id: Uuid::new_v4(), lesson_id, section_name: "visualization".to_string(), narration_text: "सिग्नल प्रवाह, क्वेरी जॉइंट्स या सॉर्टिंग ऑर्डर तत्वों को देखने के लिए इस चरण-दर-चरण एनीमेशन को देखें।".to_string(), avatar_animation: "nodding".to_string(), sequence_order: 4 },
                LessonScript { id: Uuid::new_v4(), lesson_id, section_name: "application".to_string(), narration_text: "हम सिस्टम थ्रूपुट को अनुकूलित करने के लिए प्रोडक्शन इंजीनियरिंग, डेटाबेस और एल्गोरिदम में इस अवधारणा को लागू करते हैं।".to_string(), avatar_animation: "explaining".to_string(), sequence_order: 5 },
            ];

            slides = vec![
                LessonSlide { id: Uuid::new_v4(), lesson_id, title: format!("{} में महारत हासिल करें", topic).to_string(), bullet_points: vec!["प्राथमिक तार्किक संरचनाएं".to_string(), "प्रक्रिया की सीमाएं और मेट्रिक्स".to_string(), "सामान्य एल्गोरिथम वर्कफ़्लो".to_string()], duration_seconds: (45.0 * speed_multiplier) as i32, sequence_order: 1 },
                LessonSlide { id: Uuid::new_v4(), lesson_id, title: "व्यावहारिक अनुप्रयोग".to_string(), bullet_points: vec!["वास्तविक दुनिया के सिस्टम कार्यान्वयन".to_string(), "उद्योग के मानक और संरचनाएं".to_string(), "प्रदर्शन और समझौता".to_string()], duration_seconds: (45.0 * speed_multiplier) as i32, sequence_order: 2 },
            ];

            diagrams = vec![
                LessonDiagram {
                    id: Uuid::new_v4(),
                    lesson_id,
                    diagram_type: "flowchart".to_string(),
                    mermaid_code: r#"graph TD
Start[प्रक्रिया शुरू करें] --> Init[वेरिएबल्स इनिशियलाइज़ करें]
Init --> Compare{कंडीशन चेक}
Compare -- हाँ --> Act[लॉजिक चलाएं]
Compare -- नहीं --> Exit[प्रक्रिया समाप्त करें]
Act --> Exit"# .to_string(),
                    sequence_order: 1
                }
            ];

            animations = vec![
                LessonAnimation {
                    id: Uuid::new_v4(),
                    lesson_id,
                    animation_type: "simulation".to_string(),
                    config_json: serde_json::json!({
                        "model": topic,
                        "nodes": [{"id": "Node1", "x": 100, "y": 200}, {"id": "Node2", "x": 300, "y": 200}],
                        "connections": [{"from": "Node1", "to": "Node2", "type": "flow"}]
                    }),
                    sequence_order: 1
                }
            ];

            quizzes = vec![
                LessonQuiz { id: Uuid::new_v4(), lesson_id, question: format!("{} का अध्ययन करने का मुख्य उद्देश्य क्या है?", topic).to_string(), options: vec!["कंप्यूटेशनल स्टोरेज साइज को कम करना".to_string(), "मूल संरचनात्मक संबंधों और तर्क को समझना".to_string(), "सिंटैक्स पार्सिंग कम्पाइल की पुष्टि करना".to_string(), "नेटवर्क ट्रांसमिशन हैंडशेक से बचना".to_string()], correct_option: 1, explanation: "बुनियादी तार्किक संरचना को समझने से हम अधिक कुशल और अनुकूलित सिस्टम डिज़ाइन कर सकते हैं।".to_string() },
            ];
        } else {
            // Default / SQL Joins or Fallback content
            scripts = vec![
                LessonScript { id: Uuid::new_v4(), lesson_id, section_name: "intro".to_string(), narration_text: format!("Let's learn about {}. This is an essential educational concept that covers standard structures and operations.", topic).to_string(), avatar_animation: "explaining".to_string(), sequence_order: 1 },
                LessonScript { id: Uuid::new_v4(), lesson_id, section_name: "concept".to_string(), narration_text: "Understanding the core definition and formulas is key to mastering this topic and applying it to complex scenarios.".to_string(), avatar_animation: "pointing".to_string(), sequence_order: 2 },
                LessonScript { id: Uuid::new_v4(), lesson_id, section_name: "diagram".to_string(), narration_text: "The diagram visually breaks down how nodes, attributes, and relationships map within the system model.".to_string(), avatar_animation: "gesturing".to_string(), sequence_order: 3 },
                LessonScript { id: Uuid::new_v4(), lesson_id, section_name: "visualization".to_string(), narration_text: "Watch the step-by-step animation to trace signal pathways, query joints, or sorting order elements.".to_string(), avatar_animation: "nodding".to_string(), sequence_order: 4 },
                LessonScript { id: Uuid::new_v4(), lesson_id, section_name: "application".to_string(), narration_text: "We apply this concept in production engineering, databases, and algorithms to optimize system throughput.".to_string(), avatar_animation: "explaining".to_string(), sequence_order: 5 },
            ];

            slides = vec![
                LessonSlide { id: Uuid::new_v4(), lesson_id, title: format!("Mastering {}", topic).to_string(), bullet_points: vec!["Primary logical structures".to_string(), "Process constraints and metrics".to_string(), "Common algorithmic workflows".to_string()], duration_seconds: (45.0 * speed_multiplier) as i32, sequence_order: 1 },
                LessonSlide { id: Uuid::new_v4(), lesson_id, title: "Practical Application".to_string(), bullet_points: vec!["Real-world system implementations".to_string(), "Industry standards and structures".to_string(), "Performance trade-offs".to_string()], duration_seconds: (45.0 * speed_multiplier) as i32, sequence_order: 2 },
            ];

            diagrams = vec![
                LessonDiagram {
                    id: Uuid::new_v4(),
                    lesson_id,
                    diagram_type: "flowchart".to_string(),
                    mermaid_code: r#"graph TD
Start[Start Process] --> Init[Initialize Variables]
Init --> Compare{Condition Check}
Compare -- Yes --> Act[Execute Logic]
Compare -- No --> Exit[Finish Process]
Act --> Exit"#.to_string(),
                    sequence_order: 1
                }
            ];

            animations = vec![
                LessonAnimation {
                    id: Uuid::new_v4(),
                    lesson_id,
                    animation_type: "simulation".to_string(),
                    config_json: serde_json::json!({
                        "model": topic,
                        "nodes": [{"id": "Node1", "x": 100, "y": 200}, {"id": "Node2", "x": 300, "y": 200}],
                        "connections": [{"from": "Node1", "to": "Node2", "type": "flow"}]
                    }),
                    sequence_order: 1
                }
            ];

            quizzes = vec![
                LessonQuiz { id: Uuid::new_v4(), lesson_id, question: format!("What is the primary objective of studying {}?", topic).to_string(), options: vec!["To reduce computational storage size".to_string(), "To understand core structural relations and logic".to_string(), "To perform syntax parsing compile verification".to_string(), "To avoid network transmission handshakes".to_string()], correct_option: 1, explanation: "Mastering the fundamental logical structure allows designing more optimized systems.".to_string() },
            ];
        }
    }

    // Write all scripts, slides, diagrams, animations, and quizzes into database
    for script in &scripts {
        sqlx::query!(
            "INSERT INTO lesson_scripts (id, lesson_id, section_name, narration_text, avatar_animation, sequence_order) VALUES ($1, $2, $3, $4, $5, $6)",
            script.id, script.lesson_id, script.section_name, script.narration_text, script.avatar_animation, script.sequence_order
        )
        .execute(db)
        .await?;
    }

    for slide in &slides {
        sqlx::query!(
            "INSERT INTO lesson_slides (id, lesson_id, title, bullet_points, duration_seconds, sequence_order) VALUES ($1, $2, $3, $4, $5, $6)",
            slide.id, slide.lesson_id, slide.title, &slide.bullet_points, slide.duration_seconds, slide.sequence_order
        )
        .execute(db)
        .await?;
    }

    for diagram in &diagrams {
        sqlx::query!(
            "INSERT INTO lesson_diagrams (id, lesson_id, diagram_type, mermaid_code, sequence_order) VALUES ($1, $2, $3, $4, $5)",
            diagram.id, diagram.lesson_id, diagram.diagram_type, diagram.mermaid_code, diagram.sequence_order
        )
        .execute(db)
        .await?;
    }

    for animation in &animations {
        sqlx::query!(
            "INSERT INTO lesson_animations (id, lesson_id, animation_type, config_json, sequence_order) VALUES ($1, $2, $3, $4, $5)",
            animation.id, animation.lesson_id, animation.animation_type, animation.config_json, animation.sequence_order
        )
        .execute(db)
        .await?;
    }

    for quiz in &quizzes {
        sqlx::query!(
            "INSERT INTO lesson_quizzes (id, lesson_id, question, options, correct_option, explanation) VALUES ($1, $2, $3, $4, $5, $6)",
            quiz.id, quiz.lesson_id, quiz.question, &quiz.options, quiz.correct_option, quiz.explanation
        )
        .execute(db)
        .await?;
    }

    // Calculate completion metrics
    let mut response_lesson: VideoLessonResponse = lesson.into();
    response_lesson.completion_rate = 0.0;
    response_lesson.is_saved = false;

    Ok(CompleteLessonPayload {
        lesson: response_lesson,
        scripts,
        slides,
        diagrams,
        animations,
        quizzes,
        progress: None,
    })
}

// Fetch generated lessons list
pub async fn get_lessons(db: &PgPool, student_id: Uuid) -> Result<Vec<VideoLessonResponse>, sqlx::Error> {
    let lessons = sqlx::query_as::<_, VideoLesson>(
        "SELECT * FROM video_lessons WHERE student_id = $1 ORDER BY created_at DESC"
    )
    .bind(student_id)
    .fetch_all(db)
    .await?;

    let mut responses = Vec::new();
    for l in lessons {
        let is_saved = sqlx::query!(
            "SELECT COUNT(*) FROM saved_lessons WHERE student_id = $1 AND lesson_id = $2",
            student_id,
            l.id
        )
        .fetch_one(db)
        .await?
        .count
        .unwrap_or(0) > 0;

        let completion_rate = sqlx::query!(
            "SELECT completion_rate FROM student_progress WHERE student_id = $1 AND lesson_id = $2",
            student_id,
            l.id
        )
        .fetch_optional(db)
        .await?
        .map(|r| r.completion_rate)
        .unwrap_or(0.0);

        let mut res: VideoLessonResponse = l.into();
        res.is_saved = is_saved;
        res.completion_rate = completion_rate;
        responses.push(res);
    }

    Ok(responses)
}

// Fetch single complete lesson payload
pub async fn get_lesson_by_id(
    db: &PgPool,
    student_id: Uuid,
    lesson_id: Uuid,
) -> Result<Option<CompleteLessonPayload>, sqlx::Error> {
    let lesson = sqlx::query_as::<_, VideoLesson>(
        "SELECT * FROM video_lessons WHERE id = $1"
    )
    .bind(lesson_id)
    .fetch_optional(db)
    .await?;

    let lesson = match lesson {
        Some(l) => l,
        None => return Ok(None),
    };

    let is_saved = sqlx::query!(
        "SELECT COUNT(*) FROM saved_lessons WHERE student_id = $1 AND lesson_id = $2",
        student_id,
        lesson_id
    )
    .fetch_one(db)
    .await?
    .count
    .unwrap_or(0) > 0;

    let progress = sqlx::query_as::<_, StudentProgress>(
        "SELECT * FROM student_progress WHERE student_id = $1 AND lesson_id = $2"
    )
    .bind(student_id)
    .bind(lesson_id)
    .fetch_optional(db)
    .await?;

    let mut response_lesson: VideoLessonResponse = lesson.into();
    response_lesson.is_saved = is_saved;
    response_lesson.completion_rate = progress.as_ref().map(|p| p.completion_rate).unwrap_or(0.0);

    let scripts = sqlx::query_as::<_, LessonScript>(
        "SELECT * FROM lesson_scripts WHERE lesson_id = $1 ORDER BY sequence_order ASC"
    )
    .bind(lesson_id)
    .fetch_all(db)
    .await?;

    let slides = sqlx::query_as::<_, LessonSlide>(
        "SELECT * FROM lesson_slides WHERE lesson_id = $1 ORDER BY sequence_order ASC"
    )
    .bind(lesson_id)
    .fetch_all(db)
    .await?;

    let diagrams = sqlx::query_as::<_, LessonDiagram>(
        "SELECT * FROM lesson_diagrams WHERE lesson_id = $1 ORDER BY sequence_order ASC"
    )
    .bind(lesson_id)
    .fetch_all(db)
    .await?;

    let animations = sqlx::query_as::<_, LessonAnimation>(
        "SELECT * FROM lesson_animations WHERE lesson_id = $1 ORDER BY sequence_order ASC"
    )
    .bind(lesson_id)
    .fetch_all(db)
    .await?;

    let quizzes = sqlx::query_as::<_, LessonQuiz>(
        "SELECT * FROM lesson_quizzes WHERE lesson_id = $1"
    )
    .bind(lesson_id)
    .fetch_all(db)
    .await?;

    Ok(Some(CompleteLessonPayload {
        lesson: response_lesson,
        scripts,
        slides,
        diagrams,
        animations,
        quizzes,
        progress,
    }))
}

// Bookmark / Save lesson toggles
pub async fn save_lesson(db: &PgPool, student_id: Uuid, lesson_id: Uuid) -> Result<(), sqlx::Error> {
    sqlx::query!(
        "INSERT INTO saved_lessons (student_id, lesson_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        student_id,
        lesson_id
    )
    .execute(db)
    .await?;
    Ok(())
}

pub async fn unsave_lesson(db: &PgPool, student_id: Uuid, lesson_id: Uuid) -> Result<(), sqlx::Error> {
    sqlx::query!(
        "DELETE FROM saved_lessons WHERE student_id = $1 AND lesson_id = $2",
        student_id,
        lesson_id
    )
    .execute(db)
    .await?;
    Ok(())
}

// Fetch list of saved video lessons
pub async fn get_saved_lessons(db: &PgPool, student_id: Uuid) -> Result<Vec<VideoLessonResponse>, sqlx::Error> {
    let saved_rows = sqlx::query!(
        "SELECT lesson_id FROM saved_lessons WHERE student_id = $1",
        student_id
    )
    .fetch_all(db)
    .await?;

    let mut responses = Vec::new();
    for row in saved_rows {
        if let Some(payload) = get_lesson_by_id(db, student_id, row.lesson_id).await? {
            responses.push(payload.lesson);
        }
    }
    Ok(responses)
}

// Watch progress logging
pub async fn update_progress(
    db: &PgPool,
    student_id: Uuid,
    lesson_id: Uuid,
    completion_rate: f64,
    quiz_score: Option<i32>,
    watch_time_seconds: i32,
) -> Result<StudentProgress, sqlx::Error> {
    // 1. Log to watch history if watch time was positive
    if watch_time_seconds > 0 {
        sqlx::query!(
            "INSERT INTO video_watch_history (student_id, lesson_id) VALUES ($1, $2)",
            student_id,
            lesson_id
        )
        .execute(db)
        .await?;
    }

    // 2. Upsert progress record
    let progress = sqlx::query_as::<_, StudentProgress>(
        r#"
        INSERT INTO student_progress (student_id, lesson_id, completion_rate, quiz_score, watch_time_seconds, last_watched)
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
        ON CONFLICT (student_id, lesson_id) DO UPDATE
        SET completion_rate = GREATEST(student_progress.completion_rate, EXCLUDED.completion_rate),
            quiz_score = COALESCE(EXCLUDED.quiz_score, student_progress.quiz_score),
            watch_time_seconds = student_progress.watch_time_seconds + EXCLUDED.watch_time_seconds,
            last_watched = CURRENT_TIMESTAMP
        RETURNING *
        "#
    )
    .bind(student_id)
    .bind(lesson_id)
    .bind(completion_rate)
    .bind(quiz_score)
    .bind(watch_time_seconds)
    .fetch_one(db)
    .await?;

    // 3. Adapt profile: if quiz score is low (< 70%), add topic to weak topics list
    if let Some(score) = quiz_score {
        let lesson_meta = sqlx::query!("SELECT topic FROM video_lessons WHERE id = $1", lesson_id)
            .fetch_optional(db)
            .await?;

        if let Some(meta) = lesson_meta {
            let topic = meta.topic;
            if score < 70 {
                // Add to weak topics, remove from strong topics
                sqlx::query!(
                    r#"
                    UPDATE learning_profiles
                    SET weak_topics = ARRAY(SELECT DISTINCT UNNEST(array_append(weak_topics, $1))),
                        strong_topics = ARRAY(SELECT DISTINCT val FROM UNNEST(strong_topics) as val WHERE val != $1),
                        last_updated = CURRENT_TIMESTAMP
                    WHERE student_id = $2
                    "#,
                    topic,
                    student_id
                )
                .execute(db)
                .await?;
            } else {
                // Add to strong topics, remove from weak topics
                sqlx::query!(
                    r#"
                    UPDATE learning_profiles
                    SET strong_topics = ARRAY(SELECT DISTINCT UNNEST(array_append(strong_topics, $1))),
                        weak_topics = ARRAY(SELECT DISTINCT val FROM UNNEST(weak_topics) as val WHERE val != $1),
                        last_updated = CURRENT_TIMESTAMP
                    WHERE student_id = $2
                    "#,
                    topic,
                    student_id
                )
                .execute(db)
                .await?;
            }
        }
    }

    Ok(progress)
}

// Student watch history log
pub async fn get_watch_history(
    db: &PgPool,
    student_id: Uuid,
) -> Result<Vec<serde_json::Value>, sqlx::Error> {
    let rows = sqlx::query!(
        r#"
        SELECT h.watched_at, l.id, l.topic, l.mode, l.avatar
        FROM video_watch_history h
        JOIN video_lessons l ON h.lesson_id = l.id
        WHERE h.student_id = $1
        ORDER BY h.watched_at DESC
        LIMIT 20
        "#,
        student_id
    )
    .fetch_all(db)
    .await?;

    let mut list = Vec::new();
    for r in rows {
        list.push(serde_json::json!({
            "watchedAt": r.watched_at,
            "lessonId": r.id.to_string(),
            "topic": r.topic,
            "mode": r.mode,
            "avatar": r.avatar
        }));
    }
    Ok(list)
}

// Lesson Interruption / Doubt solver
pub async fn process_interrupt(
    db: &PgPool,
    student_id: Uuid,
    lesson_id: Option<Uuid>,
    query: &str,
) -> Result<serde_json::Value, sqlx::Error> {
    // Check if lesson is in Hindi
    let mut is_hindi = false;
    if let Some(l_id) = lesson_id {
        if let Ok(Some(row)) = sqlx::query!("SELECT language FROM video_lessons WHERE id = $1", l_id)
            .fetch_optional(db)
            .await
        {
            if row.language.to_lowercase() == "hindi" {
                is_hindi = true;
            }
        }
    }

    // 1. Simple doubt solver rules to output simulated technical outlines
    let normalized = query.to_lowercase();
    let (response, animation_type, config_json) = if normalized.contains("xor") {
        if is_hindi {
            (
                "एक XOR (एक्सक्लूसिव OR) गेट केवल तभी हाई (1) आउटपुट देता है जब उसके दोनों इनपुट मान भिन्न होते हैं। यदि इनपुट A और B समान हैं, तो यह शून्य (0) देता है। गणितीय रूप से, S = A ⊕ B = A·B' + A'·B।",
                "signal_flow",
                serde_json::json!({
                    "inputs": [{"name": "A", "val": 0}, {"name": "B", "val": 0}],
                    "gates": [{"type": "XOR", "inputs": [0, 0], "output": 0}],
                    "message": "ध्यान दें कि इनपुट्स समान हैं (दोनों 0), इसलिए XOR गेट का आउटपुट 0 है।"
                })
            )
        } else {
            (
                "An XOR (Exclusive OR) gate yields high only when its two input values differ. If inputs A and B are identical, it yields zero. Mathematically, S = A ⊕ B = A·B' + A'·B.",
                "signal_flow",
                serde_json::json!({
                    "inputs": [{"name": "A", "val": 0}, {"name": "B", "val": 0}],
                    "gates": [{"type": "XOR", "inputs": [0, 0], "output": 0}],
                    "message": "Notice that inputs match (both 0), so the output of the XOR gate is 0."
                })
            )
        }
    } else if normalized.contains("and") {
        if is_hindi {
            (
                "एक AND गेट केवल तभी हाई (1) आउटपुट देता है जब दोनों इनपुट सिग्नल्स हाई हों। यदि कोई भी इनपुट लो (0) है, तो आउटपुट लो होता है। गणितीय रूप से, C = A · B।",
                "signal_flow",
                serde_json::json!({
                    "inputs": [{"name": "A", "val": 1}, {"name": "B", "val": 1}],
                    "gates": [{"type": "AND", "inputs": [1, 1], "output": 1}],
                    "message": "दोनों इनपुट 1 हैं, इसलिए AND गेट का आउटपुट 1 है।"
                })
            )
        } else {
            (
                "An AND gate yields high only when both input signals are high. If either is low, the output is low. Mathematically, C = A · B.",
                "signal_flow",
                serde_json::json!({
                    "inputs": [{"name": "A", "val": 1}, {"name": "B", "val": 1}],
                    "gates": [{"type": "AND", "inputs": [1, 1], "output": 1}],
                    "message": "Both inputs are 1, so the output of the AND gate is 1."
                })
            )
        }
    } else if normalized.contains("search") || normalized.contains("find") {
        if is_hindi {
            (
                "बाइनरी सर्च ट्री में नेविगेट करते समय हम खोजे जाने वाले मान की तुलना सक्रिय नोड के मान से करते हैं। यदि मान छोटा है, तो हम बाएं जाते हैं। यदि बड़ा है, तो दाएं जाते हैं। इस खोज में औसतन O(log N) समय लगता है।",
                "traversal",
                serde_json::json!({
                    "nodes": [8, 3, 10],
                    "search_key": 3,
                    "highlight_sequence": [8, 3],
                    "message": "हम तुलना करते हैं 3 < 8, इसलिए हम बाएं चाइल्ड (3) पर जाते हैं। मैच मिल गया!"
                })
            )
        } else {
            (
                "Binary search tree navigation compares the target key against the active node's value. If the key is smaller, we traverse left. If it is larger, we traverse right. This recursive branching takes O(log N) average time.",
                "traversal",
                serde_json::json!({
                    "nodes": [8, 3, 10],
                    "search_key": 3,
                    "highlight_sequence": [8, 3],
                    "message": "We compare 3 < 8, so we traverse to the left child (3). Match found!"
                })
            )
        }
    } else if normalized.contains("syn") || normalized.contains("ack") {
        if is_hindi {
            (
                "SYN (सिंक्रोनाइज़) क्लाइंट द्वारा भेजा गया पहला पैकेट फ़्लैग है। SYN-ACK सर्वर की पावती है। ACK क्लाइंट द्वारा भेजा गया अंतिम पावती पैकेट है जो कनेक्शन को स्थापित करता है।",
                "packet_transmission",
                serde_json::json!({
                    "stages": [{"from": "Client", "to": "Server", "label": "SYN", "seq": 100, "ack": 0}]
                })
            )
        } else {
            (
                "SYN (Synchronize) is the first message flag sent by the client. SYN-ACK is the server's acknowledgement. ACK is the final confirmation packet sent back by the client to finalize the connection.",
                "packet_transmission",
                serde_json::json!({
                    "stages": [{"from": "Client", "to": "Server", "label": "SYN", "seq": 100, "ack": 0}]
                })
            )
        }
    } else {
        if is_hindi {
            (
                "यह एक बेहतरीन प्रश्न है! इस अवधारणा का विश्लेषण करते समय, हम इष्टतम संचालन सुनिश्चित करने के लिए गणितीय तर्क, संरचनात्मक गुणों और विशेष मामलों को देखते हैं।",
                "simulation",
                serde_json::json!({
                    "query": query,
                    "note": "AI सिमुलेशन रिस्पॉन्स आउटलाइन।"
                })
            )
        } else {
            (
                "That's an excellent question! When analyzing this concept, we look at the mathematical logic, structural properties, and edge cases to ensure optimal operation.",
                "simulation",
                serde_json::json!({
                    "query": query,
                    "note": "AI simulated response outline."
                })
            )
        }
    };

    // 2. Insert interaction history log
    sqlx::query!(
        "INSERT INTO ai_interactions (student_id, lesson_id, query, response, interaction_type) VALUES ($1, $2, $3, $4, 'interrupt_doubt')",
        student_id,
        lesson_id,
        query,
        response
    )
    .execute(db)
    .await?;

    Ok(serde_json::json!({
        "response": response,
        "animationType": animation_type,
        "configJson": config_json
    }))
}

// Retrieves aggregate student learning logs and target indices
pub async fn get_analytics(
    db: &PgPool,
    student_id: Uuid,
) -> Result<serde_json::Value, sqlx::Error> {
    // 1. Watch Time sum
    let watch_time = sqlx::query!(
        "SELECT COALESCE(SUM(watch_time_seconds), 0) as total FROM student_progress WHERE student_id = $1",
        student_id
    )
    .fetch_one(db)
    .await?
    .total
    .unwrap_or(0);

    // 2. Completion rate average
    let avg_completion = sqlx::query!(
        "SELECT AVG(completion_rate) as avg FROM student_progress WHERE student_id = $1",
        student_id
    )
    .fetch_one(db)
    .await?
    .avg
    .unwrap_or(0.0);

    // 3. Quiz score average
    let avg_quiz = sqlx::query!(
        r#"SELECT CAST(AVG(quiz_score) AS DOUBLE PRECISION) as "avg: f64" FROM student_progress WHERE student_id = $1 AND quiz_score IS NOT NULL"#,
        student_id
    )
    .fetch_one(db)
    .await?
    .avg
    .unwrap_or(0.0);

    // 4. Learning profile details
    let profile = sqlx::query_as::<_, LearningProfile>(
        "SELECT * FROM learning_profiles WHERE student_id = $1"
    )
    .bind(student_id)
    .bind(student_id) // placeholder
    .fetch_optional(db)
    .await?;

    let weak_count = profile.as_ref().map(|p| p.weak_topics.len() as i32).unwrap_or(0);
    let strong_count = profile.as_ref().map(|p| p.strong_topics.len() as i32).unwrap_or(0);

    // 5. Total lessons count
    let lessons_count = sqlx::query!(
        "SELECT COUNT(*) FROM video_lessons WHERE student_id = $1",
        student_id
    )
    .fetch_one(db)
    .await?
    .count
    .unwrap_or(0);

    // Streaks & Retention mocked or based on watch dates
    let streak = 3; // Mocked active learning days streak
    let retention = 85.0; // Mocked retention rate index (%)

    // Calculate the 4 target scores
    // A. Knowledge Score: based on average quiz performance and topic mastery count
    let knowledge_score = (avg_quiz * 0.7 + (strong_count as f64 * 10.0).min(30.0)) as i32;
    // B. Concept Mastery Score: ratio of strong topics to total created topics
    let total_topics = (weak_count + strong_count) as f64;
    let concept_mastery = if total_topics > 0.0 {
        ((strong_count as f64 / total_topics) * 100.0) as i32
    } else {
        70
    };
    // C. Engagement Score: based on completion rates and watch duration
    let engagement_score = ((avg_completion * 0.6 + (watch_time as f64 / 300.0).min(40.0)) as i32).min(100);
    // D. Learning Growth Score: simulated improvement indicator
    let learning_growth = (streak * 5 + 75).min(98);

    Ok(serde_json::json!({
        "watchTimeSeconds": watch_time,
        "avgCompletionRate": avg_completion,
        "avgQuizScore": avg_quiz,
        "weakTopicsCount": weak_count,
        "strongTopicsCount": strong_count,
        "totalLessonsCreated": lessons_count,
        "learningStreakDays": streak,
        "conceptRetentionRate": retention,
        "scores": {
            "knowledgeScore": knowledge_score.max(10).min(100),
            "conceptMasteryScore": concept_mastery.max(10).min(100),
            "engagementScore": engagement_score.max(10).min(100),
            "learningGrowthScore": learning_growth.max(10).min(100)
        },
        "weakTopics": profile.as_ref().map(|p| p.weak_topics.clone()).unwrap_or_default(),
        "strongTopics": profile.as_ref().map(|p| p.strong_topics.clone()).unwrap_or_default()
    }))
}
