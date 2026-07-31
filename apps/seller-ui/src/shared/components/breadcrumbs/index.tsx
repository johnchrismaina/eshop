import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface BreadcrumbsProps {
  title: string; // e.g. "All Orders"
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ title }) => {
  return (
    <nav aria-label="breadcrumb" className="mb-2">
      <ol className="flex items-center gap-1 text-sm text-blue-500">
        <li>
          <Link
            href="/dashboard"
            className="hover:underline hover:text-blue-600 transition-colors"
          >
            Dashboard
          </Link>
        </li>

        <ChevronRight size={18} className="opacity-[.8] text-[#000000cc] " />

        <li className="text-[#000000cc] font-medium">{title}</li>
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
