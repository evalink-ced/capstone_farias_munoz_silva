// import clsx from "clsx";
// import { JSX } from "react";
// import { CheckCircleIcon, ClockIcon } from "@heroicons/react/24/outline";

// import { Competencia } from "@/features/evaluacion/types/evaluacion";
// import { Respuesta } from "@/features/evaluacion/types/asignar/evaluacion";
// import IndicadorItem from "@/features/evaluacion/components/common/IndicadorItem";

// interface RadioNivelProps {
//   radioKey: string;
//   value: string;
//   nombre: string;
//   descripcion: string;
//   puntaje: number;
// }

// interface CompetenciaAccordionItemProps {
//   competencia: Competencia;
//   obtenerPuntaje: (indicadorId: number) => number;
//   manejarCambioPuntaje: (indicadorId: number, puntaje: number) => void;
//   estaRespondido: (indicadorId: number) => boolean;
//   renderRadioNivel: (props: RadioNivelProps) => JSX.Element;
// }

// // Reusable Progress Circle Component - Optimized for small screens
// function ProgressCircle({ 
//   progress, 
//   isCompleted, 
//   size = "sm" 
// }: { 
//   progress: number; 
//   isCompleted: boolean; 
//   size?: "sm" | "md" | "lg";
// }) {
//   const sizeClasses = {
//     sm: "w-6 h-6 xs:w-7 xs:h-7",
//     md: "w-7 h-7 xs:w-8 xs:h-8 sm:w-9 sm:h-9",
//     lg: "w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10"
//   };

//   const textSizes = {
//     sm: "text-xs",
//     md: "text-xs xs:text-sm",
//     lg: "text-sm xs:text-base"
//   };

//   const circumference = 2 * Math.PI * 16;
//   const strokeDasharray = circumference;
//   const strokeDashoffset = circumference - (progress / 100) * circumference;

//   return (
//     <div className={`relative ${sizeClasses[size]}`}>
//       <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 36 36">
//         {/* Background circle */}
//         <circle
//           cx="18"
//           cy="18"
//           r="16"
//           fill="none"
//           className="stroke-slate-200"
//           strokeWidth="3"
//         />
//         {/* Progress circle */}
//         <circle
//           cx="18"
//           cy="18"
//           r="16"
//           fill="none"
//           className={clsx(
//             "transition-all duration-500 ease-out",
//             isCompleted ? "stroke-emerald-500" : "stroke-blue-500"
//           )}
//           strokeWidth="3"
//           strokeLinecap="round"
//           strokeDasharray={strokeDasharray}
//           strokeDashoffset={strokeDashoffset}
//         />
//       </svg>
//       {/* Percentage text */}
//       <div className="absolute inset-0 flex items-center justify-center">
//         <span className={`font-bold ${textSizes[size]} ${
//           isCompleted ? "text-emerald-600" : "text-blue-600"
//         }`}>
//           {Math.round(progress)}%
//         </span>
//       </div>
//     </div>
//   );
// }

// // Reusable Status Badge Component - Optimized for small screens
// function StatusBadge({ 
//   isCompleted, 
//   className = "" 
// }: { 
//   isCompleted: boolean; 
//   className?: string;
// }) {
//   return (
//     <div className={clsx(
//       "inline-flex items-center gap-1 xs:gap-1.5 px-2 py-1 xs:px-2.5 xs:py-1 rounded-full text-xs font-medium transition-all duration-200",
//       isCompleted 
//         ? "bg-emerald-100 text-emerald-700 border border-emerald-200" 
//         : "bg-amber-100 text-amber-700 border border-amber-200",
//       className
//     )}>
//       {isCompleted ? (
//         <CheckCircleIcon className="w-3 h-3 xs:w-3.5 xs:h-3.5" />
//       ) : (
//         <ClockIcon className="w-3 h-3 xs:w-3.5 xs:h-3.5" />
//       )}
//       <span className="whitespace-nowrap">
//         {isCompleted ? "Completado" : "Pendiente"}
//       </span>
//     </div>
//   );
// }

// // Get competencia title with progress info
// export function getCompetenciaTitle(competencia: Competencia, respuestas: Respuesta[]) {
//   const total = competencia.indicadores.length;
//   const respondidos = competencia.indicadores.filter(indicador => 
//     respuestas.some(respuesta => respuesta.indicador === indicador.id)
//   ).length;
  
//   return `${competencia.name} (${respondidos}/${total})`;
// }

// // Competencia Header Component - Optimized for ultra small screens


// export default function CompetenciaAccordionItem({
//   competencia,
//   obtenerPuntaje,
//   manejarCambioPuntaje,
//   estaRespondido,
//   renderRadioNivel,
// }: CompetenciaAccordionItemProps) {
//   return (
//     <section className="space-y-2 xs:space-y-3 sm:space-y-4">
//       {/* Indicators list - Optimized spacing */}
//       <div className="space-y-1 xs:space-y-2 sm:space-y-3 lg:space-y-4">
//         {competencia.indicadores.map((indicador) => (
//           <div
//             key={indicador.id}
//             className={clsx(
//               "overflow-hidden transition-all duration-200",
//               "rounded-md xs:rounded-lg sm:rounded-xl lg:rounded-2xl",
//               "border border-default-200/50 backdrop-blur-sm",
//               "bg-white/90 hover:bg-white/95",
//               "hover:shadow-md hover:shadow-black/5",
//               "hover:border-default-300/60"
//             )}
//           >
//             <IndicadorItem
//               indicador={indicador}
//               estaRespondido={estaRespondido}
//               manejarCambioPuntaje={manejarCambioPuntaje}
//               obtenerPuntaje={obtenerPuntaje}
//               renderRadioNivel={renderRadioNivel}
//             />
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// }
