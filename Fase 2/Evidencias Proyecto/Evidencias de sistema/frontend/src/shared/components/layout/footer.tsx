import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import { useState, useEffect } from "react";
import { Button } from "@heroui/button";

export default function Footer() {
  const [open, setOpen] = useState(false);
  const [licenseText, setLicenseText] = useState("");

  useEffect(() => {
    if (open) {
      fetch("/LICENSE")
        .then((res) => res.text())
        .then((text) => setLicenseText(text))
        .catch(() => setLicenseText("No se pudo cargar la licencia."));
    }
  }, [open]);

  return (
    <>
      <footer className="text-center text-sm text-default-500 mb-2">
        © 2025 Evalink. Uso bajo{" "}
        <Button
          className="underline text-primary font-medium"
          size="sm"
          variant="light"
          onPress={() => setOpen(true)}
        >
          Licencia
        </Button>
      </footer>

      <Modal isOpen={open} onOpenChange={setOpen}>
        <ModalContent className="max-w-2xl">
          <ModalHeader className="text-xl font-semibold text-default-800">
            Licencia MIT
          </ModalHeader>
          <ModalBody>
            <div className="max-h-[400px] overflow-y-auto px-1 py-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-700 rounded-md bg-gray-50 border border-gray-200 shadow-inner">
              {licenseText}
            </div>
            <p className="text-center text-xs text-gray-400 mt-4">
              © 2025 Evalink
            </p>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
