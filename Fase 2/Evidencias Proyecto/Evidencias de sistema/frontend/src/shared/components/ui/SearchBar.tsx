import React, { useRef, useEffect } from "react";
import { SearchIcon, X } from "lucide-react";
import { Button } from "@heroui/button";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Buscar...",
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const wasFocusedRef = useRef(false);

  // Mantener el foco si el input estaba enfocado antes del re-renderizado
  useEffect(() => {
    if (wasFocusedRef.current && inputRef.current) {
      const input = inputRef.current;
      const cursorPosition = input.value.length;

      // Usar setTimeout para asegurar que el DOM esté actualizado
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(cursorPosition, cursorPosition);
      }, 0);
    }
  });

  const handleFocus = () => {
    wasFocusedRef.current = true;
  };

  const handleBlur = () => {
    wasFocusedRef.current = false;
  };

  const handleClear = () => {
    onChange("");
    // Mantener el foco después de limpiar
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative flex items-center">
        <SearchIcon className="absolute left-3 w-4 h-4 text-default-400 z-10" />

        <input
          ref={inputRef}
          className="
            w-full
            pl-10 pr-10
            py-3
            bg-default-50
            dark:bg-default-100/50
            border-2 border-transparent
            rounded-lg
            text-black/90 dark:text-white/90
            placeholder:text-default-500
            backdrop-blur-xl
            backdrop-saturate-200
            shadow-sm
            transition-all duration-200
            hover:bg-default-100
            dark:hover:bg-default-100/70
            focus:outline-none
            focus:bg-default-50
            dark:focus:bg-default-100/50
            focus:border-primary/50
            focus:ring-0
          "
          placeholder={placeholder}
          type="text"
          value={value}
          onBlur={handleBlur}
          onChange={handleChange}
          onFocus={handleFocus}
        />

        {value && (
          <Button
            isIconOnly
            className="absolute right-2 text-default-400 hover:text-default-600 z-10"
            size="sm"
            variant="light"
            onPress={handleClear}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
