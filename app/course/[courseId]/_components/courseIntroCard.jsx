import { Progress } from '@/components/ui/progress';
import Image from 'next/image';
import React from 'react';

function CourseIntroCard({ course }) {
    return (
        <div className="flex flex-col md:flex-row gap-5 items-center p-6 border shadow-md rounded-lg">
            {/* Image stacks on top in mobile */}
            <Image src={'/note.png'} alt="knowledge" width={70} height={70} className="w-16 h-16 md:w-20 md:h-20" />

            <div className="text-center md:text-left">
                <h2 className="font-bold text-xl md:text-2xl">{course?.courseLayout.course_name}</h2>
                <p className="text-sm md:text-base">{course?.courseLayout.course_summary}</p>
                <Progress className="mt-3" />
                <h2 className="mt-3 text-sm text-primary">
                    Number of Chapters: {course?.courseLayout?.chapters?.length}
                </h2>
            </div>
        </div>
    );
}

export default CourseIntroCard;
