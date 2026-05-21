import { InputHTMLAttributes, ReactNode, forwardRef } from "react";
import { clsx } from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  suffix?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, suffix, ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1">
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-gray-700"
        >
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              "w-full rounded-md border px-3 py-2 text-sm shadow-sm",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              "placeholder:text-gray-400",
              suffix && "pr-10",
              error
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300",
              className
            )}
            {...props}
          />
          {suffix && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {suffix}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
