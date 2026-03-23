import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost";
    fullWidth?: boolean;
  }
>;

export function Button({
  children,
  className = "",
  fullWidth = false,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`button button--${variant}${fullWidth ? " button--full" : ""}${
        className ? ` ${className}` : ""
      }`}
      {...props}
    >
      {children}
    </button>
  );
}
