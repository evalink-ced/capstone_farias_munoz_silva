// layouts/DefaultLayout.tsx
import { Suspense, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { Navbar } from "@/shared/components/layout/navbar";
import { SidebarDrawer } from "@/shared/components/layout/Sidebar";
import BackButton from "@/shared/components/ui/Button/LazyBackButton";

const FallbackLoader = () => (
  <div className="flex justify-center items-center h-24">
    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-500" />
  </div>
);

export default function DefaultLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useLocation();

  const showBack = pathname !== "/"; // mantener sin botón atrás en el home
  const isFullBleed = pathname === "/"; // el dashboard (home) va sin container

  return (
    <div className="relative flex flex-col min-h-screen bg-background">
      <Navbar />
      <SidebarDrawer isOpen={isOpen} setOpen={setIsOpen} />

      <main className="w-full flex-grow">
        {isFullBleed ? (
          <>
            {showBack && (
              <div className="flex justify-start items-start ml-10">
                <BackButton />
              </div>
            )}
            <Suspense fallback={<FallbackLoader />}>
              <Outlet />
            </Suspense>
          </>
        ) : (
          <div className="container mx-auto">
            {showBack && (
              <div className="flex justify-start items-start ml-10">
                <BackButton />
              </div>
            )}
            <Suspense fallback={<FallbackLoader />}>
              <Outlet />
            </Suspense>
          </div>
        )}
      </main>
    </div>
  );
}
