"use client"
import { Button } from "@/components/ui/button"
import React from "react"

function StepQuizProgress({ stepCount, setStepCount, data, userAnswers }) {
    const isLastQuestion = stepCount === data.length - 1
    const currentAnswer = userAnswers[stepCount]

    return (
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 items-center justify-center mt-6">
            {stepCount !== 0 && (
                <Button variant='outline' size='sm' onClick={() => setStepCount(stepCount - 1)}>
                    Previous
                </Button>
            )}
            
            <div className="flex flex-1 items-center justify-center gap-2 sm:gap-5">
                {data?.map((_, index) => (
                    <div
                        key={index}
                        className={`h-2 rounded-full transition-all duration-200 ${index <= stepCount ? 'bg-primary w-6 sm:w-10' : 'bg-gray-300 w-4 sm:w-6'}`}
                    />
                ))}
            </div>

            <Button
                size="sm"
                disabled={!currentAnswer && stepCount < data.length}
                onClick={() => {
                    if (stepCount < data.length - 1) {
                        setStepCount(stepCount + 1)
                    } else {
                        setStepCount(data.length) // Navigate to results
                    }
                }}
            >
                {isLastQuestion ? "Finish" : "Next"}
            </Button>
        </div>
    )
}

export default StepQuizProgress
