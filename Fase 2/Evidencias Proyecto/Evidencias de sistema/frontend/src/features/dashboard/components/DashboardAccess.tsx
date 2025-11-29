import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { useNavigate } from "react-router-dom";

import { sections } from "@/data/sections";
import { usePermissions } from "@/hooks/usePermissions";
import { useSession } from "@/hooks/useSession";
import { useTheme } from "@/hooks/useTheme";

export default function DashboardAccess() {
  const { user } = useSession();
  const themeId = user?.empresa?.theme ?? null;
  const { theme } = useTheme(themeId);

  const navigate = useNavigate();
  const { hasAccess } = usePermissions();
  const visibleSections = sections
    .map((section) => {
      const filteredButtons = section.buttons.filter((btn) =>
        hasAccess(btn.permiso),
      );

      return { ...section, buttons: filteredButtons };
    })
    .filter((section) => section.buttons.length > 0);

  const buttonStyle = {
    backgroundColor: theme?.primary_color,
    color: theme?.button_text_color,
  };

  return (
    <section className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full flex justify-center">
        <div className="grid gap-8 justify-center grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] max-w-screen-lg w-full">
          {visibleSections.map((section, index) => {
            return (
              <div key={index} className="w-full flex justify-center">
                <Card
                  className={`
                  w-full max-w-sm rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border-1
                  bg-[var(--third-color)] border-[var(--accent-color)] text-[var(--text-color)]
                  dark:bg-[var(--background-to-dark)] dark:text-[var(--text-color)]`}
                >
                  <CardHeader className="flex items-center justify-center gap-2 text-xl font-semibold text-gray-800 dark:text-white mb-2">
                    <span className="text-2xl ">{section.icon}</span>
                    <span className="text-center">{section.title}</span>
                  </CardHeader>
                  <CardBody className="flex flex-col gap-3">
                    {section.buttons.map((button, i) => (
                      <Button
                        key={i}
                        className="rounded-full w-full transition-all text-white"
                        style={buttonStyle}
                        variant="flat"
                        onPress={() => navigate(button.href)}
                      >
                        {button.label}
                      </Button>
                    ))}
                  </CardBody>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
