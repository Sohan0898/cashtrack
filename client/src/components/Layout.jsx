import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useState } from 'react';
import useAutoSync from '../hooks/useAutoSync';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useAutoSync();

  return (
    <div className="flex h-screen bg-base-100 overflow-hidden font-sans">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col w-full min-w-0">
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-base-200/30">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
