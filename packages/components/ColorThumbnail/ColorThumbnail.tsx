interface ColorThumbnailProps {
  title: string;
  image: string;
  price: number;
  dealPrice?: number;
  // onHover: (color: string) => void; // notify parent
  // onSelect: (color: string) => void; // optional click select
  onSelect: (swatch: {
    title: string;
    image: string;
    price: number;
    dealPrice?: number;
  }) => void;
}

export default function ColorThumbnail({
  title,
  image,
  price,
  dealPrice,
  // onHover,
  onSelect,
}: ColorThumbnailProps) {
  return (
    <div
      className="flex flex-col items-center gap-2 cursor-pointer rounded-md border border-gray-200"
      // onMouseEnter={() => onHover(title)}
      onClick={() => onSelect({ title, image, price, dealPrice })}
    >
      {/* Thumbnail */}
      <img src={image} alt={title} className="w-32 h-32 object-cover " />

      {/* Pricing */}
      <div className="flex flex-col items-center">
        {dealPrice ? (
          <>
            <span className="text-[#1C1C1E] font-bold text-sm">
              KES {dealPrice.toLocaleString()}
            </span>
            <span className="text-gray-400 line-through text-sm">
              KES {price.toLocaleString()}
            </span>
          </>
        ) : (
          <span className="text-[#1C1C1E] font-bold text-sm">
            KES {price.toLocaleString()}
          </span>
        )}
      </div>
    </div>
  );
}
