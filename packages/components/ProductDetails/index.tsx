'use client';
import {
  ChevronUp,
  ChevronDown,
  ChevronDownIcon,
  Heart,
  MessageSquareText,
  Truck,
  Gift,
  Package,
  RotateCcw,
  ShieldCheck,
  Store,
  Info,
} from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
// import ReactImageMagnify from 'react-image-magnify';
import Ratings from '../../components/ratings';
import Link from 'next/link';
import { useStore } from 'apps/user-ui/src/store';
import useUser from 'apps/user-ui/src/hooks/useUser';
import useLocationTracking from 'apps/user-ui/src/hooks/useLocationTracking';
import useDeviceTracking from 'apps/user-ui/src/hooks/useDeviceTracking';
// import ProductCard from '../../components/cards/product-card';
import axiosProductService from 'apps/user-ui/src/utils/axiosProductService';
import { isProtected } from 'apps/user-ui/src/utils/protected';
import axiosInstance from 'apps/user-ui/src/utils/axiosInstance';
import { useRouter } from 'next/navigation';
import ProductCard from '../ProductCard';
// import { userAgent } from 'next/server';
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react';
import ZoomImage from '../HoverMagnifier/HoverMagnifier';
import Breadcrumbs from '../breadcrumbs';
import ColorThumbnail from '../ColorThumbnail/ColorThumbnail';

// const swatches = [
//   { title: 'Brown', image: '/images/brown.png', price: 5000, dealPrice: 3999 },
//   { title: 'Red', image: '/images/red.png', price: 5200 },
//   { title: 'Blue', image: '/images/blue.png', price: 4800, dealPrice: 4500 },
// ];

interface ColorVariant {
  id: string;
  name: string;
  hex: string;
  title: string;
  price: number;
  isDefault: boolean;
  images: string[];
}

type ProductImage = { url: string };
type ActiveImage = string | ProductImage;

const swatches = [
  {
    title: 'Black',
    images: [
      { url: '/images/black1.png' },
      { url: '/images/black2.png' },
      { url: '/images/black3.png' },
    ],
    price: 5000,
    dealPrice: 3999,
    aspect: 'square',
  },
  {
    title: 'Brown',
    images: [
      { url: '/images/brown1.png' },
      { url: '/images/brown2.png' },
      { url: '/images/brown3.png' },
    ],
    price: 5000,
    dealPrice: 3999,
    aspect: 'square',
  },
  {
    title: 'Red',
    images: [
      { url: '/images/red1.png' },
      { url: '/images/red2.png' },
      { url: '/images/red3.png' },
    ],
    price: 5200,
    aspect: 'portrait',
  },
];

