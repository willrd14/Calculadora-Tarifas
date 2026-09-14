import type { ReactNode } from "react";

export const inputClassName =
  "w-full rounded border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

/** Etiqueta de sección — mismo tratamiento que las etiquetas del PDF (mayúsculas, mono, sutil). */
export function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-mono text-xs uppercase tracking-wide text-ink-faint">
      {children}
    </h2>
  );
}

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
        className="mb-1 block text-sm font-medium text-ink-soft"
      >
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  );
}
