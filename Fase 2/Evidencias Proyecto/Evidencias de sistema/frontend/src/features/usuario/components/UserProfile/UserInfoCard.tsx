import {
  Briefcase,
  Building2,
  Calendar,
  User as UserIcon,
  Mail,
} from "lucide-react";
import { Image } from "@heroui/image";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Skeleton } from "@heroui/skeleton";
import { Button } from "@heroui/button";
import React, { useEffect, useState } from "react";

interface Props {
  user: any;
  image: string | undefined;
  formatDate: (date: string) => string;
  userId?: number;
  canEdit?: boolean;
  onStartEdit?: () => void;
}

const UserInfoCard: React.FC<Props> = ({
  user,
  image,
  formatDate,
  canEdit = false,
  onStartEdit,
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [localUser, setLocalUser] = useState<any>(user);

  useEffect(() => {
    setLocalUser(user);
  }, [user]);

  const calcularTiempoServicio = (dateJoined: string) => {
    const inicio = new Date(dateJoined);
    const hoy = new Date();

    let years = hoy.getFullYear() - inicio.getFullYear();
    let months = hoy.getMonth() - inicio.getMonth();
    let days = hoy.getDate() - inicio.getDate();

    if (days < 0) {
      months -= 1;
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    return { years, months };
  };

  const { years, months } = calcularTiempoServicio(localUser.date_joined);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      <Card
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm"
        radius="lg"
      >
        <CardBody className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start">
            <div className="flex-shrink-0">
              <div className="w-64 h-64 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                {!image || imageError ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                    <UserIcon className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 text-gray-400 dark:text-gray-500" />
                  </div>
                ) : (
                  <div className="relative w-full h-full ">
                    {imageLoading && (
                      <div className="absolute inset-0 z-10">
                        <Skeleton className="w-full h-full" />
                      </div>
                    )}
                    <Image
                      alt={`Foto de perfil de ${localUser.first_name} ${localUser.last_name}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      radius="none"
                      src={image}
                      onError={() => {
                        setImageError(true);
                        setImageLoading(false);
                      }}
                      onLoad={() => setImageLoading(false)}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-3 min-w-0">
              <div className="space-y-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                  {localUser.first_name} {localUser.last_name}
                </h1>

                <div className="flex flex-wrap gap-2 mb-2 lg:mb-3">
                  <Chip color="primary" size="sm" variant="flat">
                    {localUser.rut}
                  </Chip>
                  {localUser.email && (
                    <Chip
                      size="sm"
                      startContent={<Mail className="w-3 h-3" />}
                      variant="flat"
                    >
                      <span className="truncate max-w-[120px] sm:max-w-none">
                        {localUser.email}
                      </span>
                    </Chip>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                {localUser.cargo && (
                  <Chip
                    className="text-xs"
                    color="primary"
                    size="sm"
                    startContent={<Briefcase className="w-3 h-3" />}
                    variant="flat"
                  >
                    {localUser.cargo}
                  </Chip>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 mt-4">
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900">
                      <Building2 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                        Sede
                      </p>
                      <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {typeof localUser.empresa === "string"
                          ? (localUser as any).empresa?.name
                          : localUser.empresa?.name || "Sin empresa"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-amber-100 dark:bg-amber-900">
                      <Calendar className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                        Miembro desde
                      </p>
                      <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {formatDate(localUser.date_joined)}
                      </p>
                      <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {years > 0
                          ? `${years} año${years > 1 ? "s" : ""}, ${months} mes${months !== 1 ? "es" : ""}`
                          : `${months} mes${months !== 1 ? "es" : ""}`}{" "}
                        de servicio
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                {canEdit && (
                  <div className="flex justify-end gap-2">
                    <Button color="primary" onPress={onStartEdit}>
                      Editar
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default UserInfoCard;
