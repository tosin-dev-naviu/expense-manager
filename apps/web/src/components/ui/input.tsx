import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
};

export function Input({ hint, id, label, ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <label className="field" htmlFor={inputId}>
      <span className="field__label">{label}</span>
      <input className="field__input" id={inputId} {...props} />
      {hint ? <span className="field__hint">{hint}</span> : null}
    </label>
  );
}
