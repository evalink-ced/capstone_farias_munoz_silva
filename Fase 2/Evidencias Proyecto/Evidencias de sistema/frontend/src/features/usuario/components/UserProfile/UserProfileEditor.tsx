import { useEffect, useRef, useState } from "react";
import { Tabs, Tab } from "@heroui/tabs";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { Switch } from "@heroui/switch";

import FileField from "@/shared/components/FileField";
import {
  updateUserById,
  fetchEmpresas,
  fetchCargos,
  fetchGeneros,
  fetchCiclos,
  fetchAccessPermissions,
  fetchAllUsers,
  uploadUserPhoto,
} from "@/api/user/user";

interface Props {
  user: any;
  userId?: number;
  canEdit: boolean;
  onSaved: (updated: any) => void;
  onCancel: () => void;
  onUserUpdated?: (updated: any) => void;
}

export default function UserProfileEditor({
  user,
  userId,
  canEdit,
  onSaved,
  onCancel,
  onUserUpdated,
}: Props) {
  const [saving, setSaving] = useState(false);
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [cargos, setCargos] = useState<any[]>([]);
  const [generos, setGeneros] = useState<any[]>([]);
  const [ciclos, setCiclos] = useState<any[]>([]);
  const [grupos, setGrupos] = useState<any[]>([]);
  const [jefes, setJefes] = useState<any[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [cropUrl, setCropUrl] = useState<string | null>(null);
  const cropImgRef = useRef<HTMLImageElement | null>(null);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropMaxZoom, setCropMaxZoom] = useState(1);
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const draggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const [cropOriginalFile, setCropOriginalFile] = useState<File | null>(null);
  const [form, setForm] = useState<any>({
    username: user?.username || "",
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    rut: user?.rut || "",
    birthday: user?.birthday || "",
    date_joined: user?.date_joined || "",
    empresa_id: user?.empresa?.id ?? null,
    cargo_id: null,
    genero_id: null,
    ciclo_id: null,
    group_id: user?.group_id ?? null,
    jefe_id: null,
    is_active: typeof user?.is_active === "boolean" ? user.is_active : true,
  });
  const [usernameTouched, setUsernameTouched] = useState(false);
  const normalizeRut = (rut: string) =>
    String(rut || "")
      .replace(/\./g, "")
      .replace(/-/g, "")
      .toUpperCase();
  const formatRut = (rut: string) => {
    const s = normalizeRut(rut);

    if (s.length < 2) return s;
    const body = s.slice(0, -1);
    const dv = s.slice(-1);
    const rev = body.split("").reverse();
    const grouped: string[] = [];

    for (let i = 0; i < rev.length; i += 3)
      grouped.push(rev.slice(i, i + 3).join(""));
    const withDots = grouped.join(".").split("").reverse().join("");

    return `${withDots}-${dv}`;
  };

  useEffect(() => {
    setForm((prev: any) => ({
      ...prev,
      username: user?.username || "",
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      email: user?.email || "",
      rut: user?.rut || "",
      birthday: user?.birthday || "",
      date_joined: user?.date_joined || "",
      empresa_id: user?.empresa?.id ?? null,
      group_id: user?.group_id ?? prev.group_id,
      is_active:
        typeof user?.is_active === "boolean" ? user.is_active : prev.is_active,
    }));
  }, [user]);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const [emp, cg, gn, cc, gp, jf] = await Promise.all([
          fetchEmpresas(),
          fetchCargos(),
          fetchGeneros(),
          fetchCiclos(),
          fetchAccessPermissions(),
          fetchAllUsers(),
        ]);

        if (!active) return;
        setEmpresas(emp || []);
        setCargos(cg || []);
        setGeneros(gn || []);
        setCiclos(cc || []);
        setGrupos(gp || []);
        setJefes(jf || []);

        const cargoMatch = cg?.find(
          (x: any) =>
            String(x?.cargo || "").toLowerCase() ===
            String(user?.cargo || "").toLowerCase(),
        );
        const generoMatch = gn?.find(
          (x: any) =>
            String(x?.genero || "").toLowerCase() ===
            String(user?.genero || "").toLowerCase(),
        );
        const cicloMatch = cc?.find(
          (x: any) =>
            String(x?.ciclo || "").toLowerCase() ===
            String(user?.ciclo || "").toLowerCase(),
        );

        const grupoMatch = gp?.find(
          (x: any) =>
            String(x?.group || "").toLowerCase() ===
            String(user?.group || "").toLowerCase(),
        );

        const jefeName = String(user?.jefe || "").toLowerCase();
        const jefeMatch = jf?.find((x: any) => {
          const full =
            `${String(x?.first_name || "").toLowerCase()} ${String(x?.last_name || "").toLowerCase()}`.trim();

          return full === jefeName;
        });

        setForm((prev: any) => ({
          ...prev,
          cargo_id: cargoMatch?.id ?? prev.cargo_id,
          genero_id: generoMatch?.id ?? prev.genero_id,
          ciclo_id: cicloMatch?.id ?? prev.ciclo_id,
          group_id: prev.group_id ?? grupoMatch?.id ?? null,
          jefe_id: prev.jefe_id ?? jefeMatch?.id ?? null,
        }));
      } catch {}
    })();

    return () => {
      active = false;
    };
  }, []);

  const makeUsername = (first: string, last: string) => {
    const raw =
      `${String(first || "").trim()} ${String(last || "").trim()}`.trim();

    if (!raw) return "";
    const cleaned = raw
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z\s]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return cleaned
      .split(" ")
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ""))
      .join(" ");
  };

  const handleChange = (key: string, value: any) => {
    if (key === "username") {
      setUsernameTouched(true);
      setForm((prev: any) => ({ ...prev, [key]: value }));

      return;
    }
    if (key === "first_name") {
      setForm((prev: any) => {
        const suggested =
          !usernameTouched || !prev.username
            ? makeUsername(value, prev.last_name)
            : prev.username;

        return { ...prev, first_name: value, username: suggested };
      });

      return;
    }
    if (key === "last_name") {
      setForm((prev: any) => {
        const suggested =
          !usernameTouched || !prev.username
            ? makeUsername(prev.first_name, value)
            : prev.username;

        return { ...prev, last_name: value, username: suggested };
      });

      return;
    }
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!userId && !user?.id) return;
    try {
      setSaving(true);
      const payload: any = { ...form };

      if (normalizeRut(payload.rut) === normalizeRut(String(user?.rut || ""))) {
        delete payload.rut;
      }
      if (String(payload.username || "") === String(user?.username || "")) {
        delete payload.username;
      }
      if (String(payload.email || "") === String(user?.email || "")) {
        delete payload.email;
      }
      Object.keys(payload).forEach((k) => {
        if (payload[k] === "" || payload[k] === null) delete payload[k];
      });
      const updated = await updateUserById(Number(userId || user.id), payload);

      addToast({
        title: "Perfil actualizado",
        description: "Los datos del usuario fueron guardados.",
        color: "success",
        variant: "solid",
      });

      onSaved(updated);
    } catch (e: any) {
      addToast({
        title: "Error al guardar",
        description: e?.message || "No se pudo guardar cambios.",
        color: "danger",
        variant: "solid",
      });
    } finally {
      setSaving(false);
    }
  };

  const getImageMeta = (
    file: File,
  ): Promise<{ width: number; height: number }> =>
    new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();

      img.onload = () => {
        const meta = { width: img.naturalWidth, height: img.naturalHeight };

        URL.revokeObjectURL(url);
        resolve(meta);
      };
      img.onerror = (e) => {
        URL.revokeObjectURL(url);
        reject(e);
      };
      img.src = url;
    });

  const resizeImage = (file: File, maxW: number, maxH: number): Promise<File> =>
    new Promise(async (resolve, reject) => {
      try {
        const url = URL.createObjectURL(file);
        const img = new Image();

        img.onload = () => {
          const ratio = Math.min(
            maxW / img.naturalWidth,
            maxH / img.naturalHeight,
            1,
          );
          const w = Math.round(img.naturalWidth * ratio);
          const h = Math.round(img.naturalHeight * ratio);
          const canvas = document.createElement("canvas");

          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            URL.revokeObjectURL(url);
            reject(new Error("No ctx"));

            return;
          }
          ctx.drawImage(img, 0, 0, w, h);
          canvas.toBlob(
            (blob) => {
              URL.revokeObjectURL(url);
              if (!blob) {
                reject(new Error("No blob"));

                return;
              }
              const out = new File([blob], file.name, { type: blob.type });

              resolve(out);
            },
            file.type || "image/jpeg",
            0.92,
          );
        };
        img.onerror = (e) => {
          URL.revokeObjectURL(url);
          reject(e);
        };
        img.src = url;
      } catch (err) {
        reject(err);
      }
    });

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;

    if (!f) {
      setPhotoFile(null);
      setPhotoError(null);

      return;
    }
    const MAX_MB = 5;
    const MAX_W = 4000;
    const MAX_H = 4000;

    if (f.size > MAX_MB * 1024 * 1024) {
      addToast({
        title: "Imagen pesada",
        description: `Se recortará y comprimirá automáticamente`,
        color: "warning",
        variant: "flat",
      });
    }
    try {
      const meta = await getImageMeta(f);
      let inputFile = f;

      if (meta.width > MAX_W || meta.height > MAX_H) {
        inputFile = await resizeImage(f, MAX_W, MAX_H);
      }
      setCropOriginalFile(inputFile);
      const url = URL.createObjectURL(inputFile);

      setCropUrl(url);
      const img = new Image();

      img.onload = () => {
        cropImgRef.current = img;
        const CROP_TARGET = 256;
        const minSide = Math.min(img.naturalWidth, img.naturalHeight);

        if (minSide < CROP_TARGET) {
          setPhotoError(`Mínimo ${CROP_TARGET}×${CROP_TARGET} px`);
          addToast({
            title: "Imagen muy pequeña",
            description: `Mínimo ${CROP_TARGET}×${CROP_TARGET} px`,
            color: "warning",
            variant: "solid",
          });
          URL.revokeObjectURL(url);
          setCropUrl(null);
          setCropOpen(false);
          setPhotoFile(null);

          return;
        }
        const maxZoom = minSide / CROP_TARGET;

        setCropMaxZoom(maxZoom);
        setCropZoom(1);
        const sourceSize = minSide;
        const startX = Math.floor((img.naturalWidth - sourceSize) / 2);
        const startY = Math.floor((img.naturalHeight - sourceSize) / 2);

        setCropX(startX);
        setCropY(startY);
        setCropOpen(true);
        setPhotoError(null);
      };
      img.onerror = (err) => {
        URL.revokeObjectURL(url);
        setCropUrl(null);
        setPhotoError("Archivo inválido");
        addToast({
          title: "Archivo inválido",
          description: (err as any)?.message || "No se pudo leer la imagen",
          color: "danger",
          variant: "solid",
        });
      };
      img.src = url;
    } catch (err: any) {
      setPhotoError("Archivo inválido");
      addToast({
        title: "Archivo inválido",
        description: err?.message || "No se pudo leer la imagen",
        color: "danger",
        variant: "solid",
      });
      setPhotoFile(null);
    }
  };

  useEffect(() => {
    if (!cropOpen) return;
    const img = cropImgRef.current;
    const canvas = previewCanvasRef.current;

    if (!img || !canvas) return;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;
    const VIEW_SIZE = 320;

    canvas.width = VIEW_SIZE;
    canvas.height = VIEW_SIZE;
    const minSide = Math.min(img.naturalWidth, img.naturalHeight);
    const sourceSize = Math.floor(minSide / cropZoom);

    ctx.clearRect(0, 0, VIEW_SIZE, VIEW_SIZE);
    ctx.drawImage(
      img,
      Math.floor(cropX),
      Math.floor(cropY),
      sourceSize,
      sourceSize,
      0,
      0,
      VIEW_SIZE,
      VIEW_SIZE,
    );
  }, [cropOpen, cropZoom, cropX, cropY]);

  const onZoomSlider = (val: number) => {
    const img = cropImgRef.current;

    if (!img) return;
    const minSide = Math.min(img.naturalWidth, img.naturalHeight);
    const oldZoom = cropZoom;
    const newZoom = Math.max(1, Math.min(cropMaxZoom, val));
    const oldSize = minSide / oldZoom;
    const newSize = minSide / newZoom;
    const cx = cropX + oldSize / 2;
    const cy = cropY + oldSize / 2;
    const nx = Math.max(
      0,
      Math.min(img.naturalWidth - newSize, cx - newSize / 2),
    );
    const ny = Math.max(
      0,
      Math.min(img.naturalHeight - newSize, cy - newSize / 2),
    );

    setCropX(nx);
    setCropY(ny);
    setCropZoom(newZoom);
  };

  const onCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    draggingRef.current = true;
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const onCanvasPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!draggingRef.current) return;
    const img = cropImgRef.current;

    if (!img) return;
    const VIEW_SIZE = 320;
    const minSide = Math.min(img.naturalWidth, img.naturalHeight);
    const sourceSize = minSide / cropZoom;
    const ds = dragStartRef.current;

    if (!ds) return;
    const dx = e.clientX - ds.x;
    const dy = e.clientY - ds.y;
    const ratio = sourceSize / VIEW_SIZE;
    const nx = cropX - dx * ratio;
    const ny = cropY - dy * ratio;
    const maxX = img.naturalWidth - sourceSize;
    const maxY = img.naturalHeight - sourceSize;

    setCropX(Math.max(0, Math.min(maxX, nx)));
    setCropY(Math.max(0, Math.min(maxY, ny)));
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const onCanvasPointerUp = () => {
    draggingRef.current = false;
    dragStartRef.current = null;
  };

  const onCanvasWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;

    onZoomSlider(cropZoom + delta);
  };

  const applyCrop = async () => {
    const img = cropImgRef.current;

    if (!img) return;
    const CROP_TARGET = 256;
    const minSide = Math.min(img.naturalWidth, img.naturalHeight);
    const sourceSize = Math.floor(minSide / cropZoom);
    const canvas = document.createElement("canvas");

    canvas.width = CROP_TARGET;
    canvas.height = CROP_TARGET;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;
    ctx.drawImage(
      img,
      Math.floor(cropX),
      Math.floor(cropY),
      sourceSize,
      sourceSize,
      0,
      0,
      CROP_TARGET,
      CROP_TARGET,
    );
    const fileRef = cropOriginalFile;
    const mime = fileRef?.type || "image/jpeg";
    const base = fileRef?.name ? fileRef.name.replace(/\.[^/.]+$/, "") : "foto";
    const ext = (fileRef?.name?.split(".").pop() || "jpg").toLowerCase();
    const name = `${base}_crop.${ext}`;
    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, mime, 0.92),
    );

    if (!blob) return;
    const outFile = new File([blob], name, { type: mime });

    setPhotoFile(outFile);
    setCropOpen(false);
    if (cropUrl) {
      URL.revokeObjectURL(cropUrl);
      setCropUrl(null);
    }
  };

  const handlePhotoUpload = async () => {
    if (!photoFile || (!userId && !user?.id)) return;
    try {
      setSaving(true);
      const updated = await uploadUserPhoto(
        Number(userId || user.id),
        photoFile,
      );

      addToast({
        title: "Foto actualizada",
        description: "La fotografía de perfil fue actualizada.",
        color: "success",
        variant: "solid",
      });
      onUserUpdated?.(updated);
    } catch (e: any) {
      addToast({
        title: "Error al subir foto",
        description: e?.message || "No se pudo actualizar la foto.",
        color: "danger",
        variant: "solid",
      });
    } finally {
      setSaving(false);
      setPhotoFile(null);
    }
  };

  return (
    <div className="mt-4">
      <div className="flex justify-end gap-2 mb-4">
        <Button color="danger" variant="flat" onPress={onCancel}>
          Cancelar
        </Button>
        <Button
          color="primary"
          isDisabled={saving || !canEdit}
          onPress={handleSave}
        >
          Guardar cambios
        </Button>
      </div>
      <Tabs
        aria-label="Editar perfil"
        classNames={{
          base: "w-full",
          tabList:
            "w-full bg-gray-50 dark:bg-gray-950/50 border-b border-gray-200 dark:border-gray-800 gap-2 px-2 py-2",
          panel: "w-full p-0",
          tab: "data-[hover]:bg-gray-100 dark:data-[hover]:bg-gray-800 px-4 py-3",
        }}
        variant="light"
      >
        <Tab
          key="personal"
          title={<span className="font-medium text-sm">Personal</span>}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            <Input
              isDisabled={!canEdit}
              label="RUT"
              value={form.rut}
              onBlur={() =>
                setForm((prev: any) => ({ ...prev, rut: formatRut(prev.rut) }))
              }
              onChange={(e) => handleChange("rut", e.target.value)}
            />
            <Input
              isDisabled={!canEdit}
              label="Correo"
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />

            <Input
              isDisabled={!canEdit}
              label="Nombre"
              value={form.first_name}
              onChange={(e) => handleChange("first_name", e.target.value)}
            />
            <Input
              isDisabled={!canEdit}
              label="Apellido"
              value={form.last_name}
              onChange={(e) => handleChange("last_name", e.target.value)}
            />
            <Input
              isDisabled={!canEdit}
              label="Usuario"
              value={form.username}
              onChange={(e) => handleChange("username", e.target.value)}
            />

            <Input
              isDisabled={!canEdit}
              label="Cumpleaños"
              type="date"
              value={form.birthday || ""}
              onChange={(e) => handleChange("birthday", e.target.value)}
            />
            <Select
              isDisabled={!canEdit}
              label="Género"
              selectedKeys={form.genero_id ? [String(form.genero_id)] : []}
              onSelectionChange={(keys) =>
                handleChange("genero_id", Number(Array.from(keys)[0]))
              }
            >
              {generos.map((g) => (
                <SelectItem key={g.id} textValue={g.genero}>
                  {g.genero}
                </SelectItem>
              ))}
            </Select>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <FileField
              accept="image/*"
              description="Vista previa, recorte cuadrado a 256×256 px. Mínimo 256×256 px, máximo 4000×4000 px."
              file={photoFile}
              id="foto"
              label="Fotografía"
              onChange={handlePhotoChange}
              onClear={() => {
                setPhotoFile(null);
                setPhotoError(null);
              }}
            />
            <Button
              color="secondary"
              isDisabled={!photoFile || saving || !canEdit}
              onPress={handlePhotoUpload}
            >
              Actualizar foto
            </Button>
            {photoError ? (
              <div className="text-danger text-xs mt-1">{photoError}</div>
            ) : null}
          </div>
        </Tab>

        <Tab
          key="trabajo"
          title={<span className="font-medium text-sm">Trabajo</span>}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            <Input
              isDisabled={!canEdit}
              label="Fecha ingreso"
              type="date"
              value={form.date_joined || ""}
              onChange={(e) => handleChange("date_joined", e.target.value)}
            />
            <Select
              isDisabled={!canEdit}
              label="Empresa"
              selectedKeys={form.empresa_id ? [String(form.empresa_id)] : []}
              onSelectionChange={(keys) =>
                handleChange("empresa_id", Number(Array.from(keys)[0]))
              }
            >
              {empresas.map((e) => (
                <SelectItem key={e.id} textValue={e.name || e.empresa}>
                  {(e.name || e.empresa) as string}
                </SelectItem>
              ))}
            </Select>
            <Select
              isDisabled={!canEdit}
              label="Cargo"
              selectedKeys={form.cargo_id ? [String(form.cargo_id)] : []}
              onSelectionChange={(keys) =>
                handleChange("cargo_id", Number(Array.from(keys)[0]))
              }
            >
              {cargos.map((c) => (
                <SelectItem key={c.id} textValue={c.cargo}>
                  {c.cargo}
                </SelectItem>
              ))}
            </Select>
            <Select
              isDisabled={!canEdit}
              label="Ciclo"
              selectedKeys={form.ciclo_id ? [String(form.ciclo_id)] : []}
              onSelectionChange={(keys) =>
                handleChange("ciclo_id", Number(Array.from(keys)[0]))
              }
            >
              {ciclos.map((c) => (
                <SelectItem key={c.id} textValue={c.ciclo}>
                  {c.ciclo}
                </SelectItem>
              ))}
            </Select>

            <Select
              isDisabled={!canEdit}
              label="Jefatura"
              selectedKeys={form.jefe_id ? [String(form.jefe_id)] : []}
              onSelectionChange={(keys) =>
                handleChange("jefe_id", Number(Array.from(keys)[0]))
              }
            >
              {jefes.map((u) => (
                <SelectItem
                  key={u.id}
                  textValue={`${u.first_name} ${u.last_name}`}
                >
                  {`${u.first_name} ${u.last_name}`.trim() || `Usuario ${u.id}`}
                </SelectItem>
              ))}
            </Select>
          </div>
        </Tab>

        <Tab
          key="permisos"
          title={<span className="font-medium text-sm">Permisos</span>}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            <Select
              isDisabled={!canEdit}
              label="Grupo"
              selectedKeys={form.group_id ? [String(form.group_id)] : []}
              onSelectionChange={(keys) =>
                handleChange("group_id", Number(Array.from(keys)[0]))
              }
            >
              {grupos.map((g) => (
                <SelectItem key={g.id} textValue={g.group}>
                  {g.group || `Grupo ${g.id}`}
                </SelectItem>
              ))}
            </Select>
            <Switch
              isDisabled={!canEdit}
              isSelected={Boolean(form.is_active)}
              onValueChange={(v) => handleChange("is_active", Boolean(v))}
            >
              Usuario Activo
            </Switch>
            <Input
              isDisabled
              label="Super Usuario"
              value={(() => {
                const g = grupos.find((x) => x.id === form.group_id);
                const flag =
                  typeof g?.is_staff === "boolean"
                    ? g.is_staff
                    : Boolean(user?.is_staff);

                return flag ? "Sí" : "No";
              })()}
            />
          </div>
        </Tab>
      </Tabs>
      <Modal
        isOpen={cropOpen}
        placement="center"
        size="lg"
        onOpenChange={setCropOpen}
      >
        <ModalContent>
          <ModalHeader>Ajustar fotografía</ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <div
                className="mx-auto rounded-xl overflow-hidden ring-1 ring-black/10 dark:ring-white/10"
                style={{ width: 320, height: 320 }}
              >
                <canvas
                  ref={previewCanvasRef as any}
                  className="w-[320px] h-[320px] bg-default-100/40 dark:bg-default-50/20 cursor-grab active:cursor-grabbing"
                  height={320}
                  width={320}
                  onPointerDown={onCanvasPointerDown}
                  onPointerLeave={onCanvasPointerUp}
                  onPointerMove={onCanvasPointerMove}
                  onPointerUp={onCanvasPointerUp}
                  onWheel={onCanvasWheel}
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-default-600">Zoom</span>
                <input
                  className="flex-1"
                  max={cropMaxZoom}
                  min={1}
                  step={0.01}
                  type="range"
                  value={cropZoom}
                  onChange={(e) => onZoomSlider(parseFloat(e.target.value))}
                />
              </div>
              <div className="text-xs text-default-500">
                Se recortará a 256×256 px
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={() => {
                setCropOpen(false);
                if (cropUrl) {
                  URL.revokeObjectURL(cropUrl);
                  setCropUrl(null);
                }
              }}
            >
              Cancelar
            </Button>
            <Button color="primary" onPress={applyCrop}>
              Aplicar recorte
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
