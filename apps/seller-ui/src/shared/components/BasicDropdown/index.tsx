import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface DropdownProps {
  options: string[];
  value: string;
  onChange: (val: string) => void;
}

export default function BasicDropdown({
  options,
  value,
  onChange,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setHighlightIndex(-1);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!open) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
      }
      if (e.key === 'Enter' && highlightIndex >= 0) {
        e.preventDefault();
        onChange(options[highlightIndex]);
        setOpen(false);
        setHighlightIndex(-1);
      }
      if (e.key === 'Escape') {
        setOpen(false);
        setHighlightIndex(-1);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, options, highlightIndex, onChange]);

  return (
    <div
      className="flex flex-col gap-1 w-full mb-0.5 relative"
      ref={dropdownRef}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full h-[36px] px-3 border border-gray-300 rounded-md text-[#1C1C1E] text-sm font-medium text-left flex items-center justify-between focus:outline-none focus:border-[#C2410C] focus:ring-2 focus:ring-[#C2410C]/20 transition-shadow"
      >
        {value || 'Select condition'}
        <ChevronDown size={14} />
      </button>

      {open && (
        <ul className="absolute top-full mt-1 w-full max-h-[168px] overflow-y-auto border border-gray-200 rounded-md bg-white shadow-lg z-10">
          {options.map((opt, idx) => (
            <li key={opt}>
              <button
                type="button"
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                  setHighlightIndex(-1);
                }}
                className={`w-full h-[34px] px-3 text-left text-sm hover:bg-gray-50 ${
                  opt === value
                    ? 'bg-[#C2410C]/10 text-[#C2410C] font-medium'
                    : 'text-[#1C1C1E]'
                } ${highlightIndex === idx ? 'bg-gray-100' : ''}`}
              >
                {opt}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
