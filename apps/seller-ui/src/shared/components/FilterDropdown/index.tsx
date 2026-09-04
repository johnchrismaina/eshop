// components/FilterDropdown.tsx
import React, { useState, useRef } from 'react';

interface FilterDropdownProps {
  label: string;
  options: string[];
  multiSelect?: boolean;
  required?: boolean;
}

export default function FilterDropdown({
  label,
  options,
  multiSelect = false,
  required,
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  const toggleOption = (opt: string) => {
    if (multiSelect) {
      setSelected((prev) =>
        prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]
      );
    } else {
      setSelected([opt]);
      setOpen(false);
    }
  };

  const clearSelection = () => {
    setSelected([]);
    if (!multiSelect) setOpen(false);
  };

  const selectAll = () => {
    setSelected([...options]);
  };

  return (
    <div className="flex flex-col gap-1 w-[550px] mb-0.5 relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full h-10 px-3 border border-gray-200 rounded-md text-[#1C1C1E] text-sm font-medium text-left flex items-center justify-between focus:outline-none focus:border-[#C2410C] focus:ring-2 focus:ring-[#C2410C]/20 transition-shadow"
      >
        {selected.length > 0 ? (
          selected.join(', ')
        ) : (
          <span className="text-gray-400">{`Select ${label}`}</span>
        )}
        <svg
          className="w-4 h-4 text-[#333]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <ul className="absolute top-full mt-1 w-full max-h-[168px] overflow-y-auto border border-gray-200 rounded-md bg-white shadow-lg z-10">
          {multiSelect && (
            <>
              {selected.length > 0 && (
                <li>
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="w-full h-[34px] px-3 text-left text-sm text-red-600 hover:bg-red-50 font-medium"
                  >
                    Clear selection
                  </button>
                </li>
              )}
              {selected.length < options.length && (
                <li>
                  <button
                    type="button"
                    onClick={selectAll}
                    className="w-full h-[34px] px-3 text-left text-sm text-green-600 hover:bg-green-50 font-medium"
                  >
                    Select all
                  </button>
                </li>
              )}
              <li className="border-t border-gray-200"></li>
            </>
          )}

          {options.map((opt) => (
            <li key={opt}>
              <button
                type="button"
                onClick={() => toggleOption(opt)}
                className={`w-full h-[34px] px-3 text-left text-sm hover:bg-gray-50 flex items-center ${
                  selected.includes(opt)
                    ? 'bg-[#C2410C]/10 text-[#C2410C] font-medium'
                    : 'text-[#1C1C1E]'
                }`}
              >
                {multiSelect && (
                  <input
                    type="checkbox"
                    checked={selected.includes(opt)}
                    onChange={() => toggleOption(opt)}
                    className="mr-2"
                  />
                )}
                {opt}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
