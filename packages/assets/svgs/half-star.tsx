import { FC } from 'react';

export const HalfStar: FC<{ size?: number; color?: string }> = ({
  size = 24,
  color = '#f2a71b',
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <defs>
      <clipPath id="half">
        <rect x="0" y="0" width="12" height="24" />
      </clipPath>
    </defs>
    <polygon
      points="12 2 15.09 8.26 22 9.27 
              17 14.14 18.18 21.02 
              12 17.77 5.82 21.02 
              7 14.14 2 9.27 
              8.91 8.26 12 2"
      fill={color}
      clipPath="url(#half)"
    />
    <polygon
      points="12 2 15.09 8.26 22 9.27 
              17 14.14 18.18 21.02 
              12 17.77 5.82 21.02 
              7 14.14 2 9.27 
              8.91 8.26 12 2"
      fill="none"
    />
  </svg>
);
