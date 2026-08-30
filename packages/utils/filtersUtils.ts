// filtersUtils.ts

// Base schema definition (your raw JSON entries inside filterLibrary/filterGroups)
export interface FilterSchema {
  label: string;
  value: string;
  type: 'enum' | 'text' | 'number';
  options?: string[];
  multiSelect?: boolean; // for customer filters
  render: 'dropdown' | 'checkbox' | 'text';
  sellerInput: 'single' | 'multi' | 'text'; // for seller dashboard
  required?: boolean;
  tooltip?: string;
}

// Seller view
export interface SellerFilter {
  label: string;
  value: string;
  options?: string[];
  render: 'dropdown' | 'text'; // sellers only use dropdowns or text
  required?: boolean;
  tooltip?: string;
  inputMode: 'single' | 'multi' | 'text';
}

// Customer view
export interface CustomerFilter {
  label: string;
  value: string;
  options?: string[];
  render: 'checkbox' | 'radio';
  multiSelect: boolean;
}

// Shop category structure
export interface ShopCategory {
  value: string;
  label: string;
  filterLibrary?: FilterSchema[];
  filterGroups?: { title: string; filters: FilterSchema[] }[];
  subCategories?: ShopCategory[];
}

// Helper function to split schema into two views
export function splitSchema(categories: ShopCategory[]): {
  sellerFilters: SellerFilter[];
  customerFilters: CustomerFilter[];
} {
  const sellerFilters: SellerFilter[] = [];
  const customerFilters: CustomerFilter[] = [];

  const walk = (cat: ShopCategory) => {
    // From filterLibrary
    cat.filterLibrary?.forEach((f) => {
      sellerFilters.push({
        label: f.label,
        value: f.value,
        options: f.options,
        render: f.render === 'dropdown' ? 'dropdown' : 'text',
        required: f.required,
        tooltip: f.tooltip,
        inputMode: f.sellerInput,
      });
      customerFilters.push({
        label: f.label,
        value: f.value,
        options: f.options,
        render: f.multiSelect ? 'checkbox' : 'radio',
        multiSelect: !!f.multiSelect,
      });
    });

    // From filterGroups
    cat.filterGroups?.forEach((group) => {
      group.filters.forEach((f) => {
        sellerFilters.push({
          label: f.label,
          value: f.value,
          options: f.options,
          render: f.render === 'dropdown' ? 'dropdown' : 'text',
          required: f.required,
          tooltip: f.tooltip,
          inputMode: f.sellerInput,
        });
        customerFilters.push({
          label: f.label,
          value: f.value,
          options: f.options,
          render: f.multiSelect ? 'checkbox' : 'radio',
          multiSelect: !!f.multiSelect,
        });
      });
    });

    // Recurse into subCategories
    cat.subCategories?.forEach(walk);
  };

  categories.forEach(walk);

  return { sellerFilters, customerFilters };
}
