import { UserButton } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

function DashboardHeader() {
    return (
        <header className="p-4 shadow-md flex items-center bg-white">
            {/* Left Spacer for Alignment */}
            <div className="flex-1"></div>

            {/* Centered Logo */}
            <Link href="/dashboard" className="flex items-center justify-center">
                <Image
                    src="/student-station.png"
                    alt="Dashboard"
                    width={180}
                    height={180}
                    className="transition-transform duration-300 hover:scale-105"
                />
            </Link>

            {/* User Button on the Right */}
            <div className="flex-1 flex justify-end">
                <UserButton />
            </div>
        </header>
    );
}

export default DashboardHeader;
