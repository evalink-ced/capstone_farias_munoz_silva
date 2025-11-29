// Router configuration for the new feature-based structure
// This file provides a template for organizing routes by features
// Import your actual route configurations from the existing routes folder

export * from "../../routes/protectedRoutes";
export * from "../../routes/publicRoutes";

// Feature-based route organization template:
// Each feature should export its own routes that can be imported here
// Example:
// export { beneficioRoutes } from '../../features/beneficio/routes';
// export { evaluacionRoutes } from '../../features/evaluacion/routes';
// export { formularioRoutes } from '../../features/formulario/routes';

// This allows for better organization and lazy loading of feature routes

// Since router is not defined, we should remove the default export
// Add router configuration and export it when needed
