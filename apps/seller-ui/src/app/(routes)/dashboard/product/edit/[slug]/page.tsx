'use client';

import ImagePlaceholder from 'apps/seller-ui/src/shared/components/image-placeholder';
import CustomSpecifications from 'packages/components/custom-specifications';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'next/navigation';
import axiosProduct from 'apps/seller-ui/src/utils/axiosProduct';
import Breadcrumbs from 'apps/seller-ui/src/shared/components/breadcrumbs';
import Input from 'packages/components/input';

type Specification = { name: string; value: string };

type Product = {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  shortDescription: string;
  detailedDescription: string;
  tags: string[];
  warranty: string;
  slug: string;
  brand: string;
  colors: string[];
  cashOnDelivery: boolean;
  videoUrl?: string;
  regularPrice: number;
  salePrice: number;
  stock: number;
  sizes: string[];
  custom_specifications: Specification[];
  images: string[];
};

export default function EditProductPage() {
  const { slug } = useParams(); // get slug from URL
  const { register, control, handleSubmit, reset } = useForm<Product>();
  const [images, setImages] = useState<string[]>([]);

  // const fetchProduct = async (slug: string) => {
  //   const res = await axiosProduct.get(`/get-product/${slug}`);
  //   return res.data.product;
  // };

  useEffect(() => {
    async function fetchProduct() {
      const res = await axiosProduct.get(`/get-product/${slug}`);
      const { product } = res.data;
      reset(product);
      setImages(product.images.map((img: any) => img.url));
    }
    if (slug) fetchProduct();
  }, [slug, reset]);

  const onSubmit = async (values: Product) => {
    await axiosProduct.put(`/get-product/${slug}`, { ...values, images });
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
                  {...register('shortDescription')}
                  // placeholder="Short Description"
                  className="border p-2 w-full "
                />
              </div>

              {/* Tags */}
              <div className="mt-2">
                <Input
                  label="Tags *"
                  placeholder="Apple, flagship"
                  {...register('tags')}
                  className="border p-2 w-full mt-2"
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
              <Input
                {...register('category')}
                placeholder="Category"
                className="border p-2 w-full"
              />

              {/* Sub-category */}
              <Input
                {...register('subcategory')}
                placeholder="Subcategory"
                className="border p-2 w-full mt-2"
              />

              {/* Detailed description */}
              <textarea
                {...register('detailedDescription')}
                placeholder="Detailed Description"
                className="border p-2 w-full h-40 mt-2"
              />

              {/* Regular price */}
              <Input
                type="number"
                {...register('regularPrice')}
                placeholder="Regular Price"
                className="border p-2 w-full mt-2"
              />

              {/* Sale price */}
              <Input
                type="number"
                {...register('salePrice')}
                placeholder="Sale Price"
                className="border p-2 w-full mt-2"
              />

              {/* Stock */}
              <Input
                type="number"
                {...register('stock')}
                placeholder="Stock"
                className="border p-2 w-full mt-2"
              />
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
