'use client';

import React, { useDeferredValue, useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import { Ban, DownloadIcon, Search } from 'lucide-react';
import { saveAs } from 'file-saver';
import axiosInstance from 'apps/admin-ui/src/utils/axiosInstance';
import Breadcrumbs from 'apps/admin-ui/src/shared/components/breadcrumbs';
import Spinner from 'packages/components/spinner';

// Types
type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

type UsersResponse = {
  data: User[];
  meta: {
    totalUsers: number;
  };
};

const UsersPage = () => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const deferredGlobalFilter = useDeferredValue(globalFilter);
  const limit = 10;
  const queryClient = useQueryClient();

  const { data, isLoading }: UseQueryResult<UsersResponse, Error> = useQuery<
    UsersResponse,
    Error,
    UsersResponse,
    [string, number]
  >({
    queryKey: ['users-list', page],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/admin/api/get-all-users?page=${page}&limit=${limit}`
      );
      return res.data;
    },
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 5,
  });

  const banUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await axiosInstance.put(`/admin/api/ban-user/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-list'] });
      setIsModalOpen(false);
      setSelectedUser(null);
    },
  });

  const allUsers = data?.data || [];
  const filteredUsers = useMemo(() => {
    return allUsers.filter((user) => {
      const matchesRole = roleFilter
        ? user.role.toLowerCase() === roleFilter.toLowerCase()
        : true;
      const matchesGlobal = deferredGlobalFilter
        ? Object.values(user)
            .join(' ')
            .toLowerCase()
            .includes(deferredGlobalFilter.toLowerCase())
        : true;
      return matchesRole && matchesGlobal;
    });
  }, [allUsers, roleFilter, deferredGlobalFilter]);

  const totalPages = Math.ceil((data?.meta?.totalUsers ?? 0) / limit);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
      },
      {
        accessorKey: 'email',
        header: 'Email',
      },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }: any) => (
          <span className="uppercase font-semibold text-blue-400">
            {row.original.role}
          </span>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Joined',
        cell: ({ row }: any) => (
          <span className="text-gray-400">
            {new Date(row.original.createdAt).toLocaleDateString()}
          </span>
        ),
      },
      {
        header: 'Actions',
        cell: ({ row }: any) => (
          <button
            onClick={() => {
              setSelectedUser(row.original); // set the user you want to ban
              setIsModalOpen(true); // open the modal
            }}
            className="text-red-500 hover:text-red-600 transition"
          >
            <Ban size={18} />
          </button>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredUsers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  const exportToCSV = () => {
    const csvData = filteredUsers.map(
      (user: any) => `${user.name},${user.email},${user.role},${user.createdAt}`
    );
    const blob = new Blob(
      [`Name,Email,Role,Created At\n${csvData.join('\n')}`],
      { type: 'text/csv;charset=utf-8' }
    );
    saveAs(blob, `users-page-${page}.csv`);
  };

  return (
    <div className="w-full min-h-screen p-8 bg-black text-white text-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold tracking-wide">All Users</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center justify-center gap-2"
          >
            <DownloadIcon size={16} />
            Export CSV
          </button>

          <select
            className="bg-gray-800 border border-gray-700 outline-none text-white"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>
      </div>

      {/* Breadcrumbs */}
      <Breadcrumbs title="All Users" />

      {/* Search Bar */}
      <div className="my-4 flex items-center bg-gray-900 p-2 rounded-md flex-1">
        <Search size={18} className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search users"
          className="w-full bg-transparent text-white outline-none"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-gray-900 rounded-lg p-4">
        {isLoading ? (
          <div className="flex items-center justify-center gap-4">
            <Spinner size={16} borderColor="border-gray-200" />
            <p className="text-center text-white">Loading events...</p>
          </div>
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

        {/* Pagination controls */}
        <div className="flex justify-between items-center mt-4">
          <button
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
          >
            Previous
          </button>

          <span className="text-gray-300">
            Page {page} of {totalPages || 1}
          </span>

          <button
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
            onClick={() => setPage((prev) => prev + 1)}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      </div>

      {/* Ban Confirmation Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-[#1e293b] rounded-lg shadow-lg w-[90%] max-w-md p-6 relative">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-white text-lg font-semibold">Ban User</h3>
            </div>

            <div className="mb-6">
              <p className="text-gray-300 leading-6">
                <span className="text-yellow-400 font-medium">
                  ⚠ Important:{' '}
                </span>
                Are you sure you want to ban{' '}
                <span className="text-red-400 font-medium">
                  {selectedUser.name}
                </span>
                ? This action can be reverted later!
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-sm text-white rounded-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => banUserMutation.mutate(selectedUser.id)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-sm text-white rounded-sm flex items-center justify-center gap-2"
              >
                <Ban size={16} /> Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
