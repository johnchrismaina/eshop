interface BreadcrumbsProps {
  title: string; // e.g. "All Orders"
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ title }) => {
  return (
    <nav aria-label="breadcrumb" className="mb-4">
      <ol className="flex items-center space-x-2 text-sm text-blue-400">
        <li className="mx-2">Dashboard</li>
        <li className="mx-2 text-gray-200">{'>'}</li>
        <li className="text-gray-200 font-medium">{title}</li>
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
