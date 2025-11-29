import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input"; // Importamos Input
import { 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem 
} from "@heroui/dropdown";
import { addToast } from "@heroui/toast";

// Iconos
import {
  Square2StackIcon, 
  ListBulletIcon,   
  FunnelIcon,       
  CheckCircleIcon,
  ClockIcon,
  ChevronRightIcon,
  DocumentCheckIcon,
  UserGroupIcon,
  ChartPieIcon,
  CalendarDaysIcon,
  MagnifyingGlassIcon,
  RectangleStackIcon, // Para el icono de agrupar
  UserIcon
} from "@heroicons/react/24/outline";

import { HeaderSkeleton, SkeletonGrid } from "./components/subordinados/Skeletons";
import { Autoevaluacion } from "@/features/evaluacion/types/evaluacion";
import axios from "@/services/google/axiosInstance";

/* ────────────────── TIPOS ────────────────── */

interface AutoevaluacionSubordinado extends Omit<Autoevaluacion, "tipo_evaluacion"> {
  persona: { id: number; first_name: string; last_name: string; email: string };
  tipo_evaluacion: { id: number; n_tipo_evaluacion: string };
  completado: boolean;
  logro_obtenido: number;
  fecha_inicio: string;
  fecha_ultima_modificacion: string;
  fecha_periodo?: string; 
}

interface GrupoAutoevaluacionesData {
  tipo_evaluacion: { id: number; n_tipo_evaluacion: string };
  fecha_evaluacion: string;
  autoevaluaciones: AutoevaluacionSubordinado[];
}

// Tipo para el agrupamiento
type GroupByOption = 'none' | 'period' | 'person';

/* ────────────────── HELPERS ────────────────── */

const getYearFromItem = (item: AutoevaluacionSubordinado): string => {
    const dateStr = item.fecha_periodo || item.fecha_inicio || item.fecha_ultima_modificacion;
    if (dateStr) {
        return dateStr.split('-')[0];
    }
    return "Sin Año";
};

const getFullPeriodLabel = (item: AutoevaluacionSubordinado): string => {
    const dateStr = item.fecha_periodo || item.fecha_inicio; 
    
    if (!dateStr) return "Periodo sin fecha";

    try {
        const parts = dateStr.split('-'); 
        if(parts.length < 2) return dateStr;

        const year = parseInt(parts[0]);
        const monthIndex = parseInt(parts[1]) - 1; 
        
        const date = new Date(year, monthIndex, 15); 
        
        const monthName = date.toLocaleDateString("es-CL", { month: "long" });
        return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;
    } catch (e) {
        return dateStr;
    }
};

