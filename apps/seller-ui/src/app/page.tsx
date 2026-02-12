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
  Star,
  Users,
  XIcon,
  YoutubeIcon,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import useSeller from '../hooks/useSeller';
import { useRouter } from 'next/navigation';
import ProductCard from '../shared/components/cards/product-card';
import Spinner from 'packages/components/spinner';

const TABS = ['Products', 'Offers', 'Reviews'];

const fetchProducts = async () => {
  const res = await axiosInstance.get('/product/api/get-shop-products');
  const products = res.data.products?.filter((i: any) => !i.starting_date);
  return products;
};

const fetchEvents = async () => {
  const res = await axiosInstance.get('/product/api/get-shop-products');
  const products = res.data.products?.filter((i: any) => i.starting_date);
  return products;
};

const SellerProfile = () => {
  const { seller, isLoading } = useSeller();
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('Products');
  const [editType, setEditType] = useState<'cover' | 'avatar' | null>(null);
  const router = useRouter();

  const { data: products = [] } = useQuery({
    queryKey: ['shop-products'],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (!seller && !isLoading) {
      router.push('/login');
    }
  }, [seller, isLoading]);

  const { data: events = [] } = useQuery({
    queryKey: ['shop-events'],
    queryFn: fetchEvents,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center gap-2">
          <Spinner size={16} borderColor="border-gray-300" />
        </div>
      ) : (
        <div className="w-full bg-gray-900 min-h-screen">
          {/* Back to Dashboard Button */}
          <div className="w-full px-3 pt-2">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">back to Dashboard</span>
            </button>
          </div>

          {/* Cover Photo */}
          <div className="relative w-full flex justify-center bg-gray-800">
            <Image
              src={
                seller?.shop?.coverBanner ||
                'https://ik.imagekit.io/johnchrismaina/fashion-banner.png?updatedAt=1767450141321'
              }
              alt="Seller Cover"
              className="w-full h-[400px] object-cover"
              width={1200}
              height={300}
            />
            {seller?.id && (
              <button
                className="absolute top-3 right-3 bg-gray-700 px-3 py-2 rounded-md flex items-center gap-2 text-gray-200"
                onClick={() => setEditType('cover')}
              >
                <Pencil size={16} /> Edit Cover
              </button>
            )}
          </div>

          {/* Seller Info Section */}
          <div className="w-[85%] lg:w-[70%] mt-[-50px] mx-auto relative z-20 flex flex-col lg:flex-row gap-6">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex-1">
              <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                <div className="relative w-[100px] h-[100px] rounded-full border-4 border-slate-700 overflow-hidden">
                  <Image
                    src={
                      seller?.shop?.avatar ||
                      'https://ik.imagekit.io/johnchrismaina/3d-portrait-businessman-min.jpg'
                    }
                    alt="Seller Avatar"
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
                    {seller?.shop?.name}
                  </h1>
                  <p className="text-gray-400 text-sm mt-1">
                    {seller?.shop?.bio || 'No bio available.'}
                  </p>

                  {/* Ratings */}
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center text-yellow-400 gap-1">
                      <Star fill="#facc15" size={18} />{' '}
                      <span>{seller?.shop?.ratings || 'N/A'}</span>
                    </div>
                    <div className="flex items-center text-gray-300 gap-1">
                      <Users size={18} />{' '}
                      <span>{seller?.followers} Followers</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-3 text-gray-400">
                    <Clock size={18} />
                    <span>
                      {seller?.shop?.opening_hours || 'Mon - Sat: 9 AM - 6 PM'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-3 text-gray-400">
                    <MapPin size={18} />{' '}
                    <span>
                      {seller?.shop?.address || 'No address provided'}
                    </span>
                  </div>
                </div>

                {seller?.id ? (
                  <button
                    className="px-6 py-2 h-[40px] rounded-lg font-semibold flex items-center gap-2 text-gray-200 bg-gray-600"
                    onClick={() => router.push('/edit-profile')}
                  >
                    <Pencil size={16} /> Edit Profile
                  </button>
                ) : (
                  <button
                    className={`px-6 py-2 h-[40px] rounded-lg font-semibold flex items-center gap-2 transition ${
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

            {/* Review from here */}

            <div className="bg-gray-200 p-6 rounded-lg shadow-lg w-full lg:w-[30%]">
              <h2 className="text-xl font-semibold text-slate-900">
                Shop Details
              </h2>

              <div className="flex items-center gap-3 mt-3 text-slate-700">
                <Calendar size={18} />
                <span>
                  Joined At:{' '}
                  {new Date(seller?.shop?.createdAt!).toLocaleDateString()}
                </span>
              </div>

              {seller.shop?.website && (
                <div className="flex items-center gap-3 mt-3 text-slate-700">
                  <Globe size={18} />
                  <Link
                    href={seller.shop?.website}
                    className="hover:underline text-blue-600"
                  >
                    {seller.shop?.website}
                  </Link>
                </div>
              )}

              {seller.shop?.socialLinks &&
                seller.shop?.socialLinks.length > 0 && (
                  <div className="mt-3">
                    <h3 className="text-slate-700 text-lg font-medium">
                      Follow Us:
                    </h3>
                    <div className="flex gap-3 mt-2">
                      {seller.shop?.socialLinks?.map(
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
          <div className="w-[85%] lg:w-[70%] mx-auto mt-8">
            {/* Tabs */}
            <div className="flex">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 px-6 text-lg font-semibold ${
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
            <div className="bg-gray-200 rounded-lg my-4 text-slate-700">
              {/* Products Tab */}
              {activeTab === 'Products' && (
                <div className="m-auto grid grid-cols-1 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {isLoading && (
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

              {/* Offers Tab */}
              {activeTab === 'Offers' && (
                <div className="m-auto grid grid-cols-1 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {/* isEventsLoading */}
                  {isLoading && (
                    <>
                      {Array.from({ length: 10 }).map((_, index) => (
                        <div
                          key={index}
                          className="h-[250px] bg-gray-300 animate-pulse rounded-xl"
                        ></div>
                      ))}
                    </>
                  )}
                  {events?.map((product: any) => (
                    <ProductCard
                      isEvent={true}
                      key={product.id}
                      product={product}
                    />
                  ))}
                  {products?.length === 0 && (
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
        </div>
      )}
    </>
  );
};

export default SellerProfile;
