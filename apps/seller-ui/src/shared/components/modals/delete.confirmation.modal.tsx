import { X } from 'lucide-react';
import React from 'react';

type Product = {
  id: string;
  title: string;
  isDeleted?: boolean;
};

type DeleteConfirmationModalProps = {
  product: Product | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
  onRestore: (id: string) => void;
};

const DeleteConfirmationModal = ({
  product,
  onClose,
  onConfirm,
  onRestore,
}: DeleteConfirmationModalProps) => {
  if (!product) return null; // or render a loading state

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-lg md:w-[450px] shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-700 pb-3">
          <h3 className="text-xl text-white">Delete Product</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <p className="text-gray-300 mt-4">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-white">{product.title}</span>?
        </p>

        {/* Action buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-md text-white transition"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              console.log('Deleting product with id:', product.id);
              if (!product.isDeleted) {
                onConfirm(product.id);
              } else {
                onRestore(product.id);
              }
            }}
            className={`${
              product.isDeleted
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
            } px-4 py-2 rounded-md text-white font-semibold transition`}
          >
            {product.isDeleted ? 'Restore' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
