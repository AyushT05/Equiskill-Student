"use client"
import React, { useState } from 'react'
import SelectOption from './_components/SelectOption'
import { Button } from '@/components/ui/button';
import TopicInput from './_components/TopicInput';
import { v4 as uuidv4 } from 'uuid';
import { useUser } from '@clerk/nextjs';
import axios from 'axios';
import { Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import DashboardHeader from '@/app/dashboard/_components/DashboardHeader';

function Create() {
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState([]);
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleUserInput = (fieldName, fieldValue) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: fieldValue
        }));
    };

    const GenerateCourseOutline = async () => {
        setLoading(true);
        const courseId = uuidv4();
        const result = await axios.post('/api/generate-course-outline', {
            courseId: courseId,
            ...formData,
            createdBy: user?.primaryEmailAddress.emailAddress,
        });
        setLoading(false);
        router.replace('/dashboard');
        toast("Your study material is being generated! Please wait...");
    };

    return (
        <div className='min-h-screen flex flex-col'>
            {/* Header — consistent with rest of the app */}
            <DashboardHeader />

            <div className='flex flex-col items-center px-4 py-6 sm:px-8 md:px-24 lg:px-36 mt-10 sm:mt-16 text-center flex-1'>
                <h2 className='font-bold text-2xl sm:text-3xl md:text-4xl text-primary'>
                    Start building your personalized study material
                </h2>
                <p className='text-gray-500 text-sm sm:text-base md:text-lg mt-2'>
                    Fill in all the details to be able to generate the study material!
                </p>

                {/* Step indicator */}
                <div className='flex items-center gap-2 mt-6'>
                    {[0, 1].map(i => (
                        <div
                            key={i}
                            className={`h-2 rounded-full transition-all duration-300 ${
                                i === step ? 'bg-primary w-8' : i < step ? 'bg-primary/40 w-5' : 'bg-gray-200 w-4'
                            }`}
                        />
                    ))}
                </div>

                <div className='mt-8 sm:mt-10 w-full'>
                    {step === 0
                        ? <SelectOption selectedStudyType={(value) => handleUserInput('courseType', value)} />
                        : <TopicInput
                            SetTopic={(value) => handleUserInput('topic', value)}
                            setDifficultyLevel={(value) => handleUserInput('difficultyLevel', value)}
                          />
                    }
                </div>

                {/* Single set of navigation buttons */}
                <div className='flex flex-col sm:flex-row justify-between w-full mt-16 sm:mt-24 gap-3'>
                    {step !== 0 ? (
                        <Button variant='outline' onClick={() => setStep(step - 1)} className="w-full sm:w-auto">
                            Previous
                        </Button>
                    ) : (
                        <div /> /* spacer so Next button stays right-aligned */
                    )}
                    {step === 0 ? (
                        <Button onClick={() => setStep(step + 1)} className="w-full sm:w-auto">
                            Next
                        </Button>
                    ) : (
                        <Button onClick={GenerateCourseOutline} disabled={loading} className="w-full sm:w-auto">
                            {loading ? <Loader className='animate-spin' /> : 'Generate Material'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Create;
