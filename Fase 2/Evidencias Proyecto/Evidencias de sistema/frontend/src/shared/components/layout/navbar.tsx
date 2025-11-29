import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/navbar";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
} from "@heroui/dropdown";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import {
  Settings,
  User as UserIcon,
  BarChart3,
  LogOut,
  Menu,
} from "lucide-react";

// Imports de tu proyecto
import { useAuthentication } from "@/services/google/auth";
import { Logo } from "@/shared/components/Icons/icons";
import { ThemeSwitch } from "@/shared/components/ui/theme-switch";
import { buildFileUrl } from "@/utils/urlUtils";
import { useUser } from "@/hooks/useUser";
import { usePermissions } from "@/hooks/usePermissions";
import { SidebarDrawer } from "@/shared/components/layout/Sidebar"; // Tu sidebar móvil existente

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuthentication();
  const { user } = useUser();
  const { is_staff } = usePermissions();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // Estado para el Sidebar Móvil
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Estado para Scroll
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Lógica de Scroll (Optimizada)
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      // Umbral de 80px para evitar saltos pequeños
      if (currentY > lastScrollY && currentY > 80) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }
      setLastScrollY(currentY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleLogout = async () => {
    logout();
    navigate("/");
  };

  const handleProfileClick = () => {
    navigate("/perfil", { state: { userId: user?.id } });
  };

  // Nombre y rol visibles
  const displayName =
    `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim() ||
    user?.username
  return (
    <>
      <HeroUINavbar
        className={`transition-transform duration-300 ease-in-out border-b border-default-200/50 bg-background/80 backdrop-blur-md ${showNavbar ? "translate-y-0" : "-translate-y-full"
          }`}
        classNames={{
          wrapper: "px-4 sm:px-6 h-16",
        }}
        maxWidth="full"
        position="sticky"
      >
        {/* 1. Izquierda: Menú Móvil + Logo */}
        <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
          {/* Botón Hamburguesa (Solo Móvil) */}
          <div className="md:hidden mr-2">
            <Button
              isIconOnly
              variant="light"
              onPress={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6 text-default-500" />
            </Button>
          </div>

          <NavbarBrand
            className="gap-3 max-w-fit cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-sm">
              <Logo className="text-white" size={20} />
            </div>
            <div className="hidden sm:flex flex-col">
              <p className="font-bold text-inherit leading-none text-lg">
                Evalink
              </p>
              <p className="text-[10px] text-default-400 font-medium uppercase tracking-wide">
                Gestión {new Date().getFullYear()}
              </p>
            </div>
          </NavbarBrand>
        </NavbarContent>

        {/* 2. Centro: Navegación Desktop (Opcional, si no usas Sidebar en Desktop) */}
        {/* Si usas Sidebar lateral en desktop, esta sección puede quedar vacía o usarse para un buscador global */}
        <NavbarContent
          className="hidden md:flex basis-1/5 sm:basis-full"
          justify="center"
        >
          {/* Ejemplo: Buscador Global podría ir aquí */}
        </NavbarContent>

        {/* 3. Derecha: Acciones y Perfil */}
        <NavbarContent className="gap-2" justify="end">
          {/* Switch de Tema */}
          <NavbarItem>
            <ThemeSwitch />
          </NavbarItem>

          {/* Dropdown de Usuario */}
          <Dropdown showArrow placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform w-8 h-8 sm:w-9 sm:h-9"
                color="primary"
                name={displayName}
                size="sm"
                src={
                  user?.foto_thumbnail
                    ? buildFileUrl(user.foto_thumbnail)
                    : undefined
                }
              />
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Profile Actions"
              className="w-60"
              variant="flat"
            >
              <DropdownSection showDivider>
                <DropdownItem
                  key="profile"
                  className="h-14 gap-2"
                  textValue="Perfil"
                >
                  <p className="font-semibold">Conectado como</p>
                  <p className="font-semibold text-primary truncate">
                    {user?.email}
                  </p>

                </DropdownItem>
              </DropdownSection>

              <DropdownSection showDivider>
                <DropdownItem
                  key="settings"
                  textValue="Mi Perfil"
                  onPress={handleProfileClick}
                >
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    <span>Mi Perfil</span>
                  </div>
                </DropdownItem>
              </DropdownSection>

              {is_staff ? (
                <DropdownSection showDivider>
                  <DropdownItem
                    key="admin"
                    textValue="Administración"
                    onPress={() =>
                      (window.location.href = `${import.meta.env.VITE_API_URL}/admin/`)
                    }
                  >
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      <span>Administración</span>
                    </div>
                  </DropdownItem>
                  <DropdownItem
                    key="analytics"
                    textValue="Analítica"
                    onPress={() =>
                      window.open("https://meta.eva-link.com", "_blank", "noopener")
                    }
                  >
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      <span>Metabase</span>
                    </div>
                  </DropdownItem>
                </DropdownSection>
              ) : null}

              <DropdownSection>
                <DropdownItem
                  key="logout"
                  className="text-danger"
                  color="danger"
                  textValue="Cerrar Sesión"
                  onPress={onOpen}
                >
                  <div className="flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                  </div>
                </DropdownItem>
              </DropdownSection>
            </DropdownMenu>
          </Dropdown>
        </NavbarContent>

        {/* Modal de Confirmación Logout */}
        <Modal
          backdrop="blur"
          isOpen={isOpen}
          size="sm"
          onOpenChange={onOpenChange}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Cerrar Sesión
                </ModalHeader>
                <ModalBody>
                  <p className="text-sm text-default-500">
                    ¿Estás seguro de que deseas salir de la plataforma?
                  </p>
                </ModalBody>
                <ModalFooter>
                  <Button variant="light" onPress={onClose}>
                    Cancelar
                  </Button>
                  <Button
                    color="danger"
                    onPress={() => {
                      onClose();
                      handleLogout();
                    }}
                  >
                    Salir
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </HeroUINavbar>

      {/* Sidebar Drawer para Móvil (Se mantiene tu componente existente) */}
      <SidebarDrawer
        isOpen={isSidebarOpen}
        setOpen={() => setSidebarOpen(!isSidebarOpen)}
      />
    </>
  );
};
