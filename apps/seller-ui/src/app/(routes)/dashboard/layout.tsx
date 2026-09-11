import SidebarWrapper from 'apps/seller-ui/src/shared/components/sidebar/sidebar';
import React from 'react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen bg-[#fff] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[260px] min-w-[250px] max-w-[300px] border-r bg-[#EFEFF1] border-r-gray-400/50 text-gray-800 pl-4 py-4 overflow-y-auto">
        <SidebarWrapper />
      </aside>

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
};

export default Layout;
// F8F8F8
