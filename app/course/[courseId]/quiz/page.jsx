"use client"
import axios from 'axios'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState, useCallback } from 'react'
import { STUDY_TYPES } from '@/configs/studyTypes'
import QuizCardItem from './_components/QuizCardItem'
import ResultsPage from './_components/ResultPage'
import StepQuizProgress from './_components/StepProgress'
import ShinyText from './_components/ShinyText'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

function Quiz() {
    const { courseId } = useParams()
    const router = useRouter()
    const [quizData, setQuizData] = useState(null)
    const [quiz, setQuiz] = useState([])
    const [stepCount, setStepCount] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [userAnswers, setUserAnswers] = useState([])

const normalizeAnswer = (value = "") =>
    value
        .replace(/^option\s+[a-d]\s*[:.)-]?\s*/i, "")
        .replace(/^\(?[a-d]\)?\s*[:.)-]?\s*/i, "")
        .trim()
        .toLowerCase();

const checkAnswer = useCallback((userAnswer, currentQuestion) => {
    setUserAnswers(prev => {
        const newAnswers = [...prev];

        const selectedLetter =
            userAnswer?.match(/^[A-D]/i)?.[0]?.toUpperCase();

        const correctLetter =
            currentQuestion.answer?.trim()?.toUpperCase();

        newAnswers[stepCount] = {
            userAnswer,
            correctAnswer: currentQuestion.answer,
            explanation: currentQuestion.explanation,
            isCorrect: selectedLetter === correctLetter
        };

        return newAnswers;
    });
}, [stepCount]);

    useEffect(() => {
        const getQuiz = async () => {
            setIsLoading(true);
            try {
                // FIX: use canonical STUDY_TYPES.QUIZ constant
                const result = await axios.post('/api/study-type', {
                    courseId: courseId,
                    studyType: STUDY_TYPES.QUIZ
                });
                const data = result.data;
                setQuizData(data);
                // FIX: content is the array directly
                const questions = Array.isArray(data?.content) ? data.content : [];
                setQuiz(questions);
                setUserAnswers(new Array(questions.length).fill(null));
            } catch (error) {
                console.error("Error fetching quiz:", error);
            } finally {
                setIsLoading(false);
            }
        };
        getQuiz();
    }, [courseId]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <ShinyText text="Loading Quiz..." disabled={false} speed={3} className='custom-class' />
                </div>
            </div>
        );
    }

    if (!quiz.length) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <p className="text-gray-500 text-lg">No quiz questions found.</p>
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
                </Button>
            </div>
        );
    }

    return (
        <div className="px-4 sm:px-8 md:px-16 lg:px-24 max-w-4xl mx-auto py-6">
            {/* Back button */}
            <Button variant="ghost" className="mb-4 text-gray-500 hover:text-gray-800" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Course
            </Button>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold border-b-2 border-gray-300 py-4 mb-6 text-center">
                Quiz
            </h2>

            {stepCount < quiz.length ? (
                <>
                    <StepQuizProgress
                        data={quiz}
                        stepCount={stepCount}
                        setStepCount={setStepCount}
                        userAnswers={userAnswers}
                    />

                    {quiz[stepCount] && (
                        <QuizCardItem
                            quiz={quiz[stepCount]}
                            userSelectedOption={(v) => checkAnswer(v, quiz[stepCount])}
                            isOptionDisabled={userAnswers[stepCount] !== null}
                        />
                    )}

                    {/* Next button */}
                    <div className="flex justify-end mt-6">
                        {stepCount < quiz.length - 1 ? (
                            <Button
                                onClick={() => setStepCount(s => s + 1)}
                                disabled={userAnswers[stepCount] === null}
                            >
                                Next Question
                            </Button>
                        ) : (
                            <Button
                                onClick={() => setStepCount(quiz.length)}
                                disabled={userAnswers[stepCount] === null}
                            >
                                See Results
                            </Button>
                        )}
                    </div>
                </>
            ) : (
                <ResultsPage
                    userAnswers={userAnswers}
                    quiz={quiz}
                />
            )}
        </div>
    )
}

export default Quiz
