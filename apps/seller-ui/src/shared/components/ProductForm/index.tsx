'use client';
import { useQuery } from '@tanstack/react-query';
import ImagePlaceholder from 'apps/seller-ui/src/shared/components/image-placeholder';
import { enhancements } from 'apps/seller-ui/src/utils/AI.enhancements';
import axiosProduct from 'apps/seller-ui/src/utils/axiosProduct';
import { ChevronDown, Info, Wand, X } from 'lucide-react';
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
import React, { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import Select from 'react-select';
import { usePathname } from 'next/navigation';
import DatePicker from 'react-datepicker';
import CustomAccordion from '../CustomAccordion';
import { validateWordCount } from 'apps/seller-ui/src/utils/validation';
import AutoResizeTextarea from 'packages/components/AutoResizeTextArea';
import ColorVariantsEditor from 'apps/seller-ui/src/shared/components/ColorVariantsEditor';
import { splitSchema } from 'packages/utils/filtersUtils';
import { renderFilterRow } from 'packages/utils/renderFilterRow';
// import { categories } from 'packages/utils/shopCategories.json';

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

// interface ShopCategory {
//   value: string;
//   label: string;
//   subCategories?: ShopCategory[];
// }

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

interface ColorVariant {
  id?: string;
  title: string;
  hex: string;
  price: number;
  dealPrice?: number;
  dealStart?: Date | null;
  dealEnd?: Date | null;
  // images: string[];
  images: (UploadedImage | null)[]; // ✅ form-only
}

interface ProductDetails {
  regular_price: number;
  sale_price?: number;
  enableDeal?: boolean;
  colorVariants?: ColorVariant[];
}

export type FormValues = {
  title: string;
  aspect: 'square' | 'portrait';
  images: (UploadedImage | null)[];
  regular_price: number | undefined;
  sale_price: number | undefined;
  short_description: string;
  slug: string;
  tags: string[];
  category: string;
  subCategory: string;
  product_specifications: { label: string; value: string }[];
  detailed_description: string;
  video_url: string;
  deal_start: Date | null;
  deal_end: Date | null;
  stock: number | undefined;
  total_tickets: number | undefined;
  discountCodes: string[];
  enableDeal: boolean;
  accordions?: { title: string; content: string }[];
  // ✅ new field
  // colorVariants?: ColorVariantForm[];
  colorVariants: ColorVariant[];
};

export default function ProductForm({
  mode = 'create',
  product,
}: {
  mode: 'create' | 'edit';
  product?: FormValues;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isDealRoute = pathname.includes('create-deal');

  const {
    control,
    register,
    setValue,
    getValues,
    watch,
    handleSubmit,
    reset,
    formState: { errors },
    clearErrors,
  } = useForm<FormValues>({
    defaultValues:
      product ??
      ({
        title: '',
        aspect: 'square',
        images: Array(8).fill(null),
        regular_price: undefined,
        sale_price: undefined,
        short_description: '',
        accordions: [],
        slug: '',
        tags: [],
        category: 'Clothing & Apparel',
        subCategory: "Women's Clothing",
        product_specifications: [],
        detailed_description: '',
        video_url: '',
        deal_start: null,
        deal_end: null,
        stock: undefined,
        total_tickets: undefined,
        discountCodes: [],
        enableDeal: isDealRoute,
        // ✅ initialize empty colorVariants array
        colorVariants: [],
      } as FormValues),
  });

  useEffect(() => {
    if (mode === 'edit' && product) {
      reset(product);
    }
  }, [mode, product, reset]);

  const enableDeal = watch('enableDeal');

  const [hasColors, setHasColors] = useState(false);
  const [openImageModal, setOpenImageModal] = useState(false);

  // const [isChanged, setIsChanged] = useState(true);
  const [isChanged] = useState(true);
  const [activeEffect, setActiveEffect] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState('');

  const colorVariants = watch('colorVariants') ?? [];

  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);

  const [pictureUploadingLoader, setPictureUploadingLoader] = useState(false);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  // const router = useRouter();

  const [activeTab, setActiveTab] = useState(TABS[0]);

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

  // Inside ProductForm, alongside `mode`, `isDealRoute`, `product` (whatever these are already destructured from)
  const draftKey =
    mode === 'edit'
      ? `colorVariantsDraft-edit-${product?.slug}`
      : `colorVariantsDraft-create-${isDealRoute ? 'deal' : 'product'}`;

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

  //   Fetch categories
  const { data, isLoading, isError } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const res = await axiosProduct.get('/get-categories');
        return res.data;
      } catch (error) {
        console.log(error);
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  //   Fetch discount codes
  const { data: discountCodes = [], isLoading: discountLoading } = useQuery({
    queryKey: ['shop-discounts'],
    queryFn: async () => {
      const res = await axiosProduct.get('/get-discount-codes');
      return res?.data?.discount_codes || [];
    },
  });

  // const categories = data?.categories || [];
  // const subCategoriesData = data?.subCategories || {};

  const selectedCategory = watch('category');
  const specs = watch('product_specifications');

  const regularPrice = watch('regular_price');

  // const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [openCategories, setOpenCategories] = useState(false);
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const [currentLevel, setCurrentLevel] = useState<ShopCategory[]>([]);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  // path leading TO the level currently being displayed (never includes a leaf label)
  const [levelPath, setLevelPath] = useState<string[]>([]);

  // const filters = getFiltersForCategory(selectedPath, categories);
  const { inherited, groups } = getFiltersGrouped(selectedPath, categories);

  //---------------------------

  const categoryButtonRef = useRef<HTMLDivElement>(null);

  const { sellerFilters } = splitSchema(categories);

  const [openAspectRatio, setOpenAspectRatio] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [aspect, setAspect] = useState<'square' | 'portrait'>('square');

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
      setSelectedValue(cat.value);
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
      const isSelected = isLeaf && selectedValue === cat.value;

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

  // Load Draft on Page Mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('productDraft');
    if (savedDraft) {
      const parsed = JSON.parse(savedDraft);

      // ✅ restore form values
      Object.keys(parsed).forEach((key) => {
        if (key !== 'activeTab') {
          setValue(key as keyof FormValues, parsed[key]);
        }
      });

      // ✅ restore tab
      if (parsed.activeTab && TABS.includes(parsed.activeTab)) {
        setActiveTab(parsed.activeTab);
      }
    }
  }, [setValue]);

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

  // console.log(categories, subCategoriesData);

  // const convertFiletoBase64 = (file: File) => {
  //   return new Promise((resolve, reject) => {
  //     const reader = new FileReader();
  //     reader.readAsDataURL(file);
  //     reader.onload = () => resolve(reader.result);
  //     reader.onerror = (error) => reject(error);
  //   });
  // };

  //-----------------------------------------------

  const handleMainImageUpload = (index: number, file: File | null) => {
    const updated = [...mainImages];
    updated[index] = file
      ? { fileId: crypto.randomUUID(), file_url: URL.createObjectURL(file) }
      : null;
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
      const payload = {
        ...data,
        images: (data.images || []).filter(
          (img) => img && img.file_url && img.fileId
        ),
      };
      if (mode === 'create') {
        if (isDealRoute || data.enableDeal) {
          await axiosProduct.post('/create-deal', payload);
          localStorage.removeItem(draftKey); // ✅
          router.push('/dashboard/all-deals');
        } else {
          await axiosProduct.post('/create-product', payload);
          localStorage.removeItem(draftKey); // ✅
          router.push('/dashboard/all-products');
        }
      } else {
        await axiosProduct.put(`/update-product/${product?.slug}`, payload);
        localStorage.removeItem(draftKey); // ✅
        router.push('/dashboard/all-products');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Something went wrong');
    }
  };

  // ✅ Save Draft (no validation)
  const handleSaveDraft = () => {
    const draftData = getValues(); // ✅ grab all current form values
    localStorage.setItem(
      mode === 'create' ? 'productDraft' : `editDraft-${product?.slug}`,
      JSON.stringify({
        ...draftData,
        activeTab, // ✅ also save which tab they were on
      })
    );
    toast.success('Draft saved!');
  };

  // load the draft from localStorage and set it as default values
  useEffect(() => {
    const savedDraft = localStorage.getItem(
      mode === 'create' ? 'productDraft' : `editDraft-${product?.slug}`
    );
    if (savedDraft) {
      const parsed = JSON.parse(savedDraft);
      Object.keys(parsed).forEach((key) => {
        setValue(key as keyof FormValues, parsed[key]);
      });
      if (parsed.activeTab && TABS.includes(parsed.activeTab)) {
        setActiveTab(parsed.activeTab);
      }
    }
  }, [mode, product?.slug, setValue]);

  return (
    <form
      className="w-full mx-auto px-0 py-4 rounded-lg text-white"
      onSubmit={handleSubmit(onSubmit)}
    >
      {/* Tabs Section */}
      <div className="w-full lg:w-full mx-auto bg-[#f6f6f6]">
        {/* Tabs */}
        <div className="flex justify-center border-b border-gray-400 overflow-hidden mx-8">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button" // ✅ prevents accidental form submission
              // onClick={() => setActiveTab(tab)}
              onClick={() => handleTabChange(tab)}
              className={`py-3 px-4 text-base font-semibold ${
                activeTab === tab
                  ? 'text-[#000] border-b-2 border-[#FEA417]'
                  : 'text-[#1d1d1f]'
              } transition`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="py-0 text-slate-700">
          {/* Product Identity */}
          {activeTab === 'Product Identity' && (
            <div className="w-[700px] flex flex-col mx-auto items-center justify-start gap-3 py-4">
              {/* Product Title */}
              <div className="w-full p-3 bg-white rounded-md ">
                <label className="block text-[14px] font-bold  text-gray-800 mb-2">
                  Product Title *
                </label>
                <AutoResizeTextarea
                  label=""
                  rows={2}
                  placeholder="Enter product title"
                  {...register('title', { required: 'Title is required' })}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.title.message as string}
                  </p>
                )}
              </div>
              {/* Slug */}
              <div className="mt-0 w-full p-3 bg-white rounded-md">
                <label className="block text-[14px] font-bold text-gray-700 mb-2">
                  Slug *
                </label>
                <Input
                  label=""
                  placeholder="product_slug"
                  className="bg-[#fff]"
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
                      value: 50,
                      message: 'Slug cannot be longer than 50 characters.',
                    },
                  })}
                />

                {errors.slug && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.slug.message as string}
                  </p>
                )}
              </div>
              {/* --- DROPDOWN --- */}
              <div className="relative w-full flex flex-col items-center justify-start gap-3 p-3 bg-white rounded-md">
                <label className="w-full flex items-center justify-start gap-3">
                  <span className="block text-sm font-medium mb-1">
                    Category:
                  </span>
                  <div
                    className="flex flex-col gap-1 w-full relative"
                    ref={categoryButtonRef}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenCategories(true)}
                      className="w-[400px] h-10 px-3 border border-gray-200 rounded-md text-sm font-medium text-left flex items-center justify-between focus:outline-none focus:border-[#C2410C] focus:ring-2 focus:ring-[#C2410C]/20 transition-shadow"
                    >
                      {selectedPath.length > 0
                        ? selectedPath[selectedPath.length - 1]
                        : 'Select Category'}
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
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white w-full max-w-md h-full flex flex-col">
                          {/* Header */}
                          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                            <h2 className="text-lg font-medium">
                              Choose Category
                            </h2>
                            <button
                              type="button"
                              onClick={() => setOpenCategories(false)}
                              className="p-1"
                            >
                              <svg
                                className="w-5 h-5 text-gray-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>

                          {/* Scrollable category list */}
                          <div className="flex-1 overflow-y-auto p-4">
                            {levelPath.length > 0 && (
                              <button
                                type="button"
                                onClick={handleBackCategories}
                                className="w-full flex items-center gap-2 px-3 py-2 mb-2 text-sm font-medium text-[#C2410C] hover:bg-gray-50 rounded-md"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 19l-7-7 7-7"
                                  />
                                </svg>
                                Back
                                {levelPath.length > 1
                                  ? ` to ${levelPath[levelPath.length - 2]}`
                                  : ' to Categories'}
                              </button>
                            )}
                            {renderOptions()}
                          </div>

                          {/* Confirm button */}
                          <div className="p-4 border-t border-gray-200">
                            <button
                              type="button"
                              onClick={() => setOpenCategories(false)}
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
                </label>

                {/* Breadcrumb rail */}
                <div className="w-full flex items-center justify-start gap-2 px-4 py-2 border border-gray-300 rounded-lg">
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
              {/* Categories */}
              <div className="w-full mt-0 items-center justify-between gap-4 p-0 rounded-md hidden">
                {/* Category */}
                <div className="flex-1">
                  <label className="block font-semibold text-[15px] text-gray-700 mb-1">
                    Category *
                  </label>
                  <div className="relative mb-2">
                    {isLoading ? (
                      <p className="text-gray-700">Loading Categories...</p>
                    ) : isError ? (
                      <p className="text-red-500">Failed to load categories</p>
                    ) : (
                      <Controller
                        name="category"
                        control={control}
                        rules={{ required: 'Categories is required' }}
                        render={({ field }) => (
                          <select
                            {...field}
                            className="w-full px-2 py-1.5 rounded-md border outline-none border-gray-400 text-gray-700 bg-transparent appearance-none"
                          >
                            <option
                              value=""
                              className="bg-gray-100 text-gray-700"
                            >
                              Select
                            </option>
                            {/* {data?.categories?.map((c: any) => (
                              <option
                                key={c.id}
                                value={c.name}
                                className="bg-gray-200 text-gray-800"
                              >
                                {c.name}
                              </option>
                            ))} */}
                          </select>
                        )}
                      />
                    )}
                    {/* Custom arrow */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                      <ChevronDown />
                    </div>
                  </div>
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.category.message as string}
                    </p>
                  )}
                </div>

                {/* Sub Categories */}
                <div className="flex-1">
                  <label className="block font-semibold text-[15px] text-gray-700 mb-1">
                    Sub-category *
                  </label>
                  <div className="relative mb-2">
                    <Controller
                      name="subCategory"
                      control={control}
                      rules={{ required: 'Subcategories is required' }}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full px-2 py-1.5 rounded-md border outline-none border-gray-400 text-gray-700 bg-transparent appearance-none"
                        >
                          <option
                            value=""
                            className="bg-gray-100 text-gray-700"
                          >
                            Select
                          </option>
                          {/* {subcategories.map((subcategory: string) => (
                            <option
                              key={subcategory}
                              value={subcategory}
                              className="bg-gray-200 text-gray-800"
                            >
                              {subcategory}
                            </option>
                          ))} */}
                        </select>
                      )}
                    />

                    {/* Custom arrow */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                      <ChevronDown />
                    </div>
                  </div>

                  {errors.subCategory && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.subCategory.message as string}
                    </p>
                  )}
                </div>
              </div>
              {/* Tags */}
              <div className="mb-10 w-full p-0 rounded-md hidden">
                <label className="block text-[15px] font-semibold text-gray-700 mb-1">
                  Tags *
                </label>
                <Controller
                  name="tags"
                  control={control}
                  rules={{
                    required: 'Separate related product tags with a comma',
                  }}
                  render={({ field }) => (
                    <Select
                      isMulti
                      options={[
                        { value: 'sauce', label: 'Sauce' },
                        { value: 'apple', label: 'Apple' },
                        { value: 'flagship', label: 'Flagship' },
                        // ✅ Add more options or fetch dynamically
                      ]}
                      value={(field.value || []).map((tag: string) => ({
                        value: tag,
                        label: tag,
                      }))}
                      onChange={(selected) =>
                        field.onChange(selected.map((s: any) => s.value))
                      }
                      styles={{
                        control: (base) => ({
                          ...base,
                          backgroundColor: 'rgb(253 253 253)', // fdfdfd
                          borderColor: 'rgb(156 163 175)', // border-gray-400
                          color: 'rgb(31 41 55)', // Tailwind bg-gray-800
                          borderRadius: '0.375rem', // rounded-md
                          padding: '5px',
                          boxShadow: 'none',
                          '&:hover': { borderColor: 'rgb(107 114 128)' }, // gray-500
                        }),
                        menu: (base) => ({
                          ...base,
                          backgroundColor: 'rgb(31 41 55)', // bg-gray-800
                          border: '1px solid rgb(75 85 99)', // border-gray-600
                        }),
                        option: (base, { isFocused, isSelected }) => ({
                          ...base,
                          backgroundColor: isSelected
                            ? 'rgb(55 65 81)' // bg-gray-700
                            : isFocused
                            ? 'rgb(75 85 99)' // bg-gray-600
                            : 'rgb(31 41 55)', // bg-gray-800
                          color: 'white',
                          cursor: 'pointer',
                        }),
                        multiValue: (base) => ({
                          ...base,
                          backgroundColor: 'rgb(55 65 81)', // bg-gray-700
                          padding: '2px',
                          borderRadius: '0.375rem',
                        }),
                        multiValueLabel: (base) => ({
                          ...base,
                          color: 'rgb(229 231 235)', // text-gray-200
                        }),
                        multiValueRemove: (base) => ({
                          ...base,
                          color: 'rgb(156 163 175)', // text-gray-400
                          ':hover': {
                            backgroundColor: 'rgb(239 68 68)', // red-500
                            color: 'white',
                          },
                        }),
                      }}
                    />
                  )}
                />
                {errors.tags && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.tags.message as string}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Product Details */}
          {activeTab === 'Product Details' && (
            <div className="w-[700px] flex flex-col mx-auto items-center justify-center gap-3 py-4 ">
              {/* Product Specifications */}
              {/* General Attributes (inherited filters) */}
              {/* General Attributes */}
              {inherited.length > 0 && (
                <div className="w-full mb-4">
                  <h3 className="text-lg font-bold pb-2">General Attributes</h3>
                  {inherited.map((filter, idx) =>
                    renderFilterRow({
                      filter,
                      idx,
                      length: inherited.length,
                      mode: 'seller', // or "customer"
                    })
                  )}
                </div>
              )}

              {/* Category-specific filter groups */}
              {groups.map((group) => (
                <div key={group.title} className="w-full mb-4">
                  <h3 className="text-lg font-bold pb-2">{group.title}</h3>
                  {group.filters.map((filter, idx) =>
                    renderFilterRow({
                      filter,
                      idx,
                      length: group.filters.length,
                      mode: 'seller', // or "customer"
                    })
                  )}
                </div>
              ))}

              {/* ))} */}
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
            <div className="w-[700px] flex flex-col mx-auto items-start justify-center gap-3 py-4 ">
              {/* Short Description */}
              <div className="w-full p-0 rounded-md ">
                <label className="block font-bold text-gray-700 pb-3">
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
                    <RichTextEditor
                      id="short-description-editor" // ✅ unique id
                      value={field.value || ''}
                      onChange={field.onChange}
                      className="bg-white"
                    />
                  )}
                />
                {errors.short_description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.short_description.message as string}
                  </p>
                )}
              </div>

              {/* Product details / Accordions */}
              <div className="w-full p-0 rounded-md ">
                <CustomAccordion control={control} errors={errors} />{' '}
              </div>

              {/* Dropdown */}
              <div className="w-full flex flex-col items-start justify-start gap-1 mb-0 p-0 rounded-md">
                <label className="block font-bold  text-gray-700 mb-1">
                  Image Aspect Ratio
                </label>
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
              <div
                className={`relative w-full mx-auto bg-[#F5F5F5] p-0 rounded-md mt-0 ${
                  hasColors ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                <h2 className="flex items-center gap-2 font-bold text-gray-700 pb-2">
                  {hasColors ? (
                    <>
                      <Info className="w-4 h-4 text-yellow-600" />
                      <span className="text-yellow-800">
                        Main images disabled, color swatches are active
                      </span>
                    </>
                  ) : (
                    'Main Images'
                  )}
                </h2>

                {/* Main Image Upload Section */}
                <div className="grid grid-cols-4 gap-3 mt-0">
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

                {/* ✅ Single floating preview modal */}
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

              {/* Color Variants Editor */}
              <ColorVariantsEditor
                draftKey={draftKey}
                aspect={watch('aspect')} // ✅
                onHasColorsChange={setHasColors}
                setValue={setValue} // ✅ forward from useForm
              />

              {/* Color Selector */}
              <div className="w-full mt-0 p-0 rounded-md">
                <ColorSelector control={control} errors={errors} />
              </div>

              {/* Size Selector */}
              <div className="w-full mt-0 p-0 rounded-md">
                <SizeSelector control={control} errors={errors} />
              </div>

              {/* Video Url */}
              <div className="w-full pt-2 rounded-md">
                <label className="block text-[15px] font-bold text-gray-700 mb-1">
                  Video Url *
                </label>
                <Input
                  label=""
                  placeholder="https://www.youtube.com/embed/xyz123"
                  className="bg-[#fff]"
                  {...register('video_url', {
                    pattern: {
                      value:
                        /^https:\/\/(www\.)?youtube\.com\/embed\/[a-zA-Z0-9_-]+$/,
                      message:
                        'Invalid Youtube embed url URL! Use format: https://youtube.com/embed/xyz123',
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
              <div className="w-full lg:w-full mx-auto px-0 pt-1">
                {/* Detailed description */}
                <div className="mt-4">
                  <label className="block font-bold text-gray-700 mb-3">
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
                      <RichTextEditor
                        id="detailed-description-editor" // ✅ unique id
                        value={field.value || ''}
                        onChange={field.onChange}
                        className="bg-white"
                      />
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
            <div className="w-[700px] flex flex-col mx-auto items-start justify-center gap-2 py-4 ">
              <div className="space-y-6">
                {/* Case 1: No color variants → global pricing */}
                {colorVariants.length === 0 && (
                  <>
                    {/* Pricing */}
                    {/* Regular Price */}
                    <div className="flex-1 w-full">
                      <p className="text-[15px] font-semibold text-gray-700 py-2">
                        Regular Price * <span className="text-sm">(Ksh)</span>
                      </p>
                      <Input
                        label=""
                        type="number"
                        placeholder="0"
                        className="bg-[#fff] text-[15px] "
                        {...register('regular_price', {
                          setValueAs: (v) => (v === '' ? undefined : Number(v)),
                          min: {
                            value: 1,
                            message: 'Price must be at least 1',
                          },
                          validate: (value) =>
                            (typeof value === 'number' && !isNaN(value)) ||
                            'Only numbers are allowed',
                        })}
                      />
                      {errors.regular_price && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.regular_price.message as string}
                        </p>
                      )}
                    </div>

                    {/* Deal toggle */}
                    {/* Checkbox to toggle deal */}
                    <label className="flex items-center gap-2 font-semibold mt-2">
                      <input
                        id="deal-checkbox"
                        type="checkbox"
                        checked={enableDeal}
                        onChange={(e) =>
                          setValue('enableDeal', e.target.checked)
                        }
                      />
                      Add a Deal
                    </label>

                    {/* Sale Price */}
                    {/* Sale Price input (always rendered, disabled when not a deal) */}
                    <div className="flex-1 w-full">
                      <p className="text-[15px] font-semibold text-gray-700 py-2">
                        Sale Price <span className="text-sm">(Ksh)</span>
                      </p>
                      <Input
                        label=""
                        type="number"
                        placeholder="0"
                        className="bg-[#fff] text-[15px]"
                        disabled={!enableDeal} // ✅ disable when not a deal
                        {...register('sale_price', {
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
                      {errors.sale_price && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.sale_price.message as string}
                        </p>
                      )}
                    </div>

                    {/* Conditionally render deal fields */}
                    <div className="flex items-start justify-center p-0 gap-4 rounded-md">
                      {/* Deal Start Date */}
                      <div className="w-full flex flex-col items-start justify-center p-0 rounded-md">
                        <label className="text-[15px] font-medium text-gray-800 mt-1">
                          Deal Start
                        </label>
                        <Controller
                          name="deal_start"
                          control={control}
                          rules={{ required: 'Start date is required' }}
                          render={({ field }) => (
                            <DatePicker
                              selected={field.value}
                              onChange={(date: Date | null) => {
                                field.onChange(date);
                                if (date) {
                                  const autoEnd = new Date(date);
                                  autoEnd.setDate(autoEnd.getDate() + 7);
                                  setValue('deal_end', autoEnd);
                                }
                              }}
                              className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm font-semibold text-gray-700 "
                              disabled={!enableDeal} // ✅ disable when not a deal
                              dateFormat="yyyy-MM-dd"
                            />
                          )}
                        />
                        {errors.deal_start && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.deal_start.message as string}
                          </p>
                        )}
                      </div>

                      {/* Deal End Date */}
                      <div className="w-full flex flex-col items-start justify-center gap-1 p-0 rounded-md">
                        <label className="text-sm font-medium text-gray-800 mt-1">
                          Deal End
                        </label>
                        <Controller
                          name="deal_end"
                          control={control}
                          rules={{
                            required: 'End date is required',
                            validate: (value) => {
                              const start = getValues('deal_start');
                              if (!value || !start) {
                                return 'Both start and end dates are required';
                              }
                              return (
                                value > start ||
                                'End date must be after start date'
                              );
                            },
                          }}
                          render={({ field }) => (
                            <DatePicker
                              selected={field.value}
                              onChange={(date: Date | null) =>
                                field.onChange(date)
                              }
                              className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm font-semibold text-gray-700 "
                              disabled={!enableDeal} // ✅ disable when not a deal
                              dateFormat="yyyy-MM-dd"
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
                  </>
                )}

                {/* Case 2: With color variants → table */}
                {colorVariants?.length > 0 && (
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
                          <td className="border px-3 py-2">{swatch.title}</td>
                          <td className="border px-3 py-2">
                            <input
                              type="number"
                              defaultValue={swatch.price}
                              {...register(`colorVariants.${idx}.price`, {
                                setValueAs: (v) =>
                                  v === '' ? undefined : Number(v),
                                min: {
                                  value: 1,
                                  message: 'Price must be at least 1',
                                },
                              })}
                              className="w-full border rounded-md px-2 py-1"
                            />
                          </td>
                          <td className="border px-3 py-2">
                            <input
                              type="number"
                              defaultValue={swatch.dealPrice}
                              {...register(`colorVariants.${idx}.dealPrice`, {
                                setValueAs: (v) =>
                                  v === '' ? undefined : Number(v),
                              })}
                              className="w-full border rounded-md px-2 py-1"
                            />
                          </td>
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
                              className="w-full border rounded-md px-2 py-1"
                            />
                          </td>
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
                              {...register(`colorVariants.${idx}.dealEnd`)}
                              className="w-full border rounded-md px-2 py-1"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Stock */}
              <div className="w-full p-0 rounded-md">
                <p className="text-[15px] font-semibold text-gray-700 py-2">
                  Stock *
                </p>
                <Input
                  label=""
                  placeholder="0"
                  type="number"
                  className="text-[15px]"
                  {...register('stock', {
                    setValueAs: (v) => (v === '' ? undefined : Number(v)),
                    min: { value: 0, message: 'Stock cannot be negative' },
                    validate: (value) =>
                      (typeof value === 'number' && !isNaN(value)) ||
                      'Only numbers are allowed',
                  })}
                />
                {errors.stock && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.stock.message as string}
                  </p>
                )}
              </div>

              {/* Discount codes */}
              <div className="w-full p-0 rounded-md">
                <label className="block font-semibold text-gray-700 py-2">
                  Select Discount Codes (optional)
                </label>

                {discountLoading ? (
                  <p className="text-gray-400">Loading discount codes...</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {discountCodes?.map((code: any) => (
                      <button
                        key={code.id}
                        type="button"
                        className={`px-3 py-1 rounded-md text-sm font-semibold border ${
                          watch('discountCodes')?.includes(code.id)
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-gray-800 text-gray-300 border-gray-600 hover:border-gray-700'
                        }`}
                        onClick={() => {
                          const currentSelection = watch('discountCodes') || [];
                          const updatedSelection = currentSelection?.includes(
                            code.id
                          )
                            ? currentSelection.filter(
                                (id: string) => id !== code.id
                              )
                            : [...currentSelection, code.id];
                          setValue('discountCodes', updatedSelection);
                        }}
                      >
                        {code?.public_name} ({code.discountValue}
                        {code.discountType === 'percentage' ? '%' : '$'})
                      </button>
                    ))}

                    {/* Total Tickets  */}
                    <div className="mt-2 mb-4">
                      <p className="text-[15px] font-semibold text-gray-700 py-2">
                        Total Tickets
                      </p>
                      <Input
                        label=""
                        placeholder="0"
                        type="number"
                        className="text-[15px]"
                        {...register('total_tickets', {
                          setValueAs: (v) => (v === '' ? undefined : Number(v)), // ✅ empty string → undefined
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
                      {errors.total_tickets && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.total_tickets.message as string}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {/* </div> */}
            </div>
          )}
        </div>
      </div>

      {/* --------------------------------------------------------------------------------- */}

      {/* Product details */}
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
      <div className="w-[700px] mx-auto flex items-center justify-start gap-6 mt-6 mb-8 bg-[#f6f6f6]">
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
          <button
            type="button"
            onClick={handleNext}
            disabled={TABS.indexOf(activeTab) === TABS.length - 1}
            className="px-6 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
          >
            Next
          </button>
        ) : (
          <div className="flex gap-6 relative">
            {isChanged && (
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md"
              >
                Save Draft
              </button>
            )}

            {/* Submit button */}
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md relative"
              disabled={loading}
            >
              <span className={loading ? 'opacity-0' : 'opacity-100'}>
                {mode === 'create' ? 'Create Product' : 'Update Product'}
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
