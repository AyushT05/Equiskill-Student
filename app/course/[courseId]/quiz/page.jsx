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
        if (userAnswer === currentQuestion?.correct_answer) {
            setCorrectAnswer(true);
        } else {
            setCorrectAnswer(false);
        }
    }, []);

    useEffect(() => {
        const getQuiz = async () => {
            setIsLoading(true);
            try {
                console.log("Course", courseId);
                const result = await axios.post('/api/study-type', {
                    courseId: courseId,
                    studyType: 'Quizzes'
                });

                setQuizData(result.data);
                setQuiz(result.data.content);
                console.log("Quiz Result", result);

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
        return <div>Loading quiz...</div>;
    }

    return (
        <div>
            <h2 className="text-4xl font-semibold border-b-2 border-gray-300 py-4 mb-6 text-center">Quiz</h2>
            <StepProgress data={quiz} stepCount={stepCount} setStepCount={(v) => setStepCount(v)} />
            {quiz && quiz.length > 0 && quiz[stepCount] && ( // Conditional rendering
                <div>
                    <QuizCardItem
                        quiz={quiz[stepCount]}
                        userSelectedOption={(v) => checkAnswer(v, quiz[stepCount])}
                    />
                </div>
            )}
            {correctAnswer === false && (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mt-6 text-center rounded-lg shadow-md transition-all duration-300">
        <h3 className="text-2xl font-bold">Incorrect ❌</h3>
        <p className="text-lg mt-2">The correct answer is: <span className="font-semibold">{quiz[stepCount]?.correct_answer}</span></p>
    </div>
)}
{correctAnswer === true && (
    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mt-6 text-center rounded-lg shadow-md transition-all duration-300">
        <h3 className="text-2xl font-bold">Correct ✅</h3>
        <p className="text-lg mt-2">Great job! Keep going. 🎉</p>
    </div>
)}

        </div>
    );
}

export default Quiz
