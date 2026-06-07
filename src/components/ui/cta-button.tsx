import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CTAButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  size?: "sm" | "default" | "lg";
  variant?: "whatsapp" | "success";
  className?: string;
  pulse?: boolean;
}

export function CTAButton({
  children,
  href,
  onClick,
  size = "lg",
  variant = "whatsapp",
  className,
  pulse = false
}: CTAButtonProps) {
  const baseStyles = "font-bold transition-all duration-300 hover:scale-105 active:scale-95";
  const variantStyles = {
    whatsapp: "bg-whatsapp hover:bg-whatsapp/90 text-whatsapp-foreground",
    success: "bg-success hover:bg-success/90 text-success-foreground"
  };

  const sizeStyles = {
    sm: "px-4 py-2 text-sm",
    default: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  const buttonClass = cn(
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    pulse && "pulse-green",
    className
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(buttonClass, "inline-block text-center rounded-lg no-underline")}
        onClick={onClick}
      >
        {children}
      </a>
    );
  }

  return (
    <Button
      className={buttonClass}
      size={size}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
