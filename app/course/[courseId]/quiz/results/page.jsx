"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

export default function QuizResults() {
    const searchParams = useSearchParams();
    const router = useRouter();
    
    const totalQuestions = parseInt(searchParams.get("totalQuestions"), 10) || 0;
    const totalCorrect = parseInt(searchParams.get("totalCorrect"), 10) || 0;

    const data = [
        { name: "Correct Answers", value: totalCorrect },
        { name: "Incorrect Answers", value: totalQuestions - totalCorrect },
    ];

    const COLORS = ["#0088FE", "#FF8042"];

    return (
        <div className="text-center mt-10">
            <h2 className="text-2xl sm:text-3xl font-bold">Quiz Completed! 🎉</h2>
            <p className="text-lg sm:text-xl mt-4">
                You got <span className="font-bold">{totalCorrect}</span> out of <span className="font-bold">{totalQuestions}</span> correct!
            </p>

            <PieChart width={400} height={400} className="mx-auto mt-6">
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>

            <button
                onClick={() => router.push("/")}
                className="mt-6 px-5 py-2 text-lg font-semibold bg-primary text-white rounded-lg shadow-md hover:bg-primary-dark transition-all"
            >
                Go Back to Study Material
            </button>
        </div>
    );
}
