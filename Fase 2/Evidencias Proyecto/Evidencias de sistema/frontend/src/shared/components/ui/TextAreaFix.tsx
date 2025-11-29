import React from "react";
import { Textarea } from "@heroui/input";

interface TextareaFixProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  disabled?: boolean;
  maxLength?: number;
  showCount?: boolean;
}

const TextareaFix: React.FC<TextareaFixProps> = ({
  value,
  onChange,
  placeholder,
  rows = 4,
  className,
  disabled = false,
  maxLength,
  showCount,
}) => {
  // Type-safe wrapper for onChange to handle the HeroUI type mismatch
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Cast the event to the expected HTMLTextAreaElement type
    const textareaEvent =
      e as unknown as React.ChangeEvent<HTMLTextAreaElement>;

    onChange(textareaEvent);
  };

  return (
    <div className="w-full">
      <Textarea
        className={className}
        disabled={disabled}
        placeholder={placeholder}
        rows={rows}
        value={value}
        onChange={handleChange}
        maxLength={maxLength}
        // Remove showCount from here since HeroUI doesn't support it
      />
      {showCount && maxLength && (
        <p className="text-sm text-muted-foreground mt-1">
          {value.length} / {maxLength} caracteres
        </p>
      )}
    </div>
  );
};

export { TextareaFix };
export default TextareaFix;
