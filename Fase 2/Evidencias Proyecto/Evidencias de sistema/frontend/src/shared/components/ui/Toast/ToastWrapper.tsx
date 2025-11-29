// components/ToastWrapper.tsx
"use client";
import { ToastProvider } from "@heroui/toast";

export default function ToastWrapper() {
  return <ToastProvider placement="top-center" />;
}
