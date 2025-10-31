export const Spinner = ({
  size = 6,
  color = 'border-gray-300',
  highlight = 'border-t-blue-500',
}) => (
  <div
    className={`animate-spin rounded-full border-4 ${color} ${highlight}`}
    style={{ width: `${size * 4}px`, height: `${size * 4}px` }}
  />
);
