import { useRoutes } from "react-router-dom";
import { HeroUIProvider } from "@heroui/system";
import { Suspense } from "react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";

import { protectedRoutes } from "@/routes/protectedRoutes";
import { publicRoutes } from "@/routes/publicRoutes";
import { useSession, LoadingScreen } from "@/hooks/useSession";
import { useTheme } from "@/hooks/useTheme";
import { useApplyTheme } from "@/hooks/useApplyTheme";
import LazyToastProvider from "@/shared/components/ui/Toast/LazyToastProvider";

function App() {
  const routing = useRoutes([...publicRoutes, ...protectedRoutes]);
  const { isLoading: sessionLoading, user } = useSession();
  const themeId = user?.empresa?.theme ?? null;

  const { theme, loading: themeLoading } = useTheme(themeId);

  useApplyTheme(theme); // Aplica variables de tema dinámico

  const isAppReady = !sessionLoading && !themeLoading;

  if (!isAppReady) {
    return <LoadingScreen />;
  }

  return (
    <HeroUIProvider>
      <div className="min-h-screen w-full text-text bg-theme-gradient dark:bg-theme-gradient-dark transition-colors duration-700">
        <Suspense fallback={<LoadingScreen />}>{routing}</Suspense>
        <LazyToastProvider />
        <SpeedInsights />
        <Analytics />
      </div>
    </HeroUIProvider>
  );
}

export default App;
