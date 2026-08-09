import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

const Breadcrumbs = () => {
  const pathname = usePathname(); // e.g. "/product/orange-jacket"
  const pathSegments = pathname.split('/').filter(Boolean);

  // Custom label overrides
  const labelMap: Record<string, string> = {
    product: 'Products',
    orders: 'All Orders',
    users: 'Customers',
    // add more overrides here
  };

  // Helper to prettify slug → "orange-jacket" → "Orange Jacket"
  const prettify = (segment: string) => {
    if (labelMap[segment]) return labelMap[segment]; // ✅ override
    return segment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <nav aria-label="breadcrumb" className="mb-0">
      <ol className="flex items-center gap-1 text-[13px] text-[#333]">
        <li>
          <Link href="/" className="hover:underline text-[#333]/80">
            Home
          </Link>
        </li>

        {pathSegments.map((segment, index) => {
          const href = '/' + pathSegments.slice(0, index + 1).join('/');
          const isLast = index === pathSegments.length - 1;

          return (
            <React.Fragment key={href}>
              <span className="text-[#333] pr-1">/</span>
              <li>
                {isLast ? (
                  <span className="text-[#000000cc] font-normal">
                    {prettify(segment)}
                  </span>
                ) : (
                  <Link href={href} className="hover:underline text-[#333]/80">
                    {prettify(segment)}
                  </Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
