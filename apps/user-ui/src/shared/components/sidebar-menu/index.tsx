import { ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

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

const CLOSE_DELAY = 250; // ms grace period when the cursor hits the backdrop

export default function SidebarMenu({ isOpen, onClose }: SidebarMenuProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isOpen) setHovered(null);
  }, [isOpen]);

  // clear any pending delayed-close if the component unmounts mid-timer
  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    []
  );

  if (!isOpen) return null;

  const closeNow = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    onClose();
  };

  const scheduleClose = () => {
    closeTimer.current = setTimeout(onClose, CLOSE_DELAY);
  };

  const cancelScheduledClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  return (
    <>
      {/* Backdrop — hovering it schedules a delayed close; moving back
          off it before the delay elapses cancels that close */}
      <div
        className="fixed inset-0 bg-black/30 top-[104px] z-40"
        onMouseEnter={scheduleClose}
        onMouseLeave={cancelScheduledClose}
        onClick={closeNow}
      />

      <div
        className="absolute top-full left-0 py-4 h-[500px] flex bg-white rounded-b-lg shadow-[0_0_30px_rgba(0,0,0,0.1)] z-50"
        onMouseEnter={cancelScheduledClose}
      >
        <div className="w-52 overflow-y-auto">
          <h3 className="text-[#333] font-semibold mb-2 px-6">Categories</h3>
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

        {hovered && (
          <div className="w-52 h-[500px] overflow-y-auto border-l border-gray-400">
            <h3 className="font-semibold mb-2 px-4">{hovered}</h3>
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
