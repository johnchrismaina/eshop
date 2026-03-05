// import ProductDetails from 'apps/user-ui/src/shared/modules/product/product-details';
import axiosProductService from 'apps/user-ui/src/utils/axiosProductService';
import { Metadata } from 'next';
import React from 'react';
import { notFound } from 'next/navigation';
import ProductDetails from 'packages/components/ProductDetails';

// ✅ Corrected fetch function
async function fetchProductDetails(slug: string) {
  console.log('fetchProductDetails called with slug:', slug);

  if (!slug) throw new Error('Slug is undefined');

  try {
    const url = `/product/get-product/${slug}`;
    console.log('Requesting:', url);
    console.log('Base URL:', axiosProductService.defaults.baseURL);

    const response = await axiosProductService.get(url);
    console.log('Response:', response.data);

    const product = response.data?.product || response.data;

    if (!product) {
      console.log('Product not found for slug:', slug);
      notFound();
    }

    return product;
  } catch (err: any) {
    console.error('Error fetching product:', err.message);
    console.error('Full error:', err);

    if (err?.response?.status === 404) {
      console.log('API returned 404 for slug:', slug);
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
