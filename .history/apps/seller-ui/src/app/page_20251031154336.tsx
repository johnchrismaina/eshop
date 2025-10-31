import React from 'react';
import { Spinner } from '../assets/components/Spinner';

const Page = () => {
  return (
    <div className="p-8">
      Page
      <br />
      <button type="button" className="bg-indigo-500 ..." disabled>
        <Spinner />
        Processing…
      </button>
    </div>
  );
};

export default Page;
