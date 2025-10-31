import React from 'react';
import { Spinner } from '../../../../';

const Page = () => {
  return (
    <div>
      Page
      <button type="button" className="bg-indigo-500 ..." disabled>
        <Spinner />
        Processing…
      </button>
    </div>
  );
};

export default Page;
