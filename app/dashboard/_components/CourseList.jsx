"use client"
import { useUser } from '@clerk/nextjs'
import axios from 'axios'
import React, { useContext, useEffect, useState } from 'react'
import CourseCardItem from './CourseCardItem';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { CourseCountContext } from '@/app/_context/CourseCountContext';

function CourseList() {
    const { user } = useUser();
    const [CourseList, setCourseList] = useState([]);
    const [loading, setLoading] = useState(false);
    const { totalCourse, setTotalCourse } = useContext(CourseCountContext);

    useEffect(() => {
        if (user) GetCourseList();
    }, [user]);

    const GetCourseList = async () => {
        setLoading(true);
        const result = await axios.post('api/courses', { createdBy: user?.primaryEmailAddress?.emailAddress });
        setCourseList(result.data.result);
        setLoading(false);
        setTotalCourse(result.data.result?.length);
    };

    return (
        <div className='mt-5'>
            <h2 className='flex justify-between items-center font-bold text-lg md:text-2xl mb-5'>
                Your Study Material
                <Button variant='outline' className='border-primary text-primary flex gap-2 items-center text-sm' onClick={GetCourseList}>
                    <RefreshCw className='h-4 w-4 md:h-5 md:w-5' /> Refresh
                </Button>
            </h2>

            {loading ? (
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                    {[1, 2, 3, 4].map((_, index) => (
                        <div key={index} className='h-44 w-full bg-slate-200 rounded-lg animate-pulse'></div>
                    ))}
                </div>
            ) : CourseList.length > 0 ? (
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                    {CourseList.map((course, index) => (
                        <CourseCardItem course={course} key={index} />
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 text-base md:text-lg mt-5">
                    No courses available. Start by adding a new course!
                </p>
            )}
        </div>
    );
}

export default CourseList;
