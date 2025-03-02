import { Button } from '@/components/ui/button'; // Make sure you actually use the Button component, or remove this import if you don't need it.
import React, { useState } from 'react';

function QuizCardItem({ quiz,userSelectedOption }) {
    const [selectedOption, setSelectedOption] = useState(null); // Initialize to null

    return quiz&& (
        <div className='mt-10 p-5'>
            <h2 className='font-medium text-3xl text-center'>{quiz?.question}</h2>
            <div className='grid grid-cols-2 gap-5 mt-6'>
                {quiz?.options?.map((option, index) => (
                    <h2
                        key={index}
                        onClick={() => {setSelectedOption(option); userSelectedOption(option)}} // Corrected line
                        className={`w-full border rounded-full p-3 px-4 text-center text-lg hover:bg-gray-300 cursor-pointer ${
                            selectedOption === option ? 'bg-primary text-white hover:bg-primary' : ''
                        }`}
                    >
                        {option}
                    </h2>
                ))}
            </div>
        </div>
    );
}

export default QuizCardItem;
