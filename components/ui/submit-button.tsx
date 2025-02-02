"use client";

import { Button, ButtonProps } from "@/components/ui/button";
import { ReactNode, useState } from "react";

interface SubmitButtonProps extends ButtonProps {
  onClick: () => Promise<void>;
  children: ReactNode;
}

export function SubmitButton({ onClick, children, ...props }: SubmitButtonProps) {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      {...props}
      disabled={props.disabled || loading}
      onClick={async () => {
        setLoading(true);
        try {
          await onClick();
        } finally {
          setLoading(false);
        }
      }}
    >
      {loading ? "Processing..." : children}
    </Button>
  );
} 