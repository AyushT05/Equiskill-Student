"use client";

import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import CourseIntroCard from './_components/courseIntroCard';
import StudyMaterialSection from './_components/StudyMaterialSection';
import ChapterList from './_components/ChapterList';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

function Course() {
    const { courseId } = useParams();
    const router = useRouter();
    const [course, setCourse] = useState();

    useEffect(() => {
        GetCourse();
    }, []);

    const GetCourse = async () => {
        try {
            const result = await axios.get(`/api/courses?courseId=${courseId}`);
            setCourse(result.data.result);
        } catch (error) {
            console.error("Error fetching course:", error);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto">
            {/* Back button */}
            <Button
                variant="ghost"
                className="mb-4 text-gray-500 hover:text-gray-800 flex items-center gap-1"
                onClick={() => router.back()}
            >
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Button>

            <CourseIntroCard course={course} />
            <StudyMaterialSection courseId={courseId} course={course} />
            <ChapterList course={course} />
        </div>
    );
}

export default Course;
