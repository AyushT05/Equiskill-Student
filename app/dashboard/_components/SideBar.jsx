"use client"
import { CourseCountContext } from '@/app/_context/CourseCountContext'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { UserButton } from '@clerk/nextjs'
import { LayoutDashboard, UserCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useContext } from 'react'

function SideBar() {
  const { totalCourse } = useContext(CourseCountContext);
  const path = usePathname();

  const MenuList = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Profile', icon: UserCircle, path: '/dashboard/profile' }
  ];

  return (
    <div className="h-screen bg-white shadow-md p-5 flex flex-col md:w-64 w-full">
      <div className="flex justify-center mb-3">
        <Link href="/">
          <Image src='/student-station.png' alt='logo' width={200} height={200} className="w-32 md:w-48" />
        </Link>
      </div>

      <hr className="border-gray-300 mb-5" />

      <div className="w-full">
        <Link href="/create">
          <Button className="w-full">+ Create New</Button>
        </Link>
      </div>

      <div className="mt-5 flex-grow">
        {MenuList.map((menu, index) => (
          <div 
            key={index} 
            className={`flex gap-3 items-center p-2 rounded-lg cursor-pointer mt-3
            ${path === menu.path ? 'bg-slate-200' : 'hover:bg-slate-100'}`}>
            <menu.icon className="w-5 h-5" />
            <h2 className="text-sm md:text-base">{menu.name}</h2>
          </div>
        ))}
      </div>

      <div className="border p-3 bg-slate-100 rounded-lg flex flex-col gap-2 text-center">
        <h2 className="text-sm md:text-lg font-semibold">Available Credits: {5 - totalCourse}</h2>
        <Progress value={(totalCourse / 5) * 100} className="h-2" />
        <h2 className="text-xs md:text-sm mt-2">{totalCourse} out of 5 credits used</h2>
        <div className="flex items-center justify-between mt-2 text-xs">
          <UserButton />
          <Link href="/dashboard/upgrade" className="text-primary hover:underline">
            Upgrade
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SideBar;
