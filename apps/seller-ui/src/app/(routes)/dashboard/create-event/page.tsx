'use client';

import { useForm, Controller } from 'react-hook-form';
import { useState } from 'react';
// import { useRouter } from 'next/router';
import axiosProduct from 'apps/seller-ui/src/utils/axiosProduct';
import toast from 'react-hot-toast';
import RichTextEditor from 'packages/components/rich-text-editor';
import { ChevronRight } from 'lucide-react';
import Input from 'packages/components/input';
import { useRouter } from 'next/navigation';

const Page = () => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);

      const payload = {
        title: data.title,
        slug: generateSlug(data.title),
        category: data.category,
        short_description: data.short_description,
        detailed_description: data.detailed_description,
        location: data.location,
        start_date: data.start_date,
        end_date: data.end_date,
        ticket_price: data.ticket_price ? parseFloat(data.ticket_price) : null,
        total_tickets: parseInt(data.total_tickets),
        images: [], // Add image uploader later if needed
      };

      await axiosProduct.post('/create-event', payload);

      toast.success('Event created successfully!');
      router.push('/dashboard/all-events');
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="w-full mx-auto p-8 shadow-md rounded-lg text-white"
      onSubmit={handleSubmit(onSubmit)}
    >
      {/* Heading */}
      <h2 className="text-2xl py-2 font-semibold font-poppins">Create Event</h2>

      <div className="flex items-center mb-6">
        <span className="text-[#80Deea] cursor-pointer">Dashboard</span>
        <ChevronRight size={20} className="opacity-[.8]" />
        <span>Create Event</span>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left Column */}
        <div>
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
            placeholder="Music, Tech, Business..."
            {...register('category', { required: true })}
          />

          <Input
            label="Location *"
            placeholder="Berlin, Germany"
            {...register('location', { required: true })}
          />

          <Input
            type="textarea"
            rows={5}
            label="Short Description *"
            placeholder="Quick summary of the event"
            {...register('short_description', { required: true })}
          />
        </div>

        {/* Right Column */}
        <div>
          <Controller
            name="detailed_description"
            control={control}
            rules={{ required: 'Detailed description is required' }}
            render={({ field }) => (
              <RichTextEditor value={field.value} onChange={field.onChange} />
            )}
          />

          <Input
            type="text"
            label="Start Date *"
            {...register('start_date', { required: true })}
          />

          <Input
            type="text"
            label="End Date *"
            {...register('end_date', { required: true })}
          />

          <Input
            type="number"
            step="0.01"
            label="Ticket Price (Leave empty if free)"
            {...register('ticket_price')}
          />

          <Input
            type="number"
            label="Total Tickets *"
            {...register('total_tickets', { required: true })}
          />
        </div>
      </div>

      {/* Submit */}
      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-md"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Event'}
        </button>
      </div>
    </form>
  );
};

export default Page;
