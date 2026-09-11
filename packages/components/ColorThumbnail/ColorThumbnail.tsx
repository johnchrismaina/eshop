interface ColorThumbnailProps {
  title: string;
  name: string;
  image: string;
  price: number;
  dealPrice?: number;
  onHover?: (name: string) => void; // ✅ notify parent on hover
  onLeave?: () => void;
  onSelect: (swatch: {
    title: string;
    image: string;
    price: number;
    dealPrice?: number;
  }) => void;
  isActive?: boolean;
}

export default function ColorThumbnail({
  title,
  name,
  image,
  price,
  dealPrice,
  onHover,
  onLeave,
  onSelect,
  isActive,
}: ColorThumbnailProps) {
  return (
    <div
      className={`flex flex-col items-center gap-2 cursor-pointer rounded-md border 
        ${
          isActive
            ? 'border-none border-gray-200 ring-2 ring-offset-2 ring-slate-800'
            : 'border-gray-300'
        }
      `}
      onMouseEnter={() => onHover?.(name)} // ✅ hover updates parent
      onMouseLeave={() => onLeave?.()}
      onClick={() => onSelect({ title, image, price, dealPrice })}
    >
      {/* Thumbnail */}
      <img
        src={image}
        alt={title}
        className="w-32 h-32 object-cover rounded-t-md "
      />

      {/* Pricing */}
      <div className="flex flex-col items-center mb-2">
        {dealPrice ? (
          <>
            <span className="text-[#1C1C1E] font-semibold text-sm">
              Ksh {dealPrice.toLocaleString()}
            </span>
            <span className="text-gray-400 line-through text-sm">
              Ksh {price.toLocaleString()}
            </span>
          </>
        ) : (
          <span className="text-[#1C1C1E] font-semibold text-sm">
            Ksh {price.toLocaleString()}
          </span>
        )}
      </div>
    </div>
  );
}
