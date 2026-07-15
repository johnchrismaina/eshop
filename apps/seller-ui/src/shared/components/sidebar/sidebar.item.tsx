// import Link from 'next/link';
import Link from 'next/link';
import React from 'react';

interface Props {
  title: string;
  icon: React.ReactNode;
  isActive?: boolean;
  href: string;
  onClick?: () => void; // <-- add this
}

const SidebarItem = ({ icon, title, isActive, href, onClick }: Props) => {
  return (
    <Link
      href={href}
      onClick={onClick} // <-- now TypeScript knows this is valid
      className="my-1 block"
    >
      <div
        className={`flex gap-5 w-full min-h-9 h-full items-center px-[13px] rounded-lg cursor-pointer transition hover:!bg-gray-200 ${
          isActive &&
          'scale-[.98] bg-gray-100 fill-blue-200 hover:bg-[#0f3158d6]'
        }`}
      >
        {icon}
        <h5 className="text-gray-800 text-sm font-medium">{title}</h5>
      </div>
    </Link>
  );
};

export default SidebarItem;
