"use client"
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

const COLORS = ['#4CAF50', '#F44336', '#9E9E9E']

export default function ResultsPage({ userAnswers, quiz }) {
    const router = useRouter()
    const correctCount = userAnswers.filter(a => a?.isCorrect).length
    const incorrectCount = userAnswers.filter(a => a && !a.isCorrect).length
    const unansweredCount = quiz.length - (correctCount + incorrectCount)
    const totalQuestions = quiz.length
    const score = Math.round((correctCount / totalQuestions) * 100)

    const pieData = [
        { name: 'Correct', value: correctCount },
        { name: 'Incorrect', value: incorrectCount },
        { name: 'Unanswered', value: unansweredCount },
    ]

    const getPerformanceRemark = (score) => {
        if (score >= 90) return "Outstanding! 🎉"
        if (score >= 75) return "Excellent Work! 👏"
        if (score >= 60) return "Good Job! 👍"
        if (score >= 40) return "Keep Practicing! 💪"
        return "Needs Improvement 📚"
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-center">Quiz Results</h2>
            
            {/* Score Section */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
                {/* Pie Chart */}
                <div className="w-full md:w-1/2 h-96">
                    <PieChart width={400} height={400}>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </div>

                {/* Score Card */}
                <div className="w-full md:w-1/2 space-y-6 text-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg border">
                        <div className="text-4xl font-bold text-primary mb-2">
                            {score}%
                        </div>
                        <div className="text-xl font-semibold text-gray-600">
                            {correctCount}/{totalQuestions} Correct
                        </div>
                    </div>

                    <div className={`text-2xl font-bold ${
                        score >= 90 ? 'text-green-600' :
                        score >= 75 ? 'text-blue-600' :
                        score >= 40 ? 'text-orange-500' : 'text-red-600'
                    }`}>
                        {getPerformanceRemark(score)}
                    </div>

                    <div className="space-y-2 text-gray-600">
                        <div>✔️ {correctCount} Correct Answers</div>
                        <div>❌ {incorrectCount} Incorrect Answers</div>
                        <div>❓ {unansweredCount} Unanswered</div>
                    </div>
                </div>
            </div>

            {/* Detailed Solutions */}
            <div className="mt-12 space-y-8">
                {quiz.map((question, index) => {
                    const answer = userAnswers[index]
                    return (
                        <div key={index} className="p-6 border rounded-lg">
                            <h3 className="text-lg font-semibold mb-4">
                                Q{index + 1}: {question.question}
                            </h3>
                            <div className="space-y-2">
                                <p className={answer?.isCorrect ? 'text-green-600' : 'text-red-600'}>
                                    Your Answer: {answer?.userAnswer || 'Unanswered'}
                                </p>
                                <p className="text-blue-600">
                                    Correct Answer: {question.answer}
                                </p>
                                <p className="text-gray-600">
                                    Explanation: {question.explanation}
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="mt-8 text-center">
                <Button onClick={() => router.back()}>
                    Back to Study Material
                </Button>
            </div>
        </div>
    )
}
