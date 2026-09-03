// utils/renderFilterRow.tsx
import { Info } from 'lucide-react';
import FilterDropdown from '../../apps/seller-ui/src/shared/components/FilterDropdown'; // adjust path

interface FilterRowProps {
  filter: any;
  idx: number;
  length: number;
  mode: 'seller' | 'customer';
}

export function renderFilterRow({ filter, idx, length, mode }: FilterRowProps) {
  const isFirst = idx === 0;
  const isLast = idx === length - 1;

  return (
    <div
      key={filter.value}
      className={`flex items-center justify-end gap-3 bg-white px-4 py-2 
        ${isFirst ? 'rounded-t-md pt-4' : ''} 
        ${isLast ? 'rounded-b-md pb-4' : ''}`}
    >
      {/* Label + Tooltip */}
      <label className="flex items-center gap-1 shrink-0 text-sm font-bold">
        {filter.label}
        {filter.tooltip && (
          <span className="text-gray-400 cursor-pointer" title={filter.tooltip}>
            <Info size={18} color="#0078D7" />
          </span>
        )}
      </label>

      {/* Dropdowns */}
      {filter.render === 'dropdown' && (
        <FilterDropdown
          label={filter.label}
          options={filter.options ?? []}
          multiSelect={
            mode === 'seller'
              ? filter.sellerInput === 'multi'
              : filter.multiSelect
          }
          required={filter.required}
        />
      )}

      {/* Checkboxes */}
      {filter.render === 'checkbox' && (
        <div className="flex flex-wrap gap-2">
          {filter.options?.map((opt: string) => (
            <label key={opt} className="flex items-center gap-1">
              <input
                type={
                  mode === 'seller'
                    ? filter.sellerInput === 'multi'
                      ? 'checkbox'
                      : 'radio'
                    : 'checkbox'
                }
                name={filter.value}
                value={opt}
              />
              {opt}
            </label>
          ))}
        </div>
      )}

      {/* Text input */}
      {filter.render === 'text' && (
        <input
          type="text"
          placeholder={`Enter ${filter.label}`}
          className="w-[500px] border border-gray-200 rounded-md px-4 py-2 h-10 text-sm text-[#1C1C1E] placeholder-gray-400 focus:outline-none focus:border-[#C2410C] focus:ring-2 focus:ring-[#C2410C]/20 transition-shadow"
          required={filter.required}
        />
      )}
    </div>
  );
}
