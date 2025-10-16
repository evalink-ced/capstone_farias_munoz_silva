import { Button } from "@heroui/button";
import { Textarea } from "@heroui/input";
import { Spinner } from "@heroui/spinner";

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
  // ✅ AGREGAR PROP PARA ESTADO DE GUARDANDO
  guardando?: boolean;
}

export default function FinalComments({
  progresoGlobal,
  respuestasRespondidasGlobal,
  totalIndicadoresGlobal,
  mostrarTextarea,
  textMejorar,
  textDestacar,
  setTextMejorar,
  setTextDestacar,
  handleFinalizar,
  tipoEvaluacion,
  isLoading = false,
  guardando = false,
}: FinalCommentsProps) {
  const isTextDestacarValid = textDestacar.trim().length >= 20;
  const isTextMejorarValid = textMejorar.trim().length >= 20;
  const isFormValid = isTextDestacarValid && isTextMejorarValid;
  
  // ✅ SEPARAR LÓGICA: BOTÓN DESHABILITADO SI ESTÁ GUARDANDO O FINALIZANDO
  const isButtonDisabled = guardando || isLoading || (mostrarTextarea && !isFormValid);
  
  // ✅ CAMPOS SOLO DESHABILITADOS DURANTE FINALIZACIÓN, NO DURANTE GUARDADO AUTOMÁTICO
  const areFieldsDisabled = isLoading;

  // ✅ SOLO MOSTRAR EL BOTÓN SI NO ESTÁ GUARDANDO Y EL PROGRESO ES 100%
  if (progresoGlobal === 100 && !guardando) {
    return (
      <div className="bg-default-50/95 dark:bg-default-100/20 rounded-lg p-3 shadow-sm border border-default-50 dark:border-default-200/30 hover:shadow transition-all duration-200 mt-8">
        {mostrarTextarea ? (
          <div className="mt-3 space-y-3 bg-primary-50/30 dark:bg-primary-100/10 p-3 rounded-md border border-primary-50 dark:border-primary-200/30 shadow-sm">
            <h4 className="text-sm font-semibold text-primary-700 dark:text-primary-400">
              Comentarios finales
            </h4>
            <div className="bg-default-50 dark:bg-default-100/30 p-2 rounded-md shadow-sm border border-primary-50 dark:border-primary-200/30">
              <label className="text-xs font-medium mb-1 text-success-600 dark:text-success-400 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-1 h-1 bg-success-500 dark:bg-success-400 rounded-full mr-1.5" />
                  ¿Qué aspectos destacarías?
                </div>
                <span className={`text-xs ${textDestacar.length > 500 ? 'text-danger-500 dark:text-danger-400' :
                  textDestacar.length >= 20 ? 'text-success-500 dark:text-success-400' : 'text-warning-500 dark:text-warning-400'
                  }`}>
                  {textDestacar.length}/500
                </span>
              </label>
              <Textarea
                className={`w-full text-xs ${textDestacar.length >= 20 ? 'border-success-100 dark:border-success-300/30 focus:border-success-400 dark:focus:border-success-400 bg-success-50/10 dark:bg-success-100/5' :
                  'border-warning-100 dark:border-warning-300/30 focus:border-warning-400 dark:focus:border-warning-400 bg-warning-50/10 dark:bg-warning-100/5'
                  }`}
                placeholder="Escribe aquí los aspectos positivos... (mínimo 20 caracteres)"
                rows={2}
                value={textDestacar}
                maxLength={500}
                onChange={(e) => setTextDestacar(e.target.value)}
                isDisabled={areFieldsDisabled}
              />
              {textDestacar.trim().length < 20 && textDestacar.trim().length > 0 && (
                <p className="text-xs text-warning-600 dark:text-warning-400 mt-1">
                  Mínimo 20 caracteres requeridos
                </p>
              )}
            </div>
            <div className="bg-default-50 dark:bg-default-100/30 p-2 rounded-md shadow-sm border border-primary-50 dark:border-primary-200/30">
              <label className="text-xs font-medium mb-1 text-warning-600 dark:text-warning-400 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-1 h-1 bg-warning-500 dark:bg-warning-400 rounded-full mr-1.5" />
                  ¿Qué aspectos se podrían mejorar?
                </div>
                <span className={`text-xs ${textMejorar.length > 500 ? 'text-danger-500 dark:text-danger-400' :
                  textMejorar.length >= 20 ? 'text-success-500 dark:text-success-400' : 'text-warning-500 dark:text-warning-400'
                  }`}>
                  {textMejorar.length}/500
                </span>
              </label>
              <Textarea
                className={`w-full text-xs ${textMejorar.length >= 20 ? 'border-success-100 dark:border-success-300/30 focus:border-success-400 dark:focus:border-success-400 bg-success-50/10 dark:bg-success-100/5' :
                  'border-warning-100 dark:border-warning-300/30 focus:border-warning-400 dark:focus:border-warning-400 bg-warning-50/10 dark:bg-warning-100/5'
                  }`}
                placeholder="Escribe aquí los aspectos a mejorar... (mínimo 20 caracteres)"
                rows={2}
                value={textMejorar}
                maxLength={500}
                onChange={(e) => setTextMejorar(e.target.value)}
                isDisabled={areFieldsDisabled}
              />
              {textMejorar.trim().length < 20 && textMejorar.trim().length > 0 && (
                <p className="text-xs text-warning-600 dark:text-warning-400 mt-1">
                  Mínimo 20 caracteres requeridos
                </p>
              )}
            </div>
            <Button
              className="w-full mt-2 font-medium py-2 shadow-sm hover:shadow transition-all duration-200 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              color="primary"
              isDisabled={isButtonDisabled}
              isLoading={isLoading}
              size="md"
              onPress={handleFinalizar}
              spinner={<Spinner size="sm" color="white" />}
            >
              {isLoading ? "Finalizando..." : `Finalizar ${tipoEvaluacion === "autoevaluacion" ? "Autoevaluación" : "Evaluación"}`}
            </Button>
          </div>
        ) : (
          <Button
            className="w-full mt-3 text-sm"
            color="primary"
            size="md"
            isDisabled={isButtonDisabled}
            isLoading={isLoading}
            onPress={handleFinalizar}
            spinner={<Spinner size="sm" color="white" />}
          >
            {isLoading ? "Finalizando..." : `Finalizar ${tipoEvaluacion === "autoevaluacion" ? "Autoevaluación" : "Evaluación"}`}
          </Button>
        )}
      </div>
    );
  }

  // ✅ MOSTRAR MENSAJE DIFERENTE SI ESTÁ GUARDANDO
  if (guardando) {
    return (
      <div className="bg-warning-50/30 dark:bg-warning-100/10 rounded-lg p-3 shadow-sm border border-warning-100 dark:border-warning-200/30">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-warning-500 dark:bg-warning-400 rounded-full animate-pulse" />
          <h3 className="text-sm font-medium text-warning-700 dark:text-warning-400">
            Guardando cambios...
          </h3>
        </div>
        <p className="text-xs text-warning-600 dark:text-warning-400 mt-1 ml-4">
          Espere a que se complete el guardado para continuar
        </p>
      </div>
    );
  }

  return (
    <div className="bg-warning-50/30 dark:bg-warning-100/10 rounded-lg p-3 shadow-sm border border-warning-100 dark:border-warning-200/30">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-warning-500 dark:bg-warning-400 rounded-full" />
        <h3 className="text-sm font-medium text-warning-700 dark:text-warning-400">
          Completa todos los indicadores para finalizar
        </h3>
      </div>
      <p className="text-xs text-warning-600 dark:text-warning-400 mt-1 ml-4">
        Progreso actual: {progresoGlobal}% ({respuestasRespondidasGlobal} de{" "}
        {totalIndicadoresGlobal} indicadores)
      </p>
    </div>
  );
}
