// SidebarMenu.tsx
import React from 'react';
import { menuData } from './menuData';
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/solid';

type SidebarMenuProps = {
  isOpen: boolean;
  onClose: () => void;
};

const SidebarMenu: React.FC<SidebarMenuProps> = ({ isOpen, onClose }) => {
  const [openSection, setOpenSection] = React.useState<number | null>(null);
  const [openItem, setOpenItem] = React.useState<number | null>(null);

  const toggleSection = (index: number) => {
    setOpenSection(openSection === index ? null : index);
    setOpenItem(null);
  };

  const toggleItem = (index: number) => {
    setOpenItem(openItem === index ? null : index);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity z-[100]"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-[100] 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold">Hello!</h2>
          <button className="text-gray-600 hover:text-black" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="p-4">
          {menuData.map((section, sIndex: number) => (
            <div key={sIndex} className="mb-4">
              <div
                className="font-bold text-lg text-[#333] mb-2 cursor-pointer flex justify-between items-center"
                onClick={() => toggleSection(sIndex)}
              >
                {section.title}
                {openSection === sIndex ? (
                  <ChevronDownIcon className="h-5 w-5 text-gray-600" />
                ) : (
                  <ChevronRightIcon className="h-5 w-5 text-gray-600" />
                )}
              </div>

              {openSection === sIndex && (
                <ul className="space-y-1 pl-2">
                  {section.items.map((item, iIndex: number) => (
                    <li key={iIndex}>
                      <div
                        className="cursor-pointer text-gray-700 hover:text-blue-600 flex justify-between items-center"
                        onClick={() =>
                          item.subItems ? toggleItem(iIndex) : null
                        }
                      >
                        {item.name}
                        {item.subItems &&
                          (openItem === iIndex ? (
                            <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                          ) : (
                            <ChevronRightIcon className="h-4 w-4 text-gray-500" />
                          ))}
                      </div>

                      {item.subItems && openItem === iIndex && (
                        <ul className="pl-4 mt-1 space-y-1 text-sm text-gray-700">
                          {item.subItems.map((sub, subIndex) => (
                            <li
                              key={subIndex}
                              className="cursor-pointer hover:text-blue-600"
                            >
                              {sub}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default SidebarMenu;
