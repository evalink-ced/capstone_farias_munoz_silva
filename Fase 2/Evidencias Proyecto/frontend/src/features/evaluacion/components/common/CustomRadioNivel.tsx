import { useRadio, RadioProps } from "@heroui/radio";
import { VisuallyHidden } from "@react-aria/visually-hidden";

interface CustomRadioNivelProps extends RadioProps {
  nombre: string;
  descripcion: string;
  puntaje: number;
}

export const CustomRadioNivel = ({
  nombre,
  descripcion,
  puntaje,
  ...props
}: CustomRadioNivelProps) => {
  const { Component, getBaseProps, getInputProps, getLabelProps } = useRadio(props);

  // Colores dinámicos basados en el puntaje para mejor UX
  const getPuntajeColor = (puntos: number) => {
    if (puntos >= 4) return 'emerald'; // Alto rendimiento
    if (puntos >= 3) return 'emerald';    // Buen rendimiento  
    if (puntos >= 2) return 'emerald';   // Rendimiento medio
    if (puntos >= 1) return 'emerald';   // Rendimiento medio
    return 'amber';                      // Bajo rendimiento
  };

  const colorScheme = getPuntajeColor(puntaje);

  // Estilos dinámicos mejorados para ultra small screens
  const styles = {
    emerald: {
      radio: 'border-emerald-300 bg-emerald-50 group-data-[selected=true]:border-emerald-500 group-data-[selected=true]:bg-emerald-500',
      text: 'group-data-[selected=true]:text-emerald-800',
      badge: 'group-data-[selected=true]:bg-emerald-100 group-data-[selected=true]:text-emerald-700',
      container: 'group-data-[selected=true]:bg-emerald-50/80 group-data-[selected=true]:border-emerald-200',
    },
    blue: {
      radio: 'border-blue-300 bg-blue-50 group-data-[selected=true]:border-blue-500 group-data-[selected=true]:bg-blue-500',
      text: 'group-data-[selected=true]:text-blue-800',
      badge: 'group-data-[selected=true]:bg-blue-100 group-data-[selected=true]:text-blue-700',
      container: 'group-data-[selected=true]:bg-blue-50/80 group-data-[selected=true]:border-blue-200',
    },
    amber: {
      radio: 'border-amber-300 bg-amber-50 group-data-[selected=true]:border-amber-500 group-data-[selected=true]:bg-amber-500',
      text: 'group-data-[selected=true]:text-amber-800',
      badge: 'group-data-[selected=true]:bg-amber-100 group-data-[selected=true]:text-amber-700',
      container: 'group-data-[selected=true]:bg-amber-50/80 group-data-[selected=true]:border-amber-200',
    },
    red: {
      radio: 'border-red-300 bg-red-50 group-data-[selected=true]:border-red-500 group-data-[selected=true]:bg-red-500',
      text: 'group-data-[selected=true]:text-red-800',
      badge: 'group-data-[selected=true]:bg-red-100 group-data-[selected=true]:text-red-700',
      container: 'group-data-[selected=true]:bg-red-50/80 group-data-[selected=true]:border-red-200',
    }
  };

  const currentStyles = styles[colorScheme];

  return (
    <Component
      {...getBaseProps()}
      className={`group relative flex items-start gap-2 xs:gap-3 sm:gap-4 
        p-2 xs:p-3 sm:p-4 rounded-lg xs:rounded-xl 
        border border-slate-200 bg-white/80 backdrop-blur-sm
        hover:bg-slate-50/90 hover:border-slate-300/60 hover:shadow-sm
        transition-all duration-200 cursor-pointer
        ${currentStyles.container}
        touch-manipulation min-h-[3rem] xs:min-h-[3.5rem] sm:min-h-[4rem]`}
    >
      <VisuallyHidden>
        <input {...getInputProps()} />
      </VisuallyHidden>

      {/* Radio button visual - Optimized for touch */}
      <div className="flex-shrink-0 pt-0.5 xs:pt-1">
        <div
          className={`relative w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 rounded-full border-2 transition-all duration-300
            border-slate-300 ${currentStyles.radio}
            group-hover:scale-105 group-data-[selected=true]:scale-110`}
        >
          {/* Dot interno con animación */}
          <div
            className={`absolute inset-0.5 xs:inset-1 rounded-full bg-white transform transition-all duration-300
              scale-0 opacity-0 group-data-[selected=true]:scale-100 group-data-[selected=true]:opacity-100`}
          />

          {/* Efecto de ripple */}
          <div
            className={`absolute inset-0 rounded-full transition-all duration-300
              opacity-0 group-data-[selected=true]:animate-ping group-data-[selected=true]:opacity-20
              ${currentStyles.radio.split(' ')[2]?.replace('bg-', 'bg-')}`}
          />
        </div>
      </div>

      {/* Contenido principal - Optimized layout */}
      <div className="flex-1 min-w-0 space-y-1 xs:space-y-1.5 sm:space-y-2">
        {/* Header con título y puntaje - Better responsive design */}
        <div className="flex items-start justify-between gap-2">
          <h3
            {...getLabelProps()}
            className={`text-sm xs:text-base sm:text-lg font-semibold leading-tight transition-colors duration-200
              text-slate-800 ${currentStyles.text} group-data-[selected=true]:font-bold break-words flex-1 min-w-0`}
          >
            {nombre}
          </h3>

          {/* Badge de puntaje mejorado - Better touch target */}
          <div
            className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 xs:px-2.5 xs:py-1 sm:px-3 sm:py-1.5 
              rounded-full text-xs xs:text-sm font-bold
              bg-slate-100 text-slate-600 transition-all duration-200
              ${currentStyles.badge} group-data-[selected=true]:shadow-sm
              min-w-[2.5rem] xs:min-w-[3rem] justify-center`}
          >
            <div className="w-1 h-1 xs:w-1.5 xs:h-1.5 rounded-full bg-current opacity-60"></div>
            <span className="whitespace-nowrap">{puntaje} pts</span>
          </div>
        </div>

        {/* Descripción - Better text sizing and spacing */}
        <p className="text-xs xs:text-sm sm:text-base leading-relaxed text-slate-600 group-data-[selected=true]:text-slate-700 break-words pr-1">
          {descripcion}
        </p>
      </div>

      {/* Indicador de selección flotante - Responsive positioning */}
      <div
        className={`absolute top-1 xs:top-2 right-1 xs:right-2 w-2 h-2 xs:w-2.5 xs:h-2.5 rounded-full 
          transition-all duration-300 transform
          scale-0 opacity-0 group-data-[selected=true]:scale-100 group-data-[selected=true]:opacity-100
          ${currentStyles.radio.split(' ')[4]?.replace('group-data-[selected=true]:bg-', 'bg-')}
          shadow-sm`}
      />
    </Component>
  );
};