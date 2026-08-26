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

const fetchDeals = async () => {
  const res = await axiosProduct.get('/get-shop-deals');
  return res?.data?.deals;
};

const deleteDeal = async (dealId: string) => {
  await axiosProduct.delete(`/delete-deal/${dealId}`);
};

const restoreDeal = async (dealId: string) => {
  await axiosProduct.put(`/restore-deal/${dealId}`);
};

const DealList = () => {
  const [globalFilter, setGlobalFilter] = useState('');
  // const [analyticsData, setAnalyticsData] = useState(null);
  // const [showAnalytics, setShowAnalytics] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<any>();
  const queryClient = useQueryClient();

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ['deals'],
    queryFn: fetchDeals,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  //   Delete Deal Mutation
  const deleteMutation = useMutation({
    mutationFn: deleteDeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-deals'] });
      setShowDeleteModal(false);
    },
  });

  //   Restore Deal Mutation
  const restoreMutation = useMutation({
    mutationFn: restoreDeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-deals'] });
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
              className="text-blue-400 hover:underline"
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
        accessorKey: 'sale_price',
        header: 'Sale Price',
        cell: ({ row }: any) => <span>${row.original.sale_price}</span>,
      },
      {
        accessorKey: 'stock',
        header: 'Stock',
        cell: ({ row }: any) => (
          <span
            className={
              row.original.available_tickets < 10
                ? 'text-red-500'
                : 'text-white'
            }
          >
            {row.original.available_tickets} left
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
            <span className="text-white">{row.original.ratings || 4}</span>
          </div>
        ),
      },
      {
        header: 'Actions',
        cell: ({ row }: any) => (
          <div className="flex gap-4 ">
            {/* View deal */}
            <Link
              // href={`/product/${row.original.id}`}
              href={`${USER_UI_BASE_URL}/product/${row.original.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition"
            >
              <Eye size={18} />
            </Link>

            {/* Edit */}
            <Link
              // href={`/product/edit/${row.original.id}`}
              href={`${SELLER_UI_BASE_URL}/dashboard/product/edit/${row.original.slug}`}
              className="text-yellow-400 hover:text-yellow-30 transtion "
            >
              <Pencil size={18} />
            </Link>

            {/* Analytics */}
            <button
              className="text-green-400 hover:text-green-300 transition"
              // onClick={() => openAnalytics(row.original)}
            >
              <BarChart size={18} />
            </button>

            {/* Delete button */}
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
    data: deals,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: 'includesString',
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  const openDeleteModal = (deal: any) => {
    setSelectedDeal(deal);
    setShowDeleteModal(true);
  };

  return (
    <div className="w-full min-h-screen p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-2l text-gray-700 font-semibold">All Deals</h2>
        <Link
          href="/dashboard/create-deal"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-1"
        >
          <Plus size={18} /> New Deal
        </Link>
      </div>

      {/* Breadcrumbs */}
      <Breadcrumbs title="All Deals" />

      {/* Search Bar */}
      <div className="mb-4 flex items-center bg-gray-900 p-2 rounded-md flex-1">
        <Search size={18} className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search offers"
          className="w-full bg-transparent text-white outline-none"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-gray-900 rounded-lg p-4">
        {isLoading ? (
          <p className="text-center text-white">Loading offers...</p>
        ) : (
          <table className="w-full text-white">
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
          <DeleteConfirmationModal
            deal={selectedDeal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={() => deleteMutation.mutate(selectedDeal?.id)}
            onRestore={() => restoreMutation.mutate(selectedDeal?.id)}
          />
        )}
      </div>
    </div>
  );
};

export default DealList;
