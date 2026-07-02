'use client';
import ImagePlaceholder from 'apps/seller-ui/src/shared/components/image-placeholder';
import CustomSpecifications from 'packages/components/custom-specifications';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useParams } from 'next/navigation';
import axiosProduct from 'apps/seller-ui/src/utils/axiosProduct';
import Breadcrumbs from 'apps/seller-ui/src/shared/components/breadcrumbs';
import Input from 'packages/components/input';
import { ChevronDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useWatch } from 'react-hook-form';
// import RichTextEditor from 'packages/components/rich-text-editor';
import dynamic from 'next/dynamic';
import Select from 'react-select';

const RichTextEditor = dynamic(
  () => import('packages/components/rich-text-editor'),
  { ssr: false }
);

type Specification = { name: string; value: string };

type Product = {
  id: string;
  title: string;
  images: string[];
  tags: string[]; // ✅ array instead of string
  slug: string;
  category: string;
  subCategory: string;
  short_description: string;
  detailed_description: string;
  colors: string[];
  sizes: string[];
  video_url?: string;
  regular_price: number;
  sale_price: number;
  stock: number;
  custom_specifications: Specification[];
};

export default function EditProductPage() {
  const { slug } = useParams(); // get slug from URL
  // const { register, control, handleSubmit, reset } = useForm<Product>();
  const [images, setImages] = useState<string[]>([]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Product>({
    defaultValues: {
      tags: [], // ✅ always start as an empty array
      detailed_description: '', // ✅ ensures editor starts with empty string
      short_description: '',
      category: '',
      subCategory: '',
      // ...other fields
    },
  });

  useEffect(() => {
    async function fetchProduct() {
      const res = await axiosProduct.get(`/get-product/${slug}`);
      const { product } = res.data;
      reset({
        ...product,
        tags: product.tags || [], // ✅ pre-populate as array
        detailed_description: product.detailed_description || '',
        video_url: product.video_url || '', // ✅ ensure string
        regular_price: product.regular_price || 0, // ✅ pre-populate
        sale_price: product.sale_price || 0, // ✅ pre-populate
        stock: product.stock || 0, // ✅ pre-populate
      });
      setImages(product.images.map((img: any) => img.url));
    }
    if (slug) fetchProduct();
  }, [slug, reset]);

  const fetchCategories = async () => {
    const res = await axiosProduct.get('/get-categories');
    return res.data;
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  // Watch the selected category (pre-populated from productDetails)
  const selectedCategory = useWatch({ control, name: 'category' });

  const onSubmit = async (values: Product) => {
    await axiosProduct.put(`/get-product/${slug}`, {
      ...values,
      tags: values.tags, // ✅ already array
      images,
    });
    alert('Product updated!');
  };

  const handleImageChange = (file: File | null, index: number) => {
    if (!file) return;
    const newImages = [...images];
    newImages[index] = URL.createObjectURL(file); // preview
    setImages(newImages);
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    // <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full mx-auto p-8 shadow-md rounded-lg text-white"
    >
      {/* Heading & Breadcrumbs */}
      <h2 className="text-2xl py-2 font-semibold text-white">Edit Product</h2>

      {/* Breadcrumbs */}
      <Breadcrumbs title="Edit Product" />

      {/* Content layout */}
      <div className="py-4 w-full flex gap-6">
        {/* Images Section with Preview + Title */}
        <div className="md:w-[35%]">
          {images?.length > 0 && (
            <div className="mb-4">
              <img
                src={images[0]}
                alt="Main product image"
                className="w-full h-auto border rounded"
              />
              <p className="text-sm text-gray-300 p-2">
                Main Image (slug: {slug})
              </p>
              <ImagePlaceholder
                size="765 x 850"
                small={false}
                images={images}
                pictureUploadingLoader={false}
                index={0}
                onImageChange={handleImageChange}
                onRemove={handleRemoveImage}
                setOpenImageModal={() => {}}
                setSelectedImage={() => {}}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mt-4">
            {images.slice(1).map((img, index) => (
              <div key={index} className="mb-4">
                <img
                  src={img}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-auto border rounded"
                />
                <p className="text-sm text-gray-500 mt-1">Image {index + 1}</p>
                <ImagePlaceholder
                  size="765 x 850"
                  small
                  images={images}
                  pictureUploadingLoader={false}
                  index={index + 1}
                  onImageChange={handleImageChange}
                  onRemove={handleRemoveImage}
                  setOpenImageModal={() => {}}
                  setSelectedImage={() => {}}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right side - form inputs */}
        <div className="md:w-[65%]">
          <div className="w-full flex gap-6">
            <div className="w-2/4">
              {/* Title */}
              <Input
                label="Product Title *"
                placeholder="Enter product title"
                {...register('title')}
                className="border p-2 w-full"
              />

              {/* Short description */}
              <div className="mt-2">
                <Input
                  type="textarea"
                  rows={7}
                  cols={10}
                  label="Short description * (Max 150 words)"
                  placeholder="Enter product description for quick view"
                  {...register('short_description')}
                  // placeholder="Short Description"
                  className="border p-2 w-full "
                />
              </div>

              {/* Tags */}
              <div className="mt-2">
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
                  className="border p-2 w-full mt-2"
                />
              </div>

              {/* Custom Specifications */}
              <div className="mt-3 ">
                <CustomSpecifications control={control} errors={{}} />
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
                    rules={{ required: 'Category is required' }}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full p-2 rounded-md border outline-none border-gray-700 bg-transparent appearance-none"
                      >
                        <option value="" className="bg-black">
                          Select Category
                        </option>
                        {data?.categories?.map((category: string) => (
                          <option
                            key={category}
                            value={category}
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

              {/* Sub-category */}
              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Subcategory *
                </label>
                <div className="relative">
                  <Controller
                    name="subCategory"
                    control={control}
                    rules={{ required: 'Subcategory is required' }}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full p-2 rounded-md border outline-none border-gray-700 bg-transparent appearance-none"
                      >
                        <option value="">Select Subcategory</option>
                        {selectedCategory &&
                          data?.subCategories[selectedCategory]?.map(
                            (subcategory: string) => (
                              <option
                                key={subcategory}
                                value={subcategory}
                                className="bg-black"
                              >
                                {subcategory}
                              </option>
                            )
                          )}
                      </select>
                    )}
                  />
                  {/* Custom arrow */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <ChevronDown />
                  </div>
                </div>
              </div>

              {/* Detailed description */}
              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Detailed Description * (Min 100 words)
                </label>
                <Controller
                  name="detailed_description" // ✅ underscore version
                  control={control}
                  rules={{
                    required: 'Detailed description is required!',
                    validate: (value) => {
                      const plainText = value
                        .replace(/<[^>]+>/g, '')
                        .replace(/&nbsp;/g, ' ')
                        .trim();

                      const wordCount = plainText
                        ?.split(/\s+/)
                        .filter((word: string) => word).length;

                      return (
                        wordCount >= 50 ||
                        'Description must be at least 50 words!'
                      );
                    },
                  }}
                  render={({ field }) => (
                    <RichTextEditor
                      key={field.value} // 👈 forces re-render when value changes
                      value={field.value || ''}
                      onChange={field.onChange}
                    />
                  )}
                />
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

              {/* Regular Price */}
              <div className="mt-2">
                <Input
                  label="Regular Price"
                  placeholder="$20"
                  type="number"
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
                  label="Sale Price"
                  placeholder="$15"
                  type="number"
                  {...register('sale_price', {
                    valueAsNumber: true,
                    min: { value: 0, message: 'Sale price cannot be negative' },
                    validate: (value) =>
                      !isNaN(value) || 'Only numbers are allowed',
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
                  label="Stock"
                  placeholder="100"
                  type="number"
                  {...register('stock', {
                    valueAsNumber: true,
                    min: { value: 0, message: 'Stock cannot be negative' },
                    validate: (value) =>
                      !isNaN(value) || 'Only numbers are allowed',
                  })}
                />
                {errors.stock && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.stock.message as string}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Update Product
      </button>
    </form>
  );
}
