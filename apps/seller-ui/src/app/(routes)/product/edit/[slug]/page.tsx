'use client';
// import ImagePlaceholder from 'apps/seller-ui/src/shared/components/image-placeholder';
import CustomSpecifications from 'packages/components/custom-specifications';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useParams } from 'next/navigation';
import axiosProduct from 'apps/seller-ui/src/utils/axiosProduct';
import Breadcrumbs from 'apps/seller-ui/src/shared/components/breadcrumbs';
import { enhancements } from 'apps/seller-ui/src/utils/AI.enhancements';
import Input from 'packages/components/input';
import {
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  PlusIcon,
  Wand,
  X,
  XIcon,
} from 'lucide-react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { useWatch } from 'react-hook-form';
// import RichTextEditor from 'packages/components/rich-text-editor';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import { validateWordCount } from 'apps/seller-ui/src/utils/validation';
import AutoResizeTextarea from 'packages/components/AutoResizeTextArea';
import Spinner from 'packages/components/spinner';
import CustomAccordion from 'apps/seller-ui/src/shared/components/CustomAccordion';
import CustomProperties from 'packages/components/custom-properties';
import SizeSelector from 'packages/components/size-selector';
import ColorSelector from 'packages/components/color-selector';
import ImagePlaceholder from 'apps/seller-ui/src/shared/components/image-placeholder';
import ImagePlaceholderPreview from 'apps/seller-ui/src/shared/components/ImagePlaceholder';
import HoverMagnifier from 'packages/components/HoverMagnifier/HoverMagnifier';
import ZoomImage from 'packages/components/HoverMagnifier/HoverMagnifier';

const RichTextEditor = dynamic(
  () => import('packages/components/rich-text-editor'),
  { ssr: false }
);

type Specification = { name: string; value: string };

// Backend shape
type ProductImage = {
  file_id: string;
  url: string;
};

interface UploadedImage {
  fileId: string;
  file_url: string;
}

type Product = {
  id: string;
  title: string;
  images: ProductImage[];
  tags: string[]; // ✅ array instead of string
  slug: string;
  category: string;
  subCategory: string;
  short_description: string;
  detailed_description: string;
  custom_properties?: Record<string, string | number | boolean>;
  product_specifications: Specification[];
  colors: string[];
  sizes: string[];
  video_url?: string;
  regular_price: number;
  sale_price: number;
  deal_start: Date | null;
  deal_end: Date | null;
  total_tickets: number;
  stock: number;
  discountCodes: string[];
  enableDeal: boolean;
  // ✅ Add accordions
  product_details?: {
    title: string;
    content: string;
  }[];
};

// Frontend form shape
// type FormImage = {
//   fileId: string;
//   file_url: string;
// };

type FormImage = {
  fileId?: string;
  file_url: string; // always present
};

// type FormProduct = Omit<Product, 'images'> & {
//   images: FormImage[];
// };

type FormProduct = Omit<Product, 'images'> & {
  images: (FormImage | null)[];
};

