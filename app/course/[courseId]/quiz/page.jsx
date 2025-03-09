"use client"
import axios from 'axios'
import { useParams } from 'next/navigation'
import React, { useEffect, useState, useCallback } from 'react'
import StepProgress from '../_components/StepProgress'
import QuizCardItem from './_components/QuizCardItem'

function Quiz() {
    const { courseId } = useParams()
    const [quizData, setQuizData] = useState(null)
    const [quiz, setQuiz] = useState([])
    const [stepCount, setStepCount] = useState(0)
    const [isLoading, setIsLoading] = useState(true);
    const [correctAnswer, setCorrectAnswer] = useState(null)

    const checkAnswer = useCallback((userAnswer, currentQuestion) => {
        setCorrectAnswer(userAnswer === currentQuestion?.correct_answer);
    }, []);

    useEffect(() => {
        const getQuiz = async () => {
            setIsLoading(true);
            try {
                const result = await axios.post('/api/study-type', {
                    courseId: courseId,
                    studyType: 'Quizzes'
                });

                setQuizData(result.data);
                setQuiz(result.data.content);

            } catch (error) {
                console.error("Error fetching quiz:", error);
            } finally {
                setIsLoading(false);
            }
        };

        getQuiz();
    }, [courseId]);

    useEffect(() => {
        setCorrectAnswer(null);
    }, [stepCount]);

    if (isLoading) {
        return <div className="text-center text-lg">Loading quiz...</div>;
    }

    return (
        <div className="px-4 sm:px-8 md:px-16 lg:px-24">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold border-b-2 border-gray-300 py-4 mb-6 text-center">
                Quiz
            </h2>
            <StepProgress data={quiz} stepCount={stepCount} setStepCount={setStepCount} />

            {quiz?.length > 0 && quiz[stepCount] && (
                <QuizCardItem
                    quiz={quiz[stepCount]}
                    userSelectedOption={(v) => checkAnswer(v, quiz[stepCount])}
                />
            )}

            {/* Answer Feedback */}
            {correctAnswer !== null && (
                <div className={`p-4 mt-6 text-center rounded-lg shadow-md transition-all duration-300 
                    ${correctAnswer ? "bg-green-100 border-l-4 border-green-500 text-green-700" : "bg-red-100 border-l-4 border-red-500 text-red-700"}`}>
                    <h3 className="text-xl sm:text-2xl font-bold">
                        {correctAnswer ? "Correct ✅" : "Incorrect ❌"}
                    </h3>
                    {!correctAnswer && (
                        <p className="text-lg mt-2">
                            The correct answer is: <span className="font-semibold">{quiz[stepCount]?.correct_answer}</span>
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

export default Quiz;
