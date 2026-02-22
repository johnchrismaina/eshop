'use client';

export const dynamic = 'force-dynamic';
import ReactImageMagnify from 'react-image-magnify';

export default function MagnifyTestPage() {
  return (
    <div className="flex justify-center p-10">
      <div className="w-[400px] mx-auto [&_img]:max-w-none [&_img]:inline-block">
        <ReactImageMagnify
          {...{
            smallImage: {
              alt: 'Wristwatch',
              isFluidWidth: true,
              src: 'https://s3-us-west-1.amazonaws.com/react-package-assets/images/wristwatch_1033.jpg',
            },
            largeImage: {
              src: 'https://s3-us-west-1.amazonaws.com/react-package-assets/images/wristwatch_1200.jpg',
              width: 1200,
              height: 1800,
            },
            isHintEnabled: true,
            enlargedImagePosition: 'beside',
          }}
        />
      </div>
    </div>
  );
}
