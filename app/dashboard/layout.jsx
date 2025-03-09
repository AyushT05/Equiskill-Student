"use client"
import React, { useState } from 'react'
import SideBar from './_components/SideBar'
import { CourseCountContext } from '../_context/CourseCountContext'
import { Menu, X } from 'lucide-react'

function DashboardLayout({ children }) {
  const [totalCourse, setTotalCourse] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <CourseCountContext.Provider value={{ totalCourse, setTotalCourse }}>
      <div className="flex min-h-screen relative">

        {/* Sidebar - Fixed for Desktop, Toggle for Mobile */}
        <div className={`fixed top-0 left-0 h-full bg-white shadow-lg z-50 transform transition-transform duration-300
                        ${isSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"} md:translate-x-0 md:w-64`}>
          <SideBar />
        </div>

        {/* Overlay when Sidebar is Open (for Mobile) */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className={`flex-1 transition-all ${isSidebarOpen ? "" : "ml-0"} md:ml-64`}>

          {/* Sidebar Toggle Button (Mobile Only) */}
          <div className="md:hidden p-4 flex justify-between items-center">
            <button 
              className="bg-primary text-white px-3 py-2 rounded-lg"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          <div className="p-4 md:p-8">{children}</div>
        </div>
      </div>
    </CourseCountContext.Provider>
  )
}

export default DashboardLayout;
