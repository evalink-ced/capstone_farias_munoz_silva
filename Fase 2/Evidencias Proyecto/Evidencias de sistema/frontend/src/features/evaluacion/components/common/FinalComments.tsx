import { Button } from "@heroui/button";
import { Textarea } from "@heroui/input";
import { Spinner } from "@heroui/spinner";
import { Lock, Send, Sparkles, MessageSquarePlus, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FinalCommentsProps {
  progresoGlobal: number;
  respuestasRespondidasGlobal: number;
  totalIndicadoresGlobal: number;
  mostrarTextarea: boolean;
  textMejorar: string;
  textDestacar: string;
  setTextMejorar: (text: string) => void;
  setTextDestacar: (text: string) => void;
  handleFinalizar: () => void;
  tipoEvaluacion: "autoevaluacion" | "evaluacion";
  isLoading?: boolean;
  guardando?: boolean;
}

export default function FinalComments({
  progresoGlobal,
  respuestasRespondidasGlobal,
  totalIndicadoresGlobal,
  textMejorar,
  textDestacar,
  setTextMejorar,
  setTextDestacar,
  handleFinalizar,
  isLoading = false,
  guardando = false,
}: FinalCommentsProps) {
  
  // Validaciones
  const minChars = 20;
  const isDestacarValid = textDestacar.trim().length >= minChars;
  const isMejorarValid = textMejorar.trim().length >= minChars;
  const isFormValid = isDestacarValid && isMejorarValid;
  const isComplete = progresoGlobal === 100;

  // Estados de la interfaz
  const isDisabled = isLoading || guardando;
  
  // --- VISTA 1: BLOQUEADO (Progreso incompleto) ---
  if (!isComplete) {
    return (
      <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-slate-50/50 p-8 flex flex-col items-center justify-center text-center transition-all">
        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold text-slate-700">Sección Final Bloqueada</h3>
        <p className="text-sm text-slate-500 max-w-md mt-2">
          Para acceder a los comentarios finales y enviar la evaluación, debes completar todos los indicadores.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/50 text-xs font-bold text-slate-600">
          <span>Faltan {totalIndicadoresGlobal - respuestasRespondidasGlobal} preguntas</span>
        </div>
      </div>
    );
  }

  // --- VISTA 2: FORMULARIO ACTIVO (Progreso 100%) ---
  return (
    <div className="mt-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden">
        
        {/* Header Visual */}
        <div className="bg-gradient-to-r from-indigo-50 to-white dark:from-slate-800 dark:to-slate-900 px-8 py-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                    <Sparkles className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Comentarios Finales</h3>
                    <p className="text-sm text-slate-500">Comparte tu retroalimentación para cerrar el proceso.</p>
                </div>
            </div>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
            
            {/* Campo 1: Destacar */}
            <div className="space-y-3">
                <label className="flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <span>Aspectos a destacar</span>
                    <span className={cn(
                        "text-xs transition-colors",
                        textDestacar.length >= 500 ? "text-rose-500" :
                        isDestacarValid ? "text-emerald-600" : "text-slate-400"
                    )}>
                        {textDestacar.length} / 500
                    </span>
                </label>
                <div className="relative group">
                    <Textarea
                        placeholder="Describe las fortalezas y logros observados..."
                        value={textDestacar}
                        onValueChange={setTextDestacar}
                        isDisabled={isDisabled}
                        minRows={3}
                        maxLength={500}
                        classNames={{
                            inputWrapper: cn(
                                "bg-slate-50 dark:bg-slate-800 border-2 shadow-none transition-all duration-300",
                                // Validación Visual Sutil
                                !isDestacarValid && textDestacar.length > 0 
                                    ? "border-amber-200 focus-within:border-amber-400 bg-amber-50/30"
                                    : "border-slate-100 hover:border-slate-300 focus-within:border-indigo-500 focus-within:bg-white"
                            ),
                            input: "text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                        }}
                    />
                    {/* Feedback Icon inside input */}
                    <div className="absolute right-3 top-3 pointer-events-none">
                         {isDestacarValid ? (
                             <div className="bg-emerald-100 p-1 rounded-full animate-in zoom-in">
                                 <Sparkles className="w-3 h-3 text-emerald-600" />
                             </div>
                         ) : textDestacar.length > 0 && (
                            <AlertCircle className="w-4 h-4 text-amber-400" />
                         )}
                    </div>
                </div>
                {!isDestacarValid && textDestacar.length > 0 && (
                    <p className="text-xs text-amber-600 font-medium ml-1 animate-in slide-in-from-top-1">
                        Escribe al menos {minChars} caracteres para que el comentario sea útil.
                    </p>
                )}
            </div>

            {/* Campo 2: Mejorar */}
            <div className="space-y-3">
                <label className="flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <span>Oportunidades de mejora</span>
                    <span className={cn(
                        "text-xs transition-colors",
                        textMejorar.length >= 500 ? "text-rose-500" :
                        isMejorarValid ? "text-emerald-600" : "text-slate-400"
                    )}>
                        {textMejorar.length} / 500
                    </span>
                </label>
                <div className="relative group">
                    <Textarea
                        placeholder="¿Qué aspectos podrían desarrollarse mejor?"
                        value={textMejorar}
                        onValueChange={setTextMejorar}
                        isDisabled={isDisabled}
                        minRows={3}
                        maxLength={500}
                        classNames={{
                            inputWrapper: cn(
                                "bg-slate-50 dark:bg-slate-800 border-2 shadow-none transition-all duration-300",
                                !isMejorarValid && textMejorar.length > 0 
                                    ? "border-amber-200 focus-within:border-amber-400 bg-amber-50/30"
                                    : "border-slate-100 hover:border-slate-300 focus-within:border-indigo-500 focus-within:bg-white"
                            ),
                            input: "text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                        }}
                    />
                    <div className="absolute right-3 top-3 pointer-events-none">
                         {isMejorarValid && (
                             <div className="bg-emerald-100 p-1 rounded-full animate-in zoom-in">
                                 <MessageSquarePlus className="w-3 h-3 text-emerald-600" />
                             </div>
                         )}
                    </div>
                </div>
            </div>

            {/* Footer de Acción */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-slate-400 text-center sm:text-left">
                    {guardando 
                        ? "Sincronizando cambios con la nube..." 
                        : "Una vez enviada, no podrás modificar la evaluación."}
                </p>

                <Button
                    size="lg"
                    onPress={handleFinalizar}
                    isDisabled={!isFormValid || isDisabled}
                    isLoading={isLoading}
                    className={cn(
                        "w-full sm:w-auto font-semibold shadow-lg transition-all duration-300",
                        isFormValid 
                            ? "bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 shadow-indigo-200" 
                            : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600 border border-slate-200"
                    )}
                    startContent={!isLoading && <Send className="w-4 h-4" />}
                    spinner={<Spinner color="white" size="sm" />}
                >
                    {isLoading ? "Enviando..." : "Finalizar Evaluación"}
                </Button>
            </div>

        </div>
      </div>
    </div>
  );
}