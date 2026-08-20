"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { quizQuestions } from "@/data/error-detection-quiz";

export default function QuizComponent() {
    const [quizScore, setQuizScore] = useState<number | null>(null);
    const [userAnswers, setUserAnswers] = useState<{ [key: number]: number }>({});
    const [showResults, setShowResults] = useState(false);

    const handleQuizSubmit = () => {
        let score = 0;
        quizQuestions.forEach((q, idx) => {
            if (userAnswers[idx] === q.answer) {
                score++;
            }
        });
        setQuizScore(score);
        setShowResults(true);
    };

    const resetQuiz = () => {
        setQuizScore(null);
        setUserAnswers({});
        setShowResults(false);
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Quiz / Viva</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {quizQuestions.map((q, qImg) => (
                        <div key={qImg} className="border p-4 rounded-none-none bg-card shadow-none-none">
                            <p className="font-medium mb-3 text-muted-foreground">{qImg + 1}. {q.question}</p>
                            <div className="space-y-2">
                                {q.options.map((opt, optIdx) => (
                                    <div key={optIdx} className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            name={`question-${qImg}`}
                                            id={`q${qImg}-opt${optIdx}`}
                                            checked={userAnswers[qImg] === optIdx}
                                            disabled={showResults}
                                            onChange={() => setUserAnswers(prev => ({ ...prev, [qImg]: optIdx }))}
                                            className="h-4 w-4 text-primary focus:ring-primary border-border"
                                        />
                                        <label htmlFor={`q${qImg}-opt${optIdx}`} className={`text-sm ${showResults && q.answer === optIdx ? "text-green-700 font-bold" :
                                                showResults && userAnswers[qImg] === optIdx && userAnswers[qImg] !== q.answer ? "text-red-600 line-through" : "text-muted-foreground"
                                            }`}>
                                            {opt}
                                            {showResults && q.answer === optIdx && " (Correct Answer)"}
                                            {showResults && userAnswers[qImg] === optIdx && userAnswers[qImg] !== q.answer && " (Your Answer)"}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    <div className="mt-6 flex items-center gap-4">
                        {!showResults ? (
                            <Button onClick={handleQuizSubmit} className=" px-8">Submit Answers</Button>
                        ) : (
                            <div className="flex items-center gap-4">
                                <div className="text-xl font-bold bg-card px-4 py-2 rounded-none">
                                    Your Score: <span className={quizScore! > quizQuestions.length / 2 ? "text-green-600" : "text-red-600"}>{quizScore}</span> / {quizQuestions.length}
                                </div>
                                <Button variant="outline" onClick={resetQuiz}>Retake Quiz</Button>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
