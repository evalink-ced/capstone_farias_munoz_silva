import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Image } from "@heroui/image";
import { useEffect, useMemo, useState } from "react";

function FileField({
  id,
  label,
  accept,
  onChange,
  file,
  description,
  disabled,
  onClear,
  className,
}: {
  id: string;
  label: string;
  accept?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  file: File | null;
  description?: string;
  disabled?: boolean;
  onClear?: () => void;
  className?: string;
}) {
  const isImage = useMemo(() => {
    const mime = file?.type || "";
    const name = (file?.name || "").toLowerCase();

    return (
      mime.startsWith("image/") || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(name)
    );
  }, [file]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isImage && file) {
      const url = URL.createObjectURL(file);

      setPreviewUrl(url);

      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [isImage, file]);

  const sizeText = useMemo(() => {
    if (!file) return null;
    const bytes = file.size;
    const units = ["B", "KB", "MB", "GB"];
    let value = bytes;
    let i = 0;

    while (value >= 1024 && i < units.length - 1) {
      value /= 1024;
      i++;
    }
    const decimals = value < 10 ? 2 : 1;

    return `${value.toFixed(decimals)} ${units[i]}`;
  }, [file]);

  return (
    <div className={className ?? "space-y-2 w-full"}>
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      {description ? (
        <div className="text-xs text-default-500">{description}</div>
      ) : null}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
        {isImage && previewUrl ? (
          <Image
            alt="Vista previa"
            className="w-16 h-16 sm:w-14 sm:h-14 rounded-xl object-cover ring-1 ring-black/10 dark:ring-white/10"
            src={previewUrl}
          />
        ) : null}

        <div className="flex items-center gap-2">
          <Input
            accept={accept}
            className="hidden"
            disabled={disabled}
            id={id}
            type="file"
            onChange={onChange}
          />
          <Button
            as="label"
            color="primary"
            htmlFor={id}
            isDisabled={disabled}
            variant="flat"
          >
            Seleccionar archivo
          </Button>
          {file && onClear ? (
            <Button
              color="danger"
              isDisabled={disabled}
              variant="light"
              onPress={onClear}
            >
              Quitar
            </Button>
          ) : null}
        </div>

        <div className="flex-1 min-w-0 flex items-center">
          <span className="text-default-600 truncate max-w-full sm:max-w-[320px]">
            {file?.name ?? "Ningún archivo seleccionado"}
          </span>
          {file && sizeText ? (
            <span className="text-default-400 text-xs ml-2">{sizeText}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default FileField;
