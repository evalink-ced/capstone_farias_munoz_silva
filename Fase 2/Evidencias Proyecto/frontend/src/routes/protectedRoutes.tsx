// src/routes/protectedRoutes.ts
import { RouteObject } from "react-router-dom";
import { JSX, lazy } from "react";
import { Suspense } from "react";

import DefaultLayout from "@/shared/components/layout/default";
import ProtectedRoute from "@/features/auth/components/ProtectedRoute";
import { FullPageSpinner } from "@/shared/components/ui/Spinner/FullPageSpinner";
import { PERMISSIONS } from "@/constants/permissions";

// Wrapper de Suspense
const withSuspense = (
  Component: React.LazyExoticComponent<() => JSX.Element>,
) => (
  <Suspense fallback={<FullPageSpinner />}>
    <Component />
  </Suspense>
);

// Páginas protegidas lazy
const IndexPage = lazy(() => import("@/features/usuario/pages/IndexPage"));
const UsersPage = lazy(() => import("@/features/usuario/pages/UsersPage"));
const DiasTablePage = lazy(
  () => import("@/features/usuario/pages/DiasTablePage"),
);
const ProfilePage = lazy(() => import("@/features/usuario/pages/ProfilePage"));
const UserProfileView = lazy(
  () => import("@/features/usuario/pages/UserProfileView"),
);
const TableevaPage = lazy(() => import("@/features/evaluacion/pages/evaluacion_jefatura/tableeva"));
const EditarEvaluacionPage = lazy(
  () => import("@/features/evaluacion/pages/plantilla/EditarEvaluacion"),
);
const CreateEvaluationForm = lazy(
  () => import("@/features/evaluacion/pages/plantilla/createeva"),
);

const AsignarEvaluacionPage = lazy(
  () => import("@/features/evaluacion/pages/asignar/Asignar"),
);
const CrearAsignacionPage = lazy(
  () => import("@/features/evaluacion/pages/asignar/crear-asignacion"),
);
const EditarAsignacionPage = lazy(
  () => import("@/features/evaluacion/pages/asignar/editar/EditarAsignacion"),
);
const AutoevaluacionInicioPage = lazy(
  () =>
    import("@/features/evaluacion/pages/autoevaluacion/AutoevaluacionInicio"),
);
const AutoevaluacionPage = lazy(
  () => import("@/features/evaluacion/pages/autoevaluacion/AutoevaluacionPage"),
);
const JefaturaEvaluacionesPage = lazy(
  () =>
    import(
      "@/features/evaluacion/pages/autoevaluacion/JefaturaEvaluacionesPage"
    ),
);

const EvaluacionDesempenoIntro = lazy(
  () =>
    import(
      "@/features/evaluacion/pages/autoevaluacion/EvaluacionDesempenoIntro"
    ),
);

const JefaturaEvaluacionDetallePage = lazy(
  () =>
    import(
      "@/features/evaluacion/pages/autoevaluacion/JefaturaEvaluacionDetallePage"
    ),
);

const EvaluacionDetalleFinalizadaPage = lazy(
  () =>
    import(
      "@/features/evaluacion/pages/evaluacion_jefatura/finalizada/EvaluacionDetalleFinalizadaPage"
    ),
);

const EvaluacionDetallePendientePage = lazy(
  () =>
    import(
      "@/features/evaluacion/pages/evaluacion_jefatura/EvaluacionDetallePendientePage"
    ),
);

const EvaluacionRetroalimentacionPage = lazy(
  () =>
    import(
      "@/features/evaluacion/pages/evaluacion_jefatura/EvaluacionRetroalimentacionPage"
    ),
);


const AutoEvaluacionDetalleFinalizadaPage = lazy(
  () =>
    import(
      "@/features/evaluacion/pages/autoevaluacion/finalizada/AutoEvaluacionDetalleFinalizadaPage"
    ),
);
const EvaluacionInicioPage = lazy(
  () =>
    import("@/features/evaluacion/pages/evaluacion_jefatura/EvaluacionInicio"),
);
const EvaluacionPage = lazy(
  () =>
    import("@/features/evaluacion/pages/evaluacion_jefatura/EvaluacionPage"),
);

