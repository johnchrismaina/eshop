import ProductDetails from 'apps/user-ui/src/shared/modules/product/product-details';
import axiosProductService from 'apps/user-ui/src/utils/axiosProductService';
import { Metadata } from 'next';
import React from 'react';
import { notFound } from 'next/navigation';

// ✅ Corrected fetch function
async function fetchProductDetails(slug: string) {
  console.log('fetchProductDetails called with slug:', slug);

  if (!slug) throw new Error('Slug is undefined');

  try {
    console.log('Requesting:', `http://localhost:6002/api/get-product/${slug}`);
    console.log('Base URL:', axiosProductService.defaults.baseURL);

    const response = await axiosProductService.get(`/api/get-product/${slug}`);
    const product = response.data?.product;

    if (!product) {
      notFound();
    }

    return product;
  } catch (err: any) {
    if (err?.response?.status === 404) {
      notFound();
    }
    throw err;
  }
}

// ✅ Corrected metadata function
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { slug } = await params; // ✅ await params
  const product = await fetchProductDetails(slug);

  return {
    title: `${product?.title} | Eshop Marketplace`,
    description:
      product?.short_description ||
      'Discover high-quality products on Eshop Marketplace',
    openGraph: {
      title: product?.title,
      description: product?.short_description || '',
      images: [product?.images?.[0]?.url || '/default-image.jpg'],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product?.title,
      description: product?.short_description || '',
      images: [product?.images?.[0]?.url || '/default-image.jpg'],
    },
  };
}

// ✅ Corrected Page component
const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params; // ✅ await params
  const productDetails = await fetchProductDetails(slug);

  return <ProductDetails productDetails={productDetails} />;
};

export default Page;
