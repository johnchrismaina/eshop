'use client';

import React from 'react';
import Link from 'next/link';
import {
  Facebook,
  Twitter,
  Linkedin,
  mail,
  MapPin,
  ArrowUp,
} from 'lucide-react';
import { usePathname } from 'next/navigation';

const Footer = () => {
  const pathname = usePathname();

  if (pathname === '/inbox') return null;

  return (
    <footer className="bg-[#f4f7f9] border-t border-t-slate-200 py-10 text-gray-200">
      <div className="w-[90%] lg:w-[80%] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* About Company */}
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"></h2>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
