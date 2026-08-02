'use client';
import {
  ChevronUp,
  ChevronDown,
  ChevronDownIcon,
  Heart,
  MapPin,
  MessageSquareText,
  Truck,
  Gift,
  Package,
  Pencil,
  RotateCcw,
  ShieldCheck,
  Store,
  Info,
} from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
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

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSelected, setIsSelected] = useState(
    productDetails?.colors?.[0] || ''
  );
  // const [isSizeSelected, setIsSizeSelected] = useState(
  //   productDetails?.sizes?.[0] || ''
  // );
  const [isSizeSelected] = useState(productDetails?.sizes?.[0] || '');
  // const [quantity, setQuantity] = useState(1);

  const [quantity, setQuantity] = useState<number | ''>('');
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

  return (
    <div className="w-full bg-white px-8 text-[#1d1d1f]">
      {/* Breadcrumbs */}
      <div className="bg-[#fff] py-4"></div>
      <div className="w-full bg-white pt-8 pb-6 grid grid-cols-1 lg:grid-cols-[minmax(500px,650px)_minmax(300px,1fr)_250px] gap-3">
        {/* left column - product images */}
        <div className="flex items-start justify-between px-0 bg-white w-[650px] h-auto mx-auto">
          {/* Thumbnail images array */}
          <div className=" flex flex-col items-center gap-2">
            {/* Scroll up button */}
            {productDetails?.images?.length > 4 && (
              <button
                className="absolute top-0 bg-white p-2 rounded-full shadow-md z-10"
                onClick={prevImage}
                disabled={currentIndex === 0}
              >
                <ChevronUp size={24} />
              </button>
            )}

            {/* Thumbnails */}
            <div className="flex flex-col gap-3 overflow-y-auto">
              {productDetails?.images?.map((img: any, index: number) => {
                const thumbHeight =
                  productDetails?.aspect === 'square'
                    ? 75
                    : Math.round((75 * 4) / 3);

                return (
                  <img
                    key={index}
                    src={
                      img?.url ||
                      'https://ik.imagekit.io/johnchrismaina/products/product-1764947748099_PpFh77hy3.jpg?updatedAt=1764947756039'
                    }
                    alt="Thumbnail"
                    width={75}
                    height={thumbHeight}
                    style={{ width: 75, height: thumbHeight }} // ✅ forces exact box, overrides Preflight
                    className={`cursor-pointer border rounded-lg object-cover flex-shrink-0 ${
                      currentImage === img
                        ? 'border-blue-500'
                        : 'border-gray-300'
                    }`}
                    onClick={() => {
                      setCurrentIndex(index);
                      setCurrentImage(img);
                    }}
                  />
                );
              })}
            </div>

            {/* Scroll up button */}
            {(productDetails?.images?.length ?? 0) > 4 && (
              <button
                className="absolute bottom-0 bg-white p-2 rounded-full shadow-md z-10"
                onClick={nextImage}
                disabled={currentIndex === productDetails?.images.length - 1}
              >
                <ChevronDown size={24} />
              </button>
            )}
          </div>

          {/* <div className="relative mx-auto flex justify-center items-start h-[500px]"> */}
          <div className="w-[540px] mx-auto rounded-lg">
            {/* Main preview */}
            <div
              className={`relative mx-auto ${
                productDetails?.aspect === 'square'
                  ? 'w-[500px] h-[500px]'
                  : 'w-[503px] h-[670px]'
              }`}
            >
              {productDetails?.images?.length > 0 && (
                <ZoomImage
                  src={productDetails.images[currentIndex]?.url}
                  alt="Product preview"
                  aspect={productDetails.aspect}
                />
              )}
            </div>
          </div>
        </div>
        {/* Middle column - product details */}
        <div className="px-4 pt-0 pb-1 prose prose-sm max-w-none">
          {/* Title */}
          <h1 className="text-2xl text-gray-950 font-semibold">
            {productDetails?.title}
          </h1>

          {/* Go to Store */}
          <div className="text-left ">
            <Link
              href={`/shop/${productDetails?.Shop?.id}`}
              className="text-blue-600 font-medium text-sm hover:underline"
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
              <div className="pt-4 tracking-tight">
                <span className="text-sm font-normal">Ksh </span>
                <span className="text-2xl font-bold tracking-tight text-gray-900">
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

            <div className="mt-2">
              <div className="flex flex-col md:flex-row items-start gap-5 mt-4">
                {/* Color options */}
                {productDetails?.colors?.length > 0 && (
                  <div>
                    <strong>Color:</strong>
                    <div className="flex gap-2 mt-1">
                      {productDetails?.colors?.map(
                        (color: string, index: number) => (
                          <button
                            key={index}
                            className={`w-8 h-8 cursor-pointer rounded-full border-2 transition ${
                              isSelected === color
                                ? 'border-gray-400 scale-110 shadow-md'
                                : 'border-transparent'
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
                    <strong>Size:</strong>
                    <div className="flex gap-2 mt-1">
                      {productDetails?.sizes?.map(
                        (size: string, index: number) => (
                          <button
                            key={index}
                            className={`w-8 h-8 cursor-pointer rounded-full border-2 transition ${
                              isSelected === size
                                ? 'border-gray-800 text-white'
                                : 'border-gray-300 text-black'
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
            </div>

            {/* Product description */}
            {/* <div className="w-full lg:w-full mx-auto mt-5"> */}
            <div className="bg-white py-4 ">
              <span className="text-lg font-bold text-[#1d1d1f] ">
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
                <span className="text-base font-bold text-[#1d1d1f] ">
                  {/* About this item {productDetails?.title} */}
                  About this item
                </span>

                {/* Description */}
                <div
                  className="prose prose-sm text-[#1d1d1f] text-[15px] text-[15px]/6 max-w-none break-words pr-3"
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
        <div className=" w-[250px] text-[#000] px-0 py-0 bg-[#fff] border-none border-gray-200 rounded-lg">
          {/* Delivery options */}
          <div className="flex flex-col gap-4 bg-[#fff] px-4 py-4 rounded-lg border border-gray-300 mb-3">
            {/* Pickup location */}
            <div className="flex items-start justify-start gap-2 ">
              <Package size={18} strokeWidth="1.5" color="#1d1d1f" />

              <div className="flex flex-col items-start justify-start gap-0.5">
                <p className="text-[15px] ">
                  <span className="text-[#000] font-bold ">Pickup: </span>
                  <span className="font-normal">Ksh 70</span>
                </p>
                <p className="text-sm  ">
                  Delivery <span className="font-bold">Tuesday, July 7</span>
                </p>
                <p className="text-sm font-normal ">
                  Order within{' '}
                  <span className=" font-normal">3 hrs 18 mins </span>
                </p>
                <div className="flex items-center text-blue-700 ">
                  {/* <MapPin size={18} className="ml-[-5px]" /> */}
                </div>
              </div>
            </div>

            {/* Door delivery */}
            <div className="flex items-start justify-start gap-2">
              <Truck size={18} strokeWidth="1.5" color="#1d1d1f" />

              <div className="flex flex-col items-start justify-start gap-0.5">
                <p className="text-[15px] ">
                  <span className="font-bold ">Delivery: </span>
                  <span className="font-normal">Ksh 200</span>
                </p>
                <p className="text-sm  ">
                  Delivery <span className="font-bold">Tuesday, July 7</span>
                </p>
                <p className="text-sm font-normal ">
                  Order within{' '}
                  <span className="font-normal">3 hrs 18 mins </span>
                </p>
              </div>
            </div>

            <div className="flex items-end justify-start gap-2 my-0 ">
              <p className="">
                <span className="text-[15px] font-normal ">Deliver to </span>
                <span className="text-sm text-blue-600 font-normal cursor-pointer hover:underline ">
                  {location?.city}
                </span>
              </p>
              {/* <span className="text-sm text-blue-700 font-normal cursor-pointer pt-2">
                {' '}
                Deliver to
                {' ' + location?.city + ', ' + location?.country}
              </span> */}
            </div>
            {/* <hr className="border-t border-gray-200 my-0" /> */}
          </div>

          {/* Quantity and Add to Cart */}
          <div className="bg-[#f5f5f5] p-4 rounded-lg mb-3 border-none border-gray-200">
            <div className="flex flex-col items-start gap-2 mb-3">
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

              {/* Price */}
              <div className="tracking-tight">
                <span className="text-sm font-normal">Ksh </span>
                <span className="text-2xl font-bold tracking-tight text-gray-900">
                  {productDetails?.deal
                    ? productDetails.deal.sale_price
                    : productDetails?.regular_price}
                </span>
              </div>

              {/* Quantity dropdown */}
              <div className="flex flex-col gap-1 w-full">
                <span className="text-sm font-semibold  ">Quantity</span>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full border border-gray-200 font-medium text-sm rounded-md px-3 py-2 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-300 focus:ring-offset-1 transition-all duration-200"
                >
                  {/* <option value="" disabled>
                  Quantity
                </option> */}
                  {[1, 2, 3, 5, 10, 20, 50, 100].map((q) => (
                    <option key={q} value={q}>
                      {q}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Add to cart button */}
            <div className="flex flex-col gap-1 w-full">
              <button
                className={`flex items-center justify-center px-[8px] py-1.5 bg-[#ffac30] hover:bg-amber-500 text-[14.0] text-[#1d1d1f] font-medium rounded-full transition ${
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
              {/* <button className="flex items-center justify-center p-[8px] bg-rose-600 hover:bg-rose-500 text-sm text-gray-800 font-medium rounded-full transition">
                Buy Now
              </button> */}
            </div>
            <div className="pt-4 space-y-2">
              <span className="flex items-center justify-start gap-2 text-sm font-semibold">
                <RotateCcw size={18} strokeWidth="2" color="#007D49" />7 Day
                Returns
                <Info size={14} strokeWidth="1.5" color="#333" />
              </span>
              <span className="flex items-center justify-start gap-2 text-sm font-semibold">
                <ShieldCheck size={18} strokeWidth="2" color="#007D49" />
                Secure Payments
              </span>
            </div>
          </div>

          {/* <hr className="border-t border-slate-200 pt-6" /> */}

          <div className="bg-[#fff] px-4 py-6 rounded-lg border border-gray-300">
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
            <div className="flex flex-col items-start justify-start gap-2 py-0 mb-3">
              {/* Seller Store */}
              <span className="flex items-center gap-2 font-medium tracking-tight">
                <Store size={18} strokeWidth="1.5" color="#1d1d1f" />
                Sokonis Naivasha
              </span>

              {/* Seller score */}
              <div className="flex gap-1 text-sm">
                <span className="">88%</span>
                <span className="text-gray-800">Seller score</span>
              </div>
            </div>

            {/* <hr className="border-t border-slate-200 my-5" /> */}

            {/* Chat and Add to wishlist */}
            <div className="flex flex-col items-center justify-start gap-4 cursor-pointer text-gray-800 ">
              {/* Chat with seller */}
              <Link
                href={'#'}
                onClick={() => handleChat()}
                className="w-full flex items-center gap-2 text-[#1d1d1f] text-sm cursor-pointer hover:underline p-0 rounded-md"
              >
                <MessageSquareText size={16} />
                Chat
              </Link>

              {/* Add to wishlist */}
              <div className="w-full flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-100 p-2 border border-gray-400 rounded-md transition-all duration-300">
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
                <span className="text-sm">Add to Wishlist</span>
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
