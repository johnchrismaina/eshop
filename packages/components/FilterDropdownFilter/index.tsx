// components/FilterDropdownFilter.tsx
interface FilterDropdownFilterProps {
  label: string;
  options: string[];
  multiSelect?: boolean;
  required?: boolean;
}

export default function FilterDropdownFilter({
  label,
  options,
  multiSelect = false,
  required = false,
}: FilterDropdownFilterProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-sm font-semibold">{label}</label>
      <select
        multiple={multiSelect}
        required={required}
        className="border rounded px-2 py-1 text-sm"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
