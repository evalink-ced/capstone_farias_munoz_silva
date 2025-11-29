import { Button } from "@heroui/button";
import { ArrowLeft } from "lucide-react";

import { useSmartBack } from "@/shared/hooks/useSmartBack";

type Props = { className?: string; label?: string };

export default function BackButton({ className, label = "Volver" }: Props) {
  const { goBack } = useSmartBack();

  return (
    <Button
      className={className ?? "mt-4 mb-4 w-fit z-50"}
      color="warning"
      size="md"
      startContent={<ArrowLeft className="mr-2" />}
      variant="flat"
      onPress={goBack}
    >
      {label}
    </Button>
  );
}
