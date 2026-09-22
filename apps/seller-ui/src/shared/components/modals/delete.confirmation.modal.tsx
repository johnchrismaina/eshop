import { X } from 'lucide-react';
import Spinner from 'packages/components/spinner';
import React from 'react';

type Item = {
  id: string;
  title: string;
};

type DeleteConfirmationModalProps = {
  item: Item | null;
  mode: 'delete' | 'restore';
  onClose: () => void;
  onConfirm: (id: string) => void;
  isLoading: boolean; // ✅ pass mutation loading state
};

const DeleteConfirmationModal = ({
  item,
  mode,
  onClose,
  onConfirm,
  isLoading,
}: DeleteConfirmationModalProps) => {
  if (!item) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg md:w-[450px] shadow-lg relative">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-700 pb-3">
          <h3 className="text-xl text-white">
            {mode === 'delete' ? 'Delete Deal' : 'Restore Deal'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <p className="text-gray-300 mt-4">
          {mode === 'delete' ? (
            <>
              Are you sure you want to delete{' '}
              <span className="font-semibold text-white">{item.title}</span>?
              <br />
              This deal will be moved to a{' '}
              <span className="text-red-400">delete state</span> and permanently
              removed <span className="text-red-400">after 24 hours</span>.
            </>
          ) : (
            <>
              Do you want to restore{' '}
              <span className="font-semibold text-white">{item.title}</span>?
            </>
          )}
        </p>

        {/* Confirm button */}
        <div className="flex justify-center mt-6">
          <button
            onClick={() => onConfirm(item.id)}
            disabled={isLoading}
            className={`relative px-4 py-2 rounded-md text-white font-semibold transition ${
              mode === 'delete'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-green-600 hover:bg-green-700'
            } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {/* Keep text in DOM but hide when loading */}
            <span className={isLoading ? 'opacity-0' : 'opacity-100'}>
              {mode === 'delete' ? 'Confirm Delete' : 'Confirm Restore'}
            </span>

            {/* Spinner overlay */}
            {isLoading && (
              <span className="absolute inset-0 flex items-center justify-center">
                <Spinner size={16} borderColor="border-gray-100" />
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
