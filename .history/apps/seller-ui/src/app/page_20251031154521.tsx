import React from 'react';
import { Spinner } from '../assets/components/Spinner';

const Page = () => {
  return (
    <div className="p-8">
      Page
      <br />
      <button
        type="button"
        className="bg-indigo-500 px-8 py-4 flex rounded-lg"
        disabled
      >
        <Spinner />
        Processing…
      </button>
    </div>
  );
};

export default Page;
