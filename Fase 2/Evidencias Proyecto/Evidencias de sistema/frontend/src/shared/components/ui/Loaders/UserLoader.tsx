import React from "react";
import { Spinner } from "@heroui/spinner";
import { Skeleton } from "@heroui/skeleton";

const UserLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-sm bg-black/10">
      <Spinner
        color="warning"
        label="Cargando usuarios..."
        labelColor="warning"
        size="lg"
        variant="gradient"
      />
    </div>
  );
};

export default UserLoader;

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";

const UserSkeleton: React.FC = () => {
  const skeletonRows = 4;

  return (
    <div className="p-6 overflow-x-auto">
      <Table isStriped aria-label="Cargando usuarios...">
        <TableHeader>
          <TableColumn className="text-center">Usuario</TableColumn>
          <TableColumn className="text-center">Cargo</TableColumn>
          <TableColumn className="text-center">Empresa</TableColumn>
          <TableColumn className="text-center">Acción</TableColumn>
        </TableHeader>
        <TableBody>
          {Array.from({ length: skeletonRows }).map((_, index) => (
            <TableRow key={index}>
              {/* Usuario */}
              <TableCell>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 w-full">
                    <Skeleton className="h-4 w-32 rounded-md" />
                    <Skeleton className="h-3 w-24 rounded-md" />
                  </div>
                </div>
              </TableCell>
              {/* Cargo */}
              <TableCell className="text-center">
                <Skeleton className="h-4 w-32 rounded-md mx-auto" />
              </TableCell>
              {/* Empresa */}
              <TableCell className="text-center">
                <Skeleton className="h-4 w-40 rounded-md mx-auto" />
              </TableCell>
              {/* Botón */}
              <TableCell className="text-center">
                <Skeleton className="h-9 w-24 rounded-md mx-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export { UserLoader, UserSkeleton };
