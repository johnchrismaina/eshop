'use client';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  MessageSquareText,
  Package,
  ShoppingCartIcon,
  WalletMinimal,
} from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import ReactImageMagnify from 'react-image-magnify';
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
    <div className="w-full bg-white px-8">
      <div className="w-full bg-white pt-8 pb-6 grid grid-cols-1 lg:grid-cols-[minmax(500px,600px)_minmax(300px,1fr)_244px] gap-2">
        {' '}
        {/* left column - product images */}
        <div className="px-0">
          <div className="relative mx-auto flex justify-center items-start h-[500px]">
            <ReactImageMagnify
              {...{
                smallImage: {
                  alt: 'Product Image',
                  src: currentImage || '',
                  isFluidWidth: true, // required
                },
                largeImage: {
                  src: currentImage || '',
                  width: 1200,
                  height: 1200,
                },
                enlargedImageStyle: {
                  border: 'none',
                  boxShadow: 'none',
                },
                isHintEnabled: true,
                enlargedImagePosition: 'beside',
                shouldUsePositiveSpaceLens: true,
              }}
            />
          </div>

          {/* Thumbnail images array */}
          <div className="relative flex items-center gap-2 mt-1 overflow-hidden">
            {productDetails?.images?.length > 4 && (
              <button
                className="absolute left-0 bg-white p-2 rounded-full shadow-md z-10"
                onClick={prevImage}
                disabled={currentIndex === 0}
              >
                <ChevronLeft size={24} />
              </button>
            )}
            <div className="flex gap-2 overflow-x-auto">
              {productDetails?.images?.map((img: any, index: number) => (
                <Image
                  key={index}
                  src={
                    img?.url ||
                    'https://ik.imagekit.io/johnchrismaina/products/product-1764947748099_PpFh77hy3.jpg?updatedAt=1764947756039'
                  }
                  alt="Thumbnail"
                  width={60}
                  height={60}
                  className={`cursor-pointer border rounded-lg p-1 ${
                    currentImage === img ? 'border-blue-500' : 'border-gray-300'
                  }`}
                  onClick={() => {
                    setCurrentIndex(index);
                    setCurrentImage(img);
                  }}
                />
              ))}
            </div>
            {(productDetails?.images?.length ?? 0) > 4 && (
              <button
                className="absolute right-0 bg-white p-2 rounded-full shadow-md z-10"
                onClick={nextImage}
                disabled={currentIndex === productDetails?.images.length - 1}
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>
        </div>
        {/* Middle column - product details */}
        <div className="px-4 pb-1 prose prose-sm max-w-none">
          <h1 className="text-3xl text-gray-950 font-medium">
            {productDetails?.title}
          </h1>
          <div className="w-full flex flex-col items-start ">
            {/* Go to Store */}
            <div className="text-center ">
              <Link
                href={`/shop/${productDetails?.Shop?.id}`}
                className="text-blue-600 font-medium text-sm hover:underline"
              >
                {/* <Store size={18} /> */}
                Go to store
              </Link>
            </div>

            <div className="flex gap-2 text-yellow-500 mb-1">
              <Ratings rating={productDetails?.rating} />
              <Link
                href={'#reviews'}
                className="text-blue-600 text-sm hover:underline"
              >
                (0 Reviews)
              </Link>
            </div>
          </div>

          <hr className="border-t border-slate-300 " />

          <div className="mt-1">
            {/* Product price */}
            <div className="flex flex-col ">
              <div className="pt-4 ">
                <span className="text-2xl font-semibold tracking-tight text-gray-900">
                  Ksh {productDetails?.sale_price}
                </span>
              </div>

              <div className="flex items-center gap-2 ">
                <span className="text-slate-500 text-sm font-normal line-through tracking-tight">
                  Ksh {productDetails?.regular_price}
                </span>
                <span className="text-rose-600 text-sm font-semibold tracking-tight">
                  {discountPercentage}% off
                </span>
              </div>
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
              <span className="text-lg font-bold text-gray-800 ">
                {/* About this item {productDetails?.title} */}
                Product details
              </span>

              {/* Divider */}
              <hr className="border-t border-slate-300 my-2" />

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

              <div className="flex flex-col gap-2">
                <span className="text-base font-semibold text-gray-800 ">
                  {/* About this item {productDetails?.title} */}
                  About this item
                </span>

                {/* Description */}
                <div
                  className="prose prose-sm text-slate-800 text-[15px] max-w-none break-words "
                  dangerouslySetInnerHTML={{
                    __html: productDetails?.short_description,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        {/* Right column - Seller information */}
        <div className="bg-white border border-gray-200 w-[244px] px-5 py-4 rounded-md ">
          <div className="flex gap-2 items-end pb-2">
            {/* <span className="text-sm">Ksh</span> */}
            <span className="text-2xl font-medium tracking-tight text-gray-800">
              Ksh {productDetails?.sale_price}
            </span>
          </div>

          {/* Delivery options */}
          <div className="flex flex-col gap-3 py-1 ">
            {/* Instant delivery */}
            <div className="flex flex-col gap-0">
              <span className="text-[15px] text-gray-800 font-semibold ">
                Delivery:
              </span>
              <p className="text-sm text-gray-800 font-normal ">
                Ships from <span className="font-semibold">Nairobi, Kenya</span>
              </p>
            </div>
            {/* Pickup location */}
            <div className="flex flex-col gap-0">
              <span className="text-[15px] text-gray-800 font-semibold ">
                Pickup:
              </span>
              <div className="flex flex-col gap-1">
                <p className="text-sm text-gray-800 font-normal ">
                  Kshs 70 delivery
                </p>
                <p className="text-sm text-gray-800 font-normal ">
                  Order within{' '}
                  <span className="text-green-700 font-medium">
                    3 hrs 18 mins{' '}
                  </span>{' '}
                  to get by{' '}
                  <span className="font-semibold">Tuesday, July 7</span>
                </p>
              </div>
            </div>
            <div className="flex items-center text-blue-600 pt-2 gap-1">
              <MapPin size={18} className="ml-[-5px]" />
              <span className="text-sm font-normal">
                {' '}
                Deliver to
                {' ' + location?.city + ', ' + location?.country}
              </span>
            </div>
          </div>

          {/* Quantity */}
          <div className="py-3">
            <div className="flex flex-col items-start gap-2 mb-3">
              {/* In stock and out of stock */}
              {productDetails?.stock > 0 ? (
                <span className="text-green-600 font-medium">
                  In Stock{' '}
                  {/* <span className="text-gray-500 font-medium">
                    (Stock {productDetails?.stock})
                  </span> */}
                </span>
              ) : (
                <span className="text-red-600 font-medium">Out of Stock</span>
              )}

              {/* Quantity dropdown */}
              <div className="flex flex-col gap-1 w-full">
                <span className="text-sm font-semibold text-gray-700">
                  Quantity
                </span>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full border bg-white border-gray-500 font-medium text-gray-800 text-sm rounded-lg px-3 py-[6px] focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <div className="flex flex-col gap-2 w-full">
              <button
                className={`flex items-center justify-center p-[8px] bg-[#f16232] hover:bg-[#e05628] text-sm text-white font-medium rounded-full transition ${
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
          </div>

          <div className="py-1">
            <div className="w-full rounded-lg">
              {/* Sold by section */}
              <dl className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-2 text-sm pb-4">
                <dt className="font-normal tracking-tight text-gray-500">
                  Sold by
                </dt>
                <dd className="font-normal tracking-tight text-blue-600 ">
                  {productDetails?.Shop?.name}
                </dd>

                <dt className="font-normal tracking-tight text-gray-500">
                  Returns
                </dt>
                <dd className="font-normal tracking-tight text-blue-600">
                  7 day returns
                </dd>
              </dl>

              {/* Seller performance stats */}
              <div className="flex flex-col gap-2 py-3 border-t border-gray-200">
                {/* Seller score */}
                <div className="flex gap-1 text-sm">
                  <span className="font-semibold">88%</span>

                  <span className="text-gray-800">Seller score</span>
                </div>

                {/* Chat with seller */}
                <Link
                  href={'#'}
                  onClick={() => handleChat()}
                  className="text-blue-600 text-sm flex items-center gap-2"
                >
                  <MessageSquareText size={18} />
                  Chat
                </Link>
              </div>

              {/* Add to wishlist */}
              <div className="border-t border-gray-200 pt-4 cursor-pointer">
                <div className="flex items-center justify-center gap-2 p-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg ">
                  <Heart
                    size={20}
                    fill={isWishlisted ? 'red' : 'transparent'}
                    className="cursor-pointer"
                    color={isWishlisted ? 'transparent' : '#777'}
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
      </div>

      <div className="w-full lg:w-full mx-auto border-t border-y-gray-200">
        <div className="w-full h-full ">
          <h3 className="text-xl font-semibold pt-3 pb-2">
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
      <div className="w-full lg:w-full mx-auto mt-5">
        <div className="bg-white py-4 border-t border-gray-200">
          <h3 className="text-xl font-bold pb-1">
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

      <div className="w-full lg:w-full mx-auto mt-5 border-t border-y-gray-200">
        <div className="bg-white min-h-[60vh] h-full ">
          <h3 className="text-xl font-bold pt-3 pb-2">
            {/* About this item {productDetails?.title} */}
            From the manufacturer
          </h3>
        </div>
      </div>

      <div className="w-full lg:w-full mx-auto border-t border-y-gray-200">
        <div className="bg-white min-h-[50vh] h-full ">
          <h3 className="text-lg font-semibold pt-2 pb-2">
            Ratings & Reviews of {productDetails?.title}
          </h3>
          <p className="text-center pt-14">No reviews available yet!</p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
