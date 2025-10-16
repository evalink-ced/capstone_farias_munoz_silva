// src/features/evaluacion/services/autofill.ts
import type { AreaEvaluacion, NivelLogro } from "@/features/evaluacion/types/evaluacion";
import { makeArea, makeCompetencia, makeIndicadores } from "../utils/factories";

// ────────────────────────────────────────────────────────────────────────────────
// Spec: puedes usar número de indicadores o lista detallada.
// ────────────────────────────────────────────────────────────────────────────────
export type IndicatorItem = {
  /** Texto del indicador (obligatorio si usas la forma lista) */
  indicador: string;
  definicion?: string;
  /** Override opcional de niveles por indicador */
  niveles?: Partial<NivelLogro>[];
};

export type AutoFillSpec = Array<{
  n_area: string;
  ponderacion: number;
  competencias: Array<{
    id: number;
    name: string;
    /** Acepta '3' (cantidad) o lista de indicadores con contenido */
    indicadores: number | IndicatorItem[];
  }>;
}>;

// ────────────────────────────────────────────────────────────────────────────────
// Builder
// ────────────────────────────────────────────────────────────────────────────────
export function buildAreasFromSpec(spec: AutoFillSpec): AreaEvaluacion[] {
  return spec.map(area => {
    const competencias = area.competencias.map(c => {
      if (typeof c.indicadores === "number") {
        // Solo cantidad: usa texto/definición por defecto
        return makeCompetencia(c.id, c.name, c.indicadores);
      }
      // Lista detallada: mapea a overrides (texto/def/levels)
      const overrides = c.indicadores.map((it) => ({
        indicador: it.indicador,
        definicion: it.definicion ?? "",
        nvlindicadores: it.niveles as NivelLogro[] | undefined,
      }));
      const indicadores = makeIndicadores(overrides.length, c.id, overrides);
      return makeCompetencia(c.id, c.name, indicadores);
    });

    return makeArea(area.n_area, area.ponderacion, competencias);
  });
}

// ────────────────────────────────────────────────────────────────────────────────
// Caso demo (adaptado a tus áreas) con mezcla de cantidad + lista detallada
// ────────────────────────────────────────────────────────────────────────────────
export function buildDemoAutoevaluacion(): {
  nombreTipoEvaluacion: string;
  areas: AreaEvaluacion[];
} {
  const spec: AutoFillSpec = [
    {
      n_area: "I.CUMPLIMIENTO",
      ponderacion: 0,
      competencias: [
        {
          id: 1,
          name: "Responsabilidad",
          // Lista detallada (ejemplo)
          indicadores: [
            { indicador: "Cumple con su asistencia al lugar de trabajo, avisando y justificando oportunamente en caso de inasistencia. *Licencias y días administrativos no afectan el registro de asistencia." },
            { indicador: "Es puntual en el ingreso y registro personal de asistencia. Avisa y justifica oportunamente en caso de atrasos." },
            { indicador: "Demuestra capacidad para organizar el trabajo de forma efectiva y cumplir con los plazos establecidos." },
            { indicador: "Asiste puntualmente a las reuniones, actividades y capacitaciones que se le convoca." },
            { indicador: "Participa respetuosamente de las reuniones, actividades y capacitaciones que se le convoca." },
          ],
        },
      ],
    },
    {
      n_area: "II. EXCELENCIA PROFESIONAL",
      ponderacion: 0,
      competencias: [
        // Solo cantidad (genera 1 indicador con texto/def por defecto)
        {
          id: 2, name: "Trabajo en equipo y colaboración",
          indicadores: [
            { indicador: "Ayuda, en tiempo y forma, a la educadora en el diseño y ejecución de las actividades educativas." },
            { indicador: "Reporta a la educadora, en tiempo y forma, situaciones de convivencia y/o pedagógicas que observa en el aula." },
            { indicador: "Supervisa y resguarda, en tiempo y forma, la seguridad de los estudiantes durante la jornada, apoyando el trabajo de la educadora." },
            { indicador: "Colabora, en tiempo y forma, en la resolución de problemas de convivencia en el aula, apoyando el trabajo de la educadora." },
            { indicador: "Colabora, en tiempo y forma, en la comunicación con apoderados, informando sobre el progreso y necesidades de sus pupilos." },
          ],
        },
        // Lista detallada con overrides por si deseas
        {
          id: 3,
          name: "Adaptabilidad y flexibilidad ",
          indicadores: [
            { indicador: "(1) Gestiona oportunamente la presencia de obstáculos o imprevistos, para cumplir con los requerimientos asociados a su función. (2) Adapta sus estrategias y metodologías de trabajo a partir de los recursos disponibles y las necesidades del entorno. (3) Demuestra apertura frente a cambios y ajustes en las tareas, procesos y objetivos. (4) Demuestra capacidad para aprender de los errores y enfrentar los desafíos de manera constructiva, buscando soluciones creativas y eficaces." },],
        },

        {
          id: 4, name: "Orientación a la mejora continua", indicadores: [
            { indicador: "(1) Persevera proactivamente en el cumplimiento de las demandas de su trabajo. (2) Muestra disposición a adquirir nuevas habilidades y conocimientos, con miras a la mejora continua de sus prácticas profesionales. (3) Demuestra un espíritu crítico, está abierto a recibir retroalimentación para evaluar sus propias acciones y proponer, acordar e implementar medidas para su mejora continua. (4) Busca la excelencia en su trabajo a través de un compromiso continuo con la calidad de las tareas que realiza." },
          ]
        },
      ],
    },
    {
      n_area: "III. RELACIONAL",
      ponderacion: 0,
      competencias: [
        {
          id: 5,
          name: "Habilidades interpersonales",
          indicadores: [
            { indicador: "(1) Tiene la habilidad para expresarse de manera asertiva, respetuosa y empática con estudiantes, apoderados y otros profesionales del colegio. (2) Tiene la habilidad de ofrecer una escucha activa, respetuosa y empática a los estudiantes, apoderados y otros profesionales del colegio. (2) Trabaja de forma colaborativa con colegas y otros profesionales, demostrando disposición al trabajo en equipo. (4) Evita conflictos o rivalidades y posee la habilidad de abordar los desacuerdos de manera asertiva." },
          ],
        },
      ],
    },
    {
      n_area: "IV. ADHERENCIA AL PEI",
      ponderacion: 0,
      competencias: [
        {
          id: 6,
          name: "Identificación con el PEI",
          indicadores: [
            { indicador: "(1) Demuestra compromiso con los estudiantes, su profesión y el rol que desempeña en el colegio y la sociedad. (2) Muestra respeto por la diversidad presente en el colegio -cultural, étnica, socioeconómica, género, NEE, etc.-, promoviendo un ambiente escolar inclusivo, justo y equitativo. (3) Actúa con profesionalismo, ética, integridad y honestidad en todos los aspectos de su trabajo, alineándose con la normativa interna del colegio y la legislación vigente. (4) Realiza su trabajo en consonancia con la visión y misión del colegio, demostrando compromiso con el desarrollo integral de los estudiantes." },
          ],
        },
      ],
    },
  ];

  return { nombreTipoEvaluacion: "Autoevaluación", areas: buildAreasFromSpec(spec) };
}

// Builder parametrizable
export function buildAutoevaluacionCustom(
  nombre: string,
  spec: AutoFillSpec,
): { nombreTipoEvaluacion: string; areas: AreaEvaluacion[] } {
  return { nombreTipoEvaluacion: nombre, areas: buildAreasFromSpec(spec) };
}
