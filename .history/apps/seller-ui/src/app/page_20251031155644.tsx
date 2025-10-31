import React from 'react';
import { Spinner } from '../assets/components/Spinner';

const Page = () => {
  return (
    <div className="p-8">
      Page
      <br />
      <button
        type="button"
        className="bg-indigo-500 px-8 py-4 flex gap-2 rounded-lg"
        disabled
      >
        <Spinner color="border-t-gray-200" highlight="border-indigo-300" />
        Processing…
      </button>
    </div>
  );
};

export default Page;
