import { X } from 'lucide-react';
import React from 'react';

type Item = {
  id: string;
  title: string;
};

type DeleteConfirmationModalProps = {
  item: Item | null;
  mode: 'delete' | 'restore'; // ✅ distinguish action
  onClose: () => void;
  onConfirm: (id: string) => void;
};

const DeleteConfirmationModal = ({
  item,
  mode,
  onClose,
  onConfirm,
}: DeleteConfirmationModalProps) => {
  if (!item) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-lg md:w-[450px] shadow-lg">
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
              <span className="font-semibold text-white">{item.title}</span> ?
              <br />
              This deal will be moved to a{' '}
              <span className="text-red-400">delete state </span>
              and permanently removed{' '}
              <span className="text-red-400">after 24 hours</span>.
            </>
          ) : (
            <>
              Do you want to restore{' '}
              <span className="font-semibold text-white">{item.title}</span>?
            </>
          )}
        </p>

        {/* Confirm button only */}
        <div className="flex justify-center mt-6">
          <button
            onClick={() => {
              console.log('Confirm delete clicked for:', item.id);
              onConfirm(item.id);
            }}
            className={`${
              mode === 'delete'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-green-600 hover:bg-green-700'
            } px-4 py-2 rounded-md text-white font-semibold transition`}
          >
            {mode === 'delete' ? 'Confirm Delete' : 'Confirm Restore'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
