import Link from 'next/link';
import Image from 'next/image';

export default function CategoryCard({
  title,
  items,
  itemWidth = 300,
  itemHeight = 180,
  seeMoreHref,
}) {
  const count = items.length;

  return (
    <div className="bg-white overflow-hidden rounded-md">
      <div className="pt-5 pb-4 px-5">
        <h3 className="font-bold text-xl mb-3 ">{title}</h3>

        {/* Layout based on item count */}
        {count === 1 && (
          <Link href={items[0].href} className="block w-full px-0">
            <div className="relative w-[412px] h-[260px]">
              <Image
                src={items[0].image}
                alt={items[0].label}
                fill
                className="object-cover rounded-md"
              />
            </div>
            {/* <span className="block mt-2 text-sm text-center">
              {items[0].label}
            </span> */}
          </Link>
        )}

        {count === 2 && (
          <div className="grid grid-cols-2 gap-4 mb-4 ">
            {items.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center text-center hover:text-blue-600 transition-colors"
              >
                <Image
                  src={item.image}
                  alt={item.label}
                  fill
                  // width={itemWidth}
                  // height={itemHeight}
                  className="object-cover mb-2 rounded-md"
                />
                {/* <span className="text-sm">{item.label}</span> */}
              </Link>
            ))}
          </div>
        )}

        {count > 2 && (
          <div className="grid grid-cols-2 gap-4 mb-2 ">
            {items.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center justify-center text-center hover:text-blue-600 transition-colors bg-blue-300 rounded-md"
              >
                {/* Each image wrapper has its own size */}
                <div className="relative w-[210px] h-[168px] ">
                  <Image
                    src={item.image}
                    alt={item.label}
                    // width={itemWidth}
                    // height={itemHeight}
                    fill
                    className="object-contain mb-0 rounded-md"
                  />
                </div>
                {/* <span className="text-sm font-medium text-gray-500 mb-4">
                  {item.label}
                </span> */}
              </Link>
            ))}
          </div>
        )}

        {/* See more link */}
        {seeMoreHref && (
          <Link
            href={seeMoreHref}
            className="text-sm text-blue-600 hover:underline mt-0 block"
          >
            See more
          </Link>
        )}
      </div>
    </div>
  );
}
