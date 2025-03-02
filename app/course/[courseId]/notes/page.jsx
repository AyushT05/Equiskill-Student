"use client"
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

function ViewNotes() {
    const { courseId } = useParams();
    const [Notes, setNotes] = useState([]);  // ✅ Initialize as an empty array
    const [stepCount, setStepCount] = useState(0);
    const route = useRouter()
    console.log("courseId from useParams:", courseId);

    useEffect(() => {
        GetNotes();
    }, []);

    const GetNotes = async () => {
        try {
            const result = await axios.post('/api/study-type', {
                studyType: 'notes',
                courseId: courseId,
            });
            console.log(result?.data);
            setNotes(result?.data || []);  // ✅ Ensure Notes is always an array
        } catch (error) {
            console.error("Error fetching notes:", error);
            setNotes([]);  // ✅ Set to empty array in case of error
        }
    };
    console.log("Current Notes Step Data:", Notes[stepCount]);


    return (
        <div>
            <div className='flex gap-5 items-center'>
                {stepCount != 0 &&
                    <Button variant='outline' size='sm' onClick={() => setStepCount(stepCount - 1)}>
                        Previous
                    </Button>
                }

                {Notes?.map((item, index) => (
                    <div
                        key={index}
                        className={`w-full h-2 rounded-full ${index < stepCount ? 'bg-primary' : 'bg-gray-300'}`}
                    ></div>
                ))}

                <Button size="sm" onClick={() => setStepCount(stepCount + 1)}>Next</Button>
            </div>

            <div className='mt-10'>
                {Notes.length > 0 && Notes[stepCount] && (
                    <div dangerouslySetInnerHTML={{__html:(Notes[stepCount]?.notes).replace("```html"," ").replace("```"," ")}} />
                )}

                {Notes?.length == stepCount && <div className='flex items-center gap-10 flex-col justify-center'>
                    <h2> End of Notes</h2>
                    <Button onClick={() => route.back()}>Go back to Course Page</Button>
                </div>}

            </div>
        </div>
    );
}

export default ViewNotes;
