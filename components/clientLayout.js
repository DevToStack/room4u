'use client';

import { usePathname } from 'next/navigation';
import NavBar from './NavBar';
import { useState, useEffect } from 'react';


export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('');

  const showNavBar = pathname === '/';

  useEffect(() => {
    // Set activeTab based on the current path
    if (pathname === '/') {
      setActiveTab('home');
    } else {
      setActiveTab('');
    }
  }, [pathname]);


  return (
    <>
      {showNavBar && (
        <NavBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          
        />
      )}
      {children}
    </>
  );
}
