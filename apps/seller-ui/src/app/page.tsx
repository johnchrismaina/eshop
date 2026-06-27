'use client';

import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Globe,
  Heart,
  MapPin,
  Pencil,
  Plus,
  Star,
  Trash2,
  Users,
  XIcon,
  YoutubeIcon,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import useSeller from '../hooks/useSeller';
import { useRouter } from 'next/navigation';
// import ProductCard from '../shared/components/cards/product-card';
import Spinner from 'packages/components/spinner';
import axiosProduct from '../utils/axiosProduct';
import ProductCard from 'packages/components/ProductCard';

const TABS = ['Products', 'Deals', 'Reviews'];

const fetchProducts = async () => {
  const res = await axiosProduct.get('/get-shop-products');
  return res?.data?.products;
};

const fetchDeals = async () => {
  const res = await axiosProduct.get('/get-shop-deals');
  return res?.data?.deals;
};

const SellerProfile = () => {
  const { seller, isLoading } = useSeller();
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('Products');
  const [editType, setEditType] = useState<'cover' | 'avatar' | null>(null);
  const router = useRouter();

  // edit modal states
  type Link = { title: string; url: string };
  const [editShopModal, setEditShopModal] = useState(false);
  const [bio, setBio] = useState('');
  const [address, setAddress] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [website, setWebsite] = useState('');
  const [links, setLinks] = useState<Link[]>([] as Link[]);

  const [selectedShop, setSelectedShop] = useState(seller?.shops?.[0]);

  // When modal opens, initialize fields from seller.shop
  useEffect(() => {
    if (editShopModal && seller?.shop) {
      setBio(seller.shop.bio || '');
      setAddress(seller.shop.address || '');
      setOpeningHours(seller.shop.opening_hours || '');
      setWebsite(seller.shop.website || '');
      setLinks(seller.shop.socialLinks || [{ title: '', url: '' }]);
    }
  }, [editShopModal, seller]);

  const addLink = () => {
    setLinks((prev) => [...prev, { title: '', url: '' }]);
  };

  const updateLink = (index: number, field: 'title' | 'url', value: string) => {
    setLinks((prev) => {
      const updated = [...prev] as Link[];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeLink = (index: number) => {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!seller?.id || !seller?.shop?.id) return;
    await fetch('/api/shop/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sellerId: seller.id,
        shopId: seller.shop.id,
        bio,
        address,
        opening_hours: openingHours,
        website,
        socialLinks: links,
      }),
    });
    setEditShopModal(false);
  };
  // edit modal states

  useEffect(() => {
    if (!seller && !isLoading) {
      router.push('/login');
    }
  }, [seller, isLoading]);

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: deals = [], isLoading: dealsLoading } = useQuery({
    queryKey: ['deals'],
    queryFn: fetchDeals,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const capitalizeWords = (str: string) => {
    if (!str) return '';
    return str
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Debug: log products and deals to verify data
  console.log('SellerProfile products:', products);
  console.log('SellerProfile deals:', deals);

  const joinedDate = selectedShop?.createdAt
    ? new Date(selectedShop.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center gap-2">
          <Spinner size={16} borderColor="border-gray-300" />
        </div>
      ) : (
        <div className="w-full bg-gray-900 min-h-screen px-8 pb-12">
          {/* Back to Dashboard Button */}
          <div className="w-full px-3 py-2">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-1 text-gray-300 bg-gray-800 hover:bg-gray-700 transition px-4 py-2 rounded-full text-sm"
            >
              <ArrowLeft size={20} />
              <span className="font-medium ">Dashboard</span>
            </button>
          </div>

          {/* Cover Photo */}
          <div
            className="relative w-full bg-gray-800 
                aspect-[4/1] sm:aspect-[5/1] lg:aspect-[6/1]"
          >
            <Image
              src={
                selectedShop?.coverBanner ||
                'https://ik.imagekit.io/johnchrismaina/fashion-banner.png'
              }
              alt="Shop Cover"
              fill
              priority
              className="object-cover"
            />

            {/* Overlay */}
            <div
              className="absolute inset-0 bg-gradient-to-t 
                  from-black/50 via-black/20 to-transparent"
            />

            {seller?.id && (
              <button
                className="absolute top-2 right-2 sm:top-3 sm:right-3
                 bg-black/60 backdrop-blur-md
                 px-3 py-1.5 sm:px-4 sm:py-2
                 rounded-md text-xs sm:text-sm
                 font-semibold flex items-center gap-2 text-white"
                onClick={() => setEditType('cover')}
              >
                <Pencil size={16} /> Edit Cover
              </button>
            )}
          </div>

          {/* Seller Info Section */}
          <div className="w-full lg:w-full mt-2 mx-auto relative z-20 flex flex-col lg:flex-row gap-6">
            <div className="bg-[#111827] p-4 rounded-lg shadow-lg flex-1">
              <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                <div className="relative w-[160px] h-[160px] rounded-full overflow-hidden">
                  {/* avatar */}
                  <Image
                    src={
                      selectedShop?.avatar ||
                      'https://ik.imagekit.io/johnchrismaina/3d-portrait-businessman-min.jpg'
                    }
                    alt="Shop Avatar"
                    layout="fill"
                    objectFit="cover"
                  />
                  {seller?.id && (
                    <label
                      className="absolute bottom-1 right-1 bg-gray-700 p-2 rounded-full flex items-center justify-center"
                      onClick={() => setEditType('avatar')}
                    >
                      <Pencil size={16} className="text-white" />
                    </label>
                  )}
                </div>

                <div className="flex-1 w-full">
                  <h1 className="text-2xl font-semibold text-white">
                    {selectedShop?.name
                      ? capitalizeWords(selectedShop.name)
                      : 'No shop name available'}
                  </h1>

                  {/* bio */}
                  <p className="text-gray-400 text-sm mt-2">
                    {selectedShop?.bio || 'No bio available.'}
                  </p>

                  {/* address & opening hours */}
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    {/* address */}
                    <div className="flex items-center gap-1 mt-1 text-gray-400">
                      <MapPin size={16} />{' '}
                      <span>
                        {selectedShop?.address || 'No address provided'}
                      </span>
                    </div>

                    {/* opening hours */}
                    <div className="flex items-center gap-1 mt-1 text-gray-400">
                      <Clock size={16} />
                      <span>
                        {selectedShop?.opening_hours ||
                          'Mon - Sat: 8 AM - 6 PM'}
                      </span>
                    </div>
                  </div>

                  {/* Ratings */}
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center text-yellow-400 gap-1">
                      <Star fill="#facc15" size={16} />{' '}
                      <span>{selectedShop?.ratings || 'N/A'}</span>
                    </div>
                    <div className="flex items-center text-gray-300 gap-1">
                      <Users size={16} />{' '}
                      <span>{selectedShop?.followers} Followers</span>
                    </div>
                  </div>

                  {seller?.id ? (
                    <button
                      className="px-6 py-2 mt-2 h-[40px] rounded-lg text-sm font-semibold flex items-center gap-2 text-gray-200 bg-gray-800 hover:bg-gray-700 transition"
                      // onClick={() => router.push('/edit-profile')}
                      onClick={() => setEditShopModal(true)}
                    >
                      <Pencil size={16} /> Edit Profile
                    </button>
                  ) : (
                    <button
                      className={`px-6 py-2 mt-2 h-[40px] rounded-lg text-sm font-semibold flex items-center gap-2 transition ${
                        isFollowing
                          ? 'bg-gray-700 text-white'
                          : 'bg-blue-600 text-white'
                      }`}
                      onClick={() => setIsFollowing(!isFollowing)}
                    >
                      <Heart size={18} />
                      {isFollowing ? 'Unfollow' : 'Follow'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Review from here */}

            <div className="bg-gray-800 px-8 py-4 rounded-lg shadow-lg w-full lg:w-[30%]">
              <h2 className="text-xl font-semibold text-slate-200">
                Shop Details
              </h2>

              <div className="flex items-center gap-3 mt-3 text-slate-200">
                <Calendar size={18} />
                <span>{joinedDate && `Joined on ${joinedDate}`}</span>
              </div>

              {selectedShop?.website && (
                <div className="flex items-center gap-3 mt-3 text-slate-200">
                  <Globe size={18} />
                  <Link
                    href={selectedShop?.website}
                    className="hover:underline text-blue-600"
                  >
                    {selectedShop?.website}
                  </Link>
                </div>
              )}

              {selectedShop?.socialLinks &&
                selectedShop?.socialLinks.length > 0 && (
                  <div className="mt-3">
                    <h3 className="text-slate-700 text-lg font-medium">
                      Follow Us:
                    </h3>
                    <div className="flex gap-3 mt-2">
                      {selectedShop?.socialLinks?.map(
                        (link: any, index: number) => (
                          <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="opacity-[.9]"
                          >
                            {link.type === 'youtube' && <YoutubeIcon />}
                            {link.type === 'X' && <XIcon />}
                          </a>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* Tabs Section */}
          <div className="w-full lg:w-full mx-auto">
            {/* Tabs */}
            <div className="flex border-b border-gray-700 rounded-lg overflow-hidden">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 px-4 text-base font-semibold ${
                    activeTab === tab
                      ? 'text-slate-200 border-b-2 border-slate-200'
                      : 'text-slate-400'
                  } transition`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="bg-white my-4 text-slate-700">
              {/* Products Tab */}
              {activeTab === 'Products' && (
                <div className="m-auto items-center grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 p-5">
                  {productsLoading && (
                    <>
                      {Array.from({ length: 10 }).map((_, index) => (
                        <div
                          key={index}
                          className="h-[250px] bg-gray-300 animate-pulse rounded-xl"
                        ></div>
                      ))}
                    </>
                  )}
                  {products?.map((product: any) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                  {products?.length === 0 && (
                    <p className="py-2">No products available yet!</p>
                  )}
                </div>
              )}

              {/* Deals Tab */}
              {activeTab === 'Deals' && (
                <div className="m-auto items-center grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 p-5">
                  {/* isDealsLoading */}
                  {dealsLoading && (
                    <>
                      {Array.from({ length: 10 }).map((_, index) => (
                        <div
                          key={index}
                          className="h-[250px] bg-gray-300 animate-pulse rounded-xl"
                        ></div>
                      ))}
                    </>
                  )}
                  {deals?.map((deal: any) => (
                    <ProductCard
                      isDeal={true}
                      key={deal.id}
                      product={{ ...deal, ratings: deal.ratings ?? 4 }}
                    />
                  ))}
                  {deals?.length === 0 && (
                    <p className="py-2">No offers available yet!</p>
                  )}
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'Reviews' && (
                <div>
                  <p className="text-center py-5">No Reviews available yet!</p>
                </div>
              )}
            </div>
          </div>

          {editShopModal && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-[#1f1f1f] w-full max-w-xl p-6 rounded-xl max-h-[85vh] overflow-y-auto text-gray-200">
                <div className="relative flex items-center justify-between mb-6">
                  <h1 className="text-xl font-semibold text-white flex items-center gap-2">
                    {selectedShop?.name
                      ? capitalizeWords(selectedShop.name)
                      : 'Shop Details'}
                  </h1>

                  <div className="flex items-center justify-center p-2 hover:bg-gray-700 rounded-full cursor-pointer transition">
                    <button>
                      <XIcon
                        size={20}
                        className=" text-gray-400 rounded-full transition "
                        onClick={() => setEditShopModal(false)}
                      />
                    </button>
                  </div>
                </div>

                {/* DESCRIPTION */}
                <h3 className="text-gray-400 font-semibold mb-2">
                  Description
                </h3>
                <textarea
                  className="w-full bg-gray-800 rounded-md p-3 mb-6 min-h-[140px]"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />

                {/* ADDRESS */}
                <h3 className="text-gray-400 font-semibold mb-2">Address</h3>
                <input
                  className="w-full bg-gray-800 rounded-md p-2 mb-6"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />

                {/* OPENING HOURS */}
                <h3 className="text-gray-400 font-semibold mb-2">
                  Opening Hours
                </h3>
                <input
                  className="w-full bg-gray-800 rounded-md p-2 mb-6"
                  value={openingHours}
                  onChange={(e) => setOpeningHours(e.target.value)}
                />

                {/* WEBSITE */}
                <h3 className="text-gray-400 font-semibold mb-2">Website</h3>
                <input
                  className="w-full bg-gray-800 rounded-md p-2 mb-6"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />

                {/* DYNAMIC LINKS */}
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-gray-400 font-semibold">Links</h3>
                  <button
                    onClick={addLink}
                    className="text-gray-400 hover:text-white"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                {links.map((link, index) => (
                  <div key={index} className="flex gap-2 mb-3">
                    <input
                      placeholder="Link title"
                      className="flex-1 bg-gray-800 rounded-md p-2"
                      value={link.title}
                      onChange={(e) =>
                        updateLink(index, 'title', e.target.value)
                      }
                    />

                    <input
                      placeholder="URL"
                      className="flex-1 bg-gray-800 rounded-md p-2"
                      value={link.url}
                      onChange={(e) => updateLink(index, 'url', e.target.value)}
                    />

                    <button
                      onClick={() => removeLink(index)}
                      className="text-red-400 hover:text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}

                {/* SAVE BUTTON */}
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={handleSave}
                    className="flex-1 py-3 bg-blue-600 rounded-md font-semibold"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setEditShopModal(false)}
                    className="flex-1 py-3 bg-gray-600 rounded-md font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default SellerProfile;
