const fetch = require('node-fetch');

async function testGenerate() {
    try {
        const res = await fetch("http://localhost:5005/api/video-tutor/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // Provide a dummy UUID for the JWT auth bypass if we can, but we need auth!
            },
            body: JSON.stringify({
                topic: "Half Adder",
                mode: "beginner",
                avatar: "professor",
                voice: "male_voice_1",
                language: "English"
            })
        });
        const text = await res.text();
        console.log("Status:", res.status);
        console.log("Response:", text);
    } catch(e) {
        console.error(e);
    }
}
testGenerate();
