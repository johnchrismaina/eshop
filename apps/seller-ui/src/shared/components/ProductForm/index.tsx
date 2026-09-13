'use client';
import { useQuery } from '@tanstack/react-query';
import ImagePlaceholder from 'apps/seller-ui/src/shared/components/image-placeholder';
import { enhancements } from 'apps/seller-ui/src/utils/AI.enhancements';
import axiosProduct from 'apps/seller-ui/src/utils/axiosProduct';
import {
  ChevronDown,
  ChevronLeft,
  Info,
  RotateCcw,
  Wand,
  X,
} from 'lucide-react';
import Image from 'next/image';
// import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ColorSelector from 'packages/components/color-selector';
import CustomProperties from 'packages/components/custom-properties';
import CustomSpecifications from 'packages/components/custom-specifications';
import Input from 'packages/components/input';
// import RichTextEditor from 'packages/components/rich-text-editor';
import SizeSelector from 'packages/components/size-selector';
import Spinner from 'packages/components/spinner';
// import { Spinner } from 'packages/components/spinner';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
// import Select from 'react-select';
import { usePathname } from 'next/navigation';
import CustomAccordion from '../CustomAccordion';
import { validateWordCount } from 'apps/seller-ui/src/utils/validation';
import AutoResizeTextarea from 'packages/components/AutoResizeTextArea';
// import ColorVariantsEditor from 'apps/seller-ui/src/shared/components/ColorVariantsEditor';
import { splitSchema } from 'packages/utils/filtersUtils';
import { renderFilterRow } from 'packages/utils/renderFilterRow';
import { Dropdown } from '../CustomDropdown';
import axios from 'axios';
import ColorVariantsEditor, {
  ColorVariantsEditorHandle,
} from 'apps/seller-ui/src/shared/components/ColorVariantsEditor';
import BasicDropdown from '../BasicDropdown';

const TABS = [
  'Product Identity',
  'Product Details',
  'Description & Media',
  'Pricing',
];

const RichTextEditor = dynamic(
  () => import('packages/components/rich-text-editor'),
  { ssr: false }
);

interface UploadedImage {
  fileId: string;
  file_url: string;
}

// A single filter definition
interface Filter {
  label: string;
  value: string;
  type: 'enum' | 'text'; // extend as needed
  options?: string[];
  multiSelect?: boolean;
  render: 'dropdown' | 'checkbox' | 'text';
  sellerInput: 'single' | 'multi';
  required?: boolean;
  tooltip?: string;
}

// A group of filters (subcategory-specific)
interface FilterGroup {
  title: string;
  filters: Filter[];
}

// Category structure
interface ShopCategory {
  value: string;
  label: string;
  filterLibrary?: Filter[]; // reusable filters defined at parent level
  filterGroups?: FilterGroup[]; // grouped filters defined at child level
  subCategories?: ShopCategory[];
  highlights?: { ref: string }[];
}

type VariantImage = {
  fileId: string;
  file_url: string;
};

export interface ColorVariant {
  id?: string;
  name: string;
  title: string;
  price: number;
  dealPrice?: number;
  dealStart?: string; // yyyy-MM-dd
  dealEnd?: string; // yyyy-MM-dd
  images: (VariantImage | null)[]; // ✅ always objects with file_url
  isDefault: boolean; // ✅ add this
}

interface DiscountCode {
  id: string;
  public_name: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  discountCode: string;
}

export type FormValues = {
  title: string;
  slug: string;
  category: string;
  subCategory: string;
  short_description: string;
  aspect: 'square' | 'portrait';
  images: (UploadedImage | null)[];
  colorVariants: ColorVariant[];
  sizes: string[];
  video_url: string;
  product_specifications: Record<string, string | string[]>;
  detailed_description: string;
  sku: string;
  stock: number | undefined;
  regular_price: number | undefined;
  sale_price: number | undefined;
  deal_start: Date | null;
  deal_end: Date | null;
  discount_start: Date | null;
  discount_end: Date | null;
  condition: string;
  shippingOption: string; // "self" | "company"
  discountCodes: string[];
  availableTickets?: number;
  total_tickets?: number;
  enableDeal: boolean;
};

