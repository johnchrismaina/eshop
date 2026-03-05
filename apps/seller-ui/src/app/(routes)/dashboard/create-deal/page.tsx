'use client';

import { useForm, Controller } from 'react-hook-form';
import { useState } from 'react';
import axiosProduct from 'apps/seller-ui/src/utils/axiosProduct';
import toast from 'react-hot-toast';
import RichTextEditor from 'packages/components/rich-text-editor';
import { Wand, X } from 'lucide-react';
import Input from 'packages/components/input';
import { useRouter } from 'next/navigation';
import Spinner from 'packages/components/spinner';
import ImagePlaceholder from 'apps/seller-ui/src/shared/components/image-placeholder';
import Image from 'next/image';
import { enhancements } from 'apps/seller-ui/src/utils/AI.enhancements';
import Breadcrumbs from 'apps/seller-ui/src/shared/components/breadcrumbs';

interface UploadedImage {
  fileId: string;
  file_url: string;
}

const Page = () => {
  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [openImageModal, setOpenImageModal] = useState(false);
  const [isChanged] = useState(true);
  const [activeEffect, setActiveEffect] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [pictureUploadingLoader, setPictureUploadingLoader] = useState(false);
  const [images, setImages] = useState<(UploadedImage | null)[]>([null]);
  const [processing, setProcessing] = useState(false);

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const regularPrice = watch('regular_price');

  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

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

      await axiosProduct.post('/create-event', payload);

      toast.success('Deal created successfully!');
      router.push('/dashboard/all-deals');
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

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
      console.log(error);
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
      <h2 className="text-2xl py-2 font-semibold font-poppins">Create Event</h2>

      {/* Breadcrumbs */}
      <Breadcrumbs title="Create Event" />

      {/* Content layout */}
      {/* <div className="grid grid-cols-2 gap-6"> */}
      <div className="py-4 w-full flex gap-6">
        {/* Left Column */}
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
            {/* Event Title */}
            <div className="w-2/4">
              <Input
                label="Event Title *"
                placeholder="Enter event title"
                {...register('title', { required: 'Title is required' })}
              />
              {errors.title && (
                <p className="text-red-500 text-sm">
                  {errors.title.message as string}
                </p>
              )}

              <Input
                label="Category *"
                placeholder="Food, Tech, Business..."
                {...register('category', { required: true })}
              />

              <Input
                label="Location *"
                placeholder="Kenya, Nairobi"
                {...register('location', { required: true })}
              />

              {/* Slug */}
              <div className="mt-2">
                <Input
                  label="Slug"
                  placeholder="product-slug"
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

              <Input
                type="textarea"
                rows={5}
                label="Short Description *"
                placeholder="Quick summary of the event"
                {...register('short_description', { required: true })}
              />
            </div>

            {/* Right Column */}
            <div className="w-2/4">
              <Controller
                name="detailed_description"
                control={control}
                rules={{ required: 'Detailed description is required' }}
                render={({ field }) => (
                  <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />

              <div className="mt-2">
                <Input
                  type="text"
                  label="Start Date *"
                  placeholder="YYYY-MM-DD"
                  {...register('start_date', {
                    required: true,
                    pattern: {
                      value: /^\d{4}-\d{2}-\d{2}$/,
                      message: 'Date must be in YYYY-MM-DD format',
                    },
                  })}
                />
                {errors.start_date && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.start_date.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  type="text"
                  label="End Date *"
                  placeholder="YYYY-MM-DD"
                  {...register('end_date', {
                    required: true,
                    pattern: {
                      value: /^\d{4}-\d{2}-\d{2}$/,
                      message: 'Date must be in YYYY-MM-DD format',
                    },
                  })}
                />
                {errors.end_date && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.end_date.message as string}
                  </p>
                )}
              </div>

              {/* Regular Price */}
              <div className="mt-2">
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

              <Input
                type="number"
                label="Total Tickets *"
                placeholder="0"
                {...register('total_tickets', { required: true })}
              />
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

      {/* Create Event */}
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
          className="px-6 py-2 bg-blue-600 text-white rounded-md"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Event'}
        </button> */}
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
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

export default Page;
