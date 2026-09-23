'use client';
import React, { useMemo, useState } from 'react';

import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';

import {
  Search,
  Pencil,
  Trash,
  Eye,
  Plus,
  BarChart,
  Star,
  RotateCcwClock,
} from 'lucide-react';

import Link from 'next/link';
import axiosProduct from 'apps/seller-ui/src/utils/axiosProduct';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import DeleteConfirmationModal from 'apps/seller-ui/src/shared/components/modals/delete.confirmation.modal';
import Breadcrumbs from 'apps/seller-ui/src/shared/components/breadcrumbs';
import Ratings from 'packages/components/ratings';

const ProductList = () => {
  const [globalFilter, setGlobalFilter] = useState('');

  const queryClient = useQueryClient();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [modalMode, setModalMode] = useState<'delete' | 'restore'>('delete');

  const fetchProducts = async () => {
    const res = await axiosProduct.get('/get-shop-products');
    return res?.data?.products;
  };

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  console.log('data:', products);

  // frontend deleteProduct function
  // const deleteProduct = async (id: string) => {
  //   const res = await fetch(`/api/delete-product/${id}`, {
  //     method: 'DELETE',
  //     credentials: 'include', // critical for auth
  //   });
  //   if (!res.ok) {
  //     const err = await res.json().catch(() => ({}));
  //     throw new Error(err.message || 'Failed to delete');
  //   }
  //   return res.json();
  // };

  // const restoreProduct = async (productId: string) => {
  //   await axiosProduct.put(`/restore-product/${productId}`);
  // };

  const deleteProduct = async (id: string) => {
    console.log('Frontend calling DELETE Product with id:', id);
    await axiosProduct.delete(`/delete-product/${id}`);
  };

  const restoreProduct = async (id: string) => {
    console.log('Frontend calling RESTORE Product with id:', id);
    await axiosProduct.put(`/restore-product/${id}`);
  };

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowDeleteModal(false);
    },
    onError: (err) => {
      console.error(err);
      alert('Delete failed');
    },
  });

  //   Restore Product Mutation
  const restoreMutation = useMutation({
    mutationFn: restoreProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowDeleteModal(false);
    },
  });

  const USER_UI_BASE_URL =
    process.env.NEXT_PUBLIC_USER_UI_BASE_URL || 'http://localhost:3001';

  const SELLER_UI_BASE_URL =
    process.env.NEXT_PUBLIC_SELLER_UI_BASE_URL || 'http://localhost:3000';

  const columns = useMemo(
    () => [
      {
        accessorKey: 'images',
        header: 'Image',
        cell: ({ row }: any) => {
          const product = row.original;

          // console.log('--- Image cell debug ---');
          // console.log('product.id:', product.id);
          // console.log('product.colorVariants:', product.colorVariants);
          // console.log('product.images:', product.images);

          let imageUrl: string | undefined;

          const variants = Array.isArray(product.colorVariants)
            ? product.colorVariants
            : [];

          if (variants.length > 0) {
            const chosenVariant =
              variants.find((v: any) => v.isDefault) ?? variants[0];

            // console.log('chosenVariant:', chosenVariant);
            // console.log('chosenVariant.images:', chosenVariant?.images);

            if (
              Array.isArray(chosenVariant?.images) &&
              chosenVariant.images.length > 0
            ) {
              const firstImage = chosenVariant.images[0];
              // console.log(
              //   'firstImage (raw):',
              //   firstImage,
              //   'typeof:',
              //   typeof firstImage
              // );

              // Handle both shapes: array of URL strings, or array of {url} objects
              imageUrl =
                typeof firstImage === 'string' ? firstImage : firstImage?.url;
            }
          }

          // console.log('imageUrl after variant check:', imageUrl);

          // Fallback to main product images if variants had none
          if (!imageUrl) {
            imageUrl = Array.isArray(product.images)
              ? typeof product.images[0] === 'string'
                ? product.images[0]
                : product.images[0]?.url
              : product.images?.url;
          }

          // console.log('final imageUrl:', imageUrl);

          return imageUrl ? (
            <Image
              src={imageUrl}
              alt="Product image"
              width={200}
              height={200}
              className="w-12 h-12 object-cover rounded-md"
            />
          ) : (
            <span className="text-gray-400">No image</span>
          );
        },
      },
      {
        accessorKey: 'name',
        header: 'Product Name',
        cell: ({ row }: any) => {
          const truncatedTitle =
            row.original.title.length > 25
              ? `${row.original.title.substring(0, 25)}...`
              : row.original.title;

          return (
            <Link
              href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`}
              className="text-blue-500 hover:underline"
              title={row.original.title}
            >
              {truncatedTitle}
            </Link>
          );
        },
      },
      {
        accessorKey: 'regular_price',
        header: 'Regular Price',
        cell: ({ row }: any) => <span>${row.original.regular_price}</span>,
      },
      {
        accessorKey: 'stock',
        header: 'Stock',
        size: 90, // fixed width for the column (if your table lib supports this)
        minSize: 90, // prevents it from shrinking below this
        cell: ({ row }: any) => (
          <span
            className={`whitespace-nowrap ${
              row.original.stock < 10 ? 'text-red-500' : 'text-gray-700'
            }`}
          >
            {row.original.stock} left
          </span>
        ),
      },
      {
        accessorKey: 'category',
        header: 'Category',
      },
      {
        accessorKey: 'rating',
        header: 'Rating',
        cell: ({ row }: any) => {
          const rating = row.original.ratings ?? 4;
          return (
            <div className="flex items-center gap-2">
              <Ratings rating={rating} />
              <span className="text-white text-sm">{rating}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const deal = row.original;
          if (!deal.isDeleted)
            return <span className="text-green-600 ">Active</span>;
          if (deal.deletedAt && new Date(deal.deletedAt) > new Date()) {
            return <span className="text-yellow-600">Pending Deletion</span>;
            // ✅ future date means still pending
          }
          return <span className="text-red-600">Expired</span>; // ✅ past date means expired
        },
      },
      {
        header: 'Actions',
        cell: ({ row }: any) => (
          <div className="flex gap-4 ">
            <Link
              href={`${USER_UI_BASE_URL}/product/${row.original.slug}`}
              className="text-blue-400 hover:text-blue-300 transition"
              target="_blank"
            >
              <Eye size={18} />
            </Link>
            <Link
              href={`${SELLER_UI_BASE_URL}/dashboard/product/edit/${row.original.slug}`}
              className="text-yellow-400 hover:text-yellow-30 transtion "
            >
              <Pencil size={18} />
            </Link>
            <button
              className="text-green-400 hover:text-green-300 transition"
              // onClick={() => openAnalytics(row.original)}
            >
              <BarChart size={18} />
            </button>

            <div className="flex gap-4 text-gray-800">
              {/* Restore button */}
              <button
                disabled={!row.original.isDeleted} // disable if not deleted
                className={`${
                  !row.original.isDeleted
                    ? 'opacity-50 cursor-not-allowed'
                    : 'text-green-400 hover:text-green-300'
                } transition font-semibold`}
                onClick={() => {
                  if (row.original.isDeleted) {
                    setSelectedProduct(row.original);
                    setModalMode('restore');
                    setShowDeleteModal(true);
                  }
                }}
              >
                <RotateCcwClock size={18} />
              </button>

              {/* Delete button */}
              <button
                disabled={row.original.isDeleted} // disable if already deleted
                className={`${
                  row.original.isDeleted
                    ? 'opacity-50 cursor-not-allowed'
                    : 'text-red-400 hover:text-red-300'
                } transition`}
                onClick={() => {
                  console.log(
                    'Delete button clicked for deal:',
                    row.original.id
                  );
                  if (!row.original.isDeleted) {
                    setSelectedProduct(row.original);
                    setModalMode('delete');
                    setShowDeleteModal(true);
                  }
                }}
              >
                <Trash size={18} />
              </button>
            </div>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: 'includesString',
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  // Define the shape of your product
  type Product = {
    id: string;
    title: string;
    isDeleted?: boolean;
  };

  const openDeleteModal = (product: Product) => {
    console.log('Opening delete modal for:', product.id);
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  return (
    <div className="w-full min-h-screen px-10 py-4 bg-[#f5f5f5]">
      {/* Header */}
      <div className="flex justify-between items-end mb-1 border-b border-gray-300 py-3">
        <h2 className="text-xl text-gray-900 font-semibold">All Products</h2>
        <Link
          href="/dashboard/create-product"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-1"
        >
          <Plus size={18} /> New Product
        </Link>
      </div>

      {/* Breadcrumbs */}
      <div className="py-3">
        <Breadcrumbs title="All Products" />
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex items-center bg-white border border-gray-200 p-2 rounded-md flex-1">
        <Search size={18} className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search products"
          className="w-full bg-transparent text-gray-700 outline-none"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto text-gray-800 bg-white py-6 px-8 border border-gray-200 rounded-lg ">
        {isLoading ? (
          <p className="text-center text-gray-700">Loading products...</p>
        ) : (
          <table className="w-full text-gray-700">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-gray-600">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="p-3 text-left">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-gray-400 ">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {showDeleteModal && (
          <DeleteConfirmationModal
            item={selectedProduct}
            mode={modalMode} // 'delete' or 'restore'
            onClose={() => setShowDeleteModal(false)}
            onConfirm={(id: string) =>
              modalMode === 'delete'
                ? deleteMutation.mutate(id)
                : restoreMutation.mutate(id)
            }
            isLoading={
              modalMode === 'delete'
                ? deleteMutation.isPending // ✅ use isPending
                : restoreMutation.isPending
            }
          />
        )}
      </div>
    </div>
  );
};

export default ProductList;
