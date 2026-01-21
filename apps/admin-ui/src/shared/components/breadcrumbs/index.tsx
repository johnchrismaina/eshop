interface BreadcrumbsProps {
  title: string; // e.g. "All Orders"
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ title }) => {
  return (
    <nav aria-label="breadcrumb" className="mb-4">
      {' '}
      <ol className="flex items-center space-x-1 text-sm">
        {' '}
        <li className="text-blue-400">Dashboard</li>{' '}
        <li className="text-gray-200">{'>'}</li>{' '}
        <li className="text-gray-200 font-medium">{title}</li>{' '}
      </ol>{' '}
    </nav>
  );
};

export default Breadcrumbs;
