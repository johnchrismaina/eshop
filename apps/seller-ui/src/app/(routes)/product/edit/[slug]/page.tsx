// edit-product.tsx
import ProductForm from 'apps/seller-ui/src/shared/components/ProductForm';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axiosProduct from 'apps/seller-ui/src/utils/axiosProduct';

export default function EditProductPage() {
  const { slug } = useParams();
  const { data: product } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const res = await axiosProduct.get(`/get-product/${slug}`);
      return res.data;
    },
  });

  if (!product) return <div>Loading...</div>;

  return <ProductForm mode="edit" product={product} />;
}
