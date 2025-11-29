// Re-export individual components
export { default as BaseModal } from "./BaseModal";
export { InfoModal } from "./InfoModal";
export { default as LazyBackButton } from "@/shared/components/ui/Button/LazyBackButton";
export { default as PaginationFooter } from "./PaginationFooter";
export { default as SearchBar } from "./SearchBar";
export { default as TableComponent } from "./TableComponent";
export { default as TextAreaFix } from "./TextAreaFix";
export { default as UserLoader } from "./UserLoader";
export { ThemeSwitch } from "./theme-switch";
export { default as LazyModal } from "./LazyModal";
export { SortableHeader } from "./SortableHeader";

// Re-export components from subdirectories
export * from "./Table";
export * from "./Legal";

// Export specific components from subdirectories
export { FullPageSpinner } from "./Spinner/FullPageSpinner";
export { default as LazyToastProvider } from "./Toast/LazyToastProvider";
export { default as ToastWrapper } from "./Toast/ToastWrapper";
export { default as MacthTooltip } from "./Tooltip/MacthTooltip";
export { default as LoadingOverlay } from "./Loaders/LoadingOverlay";
export {
  default as UserLoaderFromLoaders,
  UserSkeleton,
} from "./Loaders/UserLoader";
