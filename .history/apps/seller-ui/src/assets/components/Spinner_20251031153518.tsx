import React from 'react';

type SpinnerProps = {
  size?: number;
  color?: string;
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = 24,
  color = '#333',
}) => (
  <div
    style={{
      width: size,
      height: size,
      border: `${size / 8}px solid #ccc`,
      borderTop: `${size / 8}px solid ${color}`,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    }}
  />
);

// Add this globally or scoped to the component
const style = document.createElement('style');
style.innerHTML = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;
document.head.appendChild(style);
