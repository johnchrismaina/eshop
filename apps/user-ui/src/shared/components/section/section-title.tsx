import React from 'react';
// import TitleBorder from 'apps/user-ui/src/assets/svgs/title-border';

const SectionTitle = ({ title }: { title: string }) => {
  return (
    <div className="relative">
      <h1 className="md:text-2xl text-md relative z-10 text-gray-700 font-bold">
        {title}
      </h1>
      {/* <TitleBorder className="absolute top-[46%]" /> */}
    </div>
  );
};

export default SectionTitle;