export default function ProductForm({
  mode = 'createProduct',
  product,
}: {
  mode: 'createProduct' | 'editProduct' | 'createDeal';
  product?: FormValues;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isDealRoute = pathname.includes('create-deal');

  // Detect which route we're on
  const isDeal = pathname.includes('create-deal');
  const pageTitle = isDeal ? 'Create Deal' : 'Create Product';

  const {
    control,
    register,
    setValue,
    getValues,
    watch,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
    clearErrors,
  } = useForm<FormValues>({
    defaultValues:
      product ??
      ({
        title: '',
        slug: '',
        category: 'men_clothing',
        subCategory: 'polo_shirt',
        short_description: '',
        aspect: 'square',
        images: Array(8).fill(null),
        colorVariants: [], // ✅ empty, not seeded with a blank variant
        sizes: [],
        video_url: '',
        product_specifications: {},
        detailed_description: '',
        sku: '',
        stock: undefined,
        regular_price: undefined,
        sale_price: undefined,
        deal_start: null,
        deal_end: null,
        discount_start: null,
        discount_end: null,
        condition: '',
        shippingOption: '',
        discountCodes: [],
        availableTickets: undefined,
        total_tickets: undefined,
        enableDeal: isDealRoute,
        // ✅ initialize empty colorVariants array
      } as FormValues),
  });

  // Reset form when editing
  useEffect(() => {
    if (mode === 'editProduct' && product) {
      reset(product);
    }
  }, [mode, product, reset]);

  const enableDeal = watch('enableDeal');

  const [hasColors, setHasColors] = useState(false);
  const [openImageModal, setOpenImageModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const [activeEffect, setActiveEffect] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState('');

  const colorVariants = watch('colorVariants') ?? [];

  // const colorVariantsRef = useRef<ColorVariantsEditorHandle>(null);

  // const colorVariantsRef = useRef(null);
  const colorVariantsRef = useRef<ColorVariantsEditorHandle>(null);

  const handleAddColorSwatchClick = () => {
    colorVariantsRef.current?.addVariant();
  };

  const handleResetVariantsClick = () => {
    colorVariantsRef.current?.resetVariants();
  };

  const handleCloseCategories = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setOpenCategories(false);
      setIsClosing(false); // reset so next open starts clean
    }, 200); // matches the slower of the two exit durations
  }, []);

  // Single source of truth: tab follows hasColors, nothing else sets it directly
  useEffect(() => {
    setActiveImageTab(hasColors ? 'variants' : 'main');
  }, [hasColors]);

  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);

  const [pictureUploadingLoader, setPictureUploadingLoader] = useState(false);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  // const router = useRouter();

  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [activeImageTab, setActiveImageTab] = useState('main'); // 'main' | 'variants'

  const [images, setImages] = useState<(UploadedImage | null)[]>(
    Array(8).fill(null)
  );
  const [mainImages, setMainImages] = useState<(UploadedImage | null)[]>(
    Array(8).fill(null)
  );
  const [mainUploading, setMainUploading] = useState<boolean[]>(
    Array(8).fill(false)
  );

  // Main images preview state
  const [mainPreviewImage, setMainPreviewImage] = useState<string | null>(null);
  const [openMainPreviewModal, setOpenMainPreviewModal] = useState(false);

  const hasVariants = colorVariants.length > 0;

  const validateProductForm = (values: FormValues) => {
    const errors: Record<string, string> = {};

    // ✅ Common required fields
    if (!values.title?.trim()) errors.title = 'Title is required';
    if (!values.slug?.trim()) errors.slug = 'Slug is required';
    if (!values.short_description?.trim())
      errors.short_description = 'Short description is required';
    if (!values.category?.trim()) errors.category = 'Category is required';
    if (!values.subCategory) errors.subCategory = 'Subcategory is required';

    // ✅ Conditional pricing logic
    if (values.colorVariants?.length > 0) {
      values.colorVariants.forEach((variant, idx) => {
        if (variant.price == null || Number.isNaN(variant.price)) {
          errors[`colorVariants.${idx}.price`] = 'Variant price is required';
        }
      });
    } else {
      if (values.regular_price == null || Number.isNaN(values.regular_price)) {
        errors.regular_price =
          'Regular price is required when no variants exist';
      }
    }

    return errors;
  };

  // Basic dropdown state
  const [condition, setCondition] = useState('');

  // Inside ProductForm, alongside `mode`, `isDealRoute`, `product` (whatever these are already destructured from)

  // const draftKey =
  //   mode === 'editProduct'
  //     ? `colorVariantsDraft-edit-${product?.slug}`
  //     : `colorVariantsDraft-create-${isDealRoute ? 'deal' : 'product'}`;

  const draftKey =
    mode === 'editProduct'
      ? `productDraft-edit-${product?.slug}`
      : `productDraft-create-${isDealRoute ? 'deal' : 'product'}`;

  const [hasDraft, setHasDraft] = useState(false);

  useEffect(() => {
    setHasDraft(!!localStorage.getItem(draftKey));
  }, [draftKey]);

  // ✅ Save current form state as draft
  const handleSaveDraft = () => {
    const draftData = getValues();
    localStorage.setItem(draftKey, JSON.stringify({ ...draftData, activeTab }));
    setHasDraft(true); // ✅ a draft now exists
    toast.success('Draft saved!');
  };

  // ✅ Explicitly load a previously saved draft
  const handleLoadDraft = () => {
    const savedDraft = localStorage.getItem(draftKey);
    if (!savedDraft) {
      toast.error('No saved draft found');
      return;
    }
    try {
      const parsed = JSON.parse(savedDraft);
      Object.keys(parsed).forEach((key) => {
        if (key !== 'activeTab') {
          setValue(key as keyof FormValues, parsed[key], {
            shouldValidate: true,
          });
        }
      });
      if (parsed.activeTab && TABS.includes(parsed.activeTab)) {
        setActiveTab(parsed.activeTab);
      }
      toast.success('Draft loaded');
    } catch (err) {
      console.error('Failed to parse saved draft:', err);
      toast.error('Saved draft is corrupted');
    }
  };

  // ✅ Clear form + wipe draft
  const handleClearForm = () => {
    reset({
      colorVariants: [],
      // ...other blank defaults
    });
    localStorage.removeItem(draftKey);
    setHasDraft(false); // ✅ draft is gone
    setActiveTab(TABS[0]);
    toast.success('Form cleared');
  };

  const handleNext = () => {
    const currentIndex = TABS.indexOf(activeTab);
    if (currentIndex < TABS.length - 1) {
      setActiveTab(TABS[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const currentIndex = TABS.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(TABS[currentIndex - 1]);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    clearErrors(); // ✅ clears all errors when switching tabs
  };

  // ✅ Load saved tab on mount
  useEffect(() => {
    const savedTab = localStorage.getItem('activeTab');
    if (savedTab && TABS.includes(savedTab)) {
      setActiveTab(savedTab);
    }
  }, []);

  // ✅ Save tab whenever it changes
  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  //   Fetch discount codes
  const { data: discountCodes = [], isLoading: discountLoading } = useQuery({
    queryKey: ['shop-discounts'],
    queryFn: async () => {
      const res = await axiosProduct.get('/get-discount-codes');
      return res?.data?.discount_codes || [];
    },
  });

  const availableTickets = useWatch({ control, name: 'availableTickets' }) as
    | number
    | undefined;
  const total_tickets = useWatch({ control, name: 'total_tickets' }) as
    | number
    | undefined;

  const title = watch('title');

  // ✅ run the debounced slug generator
  useDebouncedSlug(title, setValue);

  const selectedCategory = watch('category');
  const specs = watch('product_specifications');

  const regularPrice = watch('regular_price');

  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [openCategories, setOpenCategories] = useState(false);
  const [selectedPath, setSelectedPath] = useState([
    "Men's Fashion",
    "Men's Clothing",
    'Men Shirts',
    'Polo Shirt',
  ]);

  const [currentLevel, setCurrentLevel] = useState<ShopCategory[]>([]);
  // const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [selectedValue, setSelectedValue] = useState<ShopCategory | null>(null);

  // path leading TO the level currently being displayed (never includes a leaf label)
  const [levelPath, setLevelPath] = useState<string[]>([]);

  // const filters = getFiltersForCategory(selectedPath, categories);
  const { inherited, groups } = getFiltersGrouped(selectedPath, categories);

  //---------------------------

  const categoryButtonRef = useRef<HTMLDivElement>(null);

  const { sellerFilters } = splitSchema(categories);

  const [openAspectRatio, setOpenAspectRatio] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // const [aspect, setAspect] = useState<'square' | 'portrait'>('square');
  const aspect = watch('aspect'); // always in sync with form

  const aspectMap = {
    square: { width: 'w-[500px]', aspect: 'aspect-square' },
    portrait: { width: 'w-[503px]', aspect: 'aspect-[3/4]' },
  };

  const options = [
    { value: 'square', label: 'Square (500 × 500)' },
    { value: 'portrait', label: 'Portrait (503 × 670)' },
  ];

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        setCategories(data);
        setCurrentLevel(data); // start at root
      } catch (err) {
        console.error('Failed to load categories', err);
      } finally {
        setLoadingCategories(false);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!openCategories) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        categoryButtonRef.current &&
        !categoryButtonRef.current.contains(e.target as Node)
      ) {
        setOpenCategories(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openCategories]);

  // handleSelect
  function handleSelect(cat: ShopCategory) {
    console.log('selected:', cat.label, 'subCategories:', cat.subCategories);

    const newPath = [...levelPath, cat.label];

    if (cat.subCategories && cat.subCategories.length > 0) {
      setLevelPath(newPath);
      setSelectedPath(newPath);
      setCurrentLevel(cat.subCategories);
    } else {
      setSelectedPath(newPath);
      setSelectedValue(cat);
      // no auto-close here anymore — panel stays open until the user
      // taps Confirm, X, or the backdrop
    }
  }

  // handleBackCategories
  function handleBackCategories() {
    if (levelPath.length === 0) return;
    const parentPath = levelPath.slice(0, -1);
    setLevelPath(parentPath);
    setSelectedPath(parentPath);

    let level = categories;
    for (const label of parentPath) {
      const node = level.find((c) => c.label === label);
      level = node?.subCategories ?? [];
    }
    setCurrentLevel(level);
  }

  // handleBreadcrumbClick
  function handleBreadcrumbClick(index: number) {
    const newPath = selectedPath.slice(0, index + 1);
    setSelectedPath(newPath);
    setLevelPath(newPath);

    let level = categories;
    for (let i = 0; i <= index; i++) {
      const node = level.find((c) => c.label === newPath[i]);
      level = node?.subCategories ?? [];
    }
    setCurrentLevel(level);
    setOpenCategories(true);

    if (index < selectedPath.length - 1) {
      setSelectedValue(null);
    }
  }

  // handleRootClick
  function handleRootClick() {
    setSelectedPath([]);
    setLevelPath([]);
    setCurrentLevel(categories);
    setSelectedValue(null);
    setOpenCategories(true);
  }

  // renderOptions — shared row list, used by both dropdown and sheet
  function renderOptions() {
    return currentLevel.map((cat) => {
      const isLeaf = !cat.subCategories || cat.subCategories.length === 0;
      const isSelected = isLeaf && selectedValue === cat;

      return (
        <button
          key={cat.value}
          type="button"
          onClick={() => handleSelect(cat)}
          className={`w-full flex items-center justify-between px-4 py-3 text-sm text-left border-b border-gray-100 last:border-b-0 ${
            isSelected ? 'bg-orange-50 text-[#C2410C]' : 'hover:bg-gray-50'
          }`}
        >
          {cat.label}
          {isLeaf ? (
            isSelected && (
              <svg
                className="w-4 h-4 text-[#C2410C]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )
          ) : (
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          )}
        </button>
      );
    });
  }

  // Extract filters from JSON
  function getFiltersGrouped(
    selectedPath: string[],
    categories: ShopCategory[]
  ) {
    let inherited: Filter[] = [];
    let groups: FilterGroup[] = [];
    let level = categories;

    for (const label of selectedPath) {
      const node = level.find((c) => c.label === label);
      if (!node) break;

      if (node.filterLibrary) {
        inherited = [...inherited, ...node.filterLibrary];
      }
      if (node.filterGroups) {
        groups = [...groups, ...node.filterGroups];
      }

      level = node.subCategories ?? [];
    }

    return { inherited, groups };
  }

  // Auto‑Generate Slug from Title
  useEffect(() => {
    if (title) {
      const baseSlug = title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '') // remove invalid chars
        .replace(/\s+/g, '-'); // spaces → dashes

      setValue('slug', baseSlug, { shouldValidate: true });
    }
  }, [title, setValue]);

  // Handle Duplicate Slugs
  function ensureUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
    let slug = baseSlug;
    let counter = 2;

    while (existingSlugs.includes(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  // Debounced Slug Auto‑Generation
  function useDebouncedSlug(title: string, setValue: any) {
    useEffect(() => {
      if (!title) return;

      const handler = setTimeout(() => {
        const baseSlug = title
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, '') // remove invalid chars
          .replace(/\s+/g, '-'); // spaces → dashes

        setValue('slug', baseSlug, { shouldValidate: true });
      }, 400); // ✅ wait 400ms after typing stops

      return () => clearTimeout(handler);
    }, [title, setValue]);
  }

  // Esc key support so the preview modal can be dismissed without clicking the Close button
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenMainPreviewModal(false); // ✅ closes modal on Esc
      }
    };

    if (openMainPreviewModal) {
      window.addEventListener('keydown', handleEsc);
    }

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [openMainPreviewModal]);

  // Close Aspect Ratio dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenAspectRatio(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // fully lock background scrolling (so the page doesn’t move at all when the modal is open)
  useEffect(() => {
    if (openMainPreviewModal) {
      document.body.style.overflow = 'hidden'; // ✅ lock scroll
    } else {
      document.body.style.overflow = 'auto'; // ✅ restore scroll
    }
  }, [openMainPreviewModal]);

  // const convertFiletoBase64 = (file: File) => {
  //   return new Promise((resolve, reject) => {
  //     const reader = new FileReader();
  //     reader.readAsDataURL(file);
  //     reader.onload = () => resolve(reader.result);
  //     reader.onerror = (error) => reject(error);
  //   });
  // };

  //-----------------------------------------------

  const handleMainImageUpload = async (index: number, file: File | null) => {
    const updated = [...mainImages];

    if (file) {
      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await axiosProduct.post(
          '/upload-product-image',
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        );

        updated[index] = {
          fileId: response.data.fileId,
          file_url: response.data.file_url, // ✅ permanent ImageKit URL
        };
      } catch (error) {
        toast.error('Main image upload failed');
        return;
      }
    } else {
      updated[index] = null;
    }

    setMainImages(updated);
  };

  const handleImageChange = async (file: File | null, index: number) => {
    if (!file) return;
    setMainUploading((prev) => ({ ...prev, [index]: true }));
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await axiosProduct.post(
        '/upload-product-image',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      const uploadedImage: UploadedImage = {
        fileId: response.data.fileId ?? response.data.file_id,
        file_url: response.data.file_url ?? response.data.url,
      };
      const updatedImages = [...mainImages];
      updatedImages[index] = uploadedImage;
      setMainImages(updatedImages);
      setValue('images', updatedImages);
    } catch (error) {
      toast.error('Image upload failed');
    } finally {
      setMainUploading((prev) => ({ ...prev, [index]: false }));
    }
  };

  const handleImageChangeWithLoader = async (
    index: number,
    file: File | null
  ) => {
    setMainUploading((prev) => {
      const copy = [...prev];
      copy[index] = true;
      return copy;
    });

    if (file) {
      const updated = [...mainImages];
      updated[index] = {
        fileId: crypto.randomUUID(),
        file_url: URL.createObjectURL(file),
      };
      setMainImages(updated);
    } else {
      const updated = [...mainImages];
      updated[index] = null;
      setMainImages(updated);
    }

    setMainUploading((prev) => {
      const copy = [...prev];
      copy[index] = false;
      return copy;
    });
  };

  const handleRemoveImage = (index: number) => {
    const updated = [...mainImages];
    updated[index] = null;
    setMainImages(updated);
  };

  const applyTransformation = async (transformation: string) => {
    if (!selectedImage || processing) return;
    setProcessing(true);
    setActiveEffect(transformation);

    try {
      const transformedUrl = `${selectedImage}?tr=${transformation}`;
      setSelectedImage(transformedUrl);
    } catch (error) {
      console.log;
    } finally {
      setProcessing(false);
    }
  };

  // Unified submit function
  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);

      // ✅ Run validation first
      const errors = validateProductForm(data);
      if (Object.keys(errors).length > 0) {
        console.error('Validation errors:', errors);
        setLoading(false);
        return;
      }

      // ✅ Clean up images
      const cleanedImages = (data.images || []).filter(
        (img) => img && img.file_url && img.fileId
      );

      // ✅ Flatten product specifications
      const specsObject = data.product_specifications || {};
      const productSpecifications = Object.entries(specsObject).flatMap(
        ([key, value]) =>
          Array.isArray(value)
            ? value.map((v) => ({ label: key, value: v }))
            : [{ label: key, value }]
      );

      // ✅ Ensure slug uniqueness
      let existingSlugs: string[] = [];
      try {
        const { data: existingProducts } = await axiosProduct.get('/all-slugs');
        existingSlugs = existingProducts.map((p: any) => p.slug);
      } catch (err) {
        console.error('Error fetching slugs:', err);
      }

      // ✅ Build payload
      const payload = {
        ...data,
        slug: ensureUniqueSlug(data.slug, existingSlugs),
        images: cleanedImages,
        product_specifications: productSpecifications,
        deal_start: data.deal_start ? new Date(data.deal_start) : null,
        deal_end: data.deal_end ? new Date(data.deal_end) : null,
        discount_start: data.discount_start
          ? new Date(data.discount_start)
          : null,
        discount_end: data.discount_end ? new Date(data.discount_end) : null,
        colorVariants: (data.colorVariants || []).map((cv) => ({
          ...cv,
          dealStart: cv.dealStart ? new Date(cv.dealStart) : null,
          dealEnd: cv.dealEnd ? new Date(cv.dealEnd) : null,
        })),
      };

      // ✅ Branch logic
      if (mode === 'createProduct') {
        await axiosProduct.post('/create-product', payload);
        toast.success('Product created!');
        router.push('/dashboard/all-products');
      } else if (mode === 'editProduct') {
        await axiosProduct.put(`/update-product/${product?.slug}`, payload);
        toast.success('Product updated!');
        router.push('/dashboard/all-products');
      } else if (mode === 'createDeal') {
        await axiosProduct.post('/create-deal', payload);
        toast.success('Deal created!');
        router.push('/dashboard/all-deals');
      } else {
        if (isDealRoute || data.enableDeal) {
          await axiosProduct.post('/create-deal', payload);
          toast.success('Deal created!');
          router.push('/dashboard/all-deals');
        } else {
          await axiosProduct.post('/create-product', payload);
          toast.success('Product created!');
          router.push('/dashboard/all-products');
        }
      }

      // ✅ Only reached if none of the branches above threw — i.e. on success
      localStorage.removeItem(draftKey);
      reset(data); // ✅ re-baseline the form so isDirty/isChanged resets too
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error(error?.response?.data?.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Submit button label
  const buttonLabel =
    mode === 'createProduct'
      ? 'Create Product'
      : mode === 'editProduct'
      ? 'Update Product'
      : 'Create Deal';

  return (
    <form
      className="w-full px-0 py-0 rounded-lg text-white"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="w-full bg-white flex items-center justify-between mb-4 px-8 py-2 border-b border-gray-300">
        <div className="">
          {/* Heading */}
          <h2 className="text-lg py-2 font-semibold text-[#1C1C1E]">
            {pageTitle}
          </h2>
        </div>
      </div>
      {/* Tabs Section */}
      <div className="w-full lg:w-full mx-auto bg-[#fff] ">
        {/* Tabs */}
        <div className="flex justify-center overflow-hidden mx-8">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => handleTabChange(tab)}
              className={`py-3 px-4 text-[15px] font-bold border-b-2 transition-colors duration-200 ${
                activeTab === tab
                  ? 'text-[#1C1C1E] border-[#FEA417]'
                  : 'text-gray-500 border-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="py-0 text-slate-700">
          {/* Product Identity */}
          {activeTab === 'Product Identity' && (
            <div className="w-[1000px] flex flex-col mx-auto items-center justify-start gap-3 mt-4 py-2 bg-white">
              {/* Product Title */}
              <div className="w-full flex items-start justify-end gap-3 bg-white px-4 py-3 rounded-sm ">
                <p className="flex items-start justify-center gap-1">
                  <label className="block text-[15px] font-bold  text-gray-800 mb-2">
                    Product Title *
                  </label>
                  <span>
                    <Info size={16} color="#333" />
                  </span>
                </p>
                <div className="w-[800px]">
                  <AutoResizeTextarea
                    label=""
                    rows={2}
                    placeholder="Enter product title"
                    {...register('title', { required: 'Title is required' })}
                  />
                </div>
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.title.message as string}
                  </p>
                )}
              </div>
              {/* Slug */}
              <div className="w-full flex flex-col items-start justify-start gap-1 px-4">
                <div className="w-full flex items-center justify-end gap-3 bg-white px-0 pt-3 rounded-sm ">
                  <p className="flex items-start justify-center gap-1 shrink-0">
                    <label className="block text-[15px] font-bold  text-gray-800 mb-2">
                      Slug *
                    </label>
                    <span>
                      <Info size={16} color="#333" />
                    </span>
                  </p>
                  <div className="w-[800px]">
                    <Input
                      label=""
                      placeholder="product-slug"
                      className="bg-[#fff]"
                      disabled={!watch('title')} // ✅ lock until title is typed
                      {...register('slug', {
                        required: 'Slug is required!',
                        pattern: {
                          value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                          message:
                            'Invalid slug format! Use only lowercase letters, numbers, and dashes (e.g., product-slug)',
                        },
                        minLength: {
                          value: 3,
                          message: 'Slug must be at least 3 characters long.',
                        },
                        maxLength: {
                          value: 500,
                          message: 'Slug cannot be longer than 50 characters.',
                        },
                      })}
                    />
                  </div>
                </div>
                {errors.slug && (
                  <p className="text-red-500 text-sm ">
                    {errors.slug.message as string}
                  </p>
                )}
              </div>
              {/* --- Dropdown Categories --- */}
              <div className="relative w-full flex flex-col items-center justify-end gap-3 bg-white px-4 py-3 rounded-sm ">
                <div className="w-full flex items-center justify-end gap-3">
                  <p className="flex items-start justify-center gap-1 text-gray-600">
                    <label className="block text-[15px] font-bold  text-gray-800 mb-2">
                      Category *
                    </label>
                    <span>
                      <Info size={16} />
                    </span>
                  </p>
                  <div className="w-[800px] pointer-events-none">
                    <div
                      className="w-[400px] flex flex-col gap-1 relative pointer-events-auto"
                      ref={categoryButtonRef}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenCategories(true)}
                        className="h-10 px-3 border border-gray-200 rounded-md text-sm font-medium text-left flex items-center justify-between focus:outline-none focus:border-[#C2410C] focus:ring-2 focus:ring-[#C2410C]/20 transition-shadow"
                      >
                        {selectedPath.length > 0
                          ? selectedPath[selectedPath.length - 1]
                          : "Men's Clothing / Polo Shirt"}

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

                      {openCategories && (
                        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
                          <div
                            className={`bg-white w-full sm:max-w-md h-[80vh] sm:h-[80vh] flex flex-col
                            rounded-t-2xl sm:rounded-lg
                            ${
                              isClosing
                                ? 'animate-slide-down-out sm:animate-fade-scale-out'
                                : 'animate-slide-up-in sm:animate-fade-scale-in'
                            }`}
                          >
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                              <h2 className="text-lg font-medium">
                                Choose Category
                              </h2>
                              <button
                                type="button"
                                // onClick={() => setOpenCategories(false)}
                                onClick={handleCloseCategories}
                                aria-label="Close"
                                className="p-1"
                              >
                                <X size={18} />
                              </button>
                            </div>

                            {/* Scrollable category list */}
                            <div className="relative flex-1 overflow-y-auto p-4">
                              {levelPath.length > 0 && (
                                <button
                                  type="button"
                                  onClick={handleBackCategories}
                                  className="w-full flex items-center gap-2 px-3 py-2 mb-2 text-sm font-medium text-[#C2410C] hover:bg-gray-50 rounded-md"
                                >
                                  <ChevronLeft size={16} />
                                  Back
                                  {levelPath.length > 1
                                    ? ` to ${levelPath[levelPath.length - 2]}`
                                    : ' to Categories'}
                                </button>
                              )}
                              {renderOptions()}

                              {/* ✅ Loading text when loading */}
                              {loading && (
                                <span className="absolute inset-0 flex items-center justify-center text-gray-700">
                                  Loading...
                                </span>
                              )}
                            </div>

                            {/* Confirm button */}
                            <div className="p-4 border-t border-gray-200">
                              <button
                                type="button"
                                onClick={() => {
                                  if (selectedValue) {
                                    setValue(
                                      'category',
                                      selectedPath[1] || 'men_clothing'
                                    ); // second level
                                    setValue(
                                      'subCategory',
                                      selectedValue.value || 'polo_shirt'
                                    );
                                  } else {
                                    setValue('category', 'men_clothing');
                                    setValue('subCategory', 'polo_shirt');
                                  }
                                  // setOpenCategories(false);
                                  handleCloseCategories();
                                }}
                                disabled={!selectedValue}
                                className="w-full h-11 rounded-md text-sm font-medium bg-[#C2410C] text-white disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                Confirm Category
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {/* Breadcrumb rail */}
              <div className="w-full flex items-start justify-end gap-3 px-4">
                <p className="flex items-start justify-center gap-1">
                  <label className="block text-[15px] font-bold  text-gray-800 mb-2">
                    Breadcrumbs
                  </label>
                  <span>
                    <Info size={16} color="#333" />
                  </span>
                </p>
                <div className="w-[800px] flex items-center justify-start gap-2 px-4 py-2 border border-gray-300 rounded-lg">
                  <span
                    onClick={handleRootClick}
                    className="cursor-pointer hover:underline text-sm font-medium text-[#C2410C] shrink-0"
                  >
                    Home{selectedPath.length > 0 && ' >'}
                  </span>
                  {selectedPath.length > 0 && (
                    <div className="flex flex-wrap gap-1 text-sm text-gray-600">
                      {selectedPath.map((crumb, i) => (
                        <span
                          key={i}
                          onClick={() => handleBreadcrumbClick(i)}
                          className="cursor-pointer hover:underline"
                        >
                          {crumb}
                          {i < selectedPath.length - 1 && ' > '}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Product Details */}
          {activeTab === 'Product Details' && (
            <div className="w-[1000px] flex flex-col mx-auto items-center justify-center rounded-sm gap-0 mt-4 relative ">
              {/* Product Specifications */}
              {/* General Attributes (inherited filters) */}
              {inherited.length > 0 && (
                <div className="w-[1000px] flex items-center justify-center bg-white ">
                  <div className="w-[700px] mb-3 px-2 pb-2 border-b border-slate-300">
                    <h3 className="text-lg font-bold pt-2 pb-2">
                      General Attributes
                    </h3>
                    {inherited.map((filter, idx) =>
                      renderFilterRow({
                        filter,
                        idx,
                        length: inherited.length,
                        mode: 'seller', // or "customer"
                        register,
                        control,
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Category-specific filter groups */}
              {groups.map((group) => (
                <div className="w-[1000px] flex items-center justify-center bg-white ">
                  <div
                    key={group.title}
                    className="w-[700px] mb-3 px-2 pb-2 border-b border-slate-300"
                  >
                    <h3 className="text-lg font-bold pt-4 pb-2 ">
                      {group.title}
                    </h3>
                    {group.filters.map((filter, idx) =>
                      renderFilterRow({
                        filter,
                        idx,
                        length: group.filters.length,
                        mode: 'seller', // or "customer"
                        register,
                        control,
                      })
                    )}
                  </div>
                </div>
              ))}

              {/* ✅ Spinner overlay when loading categories */}
              {loading && (
                <span className="absolute inset-0 flex items-center justify-center bg-white/50 text-sm font-medium">
                  <Spinner size={16} borderColor="border-gray-200" />
                  <span className="ml-2">Loading...</span>
                </span>
              )}

              {/* Product Properties */}
              <div className="w-full p-0 rounded-md hidden">
                <CustomProperties control={control} errors={errors} />
              </div>
              {/* Product Specifications */}
              <div className="w-full p-0 rounded-md hidden">
                <CustomSpecifications control={control} errors={errors} />
              </div>
            </div>
          )}

          {/* Description & Media*/}
          {activeTab === 'Description & Media' && (
            <div className="w-[1000px] flex flex-col mx-auto items-start justify-center gap-0 py-4 ">
              {/* Short Description */}
              <div className="w-full rounded-sm px-6 pt-4 pb-6 border-b border-slate-300">
                <label
                  htmlFor="short-description-editor"
                  className="block text-[15px] font-bold text-gray-700 pb-3"
                >
                  Product Description * (Min 50 words)
                </label>

                <Controller
                  name="short_description"
                  control={control}
                  rules={{
                    required: 'Description is required!',
                    validate: (value) =>
                      validateWordCount(
                        value,
                        50,
                        'Description must be at least 50 words!'
                      ),
                  }}
                  render={({ field }) => (
                    <div className="relative">
                      <RichTextEditor
                        id="short-description-editor" // ✅ unique id for accessibility
                        value={field.value || ''}
                        onChange={field.onChange}
                        className="bg-white"
                      />

                      {/* ✅ Spinner overlay when loading */}
                      {loading && (
                        <span className="absolute inset-0 flex items-center justify-center bg-white/50">
                          Loading...
                        </span>
                      )}
                    </div>
                  )}
                />

                {errors.short_description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.short_description.message as string}
                  </p>
                )}
              </div>
              {/* Product details / Accordions */}
              <div className="w-full rounded-sm px-6 py-4 bg-white hidden">
                <CustomAccordion control={control} errors={errors} />{' '}
              </div>
              {/* Dropdown */}
              <div className="w-full flex flex-col items-start justify-start gap-1 rounded-sm px-6 py-4 bg-white border-b border-slate-300">
                <label className="block text-[15px] font-bold  text-gray-700 mb-1">
                  Image Aspect Ratio
                </label>
                <p className="w-full flex-1 text-sm text-yellow-950 px-3 py-2 mb-2 border border-gray-100 bg-yellow-100 rounded-md">
                  <span className="font-bold">Aspect ratio required:</span> To
                  ensure your product images display correctly to customers,
                  please set an aspect ratio. This keeps all images consistent
                  in size and prevents them from looking stretched or squeezed
                  on the storefront.
                </p>
                <div
                  ref={dropdownRef}
                  className="relative inline-block text-left ml-0 pb-3"
                  // className="relative flex flex-col items-start justify-center text-left pb-3 w-[340px]"
                >
                  {/* Button */}
                  <button
                    type="button"
                    onClick={() => setOpenAspectRatio(!openAspectRatio)}
                    className="border rounded-md px-4 py-2 text-[15px] bg-white text-gray-700 hover:bg-gray-100 w-[320px] flex justify-between items-center"
                  >
                    Aspect Ratio:{' '}
                    {aspect === 'square'
                      ? 'Square (500 × 500)'
                      : 'Portrait (503 × 670)'}
                    <ChevronDown className="text-gray-600" />
                  </button>
                  {openAspectRatio && (
                    <div className="absolute mt-0 py-1 w-[320px] bg-white text-gray-700 border rounded-md shadow-lg z-10">
                      {options.map((opt) => (
                        <div
                          key={opt.value}
                          onClick={() => {
                            setValue(
                              'aspect',
                              opt.value as 'square' | 'portrait'
                            ); // ✅ update form only
                            setOpenAspectRatio(false);
                          }}
                          className="px-4 py-2 text-[15px] cursor-pointer hover:bg-gray-100"
                        >
                          {opt.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Hint text */}
                {/* <p className="mt-2 ml-14 pb-1 text-sm text-gray-500">
                Recommended size: 850×850 for square, 765×1020 for portrait
                </p> */}
              </div>
              {/* Image upload section */}
              {/* Main Images section always visible */}
              <div className="w-[1000px] mx-auto py-4 border-b border-slate-300">
                {/* Tab bar */}
                <div className="flex gap-4 mb-0.5 py-1">
                  <button
                    type="button"
                    disabled={hasColors}
                    onClick={() => {}} // no-op: Main Images is the default view, only reachable back via Reset Variants
                    className={`px-4 py-2 rounded-md font-medium transition ${
                      !hasColors
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-800 border border-gray-400'
                    } ${hasColors ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Main Images
                  </button>

                  <button
                    type="button"
                    onClick={handleAddColorSwatchClick}
                    className={`px-4 py-2 rounded-md font-medium border border-gray-300 transition ${
                      hasColors
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    + Add Color Swatch
                  </button>

                  {hasColors && (
                    <button
                      type="button"
                      onClick={handleResetVariantsClick}
                      className="flex items-center gap-1 px-4 py-2 rounded-md font-medium bg-gray-800 hover:bg-gray-700 text-white transition"
                    >
                      <RotateCcw size={14} /> Reset Variants
                    </button>
                  )}
                </div>

                <div className="relative rounded-sm bg-white">
                  {/* Main Images — plain conditional render, mount always replays the animation */}
                  {activeImageTab === 'main' && (
                    <div
                      key="main-tab"
                      className="px-6 py-4 animate-fade-scale-in"
                    >
                      <h2 className="font-bold text-gray-700 pb-2">
                        Main Images
                      </h2>
                      <div className="grid grid-cols-4 gap-3 mt-0 ">
                        {mainImages.map((img, index) => (
                          <ImagePlaceholder
                            key={index}
                            idPrefix="main"
                            index={index}
                            aspect={watch('aspect')}
                            pictureUploadingLoader={mainUploading[index]}
                            image={img}
                            onImageChange={(file) =>
                              handleMainImageUpload(index, file)
                            }
                            onRemove={() => handleMainImageUpload(index, null)}
                            setOpenPreviewModal={setOpenMainPreviewModal}
                            setSelectedPreviewImage={setMainPreviewImage}
                          />
                        ))}
                      </div>

                      {/* Preview modal — plain div, no animated ancestor to leak into it anymore */}
                      {openMainPreviewModal && mainPreviewImage && (
                        <div
                          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-hidden"
                          style={{ overscrollBehavior: 'contain' }}
                        >
                          <button
                            className="absolute top-4 right-6 bg-[#f6f6f6] hover:bg-red-100 text-gray-800 p-2 rounded-lg transition-all duration-150"
                            onClick={() => setOpenMainPreviewModal(false)}
                          >
                            <X />
                          </button>
                          <div
                            className={`relative bg-white p-4 rounded-lg shadow-lg overflow-hidden ${
                              watch('aspect') === 'square'
                                ? 'aspect-square w-[500px]'
                                : 'aspect-[3/4] w-[500px]'
                            }`}
                          >
                            <img
                              src={mainPreviewImage}
                              alt="Preview"
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Variants — always mounted (ref stays valid), CSS `hidden` toggles visibility.
                  Animation replays automatically each time it goes from hidden -> visible,
                  since a display:none -> display:block transition restarts CSS animations. */}
                  <div
                    className={`px-6 py-4 animate-fade-scale-in ${
                      activeImageTab !== 'variants' ? 'hidden' : ''
                    }`}
                  >
                    <ColorVariantsEditor
                      ref={colorVariantsRef}
                      aspect={watch('aspect')}
                      onHasColorsChange={setHasColors}
                      setValue={setValue}
                      productTitle={watch('title')}
                      variants={watch('colorVariants')}
                    />
                  </div>
                </div>
              </div>
              {/* Color Selector */}
              <div className="w-full mt-0 rounded-sm px-6 py-5 bg-white hidden">
                <ColorSelector control={control} errors={errors} />
              </div>
              {/* Size Selector */}
              <div className="w-full mt-0 rounded-sm px-6 py-4 bg-white border-b border-slate-300">
                <SizeSelector control={control} errors={errors} />
              </div>
              {/* Video Url */}
              <div className="w-full rounded-sm px-6 py-5 bg-white border-b border-slate-300">
                <label
                  htmlFor="video-url"
                  className="block text-[15px] font-bold text-gray-700 mb-1"
                >
                  Video Url *
                </label>
                <Input
                  id="video-url"
                  label=""
                  placeholder="https://www.youtube.com/embed/xyz123"
                  className="bg-[#fff] border border-gray-300 px-4 placeholder:font-normal"
                  {...register('video_url', {
                    validate: (value) => {
                      // ✅ normalize watch links → embed links
                      const watchRegex =
                        /^https:\/\/(www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)$/;
                      const embedRegex =
                        /^https:\/\/(www\.)?youtube\.com\/embed\/[a-zA-Z0-9_-]+$/;

                      if (embedRegex.test(value)) return true;
                      const match = value.match(watchRegex);
                      if (match) {
                        // auto-convert watch → embed
                        const embedUrl = `https://www.youtube.com/embed/${match[2]}`;
                        setValue('video_url', embedUrl);
                        return true;
                      }
                      return 'Invalid YouTube URL! Use format: https://youtube.com/embed/xyz123';
                    },
                  })}
                />

                {errors.video_url && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.video_url.message as string}
                  </p>
                )}
              </div>
              {/* Detailed product description */}
              <div className="w-full mx-auto rounded-sm px-6 py-4 bg-white border-b border-slate-300">
                <div className="mt-4">
                  <label
                    htmlFor="detailed-description-editor"
                    className="block font-bold text-gray-700 mb-3"
                  >
                    Detailed description * (Min 100 words)
                  </label>

                  <Controller
                    name="detailed_description"
                    control={control}
                    rules={{
                      required: 'Detailed description is required!',
                      validate: (value) =>
                        validateWordCount(
                          value,
                          100,
                          'Detailed description must be at least 100 words!'
                        ),
                    }}
                    render={({ field }) => (
                      <div className="relative">
                        {/* ✅ Wrap editor in relative container so spinner can be absolutely positioned */}
                        <RichTextEditor
                          id="detailed-description-editor"
                          value={field.value || ''}
                          onChange={field.onChange}
                          className="bg-white"
                        />

                        {/* ✅ Spinner overlay when loading */}
                        {loading && (
                          <span className="absolute inset-0 flex items-center justify-center bg-white/50">
                            <Spinner size={16} borderColor="border-gray-200" />
                          </span>
                        )}
                      </div>
                    )}
                  />

                  {errors.detailed_description && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.detailed_description.message as string}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Pricing */}
          {activeTab === 'Pricing' && (
            <div className="w-[1000px] flex flex-col mx-auto items-center justify-center gap-2 mt-4 py-2 ">
              {/* SKU */}
              <div className="w-full flex items-start justify-end gap-3 px-4 py-3 rounded-sm">
                <p className="flex items-center justify-center gap-1">
                  <label
                    htmlFor="sku"
                    className="text-[15px] font-bold text-gray-700 shrink-0 py-2"
                  >
                    SKU *
                  </label>
                  <span>
                    <Info size={16} color="#333" />
                  </span>
                </p>

                <div className="w-[700px]">
                  <div className="w-[600px]">
                    <Input
                      id="sku"
                      label=""
                      placeholder="Enter SKU (e.g., PROD-12345, PROD12345, SKU-ABC-999)"
                      type="text"
                      className="text-[15px] placeholder:text-sm"
                      {...register('sku', {
                        validate: (value) =>
                          value.trim().length > 0 || 'SKU cannot be empty',
                        pattern: {
                          value: /^[A-Z0-9-]+$/, // ✅ enforce alphanumeric + dashes
                          message:
                            'SKU must contain only letters, numbers, or dashes',
                        },
                      })}
                    />
                  </div>
                </div>

                {errors.sku && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.sku.message as string}
                  </p>
                )}
              </div>

              {/* Quantity */}
              <div className="w-full flex items-start justify-end gap-3 px-4 py-2 rounded-sm">
                <p className="flex items-center justify-center gap-1">
                  <label
                    htmlFor="stock"
                    className="text-[15px] font-bold text-gray-700 py-2 shrink-0"
                  >
                    Quantity *
                  </label>
                  <span>
                    <Info size={16} color="#333" />
                  </span>
                </p>

                <div className="w-[700px]">
                  <div className="w-[400px]">
                    <Input
                      id="stock"
                      label=""
                      placeholder="0"
                      type="number"
                      className="text-[15px]"
                      {...register('stock', {
                        required: 'Quantity is required!', // ✅ enforce required
                        setValueAs: (v) => (v === '' ? undefined : Number(v)), // ✅ keep empty as undefined
                        min: {
                          value: 0,
                          message: 'Quantity cannot be negative',
                        }, // ✅ no negatives allowed
                        validate: (value) =>
                          (typeof value === 'number' && !isNaN(value)) ||
                          'Only numbers are allowed',
                      })}
                    />
                  </div>
                </div>

                {errors.stock && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.stock.message as string}
                  </p>
                )}
              </div>

              {/* Case 1: No color variants → global pricing */}
              {/* Regular Price */}
              {colorVariants.length < 1 && (
                <div className="w-full flex items-start justify-end gap-3 bg-white px-4 py-2 rounded-sm">
                  <p className="flex items-center justify-center gap-1">
                    <label
                      htmlFor="regular_price"
                      className="text-[15px] font-bold text-gray-700 shrink-0 py-2"
                    >
                      Base Price * <span className="text-sm">(Ksh)</span>
                    </label>
                    <span>
                      <Info size={16} color="#333" />
                    </span>
                  </p>

                  <div className="w-[700px]">
                    <div className="w-[400px]">
                      <Input
                        id="regular_price"
                        label=""
                        type="number"
                        placeholder="0"
                        disabled={colorVariants.length > 0} // ✅ disable when variants exist
                        className="bg-[#fff] text-[15px]"
                        {...register('regular_price', {
                          required:
                            colorVariants.length === 0
                              ? 'Base Price is required when no color variants exist'
                              : false,
                          setValueAs: (v) => (v === '' ? undefined : Number(v)),
                          min:
                            colorVariants.length === 0
                              ? {
                                  value: 1,
                                  message: 'Price must be at least 1',
                                }
                              : undefined,
                          validate: (value) =>
                            colorVariants.length > 0 ||
                            (typeof value === 'number' && !isNaN(value)) ||
                            'Only numbers are allowed',
                        })}
                      />
                    </div>
                  </div>

                  {errors.regular_price && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.regular_price.message as string}
                    </p>
                  )}
                </div>
              )}

              {/* Sale Price */}
              {isDealRoute && (
                <div className="w-full flex items-start justify-end gap-3 px-4 py-2 rounded-sm">
                  <p className="flex items-center justify-center gap-1">
                    <label
                      htmlFor="sale_price"
                      className="text-[15px] font-bold text-gray-700 shrink-0 py-2"
                    >
                      Sale Price * <span className="text-sm">(Ksh)</span>
                    </label>
                    <span>
                      <Info size={16} color="#333" />
                    </span>
                  </p>

                  <div className="w-[700px]">
                    <div className="w-[400px]">
                      <Input
                        id="sale_price"
                        label=""
                        type="number"
                        placeholder="0"
                        className="bg-[#fff] text-[15px]"
                        {...register('sale_price', {
                          required:
                            'Sale Price is required when creating a deal', // ✅ always required on deal route
                          setValueAs: (v) => (v === '' ? undefined : Number(v)),
                          min: {
                            value: 1,
                            message: 'Sale price must be at least 1',
                          },
                          validate: (value) =>
                            (typeof value === 'number' && !isNaN(value)) ||
                            'Only numbers are allowed',
                        })}
                      />
                    </div>
                  </div>

                  {errors.sale_price && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.sale_price.message as string}
                    </p>
                  )}
                </div>
              )}

              {/* Conditionally render deal dates */}
              {isDealRoute && (
                <div className="w-full flex flex-col items-center justify-center gap-3 px-4 ">
                  {/* Deal Start Date */}
                  <div className="w-full flex items-center justify-end gap-2 rounded-md">
                    <label
                      htmlFor="deal_start"
                      className="shrink-0 text-[15px] font-bold text-gray-800 mt-1"
                    >
                      Deal Start *
                    </label>
                    <div className="w-[700px]">
                      <div className="w-[220px]">
                        <Controller
                          name="deal_start"
                          control={control}
                          rules={{ required: 'Start date is required' }}
                          render={({ field }) => (
                            <input
                              id="deal_start"
                              type="date"
                              value={
                                typeof field.value === 'string'
                                  ? field.value
                                  : ''
                              } // ✅ always a string
                              onChange={(e) => {
                                const startDateStr = e.target.value;
                                field.onChange(startDateStr); // ✅ store string in form state
                              }}
                              className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm font-semibold text-gray-700"
                            />
                          )}
                        />
                        {errors.deal_start && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.deal_start.message as string}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Deal End Date */}
                  <div className="w-full flex items-center justify-end gap-2 rounded-md">
                    <label
                      htmlFor="deal_end"
                      className="shrink-0 text-sm font-bold text-gray-800 mt-1"
                    >
                      Deal End *
                    </label>
                    <div className="w-[700px]">
                      <div className="w-[220px]">
                        <Controller
                          name="deal_end"
                          control={control}
                          rules={{
                            required: 'End date is required',
                            validate: (value) => {
                              const start = getValues('deal_start');
                              if (value && start) {
                                return (
                                  new Date(value) > new Date(start) ||
                                  'End date must be after start date'
                                );
                              }
                              return true;
                            },
                          }}
                          render={({ field }) => (
                            <input
                              id="deal_end"
                              type="date"
                              value={
                                typeof field.value === 'string'
                                  ? field.value
                                  : ''
                              } // ✅ always a string
                              onChange={(e) => {
                                const endDateStr = e.target.value;
                                field.onChange(endDateStr); // ✅ store string in form state
                              }}
                              className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm font-semibold text-gray-700"
                            />
                          )}
                        />
                        {errors.deal_end && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.deal_end.message as string}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Case 2: With color variants → table */}
              {colorVariants?.length > 0 && (
                <div className="flex flex-col items-start justify-center">
                  <h2 className="font-bold py-2">Color Variants</h2>
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-100 text-sm font-semibold">
                        <th className="border px-3 py-2 text-left">
                          Color Variant
                        </th>
                        <th className="border px-3 py-2 text-left">
                          Base Price (Ksh)
                        </th>
                        <th className="border px-3 py-2 text-left">
                          Deal Price (Ksh)
                        </th>
                        <th className="border px-3 py-2 text-left">
                          Deal Start
                        </th>
                        <th className="border px-3 py-2 text-left">Deal End</th>
                      </tr>
                    </thead>
                    <tbody>
                      {colorVariants.map((swatch, idx) => (
                        <tr key={swatch.id || idx} className="text-sm">
                          {/* Color name from editor, fallback to placeholder */}
                          <td className="border px-3 py-2 font-medium text-gray-800">
                            {swatch.name && swatch.name.trim() !== ''
                              ? swatch.name
                              : `Color ${idx + 1}`}
                          </td>

                          {/* Variant Base Price */}
                          <td className="border px-3 py-2">
                            <input
                              type="number"
                              defaultValue={swatch.price}
                              {...register(`colorVariants.${idx}.price`, {
                                required: 'Base Price is required',
                                setValueAs: (v) =>
                                  v === '' ? undefined : Number(v),
                                min: {
                                  value: 1,
                                  message: 'Price must be at least 1',
                                },
                                validate: (value) =>
                                  (typeof value === 'number' &&
                                    !isNaN(value)) ||
                                  'Only numbers are allowed',
                              })}
                              className="w-full border rounded-md px-2 py-1"
                            />
                          </td>

                          {/* Variant Deal Price */}
                          <td className="border px-3 py-2">
                            <input
                              type="number"
                              defaultValue={swatch.dealPrice}
                              {...register(`colorVariants.${idx}.dealPrice`, {
                                setValueAs: (v) =>
                                  v === '' ? undefined : Number(v),
                                validate: (value) => {
                                  const basePrice = getValues(
                                    `colorVariants.${idx}.price`
                                  );
                                  if (value === undefined) return true; // allow blank
                                  if (
                                    typeof value !== 'number' ||
                                    isNaN(value)
                                  ) {
                                    return 'Only numbers are allowed';
                                  }
                                  if (
                                    basePrice !== undefined &&
                                    value >= basePrice
                                  ) {
                                    return 'Deal Price must be less than Base Price';
                                  }
                                  return true;
                                },
                              })}
                              className="w-full border rounded-md px-2 py-1"
                            />
                          </td>

                          {/* Variant Deal Start Date */}
                          <td className="border px-3 py-2">
                            <input
                              type="date"
                              defaultValue={
                                swatch.dealStart
                                  ? new Date(swatch.dealStart)
                                      .toISOString()
                                      .split('T')[0]
                                  : ''
                              }
                              {...register(`colorVariants.${idx}.dealStart`)}
                              onChange={(e) => {
                                const startDateStr = e.target.value;
                                setValue(
                                  `colorVariants.${idx}.dealStart`,
                                  startDateStr
                                ); // ✅ store string only
                              }}
                              className="w-full border rounded-md px-2 py-1"
                            />
                          </td>

                          {/* Variant Deal End Date */}
                          <td className="border px-3 py-2">
                            <input
                              type="date"
                              defaultValue={
                                swatch.dealEnd
                                  ? new Date(swatch.dealEnd)
                                      .toISOString()
                                      .split('T')[0]
                                  : ''
                              }
                              {...register(`colorVariants.${idx}.dealEnd`, {
                                validate: (value) => {
                                  const start = getValues(
                                    `colorVariants.${idx}.dealStart`
                                  );
                                  if (value && start) {
                                    return (
                                      new Date(value) > new Date(start) ||
                                      'Deal End must be after Deal Start'
                                    );
                                  }
                                  return true;
                                },
                              })}
                              onChange={(e) => {
                                const endDateStr = e.target.value;
                                setValue(
                                  `colorVariants.${idx}.dealEnd`,
                                  endDateStr
                                ); // ✅ store string only
                              }}
                              className="w-full border rounded-md px-2 py-1"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Item Condition */}
              <div className="w-full flex items-start justify-end gap-3 px-4 py-2 rounded-sm">
                <p className="flex items-center justify-center gap-1">
                  <label
                    htmlFor="condition"
                    className="text-[15px] font-bold text-gray-700 py-2 shrink-0"
                  >
                    Item Condition *
                  </label>
                  <span>
                    <Info size={16} color="#333" />
                  </span>
                </p>
                <div className="w-[700px]">
                  <div className="w-[400px]">
                    <Controller
                      name="condition"
                      control={control}
                      rules={{
                        required: 'Item condition is required',
                        validate: (value) =>
                          value.trim().length > 0 ||
                          'Item condition cannot be empty',
                      }}
                      render={({ field, fieldState }) => (
                        <div className="flex flex-col gap-1">
                          <BasicDropdown
                            options={['New', 'Used', 'Renewed']}
                            value={field.value}
                            onChange={field.onChange}
                          />
                          {fieldState.error && (
                            <p className="text-red-500 text-xs mt-1">
                              {fieldState.error.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </div>
                </div>
                {errors.condition && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.condition.message as string}
                  </p>
                )}
              </div>

              {/* Shipping Options */}
              <div className="w-full flex items-start justify-end gap-3 px-4 py-2 rounded-sm">
                <p className="flex items-center justify-center gap-1">
                  <label className="text-[15px] font-bold text-gray-700 py-2 shrink-0">
                    Shipping Options *
                  </label>
                  <span>
                    <Info size={16} color="#333" />
                  </span>
                </p>
                <div className="w-[700px] ">
                  <div className="w-[600px] flex flex-col gap-2 text-[15px] px-3 py-2 border border-gray-300 rounded-md">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="self"
                        {...register('shippingOption', {
                          required: 'Please select a shipping option',
                        })}
                      />
                      I will ship the item myself
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="company"
                        {...register('shippingOption', {
                          required: 'Please select a shipping option',
                        })}
                      />
                      Fulfilled by the company
                    </label>
                  </div>
                </div>

                {errors.shippingOption && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.shippingOption.message as string}
                  </p>
                )}
              </div>

              {/* Discount Codes */}
              {isDealRoute && (
                <>
                  <div className="w-full flex items-start justify-end gap-3 bg-white px-4 py-2 rounded-sm">
                    <p className="flex items-center justify-center gap-1">
                      <label className="shrink-0 font-bold text-gray-700 py-2">
                        Select Discount Code
                      </label>
                      <span>
                        <Info size={16} color="#333" />
                      </span>
                    </p>
                    <div className="w-[700px] flex items-center justify-start text-[15px]">
                      <div className="w-[400px]">
                        <Dropdown<DiscountCode>
                          options={discountCodes}
                          getLabel={(code) =>
                            `${code.public_name} (${code.discountValue}${
                              code.discountType === 'percentage' ? '%' : '$'
                            })`
                          }
                          getValue={(code) => code.id}
                          selected={watch('discountCodes') || []}
                          multiSelect={true} // ✅ enables multi-select
                          placeholder="Select discount codes"
                          emptyMessage="No discount codes"
                          onChange={(values) =>
                            setValue('discountCodes', values as string[])
                          }
                          width="300px"
                        />

                        {errors.discountCodes && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.discountCodes.message as string}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Render discount dates */}
                  <div className="w-full flex flex-col items-center justify-center gap-3 px-4 ">
                    {/* Discount Start Date */}
                    <div className="w-full flex items-center justify-end gap-2 rounded-md">
                      <label
                        htmlFor="deal_start"
                        className="shrink-0 text-[15px] font-bold text-gray-800 mt-1"
                      >
                        Discount Start
                      </label>
                      <div className="w-[700px]">
                        <div className="w-[220px]">
                          <Controller
                            name="discount_start"
                            control={control}
                            rules={{ required: 'Start date is required' }}
                            render={({ field }) => (
                              <input
                                id="discount_start"
                                type="date"
                                value={
                                  typeof field.value === 'string'
                                    ? field.value
                                    : ''
                                } // ✅ always a string
                                onChange={(e) => {
                                  const startDateStr = e.target.value;
                                  field.onChange(startDateStr); // ✅ store string in form state
                                }}
                                className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm font-semibold text-gray-700"
                              />
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Discount End Date */}
                    <div className="w-full flex items-center justify-end gap-2 rounded-md">
                      <label
                        htmlFor="deal_start"
                        className="shrink-0 text-[15px] font-bold text-gray-800 mt-1"
                      >
                        Discount End
                      </label>
                      <div className="w-[700px]">
                        <div className="w-[220px]">
                          <Controller
                            name="discount_end"
                            control={control}
                            rules={{
                              required: 'End date is required',
                              validate: (value) => {
                                const start = watch('discount_start');
                                if (value && start) {
                                  return (
                                    new Date(value) > new Date(start) ||
                                    'Discount End must be after Discount Start'
                                  );
                                }
                                return true;
                              },
                            }}
                            render={({ field }) => (
                              <input
                                id="discount_end"
                                type="date"
                                value={
                                  typeof field.value === 'string'
                                    ? field.value
                                    : ''
                                } // ✅ always a string
                                onChange={(e) => {
                                  const endDateStr = e.target.value;
                                  field.onChange(endDateStr); // ✅ store string in form state
                                }}
                                className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm font-semibold text-gray-700"
                              />
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Total Tickets  */}
                  <div className="w-full flex items-start justify-end gap-3 bg-white px-4 py-2 rounded-sm">
                    <p className="flex items-center justify-center gap-1">
                      <label className="shrink-0 text-[15px] font-bold text-gray-700 py-2">
                        Total Tickets
                      </label>
                      <span>
                        <Info size={16} color="#333" />
                      </span>
                    </p>
                    <div className="w-[700px]">
                      <div className="w-[400px]">
                        <Input
                          label=""
                          placeholder="0"
                          type="number"
                          className="text-[15px]"
                          {...register('total_tickets', {
                            setValueAs: (v) =>
                              v === '' ? undefined : Number(v), // ✅ empty string → undefined
                            validate: (value) => {
                              if (value === undefined) return true; // ✅ allow empty
                              if (typeof value === 'number' && !isNaN(value)) {
                                if (value < 1)
                                  return 'Total tickets must be at least 1';
                                return true;
                              }
                              return 'Only numbers are allowed';
                            },
                          })}
                        />
                      </div>
                    </div>
                    {errors.total_tickets && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.total_tickets.message as string}
                      </p>
                    )}
                  </div>

                  <div className="text-sm text-gray-600 mt-1">
                    Remaining tickets:{' '}
                    <span>{availableTickets ?? total_tickets ?? 0}</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* --------------------------------------------------------------------------------- */}

      {/* <div className="w-full lg:w-full mx-auto border-t border-y-gray-200"></div> */}

      {/* Image transformation modal */}
      {openImageModal && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-[450px] text-white">
            <div className="flex justify-between items-center pb-3 mb-4">
              <h2 className="text-lg font-semibold">Enhance Product Image</h2>
              <X
                size={20}
                className="cursor-pointer"
                onClick={() => setOpenImageModal(!openImageModal)}
              />
            </div>

            <div className="relative w-full h-[250px] rounded-md overflow-hidden border border-gray-600">
              <Image
                src={selectedImage}
                alt="product-image"
                layout="fill"
                objectFit="cover"
              />
            </div>
            {selectedImage && (
              <div className="mt-4 space-y-2">
                <h3 className="text-white text-sm font-semibold">
                  AI Enhancements
                </h3>
                <div className="grid grid-cols-2 gap-3 mx-h-[250px] overflow-y-auto">
                  {enhancements?.map(({ label, effect }) => (
                    <button
                      key={effect}
                      className={`p-2 rounded-md flex items-center gap-2 ${
                        activeEffect === effect
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                      onClick={() => applyTransformation(effect)}
                      disabled={processing}
                    >
                      <Wand size={18} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Section */}
      <div className="w-[1000px] mx-auto flex items-center justify-start gap-6 mt-8 mb-8 ">
        {/* Back button */}
        <button
          type="button"
          onClick={handleBack}
          disabled={TABS.indexOf(activeTab) === 0}
          className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md disabled:opacity-50"
        >
          Back
        </button>

        {/* Next / Submit */}
        {TABS.indexOf(activeTab) < TABS.length - 1 ? (
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={handleNext}
              disabled={TABS.indexOf(activeTab) === TABS.length - 1}
              className="px-6 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
            >
              Next
            </button>
            <button
              type="button"
              disabled={!isDirty}
              onClick={handleSaveDraft}
              className="px-4 py-2 text-[#333] bg-gray-200 hover:bg-gray-300 border border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Draft
            </button>

            <button
              type="button"
              disabled={!hasDraft}
              onClick={handleLoadDraft}
              className="px-4 py-2 text-[#333] bg-gray-200 hover:bg-gray-300 border border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Load Draft
            </button>

            <button
              type="button"
              onClick={handleClearForm}
              className="px-4 py-2 text-[#333] bg-gray-200 hover:bg-gray-300 border border-gray-600 rounded-md"
            >
              Clear Form
            </button>
          </div>
        ) : (
          <div className="flex gap-6 relative">
            {/* Submit button */}
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md relative"
              disabled={loading}
            >
              <span className={loading ? 'opacity-0' : 'opacity-100'}>
                {buttonLabel}
              </span>
              {loading && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <Spinner size={16} borderColor="border-gray-200" />
                </span>
              )}
            </button>
          </div>
        )}
      </div>
    </form>
  );
}
