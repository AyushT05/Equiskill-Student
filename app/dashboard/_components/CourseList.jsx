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
    const {totalCourse,setTotalCourse}=useContext(CourseCountContext)

    useEffect(() => {
        if (user) GetCourseList();
    }, [user]);

    const GetCourseList = async () => {
        setLoading(true);
        const result = await axios.post('api/courses', { createdBy: user?.primaryEmailAddress?.emailAddress });
        console.log(result);
        setCourseList(result.data.result);
        setLoading(false);
        setTotalCourse(result.data.result?.length)
    };

    return (
        <div className='mt-10'>
            <h2 className='flex justify-between items-center font-bold text-2xl mb-5'>
                Your Study Material
                <Button variant='outline' className='border-primary text-primary' onClick={GetCourseList}>
                    <RefreshCw /> Refresh
                </Button>
            </h2>

            {/* Show loading skeleton while fetching data */}
            {loading ? (
                <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
                    {[1, 2, 3, 4].map((item, index) => (
                        <div key={index} className='h-56 w-full bg-slate-200 rounded-lg animate-pulse'></div>
                    ))}
                </div>
            ) : CourseList.length > 0 ? (
                <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
                    {CourseList.map((course, index) => (
                        <CourseCardItem course={course} key={index} />
                    ))}
                </div>
            ) : (
                // Message when no courses are available
                <div className="text-center text-gray-500 text-lg mt-10">
                    <p>No courses available. Start by adding a new course!</p>
                </div>
            )}
        </div>
    );
}

export default CourseList;
