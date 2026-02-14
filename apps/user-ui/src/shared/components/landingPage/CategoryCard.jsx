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
    <div className="bg-white overflow-hidden rounded-lg ">
      <div className="pt-6 pb-4 px-5">
        <h3 className="font-bold text-xl mb-4 ">{title}</h3>

        {/* Layout based on item count */}
        {count === 1 && (
          <Link href={items[0].href} className="block w-full rounded-md px-4">
            <div className="relative w-full h-80">
              <Image
                src={items[0].image}
                alt={items[0].label}
                fill
                className="object-cover rounded-md"
              />
            </div>
            <span className="block mt-2 text-sm text-center">
              {items[0].label}
            </span>
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
                <span className="text-sm">{item.label}</span>
              </Link>
            ))}
          </div>
        )}

        {count > 2 && (
          <div className="grid grid-cols-2 gap-0 mb-2 ">
            {items.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center text-center hover:text-blue-600 transition-colors "
              >
                {/* Each image wrapper has its own size */}
                <div className="relative w-[200px] h-[150px] ">
                  <Image
                    src={item.image}
                    alt={item.label}
                    // width={itemWidth}
                    // height={itemHeight}
                    fill
                    className="object-contain mb-2 rounded-md"
                  />
                </div>
                <span className="text-sm font-medium text-gray-500">
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        )}

        {/* See more link */}
        {seeMoreHref && (
          <Link
            href={seeMoreHref}
            className="text-sm text-blue-600 hover:underline mt-3 block"
          >
            See more
          </Link>
        )}
      </div>
    </div>
  );
}