/* ────────────────── HOOK DE DATOS ────────────────── */
const useTeamData = () => {
  const [data, setData] = useState<AutoevaluacionSubordinado[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/evaluacion/api/autoevaluaciones-subordinados/`);
        
        if (isMounted) {
            const grupos: GrupoAutoevaluacionesData[] = Array.isArray(response.data) ? response.data : [];
            
            const listaPlana = grupos.flatMap(grupo => 
                grupo.autoevaluaciones.map(evaluacion => ({
                    ...evaluacion,
                    fecha_periodo: grupo.fecha_evaluacion 
                }))
            );

            setData(listaPlana);
        }
      } catch (err) {
        console.error(err);
        addToast({ title: "Error", description: "No se pudo cargar la información del equipo.", color: "danger" });
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => { isMounted = false; };
  }, []);

  return { loading, data };
};

/* ────────────────── COMPONENTE PRINCIPAL ────────────────── */

export default function TeamReviewsDashboard() {
  const navigate = useNavigate();
  const { loading, data } = useTeamData();

  // --- ESTADOS DE UI ---
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'pendientes' | 'finalizadas'>('pendientes');
  const [selectedYear, setSelectedYear] = useState<string>('todos');
  
  // NUEVOS ESTADOS
  const [searchTerm, setSearchTerm] = useState('');
  const [groupBy, setGroupBy] = useState<GroupByOption>('none');

  // --- LÓGICA DE FILTROS ---
  
  const availableYears = useMemo(() => {
    if (!data.length) return ['todos'];
    const years = new Set(data.map(d => getYearFromItem(d)));
    const yearsArray = Array.from(years).filter(y => y !== "Sin Año").sort().reverse();
    return ['todos', ...yearsArray];
  }, [data]);

  // Filtramos la lista plana
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // 1. Filtro Estado
      const isCompleted = item.completado;
      if (activeTab === 'pendientes' && isCompleted) return false;
      if (activeTab === 'finalizadas' && !isCompleted) return false;

      // 2. Filtro Año
      if (selectedYear !== 'todos') {
        const itemYear = getYearFromItem(item);
        if (itemYear !== selectedYear) return false;
      }

      // 3. Filtro Buscador (Nuevo)
      if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          const fullName = `${item.persona.first_name} ${item.persona.last_name}`.toLowerCase();
          const email = item.persona.email.toLowerCase();
          if (!fullName.includes(searchLower) && !email.includes(searchLower)) {
              return false;
          }
      }

      return true;
    });
  }, [data, activeTab, selectedYear, searchTerm]);

  // --- LÓGICA DE AGRUPACIÓN (Nueva) ---
  const groupedData = useMemo(() => {
      if (groupBy === 'none') return null;

      const groups: Record<string, AutoevaluacionSubordinado[]> = {};

      filteredData.forEach(item => {
          let key = '';
          if (groupBy === 'period') {
              key = getFullPeriodLabel(item);
          } else if (groupBy === 'person') {
              key = `${item.persona.first_name} ${item.persona.last_name}`;
          }

          if (!groups[key]) {
              groups[key] = [];
          }
          groups[key].push(item);
      });

      return groups;
  }, [filteredData, groupBy]);


  const stats = useMemo(() => {
    const total = data.length;
    const completed = data.filter(i => i.completado).length;
    const pending = total - completed;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pending, progress };
  }, [data]);


  if (loading) return <div className="p-8 max-w-7xl mx-auto"><HeaderSkeleton /><SkeletonGrid /></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#09090b] font-sans text-slate-600 relative">
      <div className="absolute inset-0 z-0 pointer-events-none text-slate-400/20" style={{ backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`, backgroundSize: '24px 24px', opacity: 0.5 }}></div>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8 relative z-10">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Revisiones de Equipo</h1>
          <p className="text-slate-500 mt-1">Supervisa el progreso de las autoevaluaciones de tu equipo</p>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Equipo Total" value={stats.total} icon={<UserGroupIcon className="w-5 h-5 text-blue-600" />} bgIcon="bg-blue-50" />
          <StatCard title="Pendientes" value={stats.pending}  icon={<ClockIcon className="w-5 h-5 text-amber-600" />} bgIcon="bg-amber-50" highlight={stats.pending > 0} />
          <StatCard title="Finalizadas" value={stats.completed} icon={<CheckCircleIcon className="w-5 h-5 text-emerald-600" />} bgIcon="bg-emerald-50" />
          <StatCard title="Progreso Total" value={`${stats.progress}%`} icon={<ChartPieIcon className="w-5 h-5 text-violet-600" />} bgIcon="bg-violet-50" />
        </div>

        {/* MAIN PANEL */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
          
          {/* TOOLBAR */}
          <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 gap-4">
            
            {/* IZQUIERDA: Tabs y Buscador */}
            <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
                <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0">
                    <button onClick={() => setActiveTab('pendientes')} className={`flex-1 sm:flex-none px-4 py-2 text-sm font-semibold rounded-md transition-all ${activeTab === 'pendientes' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Pendientes</button>
                    <button onClick={() => setActiveTab('finalizadas')} className={`flex-1 sm:flex-none px-4 py-2 text-sm font-semibold rounded-md transition-all ${activeTab === 'finalizadas' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Finalizadas</button>
                </div>

                <Input
                    placeholder="Buscar persona..."
                    value={searchTerm}
                    onValueChange={setSearchTerm}
                    startContent={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
                    className="w-full sm:w-64"
                    size="sm"
                    variant="bordered"
                    radius="lg"
                />
            </div>

            {/* DERECHA: Filtros y Vistas */}
            <div className="flex items-center gap-3 w-full xl:w-auto justify-between sm:justify-end overflow-x-auto pb-1 sm:pb-0">
              
              {/* Dropdown Agrupar */}
              <Dropdown>
                <DropdownTrigger>
                  <Button variant="flat" className="bg-slate-50 dark:bg-slate-800 text-slate-600 min-w-fit">
                    <RectangleStackIcon className="w-4 h-4 mr-2" />
                    {groupBy === 'none' ? 'Sin agrupar' : groupBy === 'period' ? 'Por Periodo' : 'Por Persona'}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu 
                    aria-label="Agrupar por" 
                    onAction={(key) => setGroupBy(key as GroupByOption)}
                    selectionMode="single"
                    selectedKeys={new Set([groupBy])}
                >
                    <DropdownItem key="none">Sin agrupar</DropdownItem>
                    <DropdownItem key="period" startContent={<CalendarDaysIcon className="w-4 h-4"/>}>Por Periodo</DropdownItem>
                    <DropdownItem key="person" startContent={<UserIcon className="w-4 h-4"/>}>Por Persona</DropdownItem>
                </DropdownMenu>
              </Dropdown>

              {/* Dropdown Año */}
              <Dropdown>
                <DropdownTrigger>
                  <Button variant="bordered" className="border-slate-200 text-slate-600 capitalize min-w-fit">
                    <FunnelIcon className="w-4 h-4 mr-2" />
                    {selectedYear === 'todos' ? 'Año: Todos' : `Año: ${selectedYear}`}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Filtrar por año" onAction={(key) => setSelectedYear(key as string)} selectionMode="single" selectedKeys={new Set([selectedYear])}>
                  {availableYears.map((year) => (
                    <DropdownItem key={year}>{year === 'todos' ? 'Todos los años' : year}</DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>

              {/* View Mode */}
              <div className="flex items-center bg-slate-50 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700 shrink-0">
                <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><Square2StackIcon className="w-5 h-5" /></button>
                <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><ListBulletIcon className="w-5 h-5" /></button>
              </div>
            </div>
          </div>

          {/* CONTENIDO */}
          <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50 flex-1 overflow-y-auto">
            {filteredData.length === 0 ? (
              <EmptyState 
                hasSearch={!!searchTerm} 
                clearSearch={() => setSearchTerm('')} 
                clearYear={() => setSelectedYear('todos')} 
                yearFiltered={selectedYear !== 'todos'}
              />
            ) : (
              <>
                {/* LÓGICA DE RENDERIZADO: AGRUPADO VS PLANO */}
                {groupBy === 'none' ? (
                    // VISTA PLANA (SIN AGRUPAR)
                    <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-3"}>
                        {filteredData.map((item) => (
                            <ReviewItem 
                                key={item.id} 
                                item={item} 
                                viewMode={viewMode} 
                                onClick={() => navigate("/evaluacion-jefatura/autoevaluacion-detalle", { state: { id: item.id, autoevaluacion: item } })}
                            />
                        ))}
                    </div>
                ) : (
                    // VISTA AGRUPADA
                    <div className="space-y-8">
                        {groupedData && Object.entries(groupedData).map(([groupTitle, items]) => (
                            <div key={groupTitle} className="space-y-4">
                                {/* TÍTULO DEL GRUPO */}
                                <div className="flex items-center gap-3 sticky top-0 bg-slate-50/95 dark:bg-slate-900/95 py-2 z-10 backdrop-blur-sm">
                                    <div className={`p-1.5 rounded-lg ${groupBy === 'period' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                                        {groupBy === 'period' ? <CalendarDaysIcon className="w-5 h-5"/> : <UserIcon className="w-5 h-5"/>}
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">{groupTitle}</h3>
                                    <span className="text-xs font-semibold px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300">
                                        {items.length}
                                    </span>
                                    <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
                                </div>

                                {/* ITEMS DEL GRUPO */}
                                <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pl-4" : "space-y-3 pl-4"}>
                                    {items.map((item) => (
                                        <ReviewItem 
                                            key={item.id} 
                                            item={item} 
                                            viewMode={viewMode} 
                                            onClick={() => navigate("/evaluacion-jefatura/autoevaluacion-detalle", { state: { id: item.id, autoevaluacion: item } })}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────── COMPONENTES UI ────────────────── */

// Wrapper unificado para renderizar Grid o List
function ReviewItem({ item, viewMode, onClick }: { item: AutoevaluacionSubordinado, viewMode: 'grid' | 'list', onClick: () => void }) {
    if (viewMode === 'grid') return <ReviewGridCard data={item} onClick={onClick} />;
    return <ReviewListRow data={item} onClick={onClick} />;
}

function StatCard({ title, value, sublabel, icon, bgIcon, highlight }: any) {
  return (
    <Card className={`border shadow-sm bg-white dark:bg-slate-900 ${highlight ? 'border-amber-200 bg-amber-50/50' : 'border-slate-200 dark:border-slate-800'}`}>
      <CardBody className="p-5">
        <div className="flex flex-col h-full justify-between">
          <span className={`text-sm font-semibold mb-2 ${highlight ? 'text-amber-700' : 'text-slate-500'}`}>{title}</span>
          <div className="flex items-end justify-between">
            <div>
              <span className={`text-3xl font-bold block ${highlight ? 'text-amber-900' : 'text-slate-900 dark:text-white'}`}>{value}</span>
              {sublabel && <span className={`text-xs font-medium mt-1 block ${highlight ? 'text-amber-600' : 'text-slate-400'}`}>{sublabel}</span>}
            </div>
            <div className={`p-3 rounded-xl ${bgIcon}`}>
              {icon}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

function ReviewGridCard({ data, onClick }: { data: AutoevaluacionSubordinado, onClick: () => void }) {
  const firstName = data.persona?.first_name || "Usuario";
  const lastName = data.persona?.last_name || "";
  const initials = `${firstName[0] || 'U'}${lastName[0] || ''}`;
  const tipo = data.tipo_evaluacion?.n_tipo_evaluacion || "Evaluación";
  const periodLabel = getFullPeriodLabel(data);

  return (
    <div 
      onClick={onClick}
      className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-blue-400 transition-all cursor-pointer shadow-sm hover:shadow-md relative overflow-hidden flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${data.completado ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                {initials}
            </div>
            {data.completado ? (
                <div className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase rounded-md border border-emerald-100">Finalizada</div>
            ) : (
                <div className="px-2 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold uppercase rounded-md border border-amber-100 animate-pulse">Pendiente</div>
            )}
        </div>
        
        <h4 className="font-bold text-slate-800 dark:text-white text-base truncate">
          {firstName} {lastName}
        </h4>
        <p className="text-xs text-slate-500 mt-1 line-clamp-2 min-h-[2.5em]">{tipo}</p>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
           <CalendarDaysIcon className="w-4 h-4 text-slate-400" />
           {periodLabel}
        </div>
        <div className="flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:underline">
            {data.completado ? 'Ver' : 'Revisar'}
            <ChevronRightIcon className="w-3 h-3" />
        </div>
      </div>
    </div>
  )
}

function ReviewListRow({ data, onClick }: { data: AutoevaluacionSubordinado, onClick: () => void }) {
  const firstName = data.persona?.first_name || "Usuario";
  const lastName = data.persona?.last_name || "";
  const initials = `${firstName[0] || 'U'}${lastName[0] || ''}`;
  const email = data.persona?.email || "Sin email";
  const periodLabel = getFullPeriodLabel(data);

  return (
    <div 
      onClick={onClick}
      className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${data.completado ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
            {initials}
        </div>
        <div className="min-w-0">
           <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
             {firstName} {lastName}
           </p>
           <p className="text-xs text-slate-500 truncate">{email}</p>
        </div>
      </div>

      <div className="hidden md:block flex-1 px-4">
        <span className="inline-block px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium truncate max-w-full">
          {data.tipo_evaluacion?.n_tipo_evaluacion || "Evaluación"}
        </span>
      </div>

      <div className="hidden sm:flex flex-col items-end mr-6 min-w-[120px]">
         <span className={`text-xs font-bold uppercase mb-1 ${data.completado ? 'text-emerald-600' : 'text-amber-600'}`}>
             {data.completado ? 'Finalizada' : 'Pendiente'}
         </span>
         <span className="text-[11px] text-slate-500 font-medium bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
            {periodLabel}
         </span>
      </div>

      <div className="w-8 flex justify-end text-slate-300 group-hover:text-blue-600">
         <MagnifyingGlassIcon className="w-5 h-5" />
      </div>
    </div>
  )
}

function EmptyState({ hasSearch, clearSearch, clearYear, yearFiltered }: any) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
                <DocumentCheckIcon className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">
                No se encontraron evaluaciones
            </h3>
            <p className="text-slate-400 text-sm mt-1 max-w-xs mx-auto">
                {hasSearch 
                    ? `No hay resultados para tu búsqueda.` 
                    : `Intenta ajustar los filtros de año o estado.`}
            </p>
            <div className="flex gap-2 mt-4">
                {hasSearch && (
                    <Button size="sm" variant="flat" color="primary" onClick={clearSearch}>
                        Borrar búsqueda
                    </Button>
                )}
                {yearFiltered && (
                    <Button size="sm" variant="light" color="primary" onClick={clearYear}>
                        Ver todos los años
                    </Button>
                )}
            </div>
        </div>
    )
}