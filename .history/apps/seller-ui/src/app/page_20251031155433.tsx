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
        <Spinner color="border-white" highlight="border-t-indigo-500" />
        Processing…
      </button>
    </div>
  );
};

export default Page;
