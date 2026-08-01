// Example imports (adjust paths to your icon exports)
import { FC } from 'react';
import { Star } from 'lucide-react';
import { StarFilled } from 'packages/assets/svgs/star-filled';
import { HalfStar } from 'packages/assets/svgs/half-star';
// import StarOutline from './StarOutline';

type Props = {
  rating: number; // e.g. 3.5
};

const Ratings: FC<Props> = ({ rating }) => {
  const stars = [];

  // Loop through 1–5 stars
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      // full star
      stars.push(<StarFilled key={`star-${i}`} size={12} />);
    } else if (rating >= i - 0.5) {
      // half star
      stars.push(<HalfStar key={`star-${i}`} size={12} />);
    } else {
      // empty star
      stars.push(<Star key={`star-${i}`} size={12} color="#FFC107" />);
    }
  }

  return <div className="flex items-center gap-1 ">{stars}</div>;
};

export default Ratings;
