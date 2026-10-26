"use client";

import { forwardRef } from "react";
import { buttonVariants, type ButtonVariant as Variant, type ButtonSize as Size } from "~/lib/button-variants";

// Re-export agar komponen client tetap bisa mengimpor dari modul UI Button.
// Implementasi murni ada di ~/lib/button-variants supaya aman dipanggil dari server component.
export { buttonVariants };

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={buttonVariants({ variant, size, className })}
      {...props}
    />
  )
);
Button.displayName = "Button";
