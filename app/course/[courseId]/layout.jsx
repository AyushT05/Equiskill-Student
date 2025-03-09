import DashboardHeader from '@/app/dashboard/_components/DashboardHeader';
import React from 'react';

function CourseViewLayout({ children }) {
    return (
        <div>
            <DashboardHeader />
            <div className="mx-4 md:mx-16 lg:mx-40 mt-6">{children}</div>
        </div>
    );
}

export default CourseViewLayout;