const ProductDetails = ({ productDetails }: { productDetails: any }) => {
  // const { user, isLoading } = useUser();
  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();

  const router = useRouter();
  const [isChatLoading, setIsChatLoading] = useState(false);

  const fallbackImage =
    'https://ik.imagekit.io/johnchrismaina/products/product-1764947748099_PpFh77hy3.jpg?updatedAt=1764947756039';

  // const [currentImage, setCurrentImage] = useState(
  //   productDetails?.images[0]?.url
  // );
  const [currentImage, setCurrentImage] = useState(
    productDetails?.images?.[0]?.url || fallbackImage
  );

  // const [selectedSwatchColor, setSelectedSwatchColor] = useState<string>('');
  // const [selectedSwatch, setSelectedSwatch] = useState(swatches[0]);
  // const [selectedSwatch, setSelectedSwatch] = useState<color_variants | null>(
  //   null
  // );

  const [selectedSwatch, setSelectedSwatch] = useState<ColorVariant | null>(
    null
  );

  // Active images come from either swatch or product
  // const activeImages = selectedSwatch
  //   ? selectedSwatch.images
  //   : productDetails.images;

  const activeImages: ActiveImage[] = selectedSwatch
    ? selectedSwatch.images // string[]
    : productDetails.images; // ProductImage[]

  // Helper to get URL
  const getImageUrl = (img: ActiveImage) =>
    typeof img === 'string' ? img : img.url;

  const activeAspect = selectedSwatch ? 'square' : productDetails.aspect; // or swatch.aspect if you add it

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSelected, setIsSelected] = useState(
    productDetails?.colors?.[0] || ''
  );
  // const [isSizeSelected, setIsSizeSelected] = useState(
  //   productDetails?.sizes?.[0] || ''
  // );
  const [isSizeSelected] = useState(productDetails?.sizes?.[0] || '');
  // const [quantity, setQuantity] = useState(1);

  // const [quantity, setQuantity] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number>(1);

  // const [priceRange, setPriceRange] = useState([
  //   productDetails?.sale_price,
  //   1199,
  // ]);
  const [priceRange] = useState([productDetails?.sale_price, 1199]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);

  const addToCart = useStore((state: any) => state.addToCart);
  const cart = useStore((state: any) => state.cart);
  const isInCart = cart.some((item: any) => item.id === productDetails.id);
  const addToWishlist = useStore((state: any) => state.addToWishlist);
  const removeFromWishlist = useStore((state: any) => state.removeFromWishlist);
  const wishlist = useStore((state: any) => state.wishlist);
  const isWishlisted = wishlist.some(
    (item: any) => item.id === productDetails.id
  );

  // Navigate to previous image
  const prevImage = () => {
    if (currentIndex > 0) {
      // const newIndex = currentIndex - 1;
      setCurrentIndex(currentIndex - 1);
      setCurrentImage(productDetails?.images[currentIndex - 1]);
    }
  };

  // Navigate to next image
  const nextImage = () => {
    if (currentIndex < productDetails?.images.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentImage(productDetails?.images[currentIndex + 1]);
    }
  };

  const discountPercentage = Math.round(
    ((productDetails?.regular_price - productDetails?.sale_price) /
      productDetails?.regular_price) *
      100
  );

  const save = Math.round(
    productDetails?.regular_price - productDetails?.sale_price
  );

  const fetchFilteredProducts = async () => {
    try {
      const query = new URLSearchParams();

      query.set('priceRange', priceRange.join(','));
      query.set('page', '1');
      query.set('limit', '5');

      const res = await axiosProductService.get(
        `/product/get-filtered-products?${query.toString()}`
      );
      setRecommendedProducts(res.data.products);
      console.log(res);
    } catch (error) {
      console.error('Failed to fetch filtered products', error);
    }
  };

  useEffect(() => {
    fetchFilteredProducts();
  }, [priceRange]);

  const handleChat = async () => {
    if (isChatLoading) {
      return;
    }
    setIsChatLoading(true);

    try {
      const res = await axiosInstance.post(
        '/chatting/api/create-user-conversationGroup',
        { sellerId: productDetails?.Shop?.sellerId },
        isProtected
      );
      router.push(`/inbox?conversationId=${res.data.conversation.id}`);
    } catch (error) {
      console.log(error);
    } finally {
      setIsChatLoading(false);
    }
  };

  const [quantityOpen, setQuantityOpen] = useState(false);
  const quantityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        quantityRef.current &&
        !quantityRef.current.contains(e.target as Node)
      ) {
        setQuantityOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full bg-[#fff] px-8 text-[#1d1d1f]">
      {/* Breadcrumbs */}
      <div className=" py-3">
        {/* Breadcrumbs */}
        <Breadcrumbs />
      </div>
      <div className="w-full pt-2 pb-6 grid grid-cols-1 lg:grid-cols-[minmax(500px,650px)_minmax(300px,1fr)_280px] gap-4">
        {/* left column - product images */}
        <div className="flex items-start justify-between px-0 w-[650px] h-auto mx-auto">
          {/* Thumbnails */}
          <div className="flex flex-col items-center gap-2 relative">
            {activeImages.length > 4 && (
              <button
                className="absolute top-0 bg-white p-2 rounded-md shadow-md z-10"
                onClick={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
                disabled={currentIndex === 0}
              >
                <ChevronUp size={24} />
              </button>
            )}

            <div className="flex flex-col gap-3 overflow-y-auto">
              {activeImages.map((img: ActiveImage, index: number) => {
                const thumbHeight =
                  activeAspect === 'square' ? 75 : Math.round((75 * 4) / 3);

                const url = typeof img === 'string' ? img : img.url;

                return (
                  <img
                    key={index}
                    src={url}
                    alt="Thumbnail"
                    width={75}
                    height={thumbHeight}
                    style={{ width: 75, height: thumbHeight }}
                    className={`cursor-pointer border rounded-md object-cover ${
                      currentIndex === index
                        ? 'border-blue-500'
                        : 'border-gray-300'
                    }`}
                    onClick={() => setCurrentIndex(index)}
                  />
                );
              })}
            </div>

            {activeImages.length > 4 && (
              <button
                className="absolute bottom-0 p-2 rounded-full shadow-md z-10"
                onClick={() =>
                  setCurrentIndex((i) =>
                    Math.min(i + 1, activeImages.length - 1)
                  )
                }
                disabled={currentIndex === activeImages.length - 1}
              >
                <ChevronDown size={24} />
              </button>
            )}
          </div>

          {/* Main preview */}
          <div className="w-[540px] mx-auto rounded-lg">
            <div
              className={`relative mx-auto ${
                activeAspect === 'square'
                  ? 'w-[500px] h-[500px]'
                  : 'w-[503px] h-[670px]'
              }`}
            >
              {activeImages.length > 0 && (
                <ZoomImage
                  src={getImageUrl(activeImages[currentIndex])} // always string
                  alt="Product preview"
                  aspect={activeAspect}
                />
              )}
            </div>
          </div>
        </div>

        {/* Middle column - product details */}
        <div className="px-6 pt-0 pb-1 prose prose-sm max-w-none">
          {/* Title */}
          <h1 className="text-2xl text-[#333] font-semibold">
            {productDetails?.title}
          </h1>

          {/* Go to Store */}
          <div className="text-left ">
            <Link
              href={`/shop/${productDetails?.Shop?.id}`}
              className="text-blue-600 font-medium text-sm hover:underline hidden"
            >
              {/* <Store size={18} /> */}
              Go to store
            </Link>
          </div>

          <div className="w-full flex flex-col items-start ">
            <div className="flex gap-2 mb-1">
              <Ratings rating={productDetails?.ratings} />
              <Link
                href={'#reviews'}
                className="text-blue-600 text-sm hover:underline"
              >
                (Reviews)
              </Link>
            </div>
          </div>

          <hr className="border-t border-slate-200 " />

          <div className="mt-1">
            {/* Product price */}
            <div className="flex flex-col">
              <div className="pt-4 text-[#52525B] space-x-0.5">
                <span className="text-[15px] font-bold">KSh</span>
                <span className="text-3xl text-[#1C1C1E] font-semibold tracking-tight ">
                  {productDetails?.deal
                    ? productDetails.deal.sale_price
                    : productDetails?.regular_price}
                </span>
              </div>

              {/* Show discount only if deal exists */}
              {productDetails?.deal && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-sm font-normal line-through tracking-tight">
                    Ksh {productDetails?.regular_price}
                  </span>
                  <span className="text-rose-600 text-sm font-semibold tracking-tight">
                    {discountPercentage}% off
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col md:flex-col items-start gap-6 mt-6 ">
              {/* Color options */}
              {productDetails?.colors?.length > 0 && (
                <div className="hidden">
                  <strong className="text-[#333]">Color</strong>
                  <div className="flex gap-2 mt-2">
                    {productDetails?.colors?.map(
                      (color: string, index: number) => (
                        <button
                          key={index}
                          className={`w-8 h-8 cursor-pointer rounded-full border-2 border-gray-200 transition ${
                            isSelected === color
                              ? 'border-gray-400 scale-110 shadow-md'
                              : 'border-[#ddd]'
                          }`}
                          onClick={() => setIsSelected(color)}
                          style={{ backgroundColor: color }}
                        />
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Size options */}
              {productDetails?.sizes?.length > 0 && (
                <div>
                  <strong className="text-[#333]">Size</strong>
                  <div className="flex gap-2 mt-2">
                    {productDetails?.sizes?.map(
                      (size: string, index: number) => (
                        <button
                          key={index}
                          className={`w-20 h-10 text-[14px] font-medium cursor-pointer rounded-lg border border-[#ddd] transition-colors duration-100 ${
                            isSelected === size
                              ? 'bg-[#333] text-white'
                              : 'border border-[#ddd] text-black'
                          }`}
                          onClick={() => setIsSelected(size)}
                        >
                          {size}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Color swatches */}
            <div className="flex flex-col items-start justify-center mt-6">
              {/* Product header */}
              <p className=" flex items-center justify-start text-[#333] gap-1 pb-2">
                <span className=" font-normal">Color: </span>
                <span className=" font-bold">
                  {selectedSwatch ? selectedSwatch.title : 'Select a color'}
                </span>
              </p>

              <div className="grid grid-cols-4 gap-4">
                {(productDetails.colorVariants as ColorVariant[])?.map(
                  (swatch: ColorVariant) => (
                    <ColorThumbnail
                      key={swatch.id}
                      title={swatch.title}
                      image={swatch.images[0]}
                      price={swatch.price}
                      // onHover={(color) => setSelectedSwatch(color)}
                      onSelect={() => setSelectedSwatch(swatch)}
                    />
                  )
                )}
              </div>
            </div>

            {/* Product description */}
            {/* <div className="w-full lg:w-full mx-auto mt-5"> */}
            <div className=" py-4 ">
              <span className="text-lg font-bold text-[#333] hidden">
                {/* About this item {productDetails?.title} */}
                Product details
              </span>

              {/* Divider */}
              <hr className="border-t border-slate-200 my-3" />

              {/* Custom Specifications */}
              {productDetails?.custom_specifications?.length > 0 && (
                <div className="flex flex-col gap-3 mb-2">
                  <span className="text-lg font-semibold text-gray-800 ">
                    {/* About this item {productDetails?.title} */}
                    Highlights
                  </span>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm ">
                    {productDetails.custom_specifications.map(
                      (
                        spec: { name: string; value: string },
                        index: number
                      ) => (
                        <>
                          <dt
                            key={`name-${index}`}
                            className="font-medium text-gray-700"
                          >
                            {spec.name}
                          </dt>
                          <dd key={`value-${index}`} className="text-gray-900">
                            {spec.value}
                          </dd>
                        </>
                      )
                    )}
                  </dl>
                  <hr className="border-t border-slate-300 py-4" />
                </div>
              )}

              <div className="flex flex-col gap-3">
                <span className="text-base font-bold text-[#333] ">
                  {/* About this item {productDetails?.title} */}
                  About this item
                </span>

                {/* Description */}
                <div
                  className="prose prose-sm text-[#333] text-[15px] text-[15px]/6 max-w-none break-words pr-3"
                  dangerouslySetInnerHTML={{
                    __html: productDetails?.short_description,
                  }}
                />
              </div>

              {/* Product Accordions */}
              <div className="mt-6 ">
                {productDetails?.accordions?.map(
                  (accordion: any, index: number) => (
                    <Disclosure key={index}>
                      {({ open }) => (
                        <div className="rounded-none mb-2">
                          <hr className="border-t border-slate-300 py-1" />

                          <DisclosureButton className="flex w-full justify-between pl-0 pr-3 py-2 text-left text-sm font-medium text-gray-800 ">
                            <span>{accordion.title}</span>
                            <ChevronDownIcon
                              className={`${
                                open ? 'rotate-180 transform' : ''
                              } w-5 h-5 text-gray-500`}
                            />
                          </DisclosureButton>

                          <DisclosurePanel className="px-2 pt-3 pb-2 text-sm text-gray-700">
                            <div
                              className="prose prose-sm text-slate-800 text-[15px] max-w-none break-words"
                              dangerouslySetInnerHTML={{
                                __html: accordion.content,
                              }}
                            />
                          </DisclosurePanel>
                        </div>
                      )}
                    </Disclosure>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Right column - Seller information */}
        <div className=" w-[280px] px-4 py-4 bg-[#f8f8f8] border-none border-[#ddd] rounded-lg ">
          {/* Price */}
          <div className="space-x-0.5 mb-4 ">
            <span className="text-[15px] text-[#52525B] font-bold">KSh</span>
            <span className="text-3xl text-[#1C1C1E] font-bold">
              {productDetails?.deal
                ? productDetails.deal.sale_price
                : productDetails?.regular_price}
            </span>
          </div>

          {/* Quantity */}
          <div className="flex flex-col items-start gap-1 pb-4 mb-6 border-b border-gray-200">
            {/* In stock and out of stock */}
            <div className="hidden">
              {productDetails?.stock > 0 ? (
                <span className="text-[15px] text-green-600 font-medium">
                  In Stock{' '}
                  {/* <span className="text-gray-500 font-medium">
                    (Stock {productDetails?.stock})
                  </span> */}
                </span>
              ) : (
                <span className="text-red-600 font-medium">Out of Stock</span>
              )}
            </div>

            {/* Quantity dropdown */}
            <span className="text-sm font-bold text-[#333] ">Quantity</span>
            <div
              className="flex flex-col gap-1 w-[180px] mb-0.5 relative"
              ref={quantityRef}
            >
              <button
                type="button"
                onClick={() => setQuantityOpen((o) => !o)}
                className="w-full h-[36px] px-3 border border-gray-300 rounded-md text-[#1C1C1E] text-sm font-medium text-left flex items-center justify-between focus:outline-none focus:border-[#C2410C] focus:ring-2 focus:ring-[#C2410C]/20 transition-shadow"
              >
                {quantity}
                <svg
                  className="w-4 h-4 text-[#333] "
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

              {quantityOpen && (
                <ul className="absolute top-full mt-1 w-full max-h-[168px] overflow-y-auto border border-gray-200 rounded-md bg-white shadow-lg z-10">
                  {[1, 2, 3, 4, 5, 10, 20, 50, 100].map((q) => (
                    <li key={q}>
                      <button
                        type="button"
                        onClick={() => {
                          setQuantity(q);
                          setQuantityOpen(false);
                        }}
                        className={`w-full h-[34px] px-3 text-left text-sm hover:bg-gray-50 ${
                          q === quantity
                            ? 'bg-[#C2410C]/10 text-[#C2410C] font-medium'
                            : 'text-[#1C1C1E]'
                        }`}
                      >
                        {q}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Delivery options */}
          <div className="flex flex-col gap-3 px-0 mb-6">
            {/* Pickup location */}
            <div className="flex items-start justify-start font-medium tracking-tight gap-1.5">
              <Package
                size={18}
                strokeWidth="1.5"
                color="#333"
                className="shrink-0"
              />

              <div className="flex flex-col items-start gap-1 text-[13.5px] text-[#1C1C1E]">
                <div className="w-full flex items-center justify-start gap-1.5">
                  <span className=" text-[14.0px] font-bold ">
                    Pickup Station -
                  </span>
                  <span className="font-bold">Ksh 70</span>
                </div>
                <span className="font-semibold text-[#52525B]">
                  Wed, Sept 2 - Thur, Sept 3
                </span>
                <span className="font-semibold hidden">
                  {' '}
                  Order within 1 hr 55 min{' '}
                </span>
              </div>
            </div>

            {/* Door delivery */}
            <div className="flex items-start justify-start font-medium tracking-tight gap-1.5">
              <Truck
                size={18}
                strokeWidth="1.5"
                color="#333"
                className="shrink-0"
              />

              <div className="flex flex-col items-start gap-1 text-[13.5px] text-[#1C1C1E]">
                <div className="w-full flex items-center justify-start gap-1.5">
                  <span className=" text-[14.0px] font-bold ">
                    Door Delivery -
                  </span>
                  <span className="font-bold">Ksh 200</span>
                </div>
                <span className="font-semibold text-[#52525B]">
                  Wed, Sept 2 - Thur, Sept 3
                </span>
                <span className="font-semibold hidden">
                  {' '}
                  Order within 1 hr 55 min{' '}
                </span>
              </div>
            </div>

            {/* Order timeline */}
            {/* <div className="pb-0 border-none border-[#ddd]"></div> */}
            <div className="flex flex-col items-start justify-center gap-2 pb-0">
              {/* <MapPin size={16} /> */}
              <p className="flex items-center gap-1 text-sm font-normal">
                <span className="">Deliver to </span>
                <span className="text-blue-600 font-semibold cursor-pointer hover:underline">
                  {location?.city}, {location?.country}
                </span>
              </p>
              {/* <span className="text-sm text-blue-700 font-normal cursor-pointer pt-2">
                {' '}
                Deliver to
                {' ' + location?.city + ', ' + location?.country}
              </span> */}
            </div>
          </div>

          {/* Order timeline */}
          <div className="w-full flex items-start justify-start gap-1 p-2 mb-4 bg-[#FFF4EE] border border-[#FBD7C4] rounded-md">
            <p className="text-[13.5px] font-medium text-[#52525B] tracking-tight">
              Order within{' '}
              <span className="text-[13.5px] font-bold text-[#52525B] tracking-tight">
                3 hrs 18 mins
              </span>{' '}
              to get this date
            </p>
          </div>

          {/* <hr className="border-t border-gray-200 mt-0" /> */}

          {/* Add to Cart & Buy Now */}
          <div className="px-0 pb-6 mb-0 rounded-md ">
            {/* Add to cart button */}
            <div className="flex flex-col gap-2 w-full pb-4 border-none border-[#ddd]">
              <button
                className={`flex items-center justify-center px-6 h-[36px] text-[14.0px] text-[#1C1C1E] font-semibold bg-[#fff] border border-slate-500 hover:bg-gray-100 rounded-md transition-all duration-300 ${
                  isInCart ? 'cursor-not-allowed' : 'cursor-pointer'
                }`}
                disabled={isInCart || productDetails?.stock === 0}
                onClick={() =>
                  addToCart(
                    {
                      ...productDetails,
                      quantity,
                      selectedOptions: {
                        color: isSelected,
                        size: isSizeSelected,
                      },
                    },
                    user,
                    location,
                    deviceInfo
                  )
                }
              >
                Add to Cart
              </button>

              {/* Buy Now button */}
              <button className="flex items-center justify-center px-6 h-[36px] bg-[#FF9F1C] hover:bg-amber-500 text-[14.0px] text-[#1C1C1E] font-semibold rounded-md transition duration-100">
                Buy Now
              </button>
            </div>

            <div className="pt-2 space-y-2 mb-4 text-[#1C1C1E] pb-4 border-b border-gray-200">
              {/* Returns */}
              <div className="flex items-center justify-between font-medium tracking-tight pt-0 ">
                <div className="flex items-center gap-2">
                  <RotateCcw
                    size={18}
                    strokeWidth="1.5"
                    color="#007D49"
                    className="shrink-0"
                  />
                  <span className=" text-[13.5px] font-bold ">Returns</span>
                </div>
                <div className="">
                  <p className="flex items-center gap-1 text-[#52525B]">
                    <span className="font-semibold text-[13.5px]">
                      30-day returns
                    </span>
                    <span className="font-medium text-[12.5px] text-blue-600 underline cursor-pointer">
                      Details
                    </span>
                  </p>
                </div>
              </div>

              {/* Secure payments */}
              <div className="flex items-center justify-between font-medium tracking-tight ">
                <div className="flex items-center gap-2">
                  <ShieldCheck
                    size={18}
                    strokeWidth="1.5"
                    color="#007D49"
                    className="shrink-0"
                  />
                  <span className=" text-[13.5px] font-bold ">Security</span>
                </div>
                <div className="">
                  <p className="flex items-center gap-1 text-[#52525B]">
                    <span className="font-semibold text-[13.5px]">
                      Secure payments
                    </span>
                    <span className="font-medium text-[12.5px] text-blue-600 underline ">
                      Details
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* <hr className="border-t border-slate-200 mb-6" /> */}

            <div className=" px-0 py-0 rounded-lg border-none border-gray-300">
              {/* Sold by section */}
              <dl className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-0 text-sm pb-0 ">
                {/* <dt className="flex items-center gap-2 font-normal tracking-tight ">
                  <Store size={18} strokeWidth="1.5" color="#1d1d1f" />
                  Sold by
                </dt>
                <dd className="font-normal tracking-tight text-gray-800 ">
                  {productDetails?.Shop?.name}
                </dd> */}

                {/* <dt className="flex items-center gap-2 font-normal tracking-tight ">
                  <RotateCcw size={18} strokeWidth="1.5" color="#1d1d1f" />
                  Returns
                </dt>
                <dd className="font-normal tracking-tight text-blue-600">
                  7 day returns
                </dd> */}

                {/* <dt className="flex items-center gap-2 font-normal tracking-tight ">
                  <ShieldCheck size={18} strokeWidth="1.5" color="#1d1d1f" />
                  Security
                </dt>
                <dd className="font-normal tracking-tight text-blue-600">
                  Safe Payments
                </dd> */}
              </dl>

              {/* Seller performance stats */}
              <div className="flex flex-col items-start justify-start gap-2 pb-6 border-b border-[#ddd]">
                {/* Seller Store */}
                <span className="flex items-center gap-2 text-[14.5px] font-bold tracking-tight">
                  <Store size={18} strokeWidth="1.5" color="#1d1d1f" />
                  Sokonis Naivasha
                </span>

                {/* Seller score */}
                <div className="flex gap-1 text-sm">
                  <span className="font-semibold">88%</span>
                  <span className="text-gray-800">Seller score</span>
                </div>

                {/* Chat with seller */}
                <Link
                  href={'#'}
                  onClick={() => handleChat()}
                  className="w-full flex items-center gap-2 text-[#1d1d1f] text-sm cursor-pointer hover:underline p-0 rounded-md"
                >
                  <MessageSquareText size={16} />
                  Chat
                </Link>
              </div>

              {/* <hr className="border-t border-slate-200 my-5" /> */}

              {/* Chat and Add to wishlist */}
              <div className="flex flex-col items-center justify-start gap-4 cursor-pointer text-gray-800 mt-4 ">
                {/* Add to wishlist */}
                <div className="w-full flex items-center justify-center gap-2 cursor-pointer hover:bg-[#f1f1f1] p-2 border border-gray-400 rounded-md transition-all duration-300">
                  <Heart
                    size={16}
                    fill={isWishlisted ? 'red' : 'transparent'}
                    className="cursor-pointer"
                    color={isWishlisted ? 'transparent' : '#333'}
                    onClick={() =>
                      isWishlisted
                        ? removeFromWishlist(
                            productDetails.id,
                            user,
                            location,
                            deviceInfo
                          )
                        : addToWishlist(
                            {
                              ...productDetails,
                              quantity,
                              selectedOptions: {
                                color: isSelected,
                                size: isSizeSelected,
                              },
                            },
                            user,
                            location,
                            deviceInfo
                          )
                    }
                  />
                  <span className="text-sm font-semibold">Add to Wishlist</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* You may also like */}
      <div className="w-full lg:w-full mx-auto border-t border-y-gray-200">
        <div className="w-full h-full py-4 ">
          <h3 className="text-xl font-bold pb-2">
            {/* You may also like these products from our store */}
            You may also like
          </h3>
          <div className="m-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {recommendedProducts?.map((i: any) => (
              <ProductCard key={i.id} product={i} />
            ))}
          </div>
        </div>
      </div>
      {/* Product description */}
      <div className="w-full lg:w-full mx-auto mt-40">
        <div className="bg-white py-4 border-t border-gray-200">
          <h3 className="text-xl font-bold pb-2">
            {/* Product description {productDetails?.title} */}
            Product description
          </h3>
          <div
            className="prose prose-sm text-slate-800 max-w-none break-words "
            dangerouslySetInnerHTML={{
              __html: productDetails?.detailed_description,
            }}
          />
        </div>
      </div>
      {/* From the manufacturer */}
      <div className="w-full lg:w-full mx-auto mt-5 border-t border-y-gray-200 hidden">
        <div className="bg-white min-h-[60vh] h-full ">
          <h3 className="text-xl font-bold pt-3 pb-2">
            {/* {productDetails?.title} */}
            From the manufacturer
          </h3>
        </div>
      </div>
      {/* Ratings & Reviews */}
      <div className="w-full lg:w-full mx-auto border-t border-y-gray-200">
        <div className="bg-white min-h-[50vh] py-4 h-full ">
          <h3 className="text-xl font-bold pb-2">
            Ratings & Reviews of {productDetails?.title}
          </h3>
          <p className="text-center pt-14">No reviews available yet!</p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
