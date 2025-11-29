import React from "react";
import { Divider } from "@nextui-org/react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Calendar, TrendingUp } from "lucide-react";

import { Bienio } from "@/types/types";

interface Props {
  bienios: Bienio[];
}

const UserBienios: React.FC<Props> = ({ bienios }) => {
  if (!bienios || bienios.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-16 h-16 bg-default-100 rounded-full flex items-center justify-center mb-4">
          <Calendar className="w-8 h-8 text-default-400" />
        </div>
        <p className="text-default-500 text-center font-medium">
          No hay bienios registrados
        </p>
        <p className="text-default-400 text-sm text-center mt-1">
          Los bienios aparecerán aquí cuando sean agregados
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Divider className="my-6" />

      {/* Header Section */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Bienios</h2>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-content1 rounded-xl border border-default-200 overflow-hidden shadow-sm">
        <Table
          removeWrapper
          aria-label="Tabla de bienios"
          className="min-w-full"
        >
          <TableHeader>
            <TableColumn className="bg-default-50 text-default-700 font-semibold text-center py-4 px-6 border-b border-default-200">
              <div className="flex items-center justify-center gap-2">
                <Calendar className="w-4 h-4" />
                Bienio
              </div>
            </TableColumn>
            <TableColumn className="bg-default-50 text-default-700 font-semibold text-center py-4 px-6 border-b border-default-200">
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Tramo
              </div>
            </TableColumn>
          </TableHeader>
          <TableBody>
            {bienios.map((bienio, index) => (
              <TableRow
                key={index}
                className="hover:bg-default-50 transition-colors"
              >
                <TableCell className="text-center py-4 px-6 border-b border-default-100 last:border-b-0">
                  <div className="flex items-center justify-center">
                    <span className="inline-flex items-center justify-center w-10 h-10 bg-primary/10 text-primary font-bold rounded-lg text-sm">
                      {String(bienio.bienios)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-center py-4 px-6 border-b border-default-100 last:border-b-0">
                  <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-medium ${bienio.tramo
                    ? 'bg-success/10 text-success border border-success/20'
                    : 'bg-default-100 text-default-500 border border-default-200'
                    }`}>
                    {String(bienio.tramo) || 'Sin asignar'}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UserBienios;