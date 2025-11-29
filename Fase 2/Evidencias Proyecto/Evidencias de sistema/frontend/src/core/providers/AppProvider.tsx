import React from "react";
import { HeroUIProvider } from "@heroui/system";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { APP_CONFIG } from "../config";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: APP_CONFIG.API.RETRY_ATTEMPTS,
    },
  },
});

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <HeroUIProvider>
        <BrowserRouter>
          {children}
          {APP_CONFIG.ENVIRONMENT === "development" && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </BrowserRouter>
      </HeroUIProvider>
    </QueryClientProvider>
  );
};

export default AppProvider;