export default function EditProductPage() {
  const { slug } = useParams(); // get slug from URL
  // const { register, control, handleSubmit, reset } = useForm<Product>();
  // const [images, setImages] = useState<string[]>([]);

  // const [images, setImages] = useState<FormImage[]>([]);
  const [images, setImages] = useState<(FormImage | null)[]>([]);

  const [product, setProduct] = useState<Product | null>(null);

  const pathname = usePathname();
  // const isDealRoute = pathname.includes('create-deal');

  // Detect which route we're on
  // const isDeal = pathname.includes('create-deal');
  const title = 'Edit Product';

  const {
    register,
    control,
    setValue,
    getValues,
    watch,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormProduct>({
    defaultValues: {
      title: '',
      regular_price: undefined,
      sale_price: undefined,
      short_description: '',
      detailed_description: '',
      product_details: [],
      slug: '',
      tags: [],
      category: '',
      subCategory: '',
      video_url: '',
      deal_start: null,
      deal_end: null,
      total_tickets: undefined,
      stock: undefined,
      discountCodes: [],
      enableDeal: false,
      product_specifications: [],
      custom_properties: {},
      // images: [], // start empty, populate via reset
      // images: [] as FormImage[], // ✅ explicitly typed
      images: [] as (FormImage | null)[], // ✅ explicitly typed
    },
  });

  const enableDeal = watch('enableDeal');

  const [openImageModal, setOpenImageModal] = useState(false);
  const [activeEffect, setActiveEffect] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [processing, setProcessing] = useState(false);
  const [pictureUploadingLoader, setPictureUploadingLoader] = useState(false);

  const uploadedImages: (UploadedImage | null)[] = images.map((img) =>
    img ? { fileId: img.fileId ?? '', file_url: img.file_url } : null
  );

  // const [hoveredImage, setHoveredImage] = useState<string | null>(
  //   images[0]?.file_url ?? null
  // );

  // const [hoveredImage, setHoveredImage] = useState<string | null>(
  //   images[0]?.file_url ?? null
  // );

  // const [hoveredImage, setHoveredImage] = useState<string | null>(null);

  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // const categories = data?.categories || [];
  // const subCategoriesData = data?.subCategories || {};

  // const selectedCategory = watch('category');
  const regularPrice = watch('regular_price');

  // const subcategories = useMemo(() => {
  //   return selectedCategory ? subCategoriesData[selectedCategory] || [] : [];
  // }, [selectedCategory, subCategoriesData]);

  const [aspect, setAspect] = useState<'square' | 'portrait'>('square');
  const [openAspectRatio, setOpenAspectRatio] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const options = [
    { value: 'square', label: 'Square (850 × 850)' },
    { value: 'portrait', label: 'Portrait (765 × 1020)' },
  ];

  // Start with the first available image, or null
  const [hoveredImage, setHoveredImage] = useState<string | null>(
    images.find((img) => img?.file_url)?.file_url ?? null
  );

  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setImageLoaded(false); // reset opacity transition whenever hoveredImage changes
  }, [hoveredImage]);

  useEffect(() => {
    const stillExists = images.some((img) => img?.file_url === hoveredImage);
    if (!stillExists) {
      setHoveredImage(images.find((img) => img?.file_url)?.file_url ?? null);
    }
  }, [images]);

  //-----------------------------------------------

  const fetchCategories = async () => {
    const res = await axiosProduct.get('/get-categories');
    return res.data;
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  console.log(new Date().toLocaleString(), 'Fetched categories:', data);

  // Watch the selected category (pre-populated from productDetails)
  const selectedCategory = useWatch({ control, name: 'category' });

  useEffect(() => {
    async function fetchProduct() {
      const res = await axiosProduct.get(`/get-product/${slug}`);
      const { product } = res.data;

      // store product in state
      setProduct(product);

      // map backend images into FormImage[]
      let mappedImages = product.images.map((img: ProductImage) => {
        console.log('Fetched image from backend:', img.url);
        return {
          fileId: img.file_id,
          file_url: img.url,
        };
      });

      // ✅ Always ensure one trailing empty slot if under 8
      if (
        mappedImages.length < 8 &&
        mappedImages[mappedImages.length - 1] !== null
      ) {
        mappedImages.push(null);
      }

      // reset form with product data
      reset({
        ...product,
        sale_price: product.sale_price || 0,
        deal_start: product.deal_start ? new Date(product.deal_start) : null,
        deal_end: product.deal_end ? new Date(product.deal_end) : null,
        enableDeal: !!product.isDeal,
        images: mappedImages,
      });

      // ✅ sync local state with trailing empty slot
      setImages(mappedImages);
      console.log('Edit page images state after sync:', mappedImages);
    }

    if (slug) fetchProduct();
  }, [slug, reset]);

  const handleImageChange = (file: File | null, index: number) => {
    const currentImages = [...images];

    if (file) {
      // Replace or insert at index
      const newImage: FormImage = {
        fileId: undefined, // new uploads don’t have an ID yet
        file_url: URL.createObjectURL(file),
      };
      currentImages[index] = newImage;
    } else {
      // Clear slot
      currentImages[index] = null;
    }

    // ✅ Always ensure one trailing empty slot if under 8
    if (
      currentImages.length < 8 &&
      currentImages[currentImages.length - 1] !== null
    ) {
      currentImages.push(null);
    }

    setImages(currentImages);
    setValue('images', currentImages);
  };

  const handleRemoveImage = (index: number) => {
    const currentImages = images; // same source of truth handleImageChange uses
    const image = currentImages[index];

    setRemovedImageIds((prev) => [
      ...prev,
      ...(image?.fileId ? [image.fileId] : []),
    ]);

    const updatedImages = currentImages.filter((_, i) => i !== index);

    // Keep a trailing empty slot for uploading, same rule as handleImageChange
    if (
      updatedImages.length < 8 &&
      updatedImages[updatedImages.length - 1] !== null
    ) {
      updatedImages.push(null);
    }

    setImages(updatedImages);
    setValue('images', updatedImages);
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

  //   Fetch discount codes
  const { data: discountCodes = [], isLoading: discountLoading } = useQuery({
    queryKey: ['shop-discounts'],
    queryFn: async () => {
      const res = await axiosProduct.get('/get-discount-codes');
      return res?.data?.discount_codes || [];
    },
  });

  // Accept FormProduct values
  const onSubmit: SubmitHandler<FormProduct> = async (values) => {
    // Normalize images into backend shape
    const normalizedImages = values.images
      .filter((img): img is FormImage => img !== null) // ✅ remove nulls
      .map((img) => ({
        fileId: img.fileId, // keep fileId for persisted images
        file_url: img.file_url, // preview or existing URL
      }));

    // Build payload for backend
    const payload = {
      ...values,
      images: normalizedImages, // ✅ only valid images
      removedImageIds,
    };

    try {
      await axiosProduct.put(`/update-product/${slug}`, payload);
      alert('Product updated!');
    } catch (err) {
      console.error('💥 Error updating product:', err);
      alert('Failed to update product');
    }
  };

  console.log('Edit page images state:', images);

  return (
    <form
      className="w-full mx-auto px-0 py-0 shadow-md rounded-lg text-[#fff]"
      onSubmit={handleSubmit(onSubmit)}
    >
      {/* Heading & Breadcrumbs */}
      <div className="grid grid-cols-[500px_minmax(300px,1fr)] gap-4 py-0 bg-[#f5f5f7] border-b border-gray-300">
        {/* Dashboard button & Heading */}
        <div className="flex items-center justify-start gap-6 w-full px-8 py-2">
          <button
            onClick={() => router.push('/dashboard/')}
            className="flex items-center gap-1 text-gray-800 bg-gray-200 hover:bg-gray-300 transition px-4 py-2 rounded-full text-sm"
          >
            <ChevronLeft size={20} />
            <span className="font-medium ">Dashboard</span>
          </button>
          <h2 className="text-[18px] font-bold text-gray-800">{title}</h2>
        </div>
      </div>

      {/* Content layout */}
      <div className="w-full bg-[#f5f5f5] px-8 pt-6 pb-6 grid grid-cols-1 lg:grid-cols-[minmax(500px,650px)_minmax(300px,1fr)_244px] gap-2">
        {/* left column container*/}
        <div className="flex items-start justify-between px-0 bg-[#F5F5F5] w-[650px] h-auto mx-auto">
          {/* Images Section */}
          {/* <div className="flex flex-col items-center w-[580px] mx-auto"> */}
          {/* Thumbnails */}
          <div className="flex flex-col gap-1">
            {uploadedImages.map((img, index) => (
              <ImagePlaceholder
                key={index}
                size={aspect === 'square' ? '850 x 850' : '765 x 1020'}
                small={index !== 0}
                aspect={aspect}
                pictureUploadingLoader={pictureUploadingLoader}
                images={uploadedImages}
                index={index}
                onImageChange={handleImageChange}
                onRemove={handleRemoveImage}
                // ✅ setHoveredImage when hovering/clicking
                setSelectedImage={(url) => setHoveredImage(url)}
                setOpenImageModal={setOpenImageModal}
                defaultImage={img?.file_url ?? null}
              />
            ))}
          </div>

          {/* Main preview */}
          <div className="w-[540px] rounded-lg mb-6">
            <div
              className={`relative w-full ${
                aspect === 'square' ? 'aspect-square' : 'aspect-[3/4]'
              }`}
            >
              {hoveredImage ? (
                <Image
                  src={hoveredImage} // ✅ no key here
                  alt="Product preview"
                  fill
                  onLoad={() => setImageLoaded(true)}
                  className={`object-cover rounded-none transition-opacity duration-75 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  unoptimized
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-gray-100 border border-dashed border-gray-300">
                  <span className="text-gray-500">Upload product image</span>
                </div>
              )}
            </div>
          </div>
          {/* </div> */}
        </div>

        {/* Middle column - product details */}
        <div className="px-4 pb-1 prose prose-sm max-w-none">
          {/* Dropdown */}
          <div
            ref={dropdownRef}
            // className="relative inline-block text-left ml-14 "
            className="relative flex flex-col items-start justify-center text-left px-4 p-4 bg-white rounded-md mb-2"
          >
            <label className="block text-[15px] font-semibold  text-gray-700 mb-1">
              Image Aspect Ratio
            </label>
            {/* Button */}
            <button
              type="button"
              onClick={() => setOpenAspectRatio(!openAspectRatio)}
              className="border border-gray-300 rounded-md px-4 py-2 text-[15px] text-gray-700 hover:bg-gray-50 w-[320px] flex justify-between items-center"
            >
              Aspect Ratio:{' '}
              {aspect === 'square'
                ? 'Square (850 × 850)'
                : 'Portrait (765 × 1020)'}
              <ChevronDown className="text-gray-600" />
            </button>

            {/* Dropdown menu */}
            {openAspectRatio && (
              <div className="absolute mt-0 py-1 w-[320px] bg-white text-gray-700 border rounded-md shadow-lg z-10">
                {options.map((opt) => (
                  <div
                    key={opt.value}
                    onClick={() => {
                      setAspect(opt.value as 'square' | 'portrait');
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

          {/* Product Title */}
          <div className="w-full px-4 p-4 bg-white rounded-md mb-2">
            <label className="block text-[15px] font-semibold  text-gray-700 mb-1">
              Product Title *
            </label>
            <AutoResizeTextarea
              label=""
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
          <div className="mt-3 w-full">
            <label className="block text-[15px] font-semibold  text-gray-700 mb-0">
              Slug *
            </label>
            <Input
              label=""
              placeholder="product_slug"
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
              className="border p-2 w-full mt-2"
            />

            {errors.slug && (
              <p className="text-red-500 text-xs mt-1">
                {errors.slug.message as string}
              </p>
            )}
          </div>

          {/* Tags */}
          <div className="mt-4 w-[500px]">
            <label className="block text-[15px] font-semibold text-gray-700 mb-1">
              Tags *
            </label>
            <Controller
              name="tags"
              control={control}
              render={({ field }) => (
                <Select
                  isMulti
                  options={[
                    { value: 'sauce', label: 'Sauce' },
                    { value: 'apple', label: 'Apple' },
                    { value: 'flagship', label: 'Flagship' },
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
                      backgroundColor: 'rgb(31 41 55)', // Tailwind bg-gray-800
                      borderColor: 'rgb(75 85 99)', // Tailwind border-gray-600
                      color: 'white',
                      borderRadius: '0.375rem', // rounded-md
                      padding: '2px',
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
              <p className="text-red-500 text-xs mt-1">
                {errors.tags.message as string}
              </p>
            )}
          </div>

          {/* Color Selector */}
          <div className="mt-3 pb-6 border-b border-gray-300">
            <ColorSelector control={control} errors={errors} />
          </div>

          {/* Size Selector */}
          <div className="mt-3 pb-6 border-b border-gray-300">
            <SizeSelector control={control} errors={errors} />
          </div>

          {/* Product/Custom Properties */}
          <div className="mt-3">
            <CustomProperties control={control} errors={errors} />
          </div>

          {/* Product Specifications */}
          <div className="mt-3">
            <CustomSpecifications control={control} errors={errors} />
          </div>

          {/* Short Description */}
          <div className="mt-4">
            <label className="block text-[15px] font-semibold text-gray-700 pb-3">
              About this item * (Min 50 words)
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
                  key={field.value} // 👈 forces re-render when value changes
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              )}
            />
            {errors.short_description && (
              <p className="text-red-500 text-xs mt-1">
                {errors.short_description.message as string}
              </p>
            )}
          </div>

          {/* Product details / Accordions */}
          <div className="mt-4 ">
            <CustomAccordion control={control} errors={errors} />{' '}
          </div>

          {/* Video Url */}
          <div className="mt-4">
            <Input
              label="Video URL"
              placeholder="https://www.youtube.com/embed/xyz123"
              {...register('video_url', {
                pattern: {
                  value:
                    /^https:\/\/(www\.)?youtube\.com\/embed\/[a-zA-Z0-9_-]+$/,
                  message:
                    'Invalid Youtube embed URL! Use format: https://youtube.com/embed/xyz123',
                },
              })}
            />
            {errors.video_url && (
              <p className="text-red-500 text-xs mt-1">
                {errors.video_url.message as string}
              </p>
            )}
          </div>
        </div>
        {/* Right column - form inputs */}
        <div className="bg-[#fff] border-l border-gray-200 w-[244px] px-5 py-2 rounded-md ">
          {/* Category */}
          <div className="">
            <label className="block font-semibold text-[15px] text-gray-700 mb-1">
              Category *
            </label>
            <div className="relative mb-3">
              {isLoading ? (
                <p className="text-gray-400">Loading Categories...</p>
              ) : isError ? (
                <p className="text-red-500">Failed to load categories</p>
              ) : (
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: 'Category is required' }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full p-2 text-gray-700 rounded-md border outline-none border-gray-700 bg-transparent appearance-none"
                    >
                      <option value="" disabled className="bg-gray-100">
                        Select Category
                      </option>
                      {data?.categories?.map((category: string) => (
                        <option
                          key={category}
                          value={category}
                          className="bg-gray-100 text-gray-700"
                        >
                          {category}
                        </option>
                      ))}
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
              <p className="text-red-500 text-xs mt-1">
                {errors.category.message as string}
              </p>
            )}
          </div>

          {/* Sub Categories */}
          <div className="mt-3">
            <label className="block font-semibold text-[15px] text-gray-700 mb-1">
              Sub-category *
            </label>
            <div className="relative mb-2">
              <Controller
                name="subCategory"
                control={control}
                rules={{ required: 'Subcategory is required' }}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full p-2 text-gray-700 rounded-md border outline-none border-gray-700 bg-transparent appearance-none"
                  >
                    <option value="">Select Subcategory</option>
                    {selectedCategory &&
                      data?.subCategories?.[selectedCategory]?.map(
                        (subcategory: string) => (
                          <option
                            key={subcategory}
                            value={subcategory}
                            className="bg-gray-100 text-gray-700 "
                          >
                            {subcategory}
                          </option>
                        )
                      )}
                  </select>
                )}
              />
              {/* Custom arrow */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                <ChevronDown />
              </div>
            </div>

            {errors.subCategory && (
              <p className="text-red-500 text-xs mt-1">
                {errors.subCategory.message as string}
              </p>
            )}
          </div>

          {/* Regular Price */}
          <div className=" ">
            <p className="text-[15px] font-semibold text-gray-700 py-2">
              Regular Price * <span className="text-xs">(KES)</span>
            </p>
            <Input
              label=""
              type="number"
              placeholder="0"
              className="bg-[#fff] text-[15px]"
              {...register('regular_price', {
                setValueAs: (v) => (v === '' ? undefined : Number(v)),
                min: { value: 1, message: 'Price must be at least 1' },
                validate: (value) =>
                  (typeof value === 'number' && !isNaN(value)) ||
                  'Only numbers are allowed',
              })}
            />
            {errors.regular_price && (
              <p className="text-red-500 text-xs mt-1">
                {errors.regular_price.message as string}
              </p>
            )}
          </div>

          {/* Sale Price (only if deal enabled) */}
          {enableDeal && (
            <div className="mt-2">
              <p className="text-[15px] font-semibold text-gray-700 py-2">
                Sale Price <span className="text-xs">(KES)</span>
              </p>
              <Input
                label=""
                type="number"
                placeholder="0"
                className="bg-[#fff] text-[15px]"
                {...register('sale_price', {
                  setValueAs: (v) => (v === '' ? undefined : Number(v)),
                  min: { value: 1, message: 'Sale price must be at least 1' },
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
          )}

          {/* Deal fields */}
          {enableDeal && (
            <div className="flex flex-col gap-2 mt-3 pb-6 px-2 py-2 bg-gray-100 rounded-md">
              {/* Deal Start Date */}
              <label className="text-sm font-medium text-gray-800 mt-1">
                Deal Start Date
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
                    className="border border-gray-500 rounded-md px-2 py-1.5 text-sm font-semibold text-gray-700 w-full"
                    dateFormat="yyyy-MM-dd"
                  />
                )}
              />
              {errors.deal_start && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.deal_start.message as string}
                </p>
              )}

              {/* Deal End Date */}
              <label className="text-sm font-medium text-gray-800 mt-1">
                Deal End Date
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
                    return value > start || 'End date must be after start date';
                  },
                }}
                render={({ field }) => (
                  <DatePicker
                    selected={field.value}
                    onChange={(date: Date | null) => field.onChange(date)}
                    className="border border-gray-500 rounded-md px-2 py-1.5 text-sm font-semibold text-gray-700 w-full"
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
          )}

          {/* Stock */}
          <div className="mt-2">
            <p className="text-[15px] font-semibold text-gray-700 py-2">
              Stock *
            </p>
            <Input
              label=""
              placeholder="0"
              type="number"
              className="bg-[#fdfdfd] text-[15px]"
              {...register('stock', {
                setValueAs: (v) => (v === '' ? undefined : Number(v)),
                min: { value: 0, message: 'Stock cannot be negative' },
                validate: (value) =>
                  (typeof value === 'number' && !isNaN(value)) ||
                  'Only numbers are allowed',
              })}
            />
            {errors.stock && (
              <p className="text-red-500 text-xs mt-1">
                {errors.stock.message as string}
              </p>
            )}
          </div>

          {/* Discount codes */}
          <div className="mt-3">
            <label className="block font-semibold text-gray-700 mb-1">
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
                <div className="mt-2">
                  <p className="text-[15px] font-semibold text-gray-700 py-2">
                    Total Tickets
                  </p>
                  <Input
                    label=""
                    placeholder="0"
                    type="number"
                    className="bg-[#fdfdfd] text-[15px]"
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
        </div>
      </div>

      {/* Product details */}
      <div className="w-full lg:w-full mx-auto border-t border-y-gray-200"></div>

      {/* Detailed product description */}
      <div className="w-full lg:w-full mx-auto px-8 pt-6">
        {/* Detailed description */}
        <div className="mt-4">
          <label className="block font-semibold text-gray-700 mb-3">
            Detailed Description * (Min 100 words)
          </label>
          <Controller
            name="detailed_description" // ✅ underscore version
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
                key={field.value} // 👈 forces re-render when value changes
                value={field.value || ''}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      </div>

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

      {/* Update button*/}
      <div className="mt-6 flex items-center justify-end px-8">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          {/* Keep the text in DOM but hide it when loading */}
          <span className={loading ? 'opacity-0' : 'opacity-100'}>
            Update Product
          </span>

          {/* Spinner centered absolutely */}
          {loading && (
            <span className="absolute inset-0 flex items-center justify-center">
              <Spinner size={16} borderColor="border-gray-200" />
            </span>
          )}
        </button>
      </div>
    </form>
  );
}
