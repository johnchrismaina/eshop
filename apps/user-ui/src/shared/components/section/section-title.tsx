import React from 'react';
// import TitleBorder from 'apps/user-ui/src/assets/svgs/title-border';

const SectionTitle = ({ title }: { title: string }) => {
  console.log(
    'SectionTitle render:',
    typeof window === 'undefined' ? 'server' : 'client',
    { title }
  );

  return (
    <div className="relative">
      <h1 className="md:text-xl text-md relative z-10 text-gray-800 font-bold ">
        {title}
      </h1>
      {/* <TitleBorder className="absolute top-[46%]" /> */}
    </div>
  );
};

export default SectionTitle;
