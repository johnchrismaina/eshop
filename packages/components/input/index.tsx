import React from 'react';
import { forwardRef } from 'react';

interface BaseProps {
  label?: string;
  type?: 'text' | 'number' | 'password' | 'email' | 'textarea';
  className?: string;
  rows?: number; // add rows support for textarea
}

type InputProps = BaseProps & React.InputHTMLAttributes<HTMLInputElement>;

type TextareaProps = BaseProps &
  React.TextareaHTMLAttributes<HTMLTextAreaElement>;

type Props = InputProps | TextareaProps;

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, Props>(
  ({ label, type = 'text', className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block font-semibold text-gray-700 mb-1">
            {label}
          </label>
        )}

        {type === 'textarea' ? (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            className={`w-full border border-gray-300 rounded-md outline-none bg-transparent px-2 py-1.5 text-gray-800 ${className}`}
            {...(props as TextareaProps)}
          />
        ) : (
          <input
            type={type}
            ref={ref as React.Ref<HTMLInputElement>}
            className={`w-full border border-gray-300 rounded-md outline-none transparent px-2 py-1.5 text-gray-800 ${className}`}
            {...(props as InputProps)}
          />
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
