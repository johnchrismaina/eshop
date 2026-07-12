import { ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

const categories: Record<string, string[]> = {
  Sneakers: ['Running', 'Basketball', 'Lifestyle', 'Skateboarding'],
  Shoes: ['Boots', 'Sandals', 'Formal', 'Casual'],
  Apparel: ['T-Shirts', 'Jackets', 'Hoodies', 'Pants'],
};

const brands: Record<string, string[]> = {
  Nike: ['Air Max', 'Jordan', 'Dunk'],
  Adidas: ['Samba', 'Yeezy', 'Ultraboost'],
  Converse: ['Chuck Taylor', 'One Star'],
};

interface SidebarMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SidebarMenu({ isOpen, onClose }: SidebarMenuProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  // 👇 Lock body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 mt-[102px] z-40"
        // onMouseEnter
        onClick={() => {
          onClose();
          setHovered(null);
        }}
      />

      {/* Dropdown container */}
      <div
        className="absolute left-0 h-[500px] top-full mt-0 py-4 ml-[-20] flex bg-white rounded-br-lg rounded-bl-lg z-50"
        onClick={() => setHovered(null)} // 👈 attach here, not on the first panel (onMouseEnter - other option)
      >
        {/* First window */}
        <div className="w-52 overflow-y-auto ">
          <h3 className="font-semibold mb-2 px-6">Categories</h3>
          <ul className="text-sm text-gray-600">
            {Object.keys(categories).map((cat) => (
              <li
                key={cat}
                onMouseEnter={() => setHovered(cat)}
                className="flex items-center justify-between cursor-pointer hover:text-black px-6 py-1 hover:bg-slate-200"
              >
                <span>{cat}</span>
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </li>
            ))}
          </ul>

          <h3 className="font-semibold mt-4 mb-2 px-6">Brands</h3>
          <ul className="text-sm text-gray-600">
            {Object.keys(brands).map((brand) => (
              <li
                key={brand}
                onMouseEnter={() => setHovered(brand)}
                className="cursor-pointer hover:text-black px-6 py-1 hover:bg-gray-200"
              >
                {brand}
              </li>
            ))}
          </ul>
        </div>

        {/* Second window */}
        {hovered && (
          <div className="w-52 h-[500px] overflow-y-auto ">
            <h3 className="font-semibold mb-2 px-4 ">{hovered}</h3>
            <ul className="text-sm text-gray-600">
              {(categories[hovered] || brands[hovered] || []).map((sub) => (
                <li
                  key={sub}
                  className="cursor-pointer hover:text-black px-4 py-1 hover:underline"
                >
                  {sub}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
