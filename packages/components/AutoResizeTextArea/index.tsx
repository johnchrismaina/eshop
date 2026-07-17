import React from 'react';

interface AutoResizeTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

const AutoResizeTextarea = React.forwardRef<
  HTMLTextAreaElement,
  AutoResizeTextareaProps
>(({ label, className, ...props }, ref) => {
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block font-semibold text-gray-700 mb-1">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={1} // starts at 1 row, expands automatically
        onInput={handleInput}
        className={`w-full border outline-none border-gray-500 bg-[#fdfdfd] px-2 pt-2 pb-4 rounded-md text-gray-800 resize-none ${className}`}
        {...props}
      />
    </div>
  );
});

AutoResizeTextarea.displayName = 'AutoResizeTextarea';
export default AutoResizeTextarea;
