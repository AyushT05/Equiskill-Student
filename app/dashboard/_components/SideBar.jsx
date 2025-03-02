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
  const {totalCourse,setTotalCourse}=useContext(CourseCountContext)
    
    const MenuList=[
        {
            name:'Dashboard', 
            icon:LayoutDashboard,
            path:'/dashboard'
        }, 
        {
            name:'Profile', 
            icon:UserCircle,
            path:'/dashboard/profile'
        }
    ]

    const path = usePathname();

    return (
    <div className='h-screen shadow-md p-5 flex flex-col'>
      {/* Logo */}
      <div className='flex justify-center mb-3'> 
        <Link href="http://localhost:3005/student">
            <Image src='/student-station.png' alt='logo' width={240} height={240}/>
        </Link>
      </div>

      {/* Horizontal Line */}
      <hr className="border-t border-gray-300 mb-5"/>

      {/* Create Button */}
      <div> 
        <Link href={'/create'} className="w-full">
          <Button className="w-full"> + Create New</Button>
        </Link>
      </div>

      {/* Menu List */}
      <div className='mt-5 flex-grow'> 
        {MenuList.map((menu, index) => (
          <div 
            key={index} 
            className={`flex gap-5 items-center p-3 hover:bg-slate-200 rounded-lg cursor-pointer mt-3
            ${path === menu.path ? 'bg-slate-200' : ''}`}>
            <menu.icon/>
            <h2>{menu.name}</h2>
          </div>
        ))}
      </div>
      <div className="border p-4 bg-slate-100 rounded-lg flex flex-col gap-2">
  <h2 className="text-lg font-semibold">Available Credits: {(5-totalCourse)}</h2>
  <Progress value={(totalCourse/5)*100} />
  <h2 className="text-sm mt-2">{totalCourse} out of 5 credits used</h2>
  
  {/* User button & upgrade link structured properly */}
  <div className="flex items-center justify-between mt-2">
    <UserButton />
    <Link href="/dashboard/upgrade" className="text-primary text-xs hover:underline pl-3">
      Upgrade to generate more!
    </Link>
  </div>
</div>



      
    </div>
  )
}

export default SideBar
