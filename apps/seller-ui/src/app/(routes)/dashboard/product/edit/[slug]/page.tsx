// edit-product.tsx
'use client';
import ProductForm from 'apps/seller-ui/src/shared/components/ProductForm';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axiosProduct from 'apps/seller-ui/src/utils/axiosProduct';
import Spinner from 'packages/components/spinner';

export default function EditProductPage() {
  const { slug } = useParams();
  const { data: product } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const res = await axiosProduct.get(`/get-product/${slug}`);
      return res.data;
    },
  });

  if (!product)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="absolute inset-0 flex items-center justify-center gap-2">
          <Spinner size={16} borderColor="border-gray-200" />
          Loading...
        </span>
      </div>
    );

  return <ProductForm mode="edit" product={product} />;
}
