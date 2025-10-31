import React from 'react';
import Spinner from '../../../../packages/libs/shared/components/Spinner/Spinner';

const Page = () => {
  return (
    <div>
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
