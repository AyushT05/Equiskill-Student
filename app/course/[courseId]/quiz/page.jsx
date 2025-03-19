"use client"
import axios from 'axios'
import { useParams } from 'next/navigation'
import React, { useEffect, useState, useCallback } from 'react'
import QuizCardItem from './_components/QuizCardItem'
import ResultsPage from './_components/ResultPage'
import StepQuizProgress from './_components/StepProgress'

function Quiz() {
    const { courseId } = useParams()
    const [quizData, setQuizData] = useState(null)
    const [quiz, setQuiz] = useState([])
    const [stepCount, setStepCount] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [userAnswers, setUserAnswers] = useState([])

    const checkAnswer = useCallback((userAnswer, currentQuestion) => {
        setUserAnswers(prev => {
            const newAnswers = [...prev]
            newAnswers[stepCount] = {
                userAnswer,
                correctAnswer: currentQuestion.answer,
                explanation: currentQuestion.explanation,
                isCorrect: userAnswer === currentQuestion.answer
            }
            return newAnswers
        })
    }, [stepCount])

    useEffect(() => {
        const getQuiz = async () => {
            setIsLoading(true)
            try {
                const result = await axios.post('/api/study-type', {
                    courseId: courseId,
                    studyType: 'Quizzes'
                })
                setQuizData(result.data)
                setQuiz(result.data.content)
                setUserAnswers(new Array(result.data.content.length).fill(null))
            } catch (error) {
                console.error("Error fetching quiz:", error)
            } finally {
                setIsLoading(false)
            }
        }
        getQuiz()
    }, [courseId])

    if (isLoading) {
        return <div className="text-center text-lg">Loading quiz...</div>
    }

    return (
        <div className="px-4 sm:px-8 md:px-16 lg:px-24">
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
