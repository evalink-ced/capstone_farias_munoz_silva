import { Step } from "react-joyride";
import React, { JSX } from "react";

const buildMessage = (title: string, lines: React.ReactNode[]): JSX.Element => (
  <div className="text-center">
    <div className="text-xl font-semibold mb-2">{title}</div>
    <div>
      {lines.map((line, i) => (
        <p key={i}>{line}</p>
      ))}
    </div>
  </div>
);

// 🧩 Helper para pasos simples
const buildStep = (target: string, content: string): Step => ({
  target,
  content,
  disableBeacon: true,
});

// 📝 Contenidos especiales
const WELCOME = buildMessage("👋 ¡Bienvenido!", [
  "Este es tu asistente para enviar solicitudes de días administrativos.",
  "En solo unos pasos sabrás exactamente qué llenar y cómo hacerlo. 🎯",
  "¡Vamos allá!",
]);

const CAMPOS_AMARILLOS = buildMessage("", [
  <>
    🟡 Los campos en <span className="text-yellow-600 font-bold">amarillo</span>{" "}
    están deshabilitados.
  </>,
  "El sistema los completa automáticamente y no se pueden editar.",
  "Te los mostraremos ahora.",
]);

const FINAL = buildMessage("🎉¡Eso es todo!🎉", [
  "Ahora ya sabes cómo completar tu solicitud correctamente.",
  "¡Gracias por usar la plataforma! ✅",
]);

// 🧭 Lista de pasos
export const allSteps: Step[] = [
  {
    target: "#tour-formulario",
    placement: "center",
    content: WELCOME,
    disableBeacon: true,
  },

  {
    target: "#tour-formulario",
    placement: "center",
    content: CAMPOS_AMARILLOS,
    disableBeacon: true,
  },
  buildStep(
    "#tour-usuario",
    "🟡 Este es tu nombre de usuario. Es un campo deshabilitado y no puede ser modificado.",
  ),
  buildStep(
    "#tour-encargado",
    "🟡 Aquí se muestra el nombre de tu coordinador. También es un campo autocompletado.",
  ),
  buildStep(
    "#tour-hora_regreso",
    "🟡 Este campo se ajusta automáticamente según la jornada y hora de ingreso. No se puede editar.",
  ),
  buildStep(
    "#tour-dias_tomados",
    "🟡 Aquí ves cuántos días administrativos has utilizado. Es informativo y no editable.",
  ),
  buildStep(
    "#tour-dias_restantes",
    "🟡 Este campo muestra cuántos días aún tienes disponibles. No se puede modificar.",
  ),
  buildStep(
    "#tour-dias_cumpleaños",
    "🟡 Si tienes día por cumpleaños, se mostrarán aquí (disponible, tomado o expirado).",
  ),
  buildStep(
    "#tour-motivo",
    "📋 Aquí seleccionas el motivo que justifica tu solicitud. Asegúrate de elegir la opción que mejor se ajuste.",
  ),
  buildStep(
    "#tour-jornada",
    "🕑 Aquí seleccionas la jornada correspondiente para este día.",
  ),
  buildStep(
    "#tour-fecha",
    "📅 Aquí seleccionas la fecha exacta para la cual estás solicitando el beneficio. Presiona el calendario para escoger.",
  ),
  buildStep(
    "#tour-hora_ingreso",
    "🕘 Si aplicarás solo medio día, puedes indicar la hora en que planeas comenzar tu ausencia. Si es jornada completa, el campo estará deshabilitado.",
  ),
  buildStep(
    "#tour-observacion",
    "📝 Puedes agregar una observación opcional para entregar más contexto sobre tu solicitud.",
  ),
  buildStep(
    "#tour-submit-button",
    "📨 Cuando hayas revisado toda la información, presiona este botón para enviar tu solicitud.",
  ),
  {
    target: "#tour-formulario",
    placement: "center",
    content: FINAL,
    hideBackButton: true,
    styles: {
      buttonNext: {
        display: "block",
        margin: "0 auto",
        backgroundColor: "#6b21a8",
        color: "#fff",
        borderRadius: "8px",
        padding: "6px 14px",
      },
    },
  },
];
