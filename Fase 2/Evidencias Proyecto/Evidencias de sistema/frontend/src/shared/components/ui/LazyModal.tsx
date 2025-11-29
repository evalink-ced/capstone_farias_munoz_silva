import BaseModal from "@/shared/components/ui/BaseModal";

type Props = Readonly<{
  isOpen: boolean;
  onClose: () => void;
  message: string;
  color: "success" | "warning";
}>;

const config = {
  success: {
    title: "✅ Formulario enviado",
    buttonColor: "bg-green-600",
  },
  warning: {
    title: "⚠️ Advertencia",
    buttonColor: "bg-yellow-600",
  },
};

export default function ModalConfirmacion({
  isOpen,
  onClose,
  message,
  color,
}: Props) {
  const { title, buttonColor } = config[color];

  return (
    <BaseModal
      footer={
        <button
          className={`w-full ${buttonColor} text-white rounded px-4 py-2`}
          onClick={onClose}
        >
          Aceptar
        </button>
      }
      headerClassName={`text-${color}`}
      isOpen={isOpen}
      title={title}
      onClose={onClose}
    >
      <p>{message}</p>
    </BaseModal>
  );
}
