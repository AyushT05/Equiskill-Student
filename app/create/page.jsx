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

    const steps = ['Select class', 'Configure topic'];

    return (
        <div className='min-h-screen flex flex-col bg-slate-50'>
            <DashboardHeader />

            <div className='flex-1 flex flex-col items-center px-4 py-10 sm:px-8'>

                {/* Progress bar */}
                <div className='w-full max-w-2xl mb-10'>
                    <div className='flex items-center justify-between mb-3'>
                        {steps.map((label, i) => (
                            <div key={i} className='flex items-center gap-2'>
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300
                                    ${i < step ? 'bg-primary text-white' : i === step ? 'bg-primary text-white ring-4 ring-primary/20' : 'bg-white border border-slate-200 text-slate-400'}`}>
                                    {i < step ? (
                                        <svg className='w-3.5 h-3.5' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={3}>
                                            <path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
                                        </svg>
                                    ) : i + 1}
                                </div>
                                <span className={`text-sm font-medium hidden sm:block ${i === step ? 'text-slate-800' : 'text-slate-400'}`}>
                                    {label}
                                </span>
                            </div>
                        ))}
                        {/* connector line */}
                        <div className='absolute left-1/2 -translate-x-1/2 hidden' />
                    </div>
                    <div className='relative h-1 bg-slate-200 rounded-full overflow-hidden'>
                        <div
                            className='absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-500'
                            style={{ width: `${(step / (steps.length - 1)) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Card */}
                <div className='w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden'>
                    <div className='px-6 py-5 border-b border-slate-100'>
                        <h2 className='text-lg font-semibold text-slate-800'>
                            {step === 0 ? 'What class are you in?' : 'What would you like to learn?'}
                        </h2>
                        <p className='text-sm text-slate-500 mt-0.5'>
                            {step === 0
                                ? 'Select your current class to tailor the material to your level.'
                                : 'Enter a topic and choose how challenging you want it to be.'}
                        </p>
                    </div>

                    <div className='p-6'>
                        {step === 0
                            ? <SelectOption selectedStudyType={(value) => handleUserInput('courseType', value)} />
                            : <TopicInput
                                SetTopic={(value) => handleUserInput('topic', value)}
                                setDifficultyLevel={(value) => handleUserInput('difficultyLevel', value)}
                              />
                        }
                    </div>

                    {/* Footer actions */}
                    <div className='px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center gap-3'>
                        {step !== 0 ? (
                            <Button
                                variant='outline'
                                onClick={() => setStep(step - 1)}
                                className='gap-1.5 text-sm'
                            >
                                <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                                    <path strokeLinecap='round' strokeLinejoin='round' d='M15 19l-7-7 7-7' />
                                </svg>
                                Back
                            </Button>
                        ) : <div />}

                        {step === 0 ? (
                            <Button onClick={() => setStep(step + 1)} className='gap-1.5 text-sm px-5'>
                                Continue
                                <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                                    <path strokeLinecap='round' strokeLinejoin='round' d='M9 5l7 7-7 7' />
                                </svg>
                            </Button>
                        ) : (
                            <Button onClick={GenerateCourseOutline} disabled={loading} className='gap-2 text-sm px-5 min-w-[160px]'>
                                {loading ? (
                                    <><Loader className='w-4 h-4 animate-spin' /> Generating…</>
                                ) : (
                                    <><svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                                        <path strokeLinecap='round' strokeLinejoin='round' d='M13 10V3L4 14h7v7l9-11h-7z' />
                                    </svg> Generate material</>
                                )}
                            </Button>
                        )}
                    </div>
                </div>

                <p className='text-xs text-slate-400 mt-6'>Step {step + 1} of {steps.length}</p>
            </div>
        </div>
    );
}

export default Create;