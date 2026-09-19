import * as React from 'react';

interface CartIconProps {
  size?: number;
  strokeWidth?: number;
  color?: string;
}

const CartIcon: React.FC<CartIconProps> = ({
  size = 22,
  strokeWidth = 1.5,
  color = '#333',
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="icon icon-tabler icons-tabler-outline icon-tabler-shopping-cart"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M4 19a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
    <path d="M15 19a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
    <path d="M17 17h-11v-14h-2" />
    <path d="M6 5l14 1l-1 7h-13" />
  </svg>
);

export default CartIcon;
