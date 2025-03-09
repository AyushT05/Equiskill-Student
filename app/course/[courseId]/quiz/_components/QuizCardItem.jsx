import React, { useState } from 'react';

function QuizCardItem({ quiz, userSelectedOption }) {
    const [selectedOption, setSelectedOption] = useState(null);

    return quiz && (
        <div className='mt-6 sm:mt-10 p-4 sm:p-5'>
            <h2 className='font-medium text-xl sm:text-2xl md:text-3xl text-center'>{quiz?.question}</h2>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6'>
                {quiz?.options?.map((option, index) => (
                    <h2
                        key={index}
                        onClick={() => { setSelectedOption(option); userSelectedOption(option) }}
                        className={`w-full border rounded-full p-3 text-center text-lg hover:bg-gray-300 cursor-pointer transition-all duration-200
                            ${selectedOption === option ? 'bg-primary text-white hover:bg-primary' : ''}`}
                    >
                        {option}
                    </h2>
                ))}
            </div>
        </div>
    );
}

export default QuizCardItem;
