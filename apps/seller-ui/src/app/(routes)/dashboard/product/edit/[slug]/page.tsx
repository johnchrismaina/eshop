// edit-product.tsx
'use client';
import ProductForm from 'apps/seller-ui/src/shared/components/ProductForm';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axiosProduct from 'apps/seller-ui/src/utils/axiosProduct';
import Spinner from 'packages/components/spinner';
import type { FormValues } from 'apps/seller-ui/src/shared/components/ProductForm';

const IMAGE_SLOTS = 8;
const VARIANT_IMAGE_SLOTS = 8;

// Converts an ISO datetime string to the "yyyy-MM-dd" shape
// the date inputs (Controller/register, both string-based) expect.
function toDateInputString(value: string | null | undefined): string {
  if (!value) return '';
  return new Date(value).toISOString().split('T')[0];
}

// Main product images: fixed 8-slot array, empty slots = null.
function normalizeImages(images: any[] | undefined | null) {
  const arr = Array.isArray(images) ? images.slice(0, IMAGE_SLOTS) : [];
  return [...arr, ...Array(IMAGE_SLOTS - arr.length).fill(null)];
}

// Variant images: fixed 8-slot array, each slot either null or
// { fileId, file_url }. API gives plain URL strings, so wrap them.
function normalizeVariantImages(images: any[] | undefined | null) {
  const arr = Array.isArray(images) ? images.slice(0, VARIANT_IMAGE_SLOTS) : [];
  const mapped = arr.map((img) => {
    if (!img) return null;
    if (typeof img === 'string') return { fileId: null, file_url: img };
    return img; // already { fileId, file_url }
  });
  return [...mapped, ...Array(VARIANT_IMAGE_SLOTS - mapped.length).fill(null)];
}

// Converts the embedded product_specifications array ({label, value}[])
// back into the Record<string, string | string[]> shape the specs
// editor's form field expects.
function mapSpecsArrayToRecord(
  specs: { label: string; value: string | null }[] | undefined | null
): Record<string, string[]> {
  const record: Record<string, string[]> = {};
  for (const spec of specs ?? []) {
    const { label, value } = spec;
    if (!label) continue;
    if (value == null || value === '') continue; // ✅ skip blank specs entirely
    if (!record[label]) {
      record[label] = [];
    }
    record[label].push(value);
  }
  return record;
}

// Finds the active deal on a product (matches the same logic used
// server-side when syncing deals), then flattens its discount-code
// junction rows into the flat shape ProductForm expects.
function extractDiscountFields(product: any) {
  const deals = product.deals ?? [];
  const activeDeal =
    deals.find((d: any) => d.status === 'Active') ?? deals[0] ?? null;

  const junctionRows = activeDeal?.dealDiscountCodes ?? [];

  return {
    discountCodes: junctionRows.map((row: any) => row.discountId),
    // Use the first junction row's window/tickets as the form's single
    // set of fields — if multiple codes have different windows, this
    // takes the first one; adjust if you need per-code display instead.
    discount_start: toDateInputString(junctionRows[0]?.discount_start),
    discount_end: toDateInputString(junctionRows[0]?.discount_end),
    total_tickets: junctionRows[0]?.total_tickets ?? undefined,
  };
}

function mapProductToFormValues(product: any): FormValues {
  const discountFields = extractDiscountFields(product);

  return {
    ...product,
    images: normalizeImages(product.images),
    deal_start: toDateInputString(product.deal_start),
    deal_end: toDateInputString(product.deal_end),
    ...discountFields, // ✅ discountCodes, discount_start, discount_end, total_tickets
    stock: product.stock != null ? Number(product.stock) : undefined,
    regular_price:
      product.regular_price != null ? Number(product.regular_price) : undefined,
    sale_price:
      product.sale_price != null ? Number(product.sale_price) : undefined,
    sizes: product.sizes ?? [],
    product_specifications: mapSpecsArrayToRecord(
      product.product_specifications
    ),
    colorVariants: (product.colorVariants ?? []).map((variant: any) => ({
      ...variant,
      images: normalizeVariantImages(variant.images),
      dealStart: toDateInputString(variant.dealStart),
      dealEnd: toDateInputString(variant.dealEnd),
      dealPrice:
        variant.dealPrice != null ? Number(variant.dealPrice) : undefined,
      price: variant.price != null ? Number(variant.price) : undefined,
    })),
  };
}

export default function EditProductPage() {
  const { slug } = useParams();

  const { data: product } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const res = await axiosProduct.get(`/get-product/${slug}`);
      return res.data.product; // unwrap { product: {...} }
    },
    select: (data) => mapProductToFormValues(data),
    enabled: !!slug,
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

  return (
    <ProductForm key={slug as string} mode="editProduct" product={product} />
  );
}
