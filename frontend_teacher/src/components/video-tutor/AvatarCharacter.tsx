"use client";

import React from "react";

interface AvatarCharacterProps {
    avatar: string; // 'professor', 'scientist', 'expert', 'instructor', 'mentor'
    animation: string; // 'explaining', 'pointing', 'gesturing', 'nodding', 'idle'
    isSpeaking: boolean;
    gender?: "male" | "female";
}

export default function AvatarCharacter({
    avatar = "professor",
    animation = "idle",
    isSpeaking = false,
    gender = "male",
}: AvatarCharacterProps) {
    // Choose colors based on avatar theme
    let suitColor = "#1e3a8a"; // Dark blue
    let shirtColor = "#ffffff";
    let accessory = null;
    let hairColor = gender === "male" ? "#475569" : "#b45309"; // Slate vs auburn
    let skinColor = "#fbcfe8"; // Pinkish tone
    let nameLabel = "Professor";

    switch (avatar) {
        case "scientist":
            suitColor = "#cbd5e1"; // Lab coat (slate-300)
            shirtColor = "#0f172a";
            hairColor = "#94a3b8"; // Gray hair
            skinColor = "#fed7aa"; // Orange-tint skin
            nameLabel = "Dr. Helen (Scientist)";
            accessory = (
                // Safety Goggles
                <rect x="30" y="32" width="40" height="10" rx="3" fill="#38bdf8" opacity="0.6" stroke="#0284c7" strokeWidth="1" />
            );
            break;
        case "expert":
            suitColor = "#1e293b"; // Sleek dark gray
            shirtColor = "#3b82f6"; // Blue shirt
            hairColor = "#1e293b"; // Black hair
            skinColor = "#fef08a";
            nameLabel = "Alex (Industry Expert)";
            accessory = (
                // Modern glasses
                <g stroke="#000" strokeWidth="1.5" fill="none">
                    <circle cx="42" cy="37" r="7" />
                    <circle cx="58" cy="37" r="7" />
                    <line x1="49" y1="37" x2="51" y2="37" />
                </g>
            );
            break;
        case "instructor":
            suitColor = "#15803d"; // Green polo shirt
            shirtColor = "#f1f5f9";
            hairColor = "#78350f"; // Brown hair
            skinColor = "#ffedd5";
            nameLabel = "Coach Marcus (Instructor)";
            break;
        case "mentor":
            suitColor = "#ec4899"; // Pink hoodie
            shirtColor = "#f8fafc";
            hairColor = "#ca8a04"; // Blonde hair
            skinColor = "#fcd34d";
            nameLabel = "Sarah (Friendly Mentor)";
            break;
        default: // professor
            suitColor = "#1e3a8a";
            shirtColor = "#ffffff";
            hairColor = "#475569";
            skinColor = "#ffe4e6";
            nameLabel = "Prof. Sterling";
            accessory = (
                // Classic spectacles
                <g stroke="#475569" strokeWidth="1" fill="none">
                    <rect x="36" y="35" width="10" height="6" rx="1" />
                    <rect x="54" y="35" width="10" height="6" rx="1" />
                    <line x1="46" y1="38" x2="54" y2="38" />
                </g>
            );
            break;
    }

    // Determine animation translation / rotation classes
    let bodyClass = " duration-500 ease-in-out origin-bottom";
    let headClass = " duration-500 ease-in-out origin-center";
    let armClass = " duration-500 ease-in-out origin-top-left";

    if (animation === "nodding") {
        headClass += " animate-bounce";
    } else if (animation === "pointing") {
        armClass += " -rotate-45 translate-x-2 -translate-y-2";
        headClass += " rotate-3";
    } else if (animation === "gesturing") {
        armClass += " animate-pulse";
        bodyClass += " -rotate-1";
    } else if (animation === "explaining") {
        headClass += " rotate-2 translate-y-0.5";
        armClass += " rotate-12";
        bodyClass += " translate-y-0.5";
    }

    return (
        <div className="flex flex-col items-center justify-center space-y-3 p-4 bg-slate-100/50 dark:bg-slate-800/40 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm shadow-inner w-full h-full max-h-[320px]">
            <div className="relative w-36 h-36 md:w-44 md:h-44 flex items-center justify-center overflow-hidden">
                <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full drop-"
                >
                    {/* Background Circle */}
                    <circle cx="50" cy="50" r="46" fill="url(#avatar-bg-grad)" />
                    <defs>
                        <linearGradient id="avatar-bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#c084fc" stopOpacity="0.2" />
                        </linearGradient>
                    </defs>

                    {/* Torso & Clothes */}
                    <g className={bodyClass}>
                        {/* Shoulders / Suit jacket */}
                        <path
                            d="M20,90 C20,70 30,65 50,65 C70,65 80,70 80,90 Z"
                            fill={suitColor}
                            stroke="#1e293b"
                            strokeWidth="1.5"
                        />
                        {/* Shirt collar inner */}
                        <path
                            d="M40,65 L50,80 L60,65 Z"
                            fill={shirtColor}
                        />
                        {/* Tie (if professor or scientist) */}
                        {(avatar === "professor" || avatar === "scientist") && (
                            <path
                                d="M48,72 L52,72 L53,88 L50,92 L47,88 Z"
                                fill="#dc2626" // Red tie
                            />
                        )}
                    </g>

                    {/* Left Arm / Hand (for gestures) */}
                    <g className={armClass}>
                        <path
                            d="M20,78 Q10,72 8,60 Q12,58 18,70 Z"
                            fill={suitColor}
                            stroke="#1e293b"
                            strokeWidth="1.5"
                        />
                        {/* Hand */}
                        <circle cx="8" cy="58" r="4" fill={skinColor} />
                    </g>

                    {/* Head Group */}
                    <g className={headClass}>
                        {/* Neck */}
                        <rect x="44" y="55" width="12" height="12" rx="3" fill={skinColor} />

                        {/* Hair back */}
                        <circle cx="50" cy="38" r="21" fill={hairColor} />

                        {/* Head Face base */}
                        <circle cx="50" cy="40" r="18" fill={skinColor} stroke="#1e293b" strokeWidth="1.5" />

                        {/* Eyes */}
                        <circle cx="43" cy="37" r="2" fill="#0f172a" />
                        <circle cx="57" cy="37" r="2" fill="#0f172a" />

                        {/* Nose */}
                        <path d="M49,39 Q50,43 51,39" fill="none" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />

                        {/* Mouth - Animates when speaking */}
                        {isSpeaking ? (
                            // Animated Talking Mouth
                            <ellipse
                                cx="50"
                                cy="48"
                                rx="3.5"
                                ry="2.5"
                                fill="#7f1d1d"
                                className="animate-pulse"
                            />
                        ) : (
                            // Smiling Mouth
                            <path
                                d="M45,47 Q50,51 55,47"
                                fill="none"
                                stroke="#1e293b"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                            />
                        )}

                        {/* Accessories (Spectacles, Goggles, etc.) */}
                        {accessory}

                        {/* Hair front/bangs */}
                        <path
                            d="M32,32 C35,22 45,20 50,24 C55,20 65,22 68,32 C62,28 55,30 50,28 C45,30 38,28 32,32 Z"
                            fill={hairColor}
                        />
                    </g>
                </svg>
            </div>
            
            {/* Character Info */}
            <div className="text-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                    Active Avatar
                </span>
                <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">
                    {nameLabel}
                </h4>
            </div>
        </div>
    );
}
