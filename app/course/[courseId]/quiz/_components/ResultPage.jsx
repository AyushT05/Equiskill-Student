"use client"
import { PieChart, Pie, Cell, Tooltip } from 'recharts'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Trophy, CheckCircle, XCircle, CircleDashed, ArrowLeft, BadgeCheck, BookOpen } from 'lucide-react'

const COLORS = ['#22c55e', '#f87171', '#cbd5e1']

function getPerformance(score) {
    if (score >= 90) return { label: "Outstanding", color: "text-green-600", bg: "bg-green-50", border: "border-green-200" }
    if (score >= 75) return { label: "Excellent Work", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" }
    if (score >= 60) return { label: "Good Job", color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200" }
    if (score >= 40) return { label: "Keep Practicing", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" }
    return { label: "Needs Improvement", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" }
}

export default function ResultsPage({ userAnswers, quiz }) {
    const router = useRouter()
    const correctCount = userAnswers.filter(a => a?.isCorrect).length
    const incorrectCount = userAnswers.filter(a => a && !a.isCorrect).length
    const unansweredCount = quiz.length - (correctCount + incorrectCount)
    const totalQuestions = quiz.length
    const score = Math.round((correctCount / totalQuestions) * 100)
    const perf = getPerformance(score)

    const pieData = [
        { name: 'Correct', value: correctCount },
        { name: 'Incorrect', value: incorrectCount },
        { name: 'Unanswered', value: unansweredCount },
    ]

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">

            {/* Header */}
            <div className="flex flex-col items-center gap-3 mb-8">
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-amber-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Quiz Results</h1>
                <span className={`text-sm font-semibold px-4 py-1 rounded-full border ${perf.bg} ${perf.border} ${perf.color}`}>
                    {perf.label}
                </span>
            </div>

            {/* Score card + chart */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-6 flex flex-col md:flex-row items-center gap-8">
                {/* Big score */}
                <div className="flex flex-col items-center justify-center flex-1 gap-1">
                    <span className="text-6xl font-extrabold text-primary">{score}%</span>
                    <span className="text-gray-500 text-sm">{correctCount} of {totalQuestions} correct</span>
                    <div className="flex flex-wrap justify-center gap-3 mt-4">
                        <div className="flex items-center gap-1.5 text-sm text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
                            <CheckCircle className="w-4 h-4" /> {correctCount} Correct
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full">
                            <XCircle className="w-4 h-4" /> {incorrectCount} Wrong
                        </div>
                        {unansweredCount > 0 && (
                            <div className="flex items-center gap-1.5 text-sm text-gray-500 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full">
                                <CircleDashed className="w-4 h-4" /> {unansweredCount} Skipped
                            </div>
                        )}
                    </div>
                </div>

                {/* Pie chart with manual legend */}
                <div className="flex-shrink-0 flex flex-col items-center gap-2">
                    <PieChart width={160} height={160}>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={42}
                            outerRadius={62}
                            paddingAngle={4}
                            dataKey="value"
                        >
                            {pieData.map((_, index) => (
                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                    <div className="flex gap-3 text-xs text-gray-500">
                        {pieData.map((entry, index) => (
                            <div key={index} className="flex items-center gap-1">
                                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: COLORS[index] }} />
                                {entry.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Detailed breakdown */}
            <div className="mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-gray-400" />
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Question Breakdown</h2>
            </div>

            <div className="space-y-4 mb-8">
                {quiz.map((question, index) => {
                    const answer = userAnswers[index]
                    const isCorrect = answer?.isCorrect
                    const isUnanswered = !answer

                    return (
                        <div
                            key={index}
                            className={`rounded-xl border p-5 ${
                                isUnanswered ? 'border-gray-200 bg-gray-50' :
                                isCorrect ? 'border-green-200 bg-green-50/40' :
                                'border-red-200 bg-red-50/40'
                            }`}
                        >
                            <div className="flex items-start gap-3 mb-3">
                                <span className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                    isUnanswered ? 'bg-gray-400' : isCorrect ? 'bg-green-500' : 'bg-red-500'
                                }`}>
                                    {index + 1}
                                </span>
                                <h3 className="text-sm font-semibold text-gray-800 leading-relaxed">{question.question}</h3>
                            </div>

                            <div className="ml-9 space-y-1.5 text-sm">
                                <div className={`flex items-center gap-2 ${isCorrect ? 'text-green-700' : isUnanswered ? 'text-gray-400' : 'text-red-600'}`}>
                                    {isCorrect ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> :
                                     isUnanswered ? <CircleDashed className="w-4 h-4 flex-shrink-0" /> :
                                     <XCircle className="w-4 h-4 flex-shrink-0" />}
                                    <span>Your answer: <strong>{answer?.userAnswer || 'Unanswered'}</strong></span>
                                </div>

                                {!isCorrect && (
                                    <div className="flex items-center gap-2 text-blue-700">
                                        <BadgeCheck className="w-4 h-4 flex-shrink-0" />
                                        <span>Correct answer: <strong>{question.answer}</strong></span>
                                    </div>
                                )}

                                {question.explanation && (
                                    <div className="mt-2 pt-2 border-t border-gray-200 text-gray-600 leading-relaxed">
                                        {question.explanation}
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="text-center">
                <Button onClick={() => router.back()} className="flex items-center gap-2 mx-auto">
                    <ArrowLeft className="w-4 h-4" /> Back to Course
                </Button>
            </div>
        </div>
    )
}