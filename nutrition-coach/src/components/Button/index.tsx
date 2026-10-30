import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline";
};

const variants = {
  primary: "bg-primary text-on-primary shadow-card hover:shadow-raised",
  outline: "border border-primary text-primary",
};

export function Button({
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`cursor-pointer rounded-button px-6 py-3 font-semibold transition-opacity focus:opacity-80 disabled:cursor-default disabled:opacity-60 ${variants[variant]}`}
      {...props}
    />
  );
}
