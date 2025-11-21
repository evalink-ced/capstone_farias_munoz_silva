// features/evaluacion/components/autoevaluacion/PageInicio/Resumen/DenegarModal.tsx
import { useEffect, useRef, useState } from "react";
import { Button } from "@heroui/button";

type Props = {
    open: boolean;
    onClose: () => void;
    onSubmit: (motivo: string) => Promise<void> | void;
    loading?: boolean;
    maxLen?: number; // default 500
};

export default function DenegarModal({ open, onClose, onSubmit, loading, maxLen = 500 }: Props) {
    const [motivo, setMotivo] = useState("");
    const textRef = useRef<HTMLTextAreaElement | null>(null);
    const minLen = 50;
    const [confirmAccept, setConfirmAccept] = useState(false);

    useEffect(() => {
        if (open) {
            setMotivo("");
            setConfirmAccept(false);
            setTimeout(() => textRef.current?.focus(), 50);
        }
    }, [open]);

    if (!open) return null;

    const remaining = maxLen - motivo.length;
    const canSubmit = motivo.trim().length >= minLen && motivo.length <= maxLen;
    const isUnderMinimum = motivo.trim().length > 0 && motivo.trim().length < minLen;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 w-full max-w-lg rounded-2xl border border-white/60 bg-white p-6 shadow-2xl">
                <h3 className="text-lg font-semibold text-gray-900">Aceptar con observación</h3>
                <p className="mt-1 text-sm text-gray-600">
                    Explica brevemente la observación de la evaluación y confirma que aceptas con observación.
                </p>

                <textarea
                    ref={textRef}
                    className={`mt-4 h-36 w-full resize-y rounded-xl border p-3 text-sm outline-none focus:ring-2 ${
                        isUnderMinimum 
                            ? "border-red-300 focus:ring-red-500" 
                            : "border-gray-200 focus:ring-blue-500"
                    }`}
                    placeholder="Escribe aquí la observación…"
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    maxLength={maxLen}
                    aria-label="Observación de aceptación"
                />

                <div className="mt-1 flex items-center justify-between text-xs">
                    <div className="flex flex-col">
                        <span className="text-gray-500">Mín. {minLen} - Máx. {maxLen} caracteres</span>
                        {isUnderMinimum && (
                            <span className="text-red-600">
                                Faltan {minLen - motivo.trim().length} caracteres
                            </span>
                        )}
                    </div>
                    <span className={remaining < 0 ? "text-red-600" : "text-gray-500"}>{remaining}</span>
                </div>

                <label className="mt-3 flex items-start gap-2 text-sm">
                    <input
                        type="checkbox"
                        className="mt-0.5 h-4 w-4 rounded border-gray-300"
                        checked={confirmAccept}
                        onChange={(e) => setConfirmAccept(e.target.checked)}
                        aria-label="Confirmar aceptación con observación"
                    />
                    <span className="text-gray-700">
                        Confirmo que acepto la evaluación con observación y que quedará registrada.
                    </span>
                </label>

                <div className="mt-5 flex justify-end gap-3">
                    <Button className="rounded-xl border px-4 py-2 text-sm font-medium" onPress={onClose} isDisabled={loading}>
                        Cancelar
                    </Button>
                    <Button
                        className="rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-4 py-2 text-sm font-semibold text-white shadow"
                        onPress={() => onSubmit(motivo)}
                        isDisabled={loading || !canSubmit || !confirmAccept}
                    >
                        {loading ? "Enviando…" : "Aceptar con observación"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
