import { useRadio, RadioProps } from "@heroui/radio";
import { VisuallyHidden } from "@react-aria/visually-hidden";

interface RadioNivelCompactoProps extends RadioProps {
  nombre: string;
  descripcion: string;
  puntaje: number;
}

export default function RadioNivelCompacto({
  nombre,
  descripcion,
  puntaje,
  ...props
}: RadioNivelCompactoProps) {
  const { Component, getBaseProps, getInputProps } = useRadio(props);

  return (
    <Component
      {...getBaseProps()}
      className={`group relative flex flex-col p-4 rounded-xl border-2 border-default-200
        group-data-[selected=true]:border-green-400 group-data-[selected=true]:bg-green-50
        hover:shadow-md transition-all duration-300 cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500
        min-h-[120px] w-full`}
    >
      <VisuallyHidden>
        <input {...getInputProps()} />
      </VisuallyHidden>

      {/* Radio button en la esquina superior izquierda */}
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-5 h-5 rounded-full border-2 border-default-300 transition-all duration-300 relative
            group-data-[selected=true]:border-green-500 group-data-[selected=true]:bg-green-500`}
        >
          {/* Dot interno */}
          <div
            className={`absolute inset-1 rounded-full transition-all duration-300
              scale-0 opacity-0 group-data-[selected=true]:scale-100 group-data-[selected=true]:opacity-100
              bg-white`}
          />
        </div>
        
        {/* Puntos en la esquina superior derecha */}
        <div className="text-sm font-bold text-default-600 group-data-[selected=true]:text-green-600">
          • {puntaje} pts
        </div>
      </div>

      {/* Título del nivel */}
      <div className="text-xl font-bold text-default-900 mb-2 group-data-[selected=true]:text-green-700">
        {nombre.toUpperCase()} 
      </div>

      {/* Descripción */}
      <div className="text-md text-default-600 leading-relaxed flex-1">
        {descripcion}
      </div>
    </Component>
  );
}