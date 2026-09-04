import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const baseField =
  "w-full rounded-xl border bg-white px-3.5 text-[15px] text-ink placeholder:text-stone-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:bg-stone-100";

const borderFor = (invalid?: boolean) => (invalid ? "border-red-400" : "border-stone-300");

type InputProps = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ className, invalid, ...props }, ref) {
  return <input ref={ref} className={cn(baseField, "h-11", borderFor(invalid), className)} aria-invalid={invalid || undefined} {...props} />;
});

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean };
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, invalid, ...props },
  ref,
) {
  return <textarea ref={ref} className={cn(baseField, "min-h-32 py-2.5 leading-relaxed", borderFor(invalid), className)} aria-invalid={invalid || undefined} {...props} />;
});

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean };
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ className, invalid, ...props }, ref) {
  return <select ref={ref} className={cn(baseField, "h-11 pr-9", borderFor(invalid), className)} aria-invalid={invalid || undefined} {...props} />;
});

export function Label({ htmlFor, children, required, hint }: { htmlFor: string; children: React.ReactNode; required?: boolean; hint?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold text-ink">
      {children}
      {required ? <span className="ml-0.5 text-red-600" aria-hidden="true">*</span> : null}
      {hint ? <span className="ml-1.5 font-normal text-muted">{hint}</span> : null}
    </label>
  );
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-sm text-red-600">
      {message}
    </p>
  );
}

export function Checkbox({ id, label, description, ...props }: InputHTMLAttributes<HTMLInputElement> & { id: string; label: string; description?: string }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3 rounded-xl border border-stone-200 bg-white p-3.5 transition-colors hover:border-brand-300 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50">
      <input id={id} type="checkbox" className="mt-0.5 size-5 shrink-0 rounded border-stone-300 accent-brand-600" {...props} />
      <span>
        <span className="block text-sm font-semibold text-ink">{label}</span>
        {description ? <span className="block text-sm text-muted">{description}</span> : null}
      </span>
    </label>
  );
}
