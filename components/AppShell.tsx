"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Header from './Header';
import Sidebar from './Sidebar';
import { useApp } from '../context/AppContext';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { role, isHydrated } = useApp();

  useEffect(() => {
    if (isHydrated && !role && pathname !== '/login') {
      router.push('/login');
    }
  }, [role, isHydrated, pathname, router]);

  if (!isHydrated) {
    return null; // Or a loading spinner
  }

  if (!role && pathname === '/login') {
    return <>{children}</>;
  }

  if (!role) {
    return null;
  }

  // Determine current page ID for header/sidebar highlighting
  let pageId = 'home';
  if (pathname.startsWith('/admin/users')) pageId = 'users';
  else if (pathname.startsWith('/admin/reports')) pageId = 'manage-reports';
  else if (pathname.startsWith('/admin/settings')) pageId = 'upload';
  else if (pathname.startsWith('/reports')) pageId = 'reports';
  else if (pathname !== '/') pageId = pathname.substring(1);

  return (
    <div className="app visible">
      <Header 
        pageId={pageId} 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
      />
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        currentPage={pageId}
      />
      <div className="main" id="main">
        {children}
      </div>
      <footer className="app-footer">
        <span>الراجحي للخدمات المساندة</span>
        <span className="app-footer-sep">·</span>
        <span>إدارة الامتثال والالتزام</span>
        <span className="app-footer-sep">·</span>
        <span>موسم الحج 1446</span>
      </footer>
    </div>
  );
}
