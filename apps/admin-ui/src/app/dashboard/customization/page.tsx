'use client';

import { useMutation } from '@tanstack/react-query';
import axiosInstance from 'apps/admin-ui/src/utils/axiosInstance';
import { AxiosError } from 'axios';
import Spinner from 'packages/components/spinner';
import React, { useState, useEffect } from 'react';
// import toast from 'react-hot-toast';
import { toast } from 'sonner';

const tabs = ['Categories', 'Logo', 'Banner'];

const Customization = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Categories');

  // Saved config (from DB)
  const [savedCategories, setSavedCategories] = useState<string[]>([]);
  const [savedSubCategories, setSavedSubCategories] = useState<
    Record<string, string[]>
  >({});
  const [savedLogo, setSavedLogo] = useState<string | null>(null);
  const [savedBanner, setSavedBanner] = useState<string | null>(null);

  // Current edits (local state)
  const [categories, setCategories] = useState<string[]>([]);
  const [subCategories, setSubCategories] = useState<Record<string, string[]>>(
    {}
  );
  const [logo, setLogo] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  const [newCategory, setNewCategory] = useState('');
  const [newSubCategory, setNewSubCategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const [message, setMessage] = useState<string | null>(null);

  // Load saved config from DB
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true); // start loading
        //   const res = await fetch('/api/site-config');
        //   const data = await res.json();
        const res = await axiosInstance.get('/admin/api/');
        const data = res.data;
        if (data) {
          setSavedCategories(data.categories || []);
          setSavedSubCategories(data.subCategories || {});
          setSavedLogo(data.logo || null);
          setSavedBanner(data.banner || null);

          // initialize local state with saved values
          setCategories(data.categories || []);
          setSubCategories(data.subCategories || {});
          setLogo(data.logo || null);
          setBanner(data.banner || null);
        }
      } catch (error) {
        console.error('Failed to fetch site config:', error);
      } finally {
        setLoading(false); // stop loading
      }
    };

    fetchConfig();
  }, []);

  //   Add new category
  const handleAddCategory = useMutation({
    mutationFn: async ({ category }: { category: string }) => {
      if (!category.trim()) return;
      const response = await axiosInstance.post('/admin/api/category', {
        category,
      });
      return response.data;
    },
    onSuccess: (data) => {
      // Update local state with new config
      setSavedCategories(data.data.categories);
      setSavedSubCategories(data.data.subCategories);

      // ✅ Toast message
      toast.success('Category saved successfully!');

      // Reset input
      setNewCategory('');
    },
    onError: (error: AxiosError) => {
      const errorMessage = (error.response?.data as { message?: string })
        ?.message;
      toast.error(errorMessage || 'Failed to add category. Please try again!');
    },
  });

  // Add sub-category
  const handleAddSubCategory = useMutation({
    mutationFn: async ({
      category,
      subCategory,
    }: {
      category: string;
      subCategory: string;
    }) => {
      if (!category || !subCategory.trim()) return;
      const response = await axiosInstance.post('/admin/api/subcategory', {
        category,
        subCategory,
      });
      return response.data;
    },
    onSuccess: (data) => {
      // Update local state with new config
      setSavedSubCategories(data.data.subCategories);

      // ✅ Toast message
      toast.success('Subcategory saved successfully!');

      // Reset input
      setNewSubCategory('');
    },
    onError: (error: AxiosError) => {
      const errorMessage = (error.response?.data as { message?: string })
        ?.message;
      toast.error(
        errorMessage || 'Failed to add subcategory. Please try again!'
      );
    },
  });

  // Add logo
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // In real app: upload file to storage (S3, local, etc.) and get URL
      const logoUrl = URL.createObjectURL(e.target.files[0]);
      const res = await fetch('/admin/api/logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logoUrl }),
      });
      const data = await res.json();
      setSavedLogo(data.config.logo);
      setMessage(data.message);
    }
  };

  // Add banner
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const bannerUrl = URL.createObjectURL(e.target.files[0]);
      const res = await fetch('/admin/api/banner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bannerUrl }),
      });
      const data = await res.json();
      setSavedBanner(data.config.banner);
      setMessage(data.message);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Customization</h1>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded ${
              activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notification */}
      {message && (
        <div
          className={`mb-4 rounded px-3 py-2 ${
            message.startsWith('❌')
              ? 'bg-red-100 text-red-700'
              : 'bg-green-100 text-green-700'
          }`}
        >
          {message}
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'Categories' && (
        <div>
          <h2 className="text-xl font-semibold mb-3">Saved Categories</h2>

          {/* Saved preview */}
          <div className="mb-8">
            {loading ? (
              <div className="flex items-center justify-start gap-2 mb-6">
                <Spinner size={16} borderColor="border-gray-300" />
                <p className="text-center text-white">Loading categories...</p>
              </div>
            ) : savedCategories.length > 0 ? (
              savedCategories.map((cat) => (
                <div key={cat} className="mb-2 text-white">
                  <strong className="block">{cat}</strong>
                  <ul className="ml-4 list-disc text-gray-300">
                    {(savedSubCategories[cat] || []).map((sub, idx) => (
                      <li key={`${cat}-${sub}-${idx}`}>{sub}</li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No categories saved yet.</p>
            )}
          </div>

          {/* Add category */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="New category"
              className="border px-2 py-1 rounded-md w-64"
            />
            <button
              onClick={() =>
                handleAddCategory.mutate({ category: newCategory })
              }
              className="bg-green-600 text-white px-4 py-1 rounded-md"
              disabled={handleAddCategory.isPending} // optional: disable while saving
            >
              {handleAddCategory.isPending ? (
                <Spinner size={16} borderColor="border-gray-200" />
              ) : (
                <>Add Category</>
              )}
            </button>
          </div>

          {/* Add subcategory */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border px-2 py-1 rounded-md w-64"
            >
              <option value="">Select category</option>
              {savedCategories.map((cat) => (
                <option key={`sel-${cat}`} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={newSubCategory}
              onChange={(e) => setNewSubCategory(e.target.value)}
              placeholder="New subcategory"
              className="border px-2 py-1 rounded-md w-64"
            />
            <button
              onClick={() =>
                handleAddSubCategory.mutate({
                  category: selectedCategory,
                  subCategory: newSubCategory,
                })
              }
              className="bg-green-600 text-white px-4 py-1 rounded-md"
              disabled={handleAddSubCategory.isPending}
            >
              {handleAddSubCategory.isPending ? (
                <Spinner size={16} borderColor="border-gray-200" />
              ) : (
                <>Add Subcategory</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Logo Tab */}
      {activeTab === 'Logo' && (
        <div>
          <h2 className="text-xl font-semibold mb-3">Saved Logo</h2>

          {/* Saved preview */}
          <div className="mb-6">
            {savedLogo ? (
              <img
                src={savedLogo}
                alt="Saved Logo"
                className="h-24 object-contain"
              />
            ) : (
              <p className="text-gray-500">No logo uploaded yet.</p>
            )}
          </div>

          {/* Upload */}
          <div className="flex items-center gap-3">
            <input type="file" accept="image/*" onChange={handleLogoUpload} />
          </div>
        </div>
      )}

      {/* Banner Tab */}
      {activeTab === 'Banner' && (
        <div>
          <h2 className="text-xl font-semibold mb-3">Saved Banner</h2>

          {/* Saved preview */}
          <div className="mb-6">
            {savedBanner ? (
              <img
                src={savedBanner}
                alt="Saved Banner"
                className="h-40 w-full object-cover rounded"
              />
            ) : (
              <p className="text-gray-500">No banner uploaded yet.</p>
            )}
          </div>

          {/* Upload */}
          <div className="flex items-center gap-3">
            <input type="file" accept="image/*" onChange={handleBannerUpload} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Customization;
