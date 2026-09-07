import { useState } from 'react';

interface DropdownProps<T> {
  options: T[];
  getLabel: (option: T) => string;
  getValue: (option: T) => string;
  selected: string[] | string | undefined;
  multiSelect?: boolean;
  placeholder?: string;
  emptyMessage?: string;
  onChange: (value: string[] | string) => void;
  width?: string;
}

export const Dropdown = <T,>({
  options,
  getLabel,
  getValue,
  selected,
  multiSelect = false,
  placeholder = 'Select an option',
  emptyMessage = 'No options available',
  onChange,
  width = '220px',
}: DropdownProps<T>) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (value: string) => {
    if (multiSelect) {
      const current = Array.isArray(selected) ? selected : [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      onChange(updated);
    } else {
      onChange(value);
      setOpen(false);
    }
  };

  const displayLabel = () => {
    if (multiSelect) {
      const arr = Array.isArray(selected) ? selected : [];
      if (arr.length === 0) return placeholder;
      if (arr.length === 1) {
        const first = options.find((opt) => getValue(opt) === arr[0]);
        return first ? getLabel(first) : placeholder;
      }
      if (arr.length <= 3) {
        const first = options.find((opt) => getValue(opt) === arr[0]);
        return first
          ? `${getLabel(first)} (+${arr.length - 1} more)`
          : `(${arr.length} selected)`;
      }
      return `(${arr.length} selected)`;
    } else {
      return selected
        ? getLabel(options.find((opt) => getValue(opt) === selected)!)
        : placeholder;
    }
  };

  return (
    <div className="flex flex-col gap-1 mb-0.5 relative" style={{ width }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full h-[36px] px-3 border border-gray-300 rounded-md text-[#1C1C1E] text-sm font-medium text-left flex items-center justify-between focus:outline-none focus:border-[#C2410C] focus:ring-2 focus:ring-[#C2410C]/20 transition-shadow"
      >
        {displayLabel()}
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
          {options.length === 0 ? (
            <li className="px-3 py-2 text-sm text-gray-500">{emptyMessage}</li>
          ) : (
            options.map((opt) => {
              const value = getValue(opt);
              const isSelected = multiSelect
                ? Array.isArray(selected) && selected.includes(value)
                : selected === value;
              return (
                <li key={value}>
                  <button
                    type="button"
                    onClick={() => handleSelect(value)}
                    className="w-full h-[34px] px-3 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    {multiSelect && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        readOnly
                        className="w-4 h-4"
                      />
                    )}
                    {getLabel(opt)}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
};
