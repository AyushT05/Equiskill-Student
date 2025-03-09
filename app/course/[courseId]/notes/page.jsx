"use client"
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function ViewNotes() {
    const { courseId } = useParams();
    const [Notes, setNotes] = useState([]);
    const [stepCount, setStepCount] = useState(0);
    const [direction, setDirection] = useState(1); // 1 for Next, -1 for Previous
    const route = useRouter();

    useEffect(() => {
        GetNotes();
    }, []);

    const GetNotes = async () => {
        try {
            const result = await axios.post('/api/study-type', {
                studyType: 'notes',
                courseId: courseId,
            });
            setNotes(result?.data || []);
        } catch (error) {
            console.error("Error fetching notes:", error);
            setNotes([]);
        }
    };

    return (
        <div className="max-w-screen-md mx-auto px-4 sm:px-8 mt-8">
            {/* Step Progress Bar */}
            <div className='flex items-center gap-3 sm:gap-5 justify-center'>
                {stepCount !== 0 && (
                    <Button 
                        variant='outline' 
                        size='sm' 
                        onClick={() => { setDirection(-1); setStepCount(stepCount - 1); }}
                    >
                        Previous
                    </Button>
                )}

                <div className="flex flex-1 items-center justify-center gap-2 sm:gap-4">
                    {Notes?.map((_, index) => (
                        <div
                            key={index}
                            className={`h-2 rounded-full transition-all duration-300
                            ${index < stepCount ? 'bg-primary w-6 sm:w-10' : 'bg-gray-300 w-4 sm:w-6'}`}
                        />
                    ))}
                </div>

                {stepCount < Notes.length && (
                    <Button 
                        size="sm" 
                        onClick={() => { setDirection(1); setStepCount(stepCount + 1); }}
                    >
                        Next
                    </Button>
                )}
            </div>

            {/* Notes Content with Corrected Animations */}
            <div className='mt-8 sm:mt-10 relative overflow-hidden'>
                <AnimatePresence mode="wait" custom={direction}>
                    {Notes.length > 0 && stepCount < Notes.length && Notes[stepCount] && (
                        <motion.div
                            key={stepCount} // Helps framer-motion detect changes
                            initial={{ opacity: 0, x: direction > 0 ? 50 : -50 }} // Moves left or right
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: direction > 0 ? -50 : 50 }} // Moves out in opposite direction
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="bg-white shadow-md rounded-lg p-4 sm:p-6 leading-relaxed 
                                       sm:max-w-full max-w-md mx-auto text-justify text-base sm:text-lg"
                            dangerouslySetInnerHTML={{ __html: (Notes[stepCount]?.notes).replace("```html"," ").replace("```"," ") }}
                        />
                    )}
                </AnimatePresence>

                {/* End of Notes Screen */}
                {stepCount === Notes.length && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className='flex flex-col items-center gap-4 mt-10'
                    >
                        <h2 className="text-xl sm:text-2xl font-semibold text-gray-700">End of Notes 🎉</h2>
                        <Button 
                            onClick={() => route.back()} 
                            className="transition-all duration-300 hover:scale-105"
                        >
                            Go back to Course Page
                        </Button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

export default ViewNotes;
