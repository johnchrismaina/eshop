import { useState } from 'react';
import Input from 'packages/components/input';

interface Rule {
  type: string;
  value: string;
  scope?: string; // optional: product/category scope
}

interface RulesBuilderProps {
  rules?: Rule[];
  setValue: (field: string, value: any) => void;
  control?: any;
}

const RulesBuilder: React.FC<RulesBuilderProps> = ({
  rules = [],
  setValue,
}) => {
  const [localRules, setLocalRules] = useState<Rule[]>(rules || []);

  const addRule = () => {
    const newRules = [...localRules, { type: '', value: '', scope: '' }];
    setLocalRules(newRules);
    setValue('rules', newRules);
  };

  const updateRule = (index: number, field: keyof Rule, value: string) => {
    const newRules = [...localRules];
    newRules[index][field] = value;
    setLocalRules(newRules);
    setValue('rules', newRules);
  };

  const removeRule = (index: number) => {
    const newRules = localRules.filter((_, i) => i !== index);
    setLocalRules(newRules);
    setValue('rules', newRules);
  };

  return (
    <div className="bg-gray-800 p-4 rounded-md">
      <h3 className="text-lg font-semibold mb-4">Event Rules</h3>

      {localRules.length === 0 && (
        <p className="text-gray-400 text-sm mb-2">No rules added yet.</p>
      )}

      {localRules.map((rule, index) => (
        <div
          key={index}
          className="mb-4 p-3 border border-gray-700 rounded-md bg-gray-900"
        >
          {/* Rule Type */}
          <label className="block text-sm font-semibold text-gray-300 mb-1">
            Rule Type
          </label>
          <select
            value={rule.type}
            onChange={(e) => updateRule(index, 'type', e.target.value)}
            className="w-full border outline-none border-gray-700 bg-transparent mb-2"
          >
            <option value="">Select Type</option>
            <option value="percentage">Percentage Discount</option>
            <option value="fixed">Fixed Amount Discount</option>
            <option value="bundle">Bundle Offer</option>
            <option value="free-shipping">Free Shipping</option>
          </select>

          {/* Rule Value */}
          <Input
            label="Value"
            placeholder="e.g. 10% or $5"
            value={rule.value}
            onChange={(e: any) => updateRule(index, 'value', e.target.value)}
          />

          {/* Optional Scope */}
          <Input
            label="Scope (optional)"
            placeholder="Category or Product ID"
            value={rule.scope || ''}
            onChange={(e: any) => updateRule(index, 'scope', e.target.value)}
          />

          {/* Remove Button */}
          <button
            type="button"
            onClick={() => removeRule(index)}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded-md text-sm"
          >
            Remove Rule
          </button>
        </div>
      ))}

      {/* Add Rule Button */}
      <button
        type="button"
        onClick={addRule}
        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm"
      >
        + Add Rule
      </button>
    </div>
  );
};

export default RulesBuilder;
