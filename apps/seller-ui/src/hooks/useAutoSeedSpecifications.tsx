import { useEffect } from 'react';
import {
  Control,
  UseFormSetValue,
  FieldValues,
  Path,
  useWatch,
} from 'react-hook-form';

interface ProductSpecification {
  label: string;
  value: string;
}
interface SubCategory {
  name: string;
  product_specifications: ProductSpecification[];
}
interface Category {
  value: string;
  label: string;
  subCategories: SubCategory[];
}
interface Templates {
  categories: Category[];
}

interface HookProps<T extends FieldValues> {
  control: Control<T, any>; // ✅ matches useForm’s control type
  setValue: UseFormSetValue<T>; // ✅ matches useForm’s setValue type
  templates: Templates;
}

export function useAutoSeedSpecifications<T extends FieldValues>({
  control,
  setValue,
  templates,
}: HookProps<T>) {
  const [category, subCategory] = useWatch<T>({
    control,
    name: ['category', 'subCategory'] as Path<T>[],
  });

  useEffect(() => {
    if (!category || !subCategory) return;

    const categoryObj = templates.categories.find(
      (cat) => cat.label === category || cat.value === category
    );
    if (!categoryObj) return;

    const subObj = categoryObj.subCategories.find(
      (sub) => sub.name === subCategory
    );
    if (!subObj) return;

    setValue(
      'product_specifications' as Path<T>,
      subObj.product_specifications as any
    );
  }, [category, subCategory, templates, setValue]);
}
