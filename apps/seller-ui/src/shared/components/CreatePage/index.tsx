'use client';
import { useQuery } from '@tanstack/react-query';
import Breadcrumbs from 'apps/seller-ui/src/shared/components/breadcrumbs';
import ImagePlaceholder from 'apps/seller-ui/src/shared/components/image-placeholder';
import { enhancements } from 'apps/seller-ui/src/utils/AI.enhancements';
import axiosProduct from 'apps/seller-ui/src/utils/axiosProduct';
import { ChevronDown, PlusIcon, Wand, X, XIcon } from 'lucide-react';
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
import React, { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import Select from 'react-select';
import { usePathname } from 'next/navigation';
import DatePicker from 'react-datepicker';
import CustomAccordion from '../CustomAccordion';

const RichTextEditor = dynamic(
  () => import('packages/components/rich-text-editor'),
  { ssr: false }
);

interface UploadedImage {
  fileId: string;
  file_url: string;
}

type FormValues = {
  title: string;
  images: (UploadedImage | null)[];
  regular_price: number;
  sale_price: number;
  short_description: string;
  slug: string;
  tags: string[];
  category: string;
  subCategory: string;
  detailed_description: string;
  video_url: string;
  deal_start: Date | null;
  deal_end: Date | null;
  stock: number;
  discountCodes: string[];
  enableDeal: boolean;
  // ✅ Add accordions
  accordions?: {
    title: string;
    content: string;
  }[];
};

const CreatePage = () => {
  const pathname = usePathname();
  const isDealRoute = pathname.includes('create-deal');

  // Detect which route we're on
  const isDeal = pathname.includes('create-deal');
  const title = isDeal ? 'Create Deal' : 'Create Product';

  const {
    control,
    register,
    setValue,
    getValues, // ✅ add this
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      title: '',
      images: [null, null, null, null, null, null, null, null], // 8 slots
      regular_price: 0,
      sale_price: 0,
      short_description: '',
      accordions: [], // ✅ initialize accordions array
      slug: '',
      tags: [],
      category: '',
      subCategory: '',
      detailed_description: '',
      video_url: '',
      deal_start: null,
      deal_end: null,
      stock: 0,
      discountCodes: [],
      enableDeal: isDealRoute, // ✅ auto-enable toggle if on /create-deal
    },
  });

  const enableDeal = watch('enableDeal');

  const [openImageModal, setOpenImageModal] = useState(false);
  // const [isChanged, setIsChanged] = useState(true);
  const [isChanged] = useState(true);
  const [activeEffect, setActiveEffect] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [pictureUploadingLoader, setPictureUploadingLoader] = useState(false);
  const [images, setImages] = useState<(UploadedImage | null)[]>([null]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

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

  const categories = data?.categories || [];
  const subCategoriesData = data?.subCategories || {};

  const selectedCategory = watch('category');
  const regularPrice = watch('regular_price');

  const subcategories = useMemo(() => {
    return selectedCategory ? subCategoriesData[selectedCategory] || [] : [];
  }, [selectedCategory, subCategoriesData]);

  // console.log(categories, subCategoriesData);

  //   Create product function
  const onSubmit = async (data: any) => {
    try {
      setLoading(true);

      // ✅ Clean up images before sending
      const payload = {
        ...data,
        images: (data.images || []).filter(
          (img: any) => img && img.file_url && img.fileId
        ),
      };

      await axiosProduct.post('/create-product', payload);
      router.push('/dashboard/all-products');
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // const convertFiletoBase64 = (file: File) => {
  //   return new Promise((resolve, reject) => {
  //     const reader = new FileReader();
  //     reader.readAsDataURL(file);
  //     reader.onload = () => resolve(reader.result);
  //     reader.onerror = (error) => reject(error);
  //   });
  // };

  const handleImageChange = async (file: File | null, index: number) => {
    if (!file) return;
    setPictureUploadingLoader(true);

    try {
      const formData = new FormData();
      formData.append('image', file); // 'image' must match multer's field name

      const response = await axiosProduct.post(
        '/upload-product-image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // const uploadedImage: UploadedImage = {
      //   fileId: response.data.fileId,
      //   file_url: response.data.file_url,
      // };

      const uploadedImage: UploadedImage = {
        fileId: response.data.fileId ?? response.data.file_id,
        file_url: response.data.file_url ?? response.data.url,
      };

      const updatedImages = [...images];

      updatedImages[index] = uploadedImage;

      if (index === images.length - 1 && updatedImages.length < 8) {
        updatedImages.push(null);
      }

      setImages(updatedImages);
      setValue('images', updatedImages);
    } catch (error) {
      console.log(error);
    } finally {
      setPictureUploadingLoader(false);
    }

    console.log('Incoming images:', images);

    // const updatedImages = [...images];

    // updatedImages[index] = file;

    // if (index === images.length - 1 && images.length < 8) {
    //   updatedImages.push(null);
    // }

    // setImages(updatedImages);
    // setValue('images', updatedImages);
  };

  const handleRemoveImage = async (index: number) => {
    try {
      const updatedImages = [...images];

      const imageToDelete = updatedImages[index];
      if (imageToDelete && typeof imageToDelete === 'object') {
        await axiosProduct.delete('/delete-product-image', {
          data: { fileId: imageToDelete.fileId! },
        });
      }

      updatedImages.splice(index, 1);

      //  Add null placeholder
      if (!updatedImages.includes(null) && updatedImages.length < 8) {
        updatedImages.push(null);
      }

      setImages(updatedImages);
      setValue('images', updatedImages);
    } catch (error) {
      console.log(error);
    }

    // setImages((prevImages) => {
    //   let updatedImages = [...prevImages];
    //   if (index === -1) {
    //     updatedImages[0] = null;
    //   } else {
    //     updatedImages.splice(index, 1);
    //   }
    //   if (!updatedImages.includes(null) && updatedImages.length < 8) {
    //     updatedImages.push(null);
    //   }
    //   return updatedImages;
    // });
    // setValue('images', images);
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

  const handleSaveDraft = () => {};

  return (
    <form
      className="w-full mx-auto p-8 shadow-md rounded-lg text-white"
      onSubmit={handleSubmit(onSubmit)}
    >
      {/* Heading */}
      <h2 className="text-2xl py-2 font-semibold text-white">{title}</h2>

      {/* Breadcrumbs */}
      <Breadcrumbs title={title} />

      {/* Content layout */}
      <div className="py-4 w-full flex gap-6">
        {/* Left side - Image upload section */}
        <div className="md:w-[35%]">
          {images?.length > 0 && (
            <ImagePlaceholder
              setOpenImageModal={setOpenImageModal}
              size="765 x 850"
              small={false}
              images={images}
              pictureUploadingLoader={pictureUploadingLoader}
              index={0}
              onImageChange={handleImageChange}
              setSelectedImage={setSelectedImage}
              onRemove={handleRemoveImage}
            />
          )}

          <div className="grid grid-cols-2 gap-3 mt-4">
            {images.slice(1).map((_, index) => (
              <ImagePlaceholder
                setOpenImageModal={setOpenImageModal}
                size="765 x 850"
                pictureUploadingLoader={pictureUploadingLoader}
                images={images}
                key={index}
                small
                setSelectedImage={setSelectedImage}
                index={index + 1}
                onImageChange={handleImageChange}
                onRemove={handleRemoveImage}
              />
            ))}
          </div>
        </div>

        {/* Right side - form inputs */}
        <div className="md:w-[65%]">
          <div className="w-full flex gap-6">
            <div className="w-2/4">
              {/* Product Title */}

              <Input
                label="Product Title *"
                placeholder="Enter product title"
                {...register('title', { required: 'Title is required' })}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.title.message as string}
                </p>
              )}

              {/* Description */}
              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Short description * (Min 50 words)
                </label>
                <Controller
                  name="short_description"
                  control={control}
                  rules={{
                    required: 'Description is required!',
                    validate: (value) => {
                      const plainText = value
                        ?.replace(/<[^>]+>/g, '')
                        .replace(/&nbsp;/g, ' ')
                        .trim();

                      const wordCount = plainText
                        ?.split(/\s+/)
                        .filter((word) => word).length;

                      return (
                        wordCount >= 50 ||
                        'Description must be at least 50 words!'
                      );
                    },
                  }}
                  render={({ field }) => (
                    <RichTextEditor
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

              {/* Accordion */}
              <div className="mt-2">
                <CustomAccordion control={control} errors={errors} />{' '}
              </div>

              {/* Tags */}
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-200 mb-1">
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
                          backgroundColor: 'rgb(31 41 55)', // Tailwind bg-gray-800
                          borderColor: 'rgb(75 85 99)', // border-gray-600
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

              {/* Slug */}
              <div className="mt-2">
                <Input
                  label="Slug *"
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
                />

                {errors.slug && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.slug.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2 pb-6 border-b border-gray-600">
                <ColorSelector control={control} errors={errors} />
              </div>

              {/* Size selecting */}
              <div className="mt-2 pb-6 border-b border-gray-600">
                <SizeSelector control={control} errors={errors} />
              </div>

              <div className="mt-2">
                <CustomSpecifications control={control} errors={errors} />
              </div>

              <div className="mt-2">
                <CustomProperties control={control} errors={errors} />
              </div>
            </div>

            <div className="w-2/4">
              {/* Category */}
              <label className="block font-semibold text-gray-300 mb-1">
                Category *
              </label>
              <div className="relative">
                {isLoading ? (
                  <p className="text-gray-400">Loading Categories...</p>
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
                        className="w-full p-2 rounded-md border outline-none border-gray-700 bg-transparent appearance-none"
                      >
                        <option value="" className="bg-black">
                          Select Category
                        </option>
                        {categories?.map((category: string) => (
                          <option
                            value={category}
                            key={category}
                            className="bg-black"
                          >
                            {category}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                )}
                {/* Custom arrow */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronDown />
                </div>
              </div>
              {errors.category && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.category.message as string}
                </p>
              )}

              {/* Sub Categories */}
              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Subcategory *
                </label>
                <div className="relative">
                  <Controller
                    name="subCategory"
                    control={control}
                    rules={{ required: 'Subcategories is required' }}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full p-2 rounded-md border outline-none border-gray-700 bg-transparent appearance-none"
                      >
                        <option value="" className="bg-black">
                          Select Subcategory
                        </option>
                        {subcategories?.map((subcategory: string) => (
                          <option
                            value={subcategory}
                            key={subcategory}
                            className="bg-black"
                          >
                            {subcategory}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {/* Custom arrow */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <ChevronDown />
                  </div>
                </div>

                {errors.subCategory && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.subCategory.message as string}
                  </p>
                )}
              </div>

              {/* Detailed description */}
              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Detailed description * (Min 100 words)
                </label>
                <Controller
                  name="detailed_description"
                  control={control}
                  rules={{
                    required: 'Detailed description is required!',
                    validate: (value) => {
                      const plainText = value
                        ?.replace(/<[^>]+>/g, '')
                        .replace(/&nbsp;/g, ' ')
                        .trim();

                      const wordCount = plainText
                        ?.split(/\s+/)
                        .filter((word) => word).length;

                      return (
                        wordCount >= 100 ||
                        'Detailed description must be at least 100 words!'
                      );
                    },
                  }}
                  render={({ field }) => (
                    <RichTextEditor
                      value={field.value || ''}
                      onChange={field.onChange}
                    />
                  )}
                />
                {errors.detailed_description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.detailed_description.message as string}
                  </p>
                )}
              </div>

              {/* Video Url */}
              <div className="mt-2">
                <Input
                  label="Video URL"
                  placeholder="https://www.youtube.com/embed/xyz123"
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

              {/* Deal toggle */}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => {
                    if (images.length < 8) {
                      setValue('enableDeal', !getValues('enableDeal'));
                    }
                  }}
                  disabled={images.length >= 8} // ✅ disable when 8 images
                  className={`flex items-center gap-1.5 px-3 py-2 mb-2 w-[160px] rounded-md font-medium transition
                ${
                  getValues('enableDeal')
                    ? 'bg-red-700 text-white '
                    : 'bg-green-700 text-white '
                }
                ${images.length >= 8 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className="transition-transform duration-300 ease-in-out">
                    {getValues('enableDeal') ? (
                      <XIcon className="h-5 w-5 transform rotate-90" />
                    ) : (
                      <PlusIcon className="h-5 w-5 transform rotate-0" />
                    )}
                  </span>
                  {getValues('enableDeal') ? 'Remove Deal' : 'Add Deal'}
                </button>

                {images.length >= 8 && (
                  <p className="text-xs text-red-400 mt-1">
                    You’ve reached the maximum of 8 images. Remove one to enable
                    deals.
                  </p>
                )}
              </div>

              {/* Conditionally render deal fields */}
              {enableDeal && (
                <div className="flex flex-col gap-2 mt-2">
                  <label className="text-base font-semibold text-gray-300 mt-1">
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
                        className="border rounded-md px-2 py-1 text-sm font-semibold text-gray-700 w-full"
                        dateFormat="yyyy-MM-dd"
                      />
                    )}
                  />
                  {errors.deal_start && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.deal_start.message as string}
                    </p>
                  )}

                  <label className="text-base font-semibold text-gray-300 mt-1">
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
                        return (
                          value > start || 'End date must be after start date'
                        );
                      },
                    }}
                    render={({ field }) => (
                      <DatePicker
                        selected={field.value}
                        onChange={(date: Date | null) => field.onChange(date)}
                        className="border rounded-md px-2 py-1 text-sm font-semibold text-gray-700 w-full"
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

              {/* Regular Price */}
              <div className="mt-4">
                <Input
                  label="Regular Price"
                  placeholder="$20"
                  {...register('regular_price', {
                    valueAsNumber: true,
                    min: { value: 1, message: 'Price must be at least 1' },
                    validate: (value) =>
                      !isNaN(value) || 'Only numbers are allowed',
                  })}
                />
                {errors.regular_price && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.regular_price.message as string}
                  </p>
                )}
              </div>

              {/* Sale Price */}
              <div className="mt-2">
                <Input
                  label="Sale Price *"
                  placeholder="$15"
                  {...register('sale_price', {
                    required: 'Sale Price is required',
                    valueAsNumber: true,
                    min: { value: 1, message: 'Sale Price must be at least 1' },
                    validate: (value) => {
                      if (isNaN(value)) return 'Only numbers are allowed';
                      if (regularPrice && value >= regularPrice) {
                        return 'Sale Price must be less than Regular Price';
                      }
                      return true;
                    },
                  })}
                />
                {errors.sale_price && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.sale_price.message as string}
                  </p>
                )}
              </div>

              {/* Stock */}
              <div className="mt-2">
                <Input
                  label="Stock *"
                  placeholder="100"
                  {...register('stock', {
                    required: 'Stock is required',
                    valueAsNumber: true,
                    min: { value: 1, message: 'Stock must be at least 1' },
                    max: {
                      value: 1000,
                      message: 'Stock cannot exceed 1,000',
                    },
                    validate: (value) => {
                      if (isNaN(value)) return 'Only numbers are allowed';
                      if (!Number.isInteger(value))
                        return 'Stock must be a whole number!';
                      return true;
                    },
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
                <label className="block font-semibold text-gray-300 mb-1">
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
                  </div>
                )}
              </div>
            </div>
          </div>
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
      {/* Create product */}
      <div className="mt-6 flex justify-end gap-3">
        {isChanged && (
          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md"
          >
            Save Draft
          </button>
        )}
        {/* <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create'}
        </button> */}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          disabled={loading}
        >
          {/* Keep the text in DOM but hide it when loading */}
          <span className={loading ? 'opacity-0' : 'opacity-100'}>Create</span>

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
};

export default CreatePage;