const EvaluacionMixtaPage = lazy(
  () => import("@/features/evaluacion/pages/EvaluacionMixtaPage"),
);

const EvaluacionMixtaIntroPage = lazy(
  () => import("@/features/evaluacion/pages/EvaluacionMixtaIntro"),
);

const AutoevaluacionesSubordinadosPage = lazy(
  () =>
    import(
      "@/features/evaluacion/pages/evaluacion_jefatura/AutoevaluacionesSubordinados"
    ),
);

const AutoevaluacionDetallePage = lazy(
  () =>
    import(
      "@/features/evaluacion/pages/evaluacion_jefatura/AutoevaluacionDetalle"
    ),
);

export const protectedRoutes: RouteObject[] = [
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DefaultLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: withSuspense(IndexPage) },

      { path: "perfil", element: withSuspense(ProfilePage) },
      {
        path: "ficha",
        element: (
          <ProtectedRoute permiso={PERMISSIONS.FUNDACION.USUARIOS_FICHA}>
            {withSuspense(UsersPage)}
          </ProtectedRoute>
        ),
      },
      {
        path: "ficha/user-profile",
        element: (
          <ProtectedRoute permiso={PERMISSIONS.FUNDACION.USUARIOS_FICHA}>
            {withSuspense(UserProfileView)}
          </ProtectedRoute>
        ),
      },
 
      {
        path: "evaluacion-editar",
        element: (
          <ProtectedRoute permiso={PERMISSIONS.EVALUACION.PLANTILLAS}>
            {withSuspense(EditarEvaluacionPage)}
          </ProtectedRoute>
        ),
      },

      {
        path: "evaluacion-crear",
        element: (
          <ProtectedRoute permiso={PERMISSIONS.EVALUACION.PLANTILLAS}>
            {withSuspense(CreateEvaluationForm)}
          </ProtectedRoute>
        ),
      },
      {
        path: "evaluacion-asignar",
        element: (
          <ProtectedRoute permiso={PERMISSIONS.EVALUACION.ASIGNAR}>
            {withSuspense(AsignarEvaluacionPage)}
          </ProtectedRoute>
        ),
      },
      {
        path: "evaluacion-asignar/crear",
        element: (
          <ProtectedRoute permiso={PERMISSIONS.EVALUACION.ASIGNAR}>
            {withSuspense(CrearAsignacionPage)}
          </ProtectedRoute>
        ),
      },
      {
        path: "evaluacion-asignar/edicion",
        element: (
          <ProtectedRoute permiso={PERMISSIONS.EVALUACION.ASIGNAR}>
            {withSuspense(EditarAsignacionPage)}
          </ProtectedRoute>
        ),
      },
      {
        path: "autoevaluacion/inicio",
        element: (
          <ProtectedRoute permiso={PERMISSIONS.PORTAL.AUTOEVALUACION}>
            {withSuspense(AutoevaluacionInicioPage)}
          </ProtectedRoute>
        ),
      },
      {
        path: "/autoevaluacion/inicio/formulario",
        element: (
          <ProtectedRoute permiso={PERMISSIONS.PORTAL.AUTOEVALUACION}>
            {withSuspense(AutoevaluacionPage)}
          </ProtectedRoute>
        ),
      },

      {
        path: "autoevaluacion",
        element: (
          <ProtectedRoute permiso={PERMISSIONS.PORTAL.AUTOEVALUACION}>
            {withSuspense(EvaluacionDesempenoIntro)}
          </ProtectedRoute>
        ),
      },
      {
        path: "autoevaluacion/jefatura",
        element: (
          <ProtectedRoute permiso={PERMISSIONS.PORTAL.AUTOEVALUACION}>
            {withSuspense(JefaturaEvaluacionesPage)}
          </ProtectedRoute>
        ),
      },
      {
        path: "autoevaluacion/jefatura/detalle",
        element: (
          <ProtectedRoute permiso={PERMISSIONS.PORTAL.AUTOEVALUACION}>
            {withSuspense(JefaturaEvaluacionDetallePage)}
          </ProtectedRoute>
        ),
      },
      {
        path: "evaluacion-jefatura",
        element: (
          <ProtectedRoute permiso={PERMISSIONS.DIRECTIVO.EVALUAR_DESEMPENO}>
            {withSuspense(EvaluacionInicioPage)}
          </ProtectedRoute>
        ),
      },
      {
        path: "evaluacion-jefatura/tabla",
        element: (
          <ProtectedRoute permiso={PERMISSIONS.DIRECTIVO.EVALUAR_DESEMPENO}>
            {withSuspense(TableevaPage)}
          </ProtectedRoute>
        ),
      },
      {
        path: "evaluacion-jefatura/tabla/formulario",
        element: (
          <ProtectedRoute permiso={PERMISSIONS.DIRECTIVO.EVALUAR_DESEMPENO}>
            {withSuspense(EvaluacionPage)}
          </ProtectedRoute>
        ),
      },
      {
        path: "evaluacion-jefatura/tabla/detalle",
        element: (
          <ProtectedRoute permiso={PERMISSIONS.DIRECTIVO.EVALUAR_DESEMPENO}>
            {withSuspense(EvaluacionDetalleFinalizadaPage)}
          </ProtectedRoute>
        ),
      },
      {
        path: "evaluacion-jefatura/tabla/detalle-progreso",
        element: (
          <ProtectedRoute permiso={PERMISSIONS.DIRECTIVO.EVALUAR_DESEMPENO}>
            {withSuspense(EvaluacionDetallePendientePage)}
          </ProtectedRoute>
        ),
      },

      {
        path: "autoevaluacion/inicio/detalle",
        element: (
          <ProtectedRoute permiso={PERMISSIONS.PORTAL.AUTOEVALUACION}>
            {withSuspense(AutoEvaluacionDetalleFinalizadaPage)}
          </ProtectedRoute>
        ),
      },

      {
        path: "evaluacion-jefatura/tabla/retroalimentacion",
        element: (
          <ProtectedRoute permiso={PERMISSIONS.DIRECTIVO.EVALUAR_DESEMPENO}>
            {withSuspense(EvaluacionRetroalimentacionPage)}
          </ProtectedRoute>
        ),
      },

      {
        path: "evaluacion-jefatura/autoevaluaciones-subordinados",
        element: (
          <ProtectedRoute permiso={PERMISSIONS.DIRECTIVO.EVALUAR_DESEMPENO}>
            {withSuspense(AutoevaluacionesSubordinadosPage)}
          </ProtectedRoute>
        ),
      },
      {
        path: "evaluacion-jefatura/autoevaluacion-detalle",
        element: (
          <ProtectedRoute permiso={PERMISSIONS.DIRECTIVO.EVALUAR_DESEMPENO}>
            {withSuspense(AutoevaluacionDetallePage)}
          </ProtectedRoute>
        ),
      },
      {
        path: "evaluacion-jefatura/autoevaluacion-detalle/:id",
        element: (
          <ProtectedRoute permiso={PERMISSIONS.DIRECTIVO.EVALUAR_DESEMPENO}>
            {withSuspense(AutoevaluacionDetallePage)}
          </ProtectedRoute>
        ),
      },
      
 
      {
        path: "evaluacion-mixta",
        element: (
          <ProtectedRoute permiso={PERMISSIONS.DIRECTIVO.EVALUACION_MIXTA}>
            {withSuspense(EvaluacionMixtaIntroPage)}
          </ProtectedRoute>
        ),
      },
      {
        path: "evaluacion-mixta/:detalleId",
        element: (
          <ProtectedRoute permiso={PERMISSIONS.DIRECTIVO.EVALUACION_MIXTA}>
            {withSuspense(EvaluacionMixtaPage)}
          </ProtectedRoute>
        ),
      },
    ],
  },


];
