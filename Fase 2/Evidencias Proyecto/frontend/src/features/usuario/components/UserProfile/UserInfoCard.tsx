import { Briefcase, Building2, Calendar, User as UserIcon, Mail } from "lucide-react";
import { Image } from "@heroui/image";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Skeleton } from "@heroui/skeleton";
import React, { useState } from "react";
interface Props {
  user: any;
  image: string | undefined;
  formatDate: (date: string) => string;
  userId?: number; // Agregar esta prop
}

const UserInfoCard: React.FC<Props> = ({ user, image, formatDate }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const calcularTiempoServicio = (dateJoined: string) => {
    const inicio = new Date(dateJoined);
    const hoy = new Date();

    let years = hoy.getFullYear() - inicio.getFullYear();
    let months = hoy.getMonth() - inicio.getMonth();
    let days = hoy.getDate() - inicio.getDate();

    if (days < 0) {
      months -= 1; // No contar el mes actual si aún no se cumple la fecha exacta
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    return { years, months };
  };

  const { years, months } = calcularTiempoServicio(user.date_joined);



  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      {/* Card Principal */}
      <Card
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm"
        radius="lg"
      >
        <CardBody className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start">

            {/* Avatar Section Simplificado */}
            <div className="flex-shrink-0">
              <div className=" max-w-80 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                {!user.foto_thumbnail || !image || imageError ? (
                  // Avatar por defecto limpio
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                    <UserIcon className="w-30 h-30 sm:w-40 sm:h-40 lg:w-65 lg:h-65 text-gray-400 dark:text-gray-500" />
                  </div>

                ) : (
                  // Imagen sin efectos
                  <div className="relative w-full h-full ">
                    {imageLoading && (
                      <div className="absolute inset-0 z-10">
                        <Skeleton className="w-full h-full" />
                      </div>
                    )}
                    <Image
                      alt={`Foto de perfil de ${user.first_name} ${user.last_name}`}
                      className="w-full h-full object-contain"
                      src={image}
                      onLoad={() => setImageLoading(false)}
                      onError={() => {
                        setImageError(true);
                        setImageLoading(false);
                      }}
                      loading="lazy"
                      radius="none"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Info Section Mejorada */}
            <div className="flex-1 text-center sm:text-left space-y-3 min-w-0">

              {/* Header con información principal */}
              <div className="space-y-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                  {user.first_name} {user.last_name}
                </h1>

                {/* Email si existe */}
                <div className="flex flex-wrap gap-2 mb-2 lg:mb-3">
                  <Chip size="sm" variant="flat" color="primary">
                    {user.rut}
                  </Chip>
                  {user.email && (
                    <Chip size="sm" variant="flat" startContent={<Mail className="w-3 h-3" />}>
                      <span className="truncate max-w-[120px] sm:max-w-none">{user.email}</span>
                    </Chip>
                  )}
                </div>
              </div>

              {/* Badges principales */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                {user.cargo && (
                  <Chip
                    color="primary"
                    variant="flat"
                    size="sm"
                    startContent={<Briefcase className="w-3 h-3" />}
                    className="text-xs"
                  >
                    {user.cargo}
                  </Chip>
                )}
              </div>

              {/* Info Grid Compacta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 mt-4">

                {/* Empresa */}
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
                        {typeof user.empresa === "string"
                          ? user.empresa.name
                          : user.empresa?.name || "Sin empresa"}
                      </p>
                    </div>
                  </div>
                </div>



                {/* Fecha de ingreso */}
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
                        {formatDate(user.date_joined)}
                      </p>
                      <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {years > 0
                          ? `${years} año${years > 1 ? "s" : ""}, ${months} mes${months !== 1 ? "es" : ""}`
                          : `${months} mes${months !== 1 ? "es" : ""}`
                        } de servicio
                      </p>
                    </div>
                  </div>

                </div>


              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default UserInfoCard;