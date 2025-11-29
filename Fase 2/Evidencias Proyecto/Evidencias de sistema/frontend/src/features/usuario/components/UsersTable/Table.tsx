import { useEffect, useState, useRef } from "react";
import { Card, CardBody } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Chip } from "@heroui/chip";
import { Users, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { addToast } from "@heroui/toast";
import { Tabs, Tab } from "@heroui/tabs";

import FileField from "@/shared/components/FileField";
import OptimizedTableComponent from "@/shared/components/ui/Table/OptimizedTableComponent";
import useUsersCache from "@/hooks/useUsersCache";
import { columns } from "@/hooks/columns";
import { UserSkeleton } from "@/shared/components/ui/UserLoader";
import {
  createUser,
  fetchAccessPermissions,
  fetchCargos,
  fetchCiclos,
  fetchEmpresas,
  fetchGeneros,
  fetchAllUsers,
} from "@/api/user/user";

interface UsersTableProps {
  buttonText: string;
  onButtonClick: (userId: number) => void;
}

export default function UsersTable({
  buttonText,
  onButtonClick,
}: UsersTableProps) {
  const {
    searchTerm,
    setSearchTerm,
    filteredUsers,
    allUsers,
    loading,
    error,
    refreshUsers,
    lastRefresh,
    invalidateCache,
  } = useUsersCache();

  const [page, setPage] = useState<number>(() => {
    const stored = sessionStorage.getItem("lastUserTablePage");

    return stored ? parseInt(stored, 10) : 1;
  });

  const lastPageBeforeSearchRef = useRef<number>(page);
  const previousSearchTermRef = useRef<string>("");

  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [cargos, setCargos] = useState<any[]>([]);
  const [generos, setGeneros] = useState<any[]>([]);
  const [ciclos, setCiclos] = useState<any[]>([]);
  const [grupos, setGrupos] = useState<any[]>([]);
  const [jefes, setJefes] = useState<any[]>([]);
  const [form, setForm] = useState<any>({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    rut: "",
    date_joined: "",
    empresa_id: null,
    cargo_id: null,
    genero_id: null,
    ciclo_id: null,
    group_id: null,
    jefe_id: null,
    is_active: true,
  });
  const [rutTouched, setRutTouched] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [usernameTouched, setUsernameTouched] = useState(false);
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

  const validateRut = (rut: string) => {
    if (!rut) return false;
    const s = rut.replace(/\./g, "").replace(/-/g, "").toUpperCase();

    if (s.length < 2) return false;
    const body = s.slice(0, -1);
    const dv = s.slice(-1);

    if (!/^[0-9]+$/.test(body)) return false;
    let sum = 0;
    let factor = 2;

    for (let i = body.length - 1; i >= 0; i--) {
      sum += parseInt(body[i], 10) * factor;
      factor = factor === 7 ? 2 : factor + 1;
    }
    const rest = 11 - (sum % 11);
    const calc = rest === 11 ? "0" : rest === 10 ? "K" : String(rest);

    return calc === dv;
  };

  const formatRut = (rut: string) => {
    if (!rut) return "";
    const s = rut.replace(/\./g, "").replace(/-/g, "").toUpperCase();

    if (s.length < 2) return s;
    const body = s.slice(0, -1);
    const dv = s.slice(-1);
    const rev = body.split("").reverse();
    const grouped: string[] = [];

    for (let i = 0; i < rev.length; i += 3) {
      grouped.push(rev.slice(i, i + 3).join(""));
    }
    const withDots = grouped.join(".").split("").reverse().join("");

    return `${withDots}-${dv}`;
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

  const openCreate = async () => {
    setShowCreate(true);
    try {
      const [emp, cg, gn, cc, gp, jf] = await Promise.all([
        fetchEmpresas(),
        fetchCargos(),
        fetchGeneros(),
        fetchCiclos(),
        fetchAccessPermissions(),
        fetchAllUsers(),
      ]);

      setEmpresas(emp || []);
      setCargos(cg || []);
      setGeneros(gn || []);
      setCiclos(cc || []);
      setGrupos(gp || []);
      setJefes(jf || []);
    } catch {}
    setFieldErrors({});
    setPhotoFile(null);
    setPhotoError(null);
  };

  const handleCreate = async () => {
    setRutTouched(true);
    const payload = { ...form, rut: formatRut(form.rut), is_active: true };

    if (!validateRut(form.rut)) {
      addToast({
        title: "RUT inválido",
        description: "Verifica el dígito verificador.",
        color: "danger",
        variant: "solid",
      });

      return;
    }
    try {
      setSaving(true);
      let body: any = payload;

      if (photoFile) {
        const fd = new FormData();

        Object.entries(payload).forEach(([k, v]) => {
          if (v !== undefined && v !== null) fd.append(k, String(v));
        });
        fd.append("foto", photoFile);
        body = fd;
      }
      const created = await createUser(body);

      addToast({
        title: "Usuario creado",
        description: "El usuario fue creado correctamente.",
        color: "success",
        variant: "solid",
      });
      setShowCreate(false);
      setForm({
        username: "",
        first_name: "",
        last_name: "",
        email: "",
        rut: "",
        date_joined: "",
        empresa_id: null,
        cargo_id: null,
        genero_id: null,
        ciclo_id: null,
        group_id: null,
        jefe_id: null,
        is_active: true,
      });
      const targetSearch = (created as any)?.username || payload.username || "";

      setSearchTerm(targetSearch);
      invalidateCache();
      await refreshUsers();
      setPage(1);
      setFieldErrors({});
      setPhotoFile(null);
      setPhotoError(null);
    } catch (e: any) {
      const labels: Record<string, string> = {
        username: "Usuario",
        first_name: "Nombre",
        last_name: "Apellido",
        email: "Correo",
        rut: "RUT",
        date_joined: "Fecha ingreso",
        empresa_id: "Empresa",
        cargo_id: "Cargo",
        genero_id: "Género",
        ciclo_id: "Ciclo",
        group_id: "Grupo",
        jefe_id: "Jefatura",
        detail: "Detalle",
        non_field_errors: "Error",
      };
      const data = e?.response?.data || {};
      const newErrors: Record<string, string> = {};
      const messages: string[] = [];

      for (const key of Object.keys(data)) {
        const readable = labels[key] || key;
        const value = Array.isArray(data[key])
          ? data[key].join("; ")
          : String(data[key]);

        newErrors[key] = value;
        messages.push(`${readable}: ${value}`);
      }
      setFieldErrors(newErrors);
      const detail =
        messages.length > 0
          ? messages.join(" | ")
          : e?.message || "No se pudo crear el usuario.";

      addToast({
        title: "Error al crear",
        description: detail,
        color: "danger",
        variant: "solid",
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!searchTerm) {
      sessionStorage.setItem("lastUserTablePage", page.toString());
    }
  }, [page, searchTerm]);

  useEffect(() => {
    const previous = previousSearchTermRef.current;
    const isNowEmpty = searchTerm === "";
    const wasEmpty = previous === "";

    previousSearchTermRef.current = searchTerm;

    if (wasEmpty && !isNowEmpty) {
      lastPageBeforeSearchRef.current = page;
      setPage(1);
    } else if (!wasEmpty && isNowEmpty) {
      if (lastPageBeforeSearchRef.current) {
        setPage(lastPageBeforeSearchRef.current);
      }
    }
  }, [searchTerm, page, setPage]);

  // Mostrar skeleton mientras carga inicialmente
  if (loading && filteredUsers.length === 0) {
    return (
      <div className="w-full space-y-12 p-6">
        <Card className="border-none shadow-sm">
          <CardBody className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Usuarios
                </h2>
                <p className="text-sm text-default-500">Cargando usuarios...</p>
              </div>
            </div>
            <Divider className="mb-6" />
          </CardBody>
        </Card>
        <Card className="border-none shadow-sm">
          <CardBody className="p-0">
            <UserSkeleton />
          </CardBody>
        </Card>
      </div>
    );
  }

  // Mostrar error crítico si no se pueden cargar usuarios
  if (error && filteredUsers.length === 0 && !loading) {
    return (
      <div className="w-full space-y-6 p-6">
        <Card className="border-none shadow-sm">
          <CardBody className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-danger/10 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-danger" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Error al cargar usuarios
                </h2>
                <p className="text-sm text-danger">{error}</p>
              </div>
            </div>
            <Divider className="mb-6" />
            <div className="flex gap-4">
              <Button
                color="danger"
                startContent={<RefreshCw className="w-4 h-4" />}
                variant="flat"
                onPress={refreshUsers}
              >
                Reintentar
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 p-6">
      {/* Header Section */}
      <Card className="border-none shadow-sm bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardBody className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Usuarios
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {error && (
                <Chip color="warning" size="sm" variant="flat">
                  ⚠️ Error parcial
                </Chip>
              )}
              <Chip
                color={filteredUsers.length > 0 ? "primary" : "danger"}
                size="sm"
                variant="flat"
              >
                {filteredUsers.length} usuarios
                {searchTerm && ` (filtrados de ${allUsers.length})`}
              </Chip>
              {lastRefresh && (
                <Chip color="success" size="sm" variant="flat">
                  Actualizado: {lastRefresh.toLocaleTimeString()}
                </Chip>
              )}
            </div>
          </div>

          <Divider className="my-4" />

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-end sm:items-center">
            <p className="text-sm text-default-500">
              {loading ? "Cargando usuarios..." : "Gestión de usuarios"}
            </p>
            <Button
              isLoading={loading}
              size="sm"
              startContent={!loading && <RefreshCw className="w-4 h-4" />}
              variant="flat"
              onPress={refreshUsers}
            >
              {loading ? "Actualizando..." : "Actualizar"}
            </Button>
            <Button
              color="primary"
              size="sm"
              variant="flat"
              onPress={openCreate}
            >
              Crear usuario
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Table Section */}
      <Card className="border-none shadow-sm">
        <CardBody className="p-0">
          <OptimizedTableComponent
            buttonText={buttonText}
            columns={columns}
            data={filteredUsers}
            error={error}
            loading={loading}
            page={page}
            searchTerm={searchTerm}
            setPage={setPage}
            onButtonClick={onButtonClick}
            onRefresh={refreshUsers}
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={showCreate}
        placement="center"
        size="2xl"
        onOpenChange={setShowCreate}
      >
        <ModalContent>
          <ModalHeader>Crear usuario</ModalHeader>
          <ModalBody>
            <Tabs aria-label="Secciones de creación" color="primary">
              <Tab
                key="personal"
                title={<span className="text-sm font-medium">Personal</span>}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    isRequired
                    errorMessage={
                      (rutTouched && Boolean(form.rut) && !validateRut(form.rut)
                        ? "RUT inválido"
                        : undefined) || fieldErrors.rut
                    }
                    isInvalid={
                      (rutTouched &&
                        Boolean(form.rut) &&
                        !validateRut(form.rut)) ||
                      Boolean(fieldErrors.rut)
                    }
                    label="RUT"
                    placeholder="12.345.678-9"
                    value={form.rut}
                    onBlur={() => {
                      setRutTouched(true);
                      setForm({ ...form, rut: formatRut(form.rut) });
                    }}
                    onChange={(e) => setForm({ ...form, rut: e.target.value })}
                  />
                  <Input
                    isRequired
                    errorMessage={fieldErrors.email}
                    isInvalid={Boolean(fieldErrors.email)}
                    label="Correo"
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                  <Input
                    isRequired
                    errorMessage={fieldErrors.first_name}
                    isInvalid={Boolean(fieldErrors.first_name)}
                    label="Nombre"
                    value={form.first_name}
                    onChange={(e) => {
                      const v = e.target.value;

                      setForm((prev: any) => {
                        const suggested =
                          !usernameTouched || !prev.username
                            ? makeUsername(v, prev.last_name)
                            : prev.username;

                        return { ...prev, first_name: v, username: suggested };
                      });
                    }}
                  />
                  <Input
                    isRequired
                    errorMessage={fieldErrors.last_name}
                    isInvalid={Boolean(fieldErrors.last_name)}
                    label="Apellido"
                    value={form.last_name}
                    onChange={(e) => {
                      const v = e.target.value;

                      setForm((prev: any) => {
                        const suggested =
                          !usernameTouched || !prev.username
                            ? makeUsername(prev.first_name, v)
                            : prev.username;

                        return { ...prev, last_name: v, username: suggested };
                      });
                    }}
                  />
                  <Input
                    isRequired
                    errorMessage={fieldErrors.username}
                    isInvalid={Boolean(fieldErrors.username)}
                    label="Usuario"
                    value={form.username}
                    onChange={(e) => {
                      setUsernameTouched(true);
                      setForm({ ...form, username: e.target.value });
                    }}
                  />

                  <Select
                    label="Género"
                    selectedKeys={
                      form.genero_id ? [String(form.genero_id)] : []
                    }
                    onSelectionChange={(keys) =>
                      setForm({
                        ...form,
                        genero_id: Number(Array.from(keys)[0]),
                      })
                    }
                  >
                    {generos.map((g) => (
                      <SelectItem key={g.id} textValue={g.genero}>
                        {g.genero}
                      </SelectItem>
                    ))}
                  </Select>
                  <div className="sm:col-span-2">
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
                    {photoError ? (
                      <div className="text-danger text-xs mt-1">
                        {photoError}
                      </div>
                    ) : null}
                  </div>
                </div>
              </Tab>
              <Tab
                key="trabajo"
                title={<span className="text-sm font-medium">Trabajo</span>}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    isRequired
                    label="Fecha ingreso"
                    type="date"
                    value={form.date_joined || ""}
                    onChange={(e) =>
                      setForm({ ...form, date_joined: e.target.value })
                    }
                  />
                  <Select
                    isRequired
                    errorMessage={fieldErrors.empresa_id}
                    isInvalid={Boolean(fieldErrors.empresa_id)}
                    label="Empresa"
                    selectedKeys={
                      form.empresa_id ? [String(form.empresa_id)] : []
                    }
                    onSelectionChange={(keys) =>
                      setForm({
                        ...form,
                        empresa_id: Number(Array.from(keys)[0]),
                      })
                    }
                  >
                    {empresas.map((e) => (
                      <SelectItem key={e.id} textValue={e.name || e.empresa}>
                        {(e.name || e.empresa) as string}
                      </SelectItem>
                    ))}
                  </Select>
                  <Select
                    errorMessage={fieldErrors.cargo_id}
                    isInvalid={Boolean(fieldErrors.cargo_id)}
                    label="Cargo"
                    selectedKeys={form.cargo_id ? [String(form.cargo_id)] : []}
                    onSelectionChange={(keys) =>
                      setForm({
                        ...form,
                        cargo_id: Number(Array.from(keys)[0]),
                      })
                    }
                  >
                    {cargos.map((c) => (
                      <SelectItem key={c.id} textValue={c.cargo}>
                        {c.cargo}
                      </SelectItem>
                    ))}
                  </Select>
                  <Select
                    errorMessage={fieldErrors.ciclo_id}
                    isInvalid={Boolean(fieldErrors.ciclo_id)}
                    label="Ciclo"
                    selectedKeys={form.ciclo_id ? [String(form.ciclo_id)] : []}
                    onSelectionChange={(keys) =>
                      setForm({
                        ...form,
                        ciclo_id: Number(Array.from(keys)[0]),
                      })
                    }
                  >
                    {ciclos.map((c) => (
                      <SelectItem key={c.id} textValue={c.ciclo}>
                        {c.ciclo}
                      </SelectItem>
                    ))}
                  </Select>
                  <Select
                    isRequired
                    errorMessage={fieldErrors.jefe_id}
                    isInvalid={Boolean(fieldErrors.jefe_id)}
                    label="Jefatura"
                    selectedKeys={form.jefe_id ? [String(form.jefe_id)] : []}
                    onSelectionChange={(keys) =>
                      setForm({ ...form, jefe_id: Number(Array.from(keys)[0]) })
                    }
                  >
                    {jefes.map((u) => (
                      <SelectItem
                        key={u.id}
                        textValue={`${u.first_name} ${u.last_name}`}
                      >
                        {`${u.first_name} ${u.last_name}`.trim() ||
                          `Usuario ${u.id}`}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
              </Tab>
              <Tab
                key="permisos"
                title={<span className="text-sm font-medium">Permisos</span>}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Select
                    isRequired
                    errorMessage={fieldErrors.group_id}
                    isInvalid={Boolean(fieldErrors.group_id)}
                    label="Grupo"
                    selectedKeys={form.group_id ? [String(form.group_id)] : []}
                    onSelectionChange={(keys) =>
                      setForm({
                        ...form,
                        group_id: Number(Array.from(keys)[0]),
                      })
                    }
                  >
                    {grupos.map((g) => (
                      <SelectItem key={g.id} textValue={g.group}>
                        {g.group || `Grupo ${g.id}`}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
              </Tab>
            </Tabs>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setShowCreate(false)}>
              Cancelar
            </Button>
            <Button
              color="primary"
              isDisabled={
                saving ||
                !form.username ||
                !form.first_name ||
                !form.last_name ||
                !form.rut ||
                !validateRut(form.rut)
              }
              onPress={handleCreate}
            >
              Crear
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
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
