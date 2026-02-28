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
      className="my-2 block"
    >
      <div
        className={`flex gap-5 w-full min-h-8 h-full items-center px-[13px] rounded-lg cursor-pointer transition hover:!bg-[#2b2f31] ${
          isActive &&
          'scale-[.98] bg-[#0f3158] fill-blue-200 hover:bg-[#0f3158d6]'
        }`}
      >
        {icon}
        <h5 className="text-slate-200 text-sm">{title}</h5>
      </div>
    </Link>
  );
};

export default SidebarItem;
