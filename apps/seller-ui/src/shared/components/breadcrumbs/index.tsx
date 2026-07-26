import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface BreadcrumbsProps {
  title: string; // e.g. "All Orders"
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ title }) => {
  return (
    <nav aria-label="breadcrumb" className="mb-2">
      <ol className="flex items-center text-sm text-blue-500">
        <li>
          <Link
            href="/dashboard"
            className="hover:underline hover:text-blue-600 transition-colors"
          >
            Dashboard
          </Link>
        </li>

        <ChevronRight size={20} className="opacity-[.8] text-gray-700 " />

        <li className="text-gray-700 font-medium">{title}</li>
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
