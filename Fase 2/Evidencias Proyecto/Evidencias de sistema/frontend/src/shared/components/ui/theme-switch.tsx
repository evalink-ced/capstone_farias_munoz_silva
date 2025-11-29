import { FC, useState, useEffect } from "react";
import { VisuallyHidden } from "@react-aria/visually-hidden";
import { SwitchProps, useSwitch } from "@heroui/switch";
import clsx from "clsx";

import { MoonFilledIcon, SunFilledIcon } from "../Icons/icons";

import { useTheme } from "@/hooks/use-theme";

export interface ThemeSwitchProps {
  className?: string;
  classNames?: SwitchProps["classNames"];
}

export const ThemeSwitch: FC<ThemeSwitchProps> = ({
  className,
  classNames,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const {
    Component,
    isSelected,
    getBaseProps,
    getInputProps,
    getWrapperProps,
  } = useSwitch({
    isSelected: theme === "light",
    onChange: toggleTheme,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []); // <- evita re-renders innecesarios

  if (!isMounted) return <div className="h-6 w-11" />;

  return (
    <Component
      aria-label={isSelected ? "Switch to dark mode" : "Switch to light mode"}
      {...getBaseProps({
        className: clsx(
          "inline-flex items-center cursor-pointer select-none",
          "transition-opacity hover:opacity-90",
          className,
          classNames?.base,
        ),
      })}
    >
      <VisuallyHidden>
        <input {...getInputProps()} />
      </VisuallyHidden>

      {/* TRACK */}
      <div
        {...getWrapperProps()}
        className={clsx(
          "group relative h-6 w-11 rounded-full border",
          // track neutral (claro/oscuro)
          "bg-gray-200 dark:bg-zinc-700 border-gray-300 dark:border-zinc-600",
          // foco accesible
          "data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-offset-2 data-[focus-visible=true]:ring-gray-400 dark:data-[focus-visible=true]:ring-zinc-400",
          classNames?.wrapper,
        )}
      >
        {/* THUMB */}
        <span
          className={clsx(
            "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white dark:bg-zinc-100 shadow",
            "transition-transform duration-200 will-change-transform",
            // mover a la derecha cuando está seleccionado (luz) -> modo claro
            "group-data-[selected=true]:translate-x-5",
          )}
        >
          {/* Íconos dentro del thumb (fade cross) */}
          <span
            className={clsx(
              "absolute inset-0 grid place-items-center transition-opacity duration-150",
              // Sol visible cuando está seleccionado (modo claro)
              "opacity-0 group-data-[selected=true]:opacity-100",
            )}
          >
            <SunFilledIcon
              className="text-gray-700"
              size={14}
              strokeWidth={1.75}
            />
          </span>
          <span
            className={clsx(
              "absolute inset-0 grid place-items-center transition-opacity duration-150",
              // Luna visible cuando NO está seleccionado (modo oscuro)
              "opacity-100 group-data-[selected=true]:opacity-0",
            )}
          >
            <MoonFilledIcon
              className="text-gray-700"
              size={14}
              strokeWidth={1.75}
            />
          </span>
        </span>
      </div>
    </Component>
  );
};
