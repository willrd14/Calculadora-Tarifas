import type { ReactNode } from "react";

export const inputClassName =
  "w-full rounded border border-border bg-well px-3 py-2 text-sm text-text placeholder:text-text-faint focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

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
        className="mb-1 block text-sm text-text-soft"
      >
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  );
}

/** Etiqueta de sección — prefijo `//` como un comentario de código. */
export function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-xs text-text-faint">
      <span className="text-accent">// </span>
      {children}
    </h2>
  );
}
