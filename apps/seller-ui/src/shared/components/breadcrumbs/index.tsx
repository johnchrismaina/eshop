import Link from 'next/link';

interface BreadcrumbsProps {
  path: string; // e.g. "dashboard/orders"
  title: string; // e.g. "All Orders"
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ path, title }) => {
  const segments = path.split('/'); // ["dashboard", "orders"]

  return (
    <nav aria-label="breadcrumb" className="mb-4">
      <ol className="flex items-center space-x-2 text-sm text-blue-400">
        {segments.map((segment, idx) => {
          const href = '/' + segments.slice(0, idx + 1).join('/');
          const isLast = idx === segments.length - 1;

          return (
            <li key={idx} className="flex items-center">
              {!isLast ? (
                <Link href={href} className="hover:text-blue-600 capitalize">
                  {segment}
                </Link>
              ) : (
                <span className="capitalize">{segment}</span>
              )}
              <span className="mx-2 text-gray-200">{'>'}</span>
            </li>
          );
        })}
        <li className="text-gray-200 font-medium">{title}</li>
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
