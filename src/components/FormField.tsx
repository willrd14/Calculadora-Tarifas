import type { ReactNode } from "react";

export const inputClassName =
  "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

/** Envuelve un input con su label y mensaje de error, con el estilo estándar del formulario. */
export function FormField({
  label,
  htmlFor,
  error,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="mb-1 block text-sm font-medium text-neutral-700"
      >
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
