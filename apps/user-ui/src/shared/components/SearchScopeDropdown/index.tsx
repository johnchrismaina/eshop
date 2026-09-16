import { ChevronDown } from 'lucide-react';

interface SearchScopeDropdownProps {
  value: string;
  onToggle: () => void;
}

export default function SearchScopeDropdown({
  value,
  onToggle,
}: SearchScopeDropdownProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-1.5 h-10 pl-4 pr-3 text-[13px] text-[#333] 
                 hover:text-[#14181A] bg-[#F1F0ED] rounded-l-md transition-colors 
                 flex-shrink-0 outline-none focus:outline-none focus-visible:outline-none"
    >
      {value}
      <ChevronDown size={14} />
    </button>
  );
}
