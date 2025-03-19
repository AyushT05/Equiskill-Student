import React, { useState } from "react";

function QuizCardItem({ quiz, userSelectedOption, isOptionDisabled }) {
    const [selectedOption, setSelectedOption] = useState(null)

    return quiz && (
        <div className="mt-6 sm:mt-10 p-4 sm:p-5">
            <h2 className="font-medium text-xl sm:text-2xl md:text-3xl text-center">
                {quiz.question}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                {quiz.options.map((option, index) => (
                    <button
                        key={index}
                        disabled={isOptionDisabled}
                        onClick={() => {
                            setSelectedOption(option)
                            userSelectedOption(option)
                        }}
                        className={`w-full border rounded-full p-3 text-center text-lg transition-all duration-200
                            ${selectedOption === option ? "bg-primary text-white" : ""}
                            ${isOptionDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100 cursor-pointer"}`}
                    >
                        {option}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default QuizCardItem;