import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface BreadcrumbsProps {
  title: string; // e.g. "All Orders"
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ title }) => {
  return (
    <nav aria-label="breadcrumb" className="mb-4">
      <ol className="flex items-center text-base text-blue-400">
        <li>
          <Link
            href="/dashboard"
            className="hover:underline hover:text-blue-500 transition-colors"
          >
            Dashboard
          </Link>
        </li>

        <ChevronRight size={20} className="opacity-[.8] text-gray-200 " />

        <li className="text-gray-200 font-medium">{title}</li>
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
