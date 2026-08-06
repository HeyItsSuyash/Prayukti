import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, RefreshCcw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { QuizQuestion } from "@/lib/labs/rich-content";

interface QuizViewProps {
    questions: QuizQuestion[];
    onComplete?: (score: number) => void;
}

export function QuizView({ questions, onComplete }: QuizViewProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);

    const currentQuestion = questions[currentIndex];

    const handleOptionSelect = (index: number) => {
        if (isAnswered) return;
        setSelectedOption(index);
    };

    const handleSubmit = () => {
        if (selectedOption === null) return;

        const isCorrect = selectedOption === currentQuestion.correctAnswer;
        if (isCorrect) {
            setScore(prev => prev + 1);
        }
        setIsAnswered(true);
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setShowResult(true);
            if (onComplete) onComplete(score + (selectedOption === currentQuestion.correctAnswer ? 0 : 0)); // Score is already updated
        }
    };

    const handleRetry = () => {
        setCurrentIndex(0);
        setSelectedOption(null);
        setIsAnswered(false);
        setScore(0);
        setShowResult(false);
    };

    if (showResult) {
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-6 text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative"
                >
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-50"></div>
                    <div className="relative bg-card p-6 rounded-full shadow-lg border-4 border-primary/20">
                        <span className="text-4xl font-bold text-primary">{score} / {questions.length}</span>
                    </div>
                </motion.div>

                <div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">Quiz Completed!</h3>
                    <p className="text-muted-foreground">
                        {score === questions.length ? "Perfect Score! You mastered this topic." : "Good effort! Review the material and try again."}
                    </p>
                </div>

<<<<<<< Updated upstream
                <Button onClick={handleRetry} className="gap-2">
                    <RefreshCcw size={16} /> Retry Quiz
=======
                <Button onClick={handleRetry} className="gap-2 btn-press">
                    <i className="bx bx-refreshccw"  /> Retry Quiz
>>>>>>> Stashed changes
                </Button>
            </div>
        );
    }

    return (
        <Card className="w-full border-0 shadow-none">
            <CardHeader>
                <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
                    <span>Question {currentIndex + 1} of {questions.length}</span>
                    <span>Score: {score}</span>
                </div>
                <div className="relative w-full h-1 bg-muted rounded-full overflow-hidden">
                    <motion.div
                        className="absolute h-full bg-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                    />
                </div>
                <CardTitle className="text-xl mt-4 leading-relaxed">
                    {currentQuestion.question}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <AnimatePresence mode="wait">
                    {currentQuestion.options.map((option, index) => {
                        let borderColor = "border-border hover:border-primary/50";
                        let bgColor = "bg-card hover:bg-muted/50";
                        let icon = null;

                        if (isAnswered) {
                            if (index === currentQuestion.correctAnswer) {
<<<<<<< Updated upstream
                                borderColor = "border-green-500 bg-green-50";
                                icon = <CheckCircle2 className="text-green-600" size={20} />;
                            } else if (index === selectedOption) {
                                borderColor = "border-red-500 bg-red-50";
                                icon = <XCircle className="text-red-600" size={20} />;
=======
                                borderColor = "border-success bg-success/10";
                                icon = <i className="bx bx-check-circle text-success"  />;
                            } else if (index === selectedOption) {
                                borderColor = "border-destructive bg-destructive/10";
                                icon = <i className="bx bx-xcircle text-destructive"  />;
>>>>>>> Stashed changes
                            } else {
                                borderColor = "border-border/50 opacity-50";
                            }
                        } else if (selectedOption === index) {
                            borderColor = "border-primary ring-1 ring-primary";
                            bgColor = "bg-primary/10";
                        }

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => handleOptionSelect(index)}
                                className={`
                                    relative flex items-center p-4 rounded border-2 cursor-pointer transition-all duration-200 card-hover
                                    ${borderColor} ${bgColor}
                                `}
                            >
                                <span className="flex-grow font-medium text-foreground/90">{option}</span>
                                {icon}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {isAnswered && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4 p-3 bg-primary/10 rounded text-sm text-primary border border-primary/20"
                    >
                        <strong>Explanation:</strong> {currentQuestion.explanation}
                    </motion.div>
                )}
            </CardContent>
            <CardFooter className="flex justify-end pt-2">
                {!isAnswered ? (
                    <Button
                        onClick={handleSubmit}
                        disabled={selectedOption === null}
                        className="w-full sm:w-auto btn-press"
                    >
                        Check Answer
                    </Button>
                ) : (
<<<<<<< Updated upstream
                    <Button onClick={handleNext} className="w-full sm:w-auto gap-2">
                        {currentIndex < questions.length - 1 ? "Next Question" : "View Results"} <ArrowRight size={16} />
=======
                    <Button onClick={handleNext} className="w-full sm:w-auto gap-2 btn-press">
                        {currentIndex < questions.length - 1 ? "Next Question" : "View Results"} <i className="bx bx-right-arrow-alt"  />
>>>>>>> Stashed changes
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
