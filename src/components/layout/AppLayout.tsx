import React from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { Toaster } from 'sonner'
import { useAppDispatch, useAppSelector } from '@/store'
import { setMobileSidebarOpen } from '@/store/uiSlice'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

export const AppLayout: React.FC = () => {
  const dispatch = useAppDispatch()
  const mobileSidebarOpen = useAppSelector((state) => state.ui.mobileSidebarOpen)

  return (
    <div className="flex min-h-screen bg-[#F7F8FA] text-[#0F172A]">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => dispatch(setMobileSidebarOpen(false))}
          />
          <div className="relative w-[280px] bg-white h-full shadow-2xl flex flex-col z-50">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <Header />
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Sonner Toast Notification Provider */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#FFFFFF',
            color: '#0F172A',
            border: '1px solid #DCE2E8',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
            fontSize: '13px',
          },
        }}
      />
    </div>
  )
}
