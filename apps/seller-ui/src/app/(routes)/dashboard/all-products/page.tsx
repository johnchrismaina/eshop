'use client';
import React, { useMemo, useState } from 'react';

import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';

import { Search, Pencil, Trash, Eye, Plus, BarChart, Star } from 'lucide-react';

import Link from 'next/link';
import axiosProduct from 'apps/seller-ui/src/utils/axiosProduct';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import DeleteConfirmationModal from 'apps/seller-ui/src/shared/components/modals/delete.confirmation.modal';
import Breadcrumbs from 'apps/seller-ui/src/shared/components/breadcrumbs';

const fetchProducts = async () => {
  const res = await axiosProduct.get('/get-shop-products');
  return res?.data?.products;
};

// frontend deleteProduct function
const deleteProduct = async (id: string) => {
  const res = await fetch(`/api/delete-product/${id}`, {
    method: 'DELETE',
    credentials: 'include', // critical for auth
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to delete');
  }
  return res.json();
};

const restoreProduct = async (productId: string) => {
  await axiosProduct.put(`/restore-product/${productId}`);
};

const ProductList = () => {
  const [globalFilter, setGlobalFilter] = useState('');
  // const [analyticsData, setAnalyticsData] = useState(null);
  // const [showAnalytics, setShowAnalytics] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  // const [selectedProduct, setSelectedProduct] = useState<any>();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-products'] });
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
      queryClient.invalidateQueries({ queryKey: ['shop-products'] });
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
          const images = row.original.images;

          // Handle cases where images is missing or not an array
          const imageUrl = Array.isArray(images) ? images[0]?.url : images?.url;

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
        accessorKey: 'price',
        header: 'Price',
        cell: ({ row }: any) => <span>${row.original.sale_price}</span>,
      },
      {
        accessorKey: 'stock',
        header: 'Stock',
        cell: ({ row }: any) => (
          <span
            className={row.original.stock < 10 ? 'text-red-500' : 'text-white'}
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
        cell: ({ row }: any) => (
          <div className="flex items-center gap-1 text-yellow-400">
            <Star size={18} fill="#fde047" />{' '}
            <span className="text-white">{row.original.ratings || 5}</span>
          </div>
        ),
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
            <button
              className="text-red-400 hover:text-red-300 transition"
              onClick={() => openDeleteModal(row.original)}
            >
              <Trash size={18} />
            </button>
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

  // const openDeleteModal = (product: any) => {
  //   setSelectedProduct(product);
  //   setShowDeleteModal(true);
  // };

  const openDeleteModal = (product: Product) => {
    console.log('Opening delete modal for:', product.id);
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  return (
    <div className="w-full min-h-screen p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-2l text-gray-700 font-semibold">All Products</h2>
        <Link
          href="/dashboard/create-product"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-1"
        >
          <Plus size={18} /> New Product
        </Link>
      </div>

      {/* Breadcrumbs */}
      <Breadcrumbs title="All Products" />

      {/* Search Bar */}
      <div className="mb-4 flex items-center bg-gray-200 p-2 rounded-md flex-1">
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
      <div className="overflow-x-auto bg-white rounded-lg p-4">
        {isLoading ? (
          <p className="text-center text-gray-700">Loading products...</p>
        ) : (
          <table className="w-full text-gray-700">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-gray-800">
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
                <tr
                  key={row.id}
                  className="border-b border-gray-800 hover:border-gray-900 transition"
                >
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
          // <DeleteConfirmationModal
          //   product={selectedProduct}
          //   onClose={() => setShowDeleteModal(false)}
          //   onConfirm={() => deleteMutation.mutate(selectedProduct?.id)}
          //   onRestore={() => restoreMutation.mutate(selectedProduct?.id)}
          // />

          <DeleteConfirmationModal
            product={selectedProduct}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={(id: string) => deleteMutation.mutate(id)}
            onRestore={(id: string) => restoreMutation.mutate(id)}
          />
        )}
      </div>
    </div>
  );
};

export default ProductList;
