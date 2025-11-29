"use client";

import {
  Drawer,
  DrawerContent,
  DrawerBody,
  DrawerFooter,
} from "@heroui/drawer";
import { useNavigate, useLocation } from "react-router-dom";
import { Accordion, AccordionItem } from "@heroui/accordion";
import "@/styles/sidebarDrawer.css"; // ← importa tus estilos empresariales
import { FC } from "react";
import { X } from "lucide-react";
import { Button } from "@heroui/button";

import { usePermissions } from "@/hooks/usePermissions";
import { useUser } from "@/hooks/useUser";
import { sections } from "@/data/sections";
// ... tus imports
interface Props {
  isOpen: boolean;
  setOpen: (val: boolean) => void;
}

export const SidebarDrawer: FC<Props> = ({ isOpen, setOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasAccess } = usePermissions();
  const { user } = useUser();

  // Detectar empresa
  const empresaId =
    typeof user?.empresa === "object" && user?.empresa !== null
      ? user.empresa.id
      : null;

  const empresaClass = empresaId === 2 ? "empresa-roja" : "empresa-azul";

  // Cerrar drawer al navegar

  const handleNavigate = (href: string) => {
    navigate(href);
  };

  const activeSectionTitles = sections
    .filter((section) =>
      section.buttons.some(
        (btn) => hasAccess(btn.permiso) && location.pathname === btn.href,
      ),
    )
    .map((section) => section.title);

  return (
    <>
      {/* Drawer desde la izquierda */}
      <Drawer
        closeButton={
          <Button
            className="absolute top-3 right-3 text-red-500"
            color="danger"
            size="sm"
            variant="light"
            onPress={() => setOpen(false)}
          >
            <X className="w-4 h-4 text-red-500" />
          </Button>
        }
        isOpen={isOpen}
        placement="left"
        onClose={() => setOpen(false)}
      >
        <DrawerContent
          className={`${empresaClass} fixed top-0 left-0 h-screen max-h-screen w-[280px] flex flex-col border-r shadow-lg z-[1100]`}
        >
          <DrawerBody className="p-4 overflow-y-auto flex-1">
            <Accordion
              defaultSelectedKeys={activeSectionTitles}
              selectionMode="multiple"
              showDivider={true}
              variant="light"
            >
              {sections.map((section) => {
                const visibleButtons = section.buttons.filter((btn) =>
                  hasAccess(btn.permiso),
                );

                if (visibleButtons.length === 0) return null;

                const isCurrentSectionActive = visibleButtons.some(
                  (btn) => location.pathname === btn.href,
                );

                return (
                  <AccordionItem
                    key={section.title}
                    classNames={{
                      title: `
                                              px-3 py-2 rounded-md transition-colors
                                              ${
                                                isCurrentSectionActive
                                                  ? "accordion-title-active accordion-hover"
                                                  : "accordion-title-inactive accordion-hover"
                                              }
                                            `,
                    }}
                    title={section.title}
                    value={section.title}
                  >
                    <div className="flex flex-col gap-1 mt-2">
                      {visibleButtons.map((btn) => {
                        const isActive = location.pathname === btn.href;

                        return (
                          <Button
                            key={btn.href}
                            className={`menu-button ${
                              isActive
                                ? "menu-button-active accordion-hover"
                                : "menu-button-inactive accordion-hover"
                            }`}
                            color="default"
                            variant="light"
                            onPress={() => handleNavigate(btn.href)}
                          >
                            {btn.label}
                          </Button>
                        );
                      })}
                    </div>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </DrawerBody>

          <DrawerFooter className="p-3 text-xs text-center text-default-500 border-t border-default-300">
            © {new Date().getFullYear()} Evalink
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};
