"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React from "react";

function StepProgress({ stepCount, setStepCount, data }) {
    const router = useRouter(); // Initialize the router

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
                onClick={() => {
                    if (stepCount < data.length - 1) {
                        setStepCount(stepCount + 1);
                    } else {
                        router.back(); // Navigate back to the study material page
                    }
                }}
            >
                {stepCount < data.length - 1 ? "Next" : "Finish"}
            </Button>
        </div>
    );
}

export default StepProgress;
