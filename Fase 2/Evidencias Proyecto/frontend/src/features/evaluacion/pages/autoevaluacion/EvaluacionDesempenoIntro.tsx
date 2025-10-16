// features/evaluacion/autoevaluacion/pages/EvaluacionDesempenoIntro.tsx
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { useNavigate } from "react-router-dom";

export default function EvaluacionDesempenoIntro() {
    const navigate = useNavigate();
    const goNow = () => navigate("/autoevaluacion/inicio");
    const goJefatura = () => navigate("/autoevaluacion/jefatura");

    const pasos = [
        {
            numero: "01",
            title: "Autoevaluación",
            text: "Evalúa tu desempeño por competencias. Avanza a tu ritmo y retoma cuando necesites. Tu perspectiva es fundamental para el proceso.",
            icon: (
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                    <path d="M12 11h4" />
                    <path d="M12 16h4" />
                    <path d="M8 11h.01" />
                    <path d="M8 16h.01" />
                </svg>
            ),
            color: "primary",
            bgGradient: "from-blue-500/20 to-indigo-500/20",
            iconBg: "from-blue-500 to-indigo-600"
        },
        {
            numero: "02",
            title: "Mis Evaluaciones",
            text: "Tu supervisor evalúa con los mismos criterios, aportando retroalimentación objetiva y perspectivas de desarrollo profesional.",
            icon: (
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            ),
            color: "secondary",
            bgGradient: "from-purple-500/20 to-pink-500/20",
            iconBg: "from-purple-500 to-pink-600"
        },
        
    ];

    const criterios = [
        {
            icon: (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.09 0 2.13.2 3.1.55" />
                </svg>
            ),
            text: "Indicadores ponderados por área y competencia específica"
        },
        {
            icon: (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 12l2-2 4 4 8-8" />
                </svg>
            ),
            text: "Escalas de logro claras y criterios de evaluación consistentes"
        },
        {
            icon: (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    <path d="M8 9h8" />
                    <path d="M8 13h6" />
                </svg>
            ),
            text: "Retroalimentación para potenciar fortalezas y áreas de mejora"
        },
        {
            icon: (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v6m0 6v6" />
                    <path d="M1 12h6m6 0h6" />
                </svg>
            ),
            text: "Transparencia total: seguimiento en tiempo real del estado del proceso"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-blue-950/30 dark:to-indigo-950/50 rounded-xl">
            {/* Elementos decorativos mejorados */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/30 to-indigo-600/30 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/30 to-pink-600/30 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-500" />
            </div>

            <div className="relative z-10 container mx-auto px-6 py-12 max-w-6xl">
                {/* Header principal mejorado */}
                <Card className="mb-12 bg-white/80 backdrop-blur-xl border-0 shadow-2xl dark:bg-slate-900/80">
                    <CardBody className="p-12 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-xl mb-8 group hover:scale-105 transition-transform duration-300">
                            <svg className="w-10 h-10 text-white group-hover:rotate-12 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 11l3 3L22 4" />
                                <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.09 0 2.13.2 3.1.55" />
                            </svg>
                        </div>

                        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                            Evaluación de Desempeño
                        </h1>

                        <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                            Sistema integral de evaluación que potencia tu crecimiento profesional. Mide logros, identifica oportunidades de mejora y planifica tu desarrollo futuro con herramientas de vanguardia.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Button
                                onPress={goNow}
                                size="lg"
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 min-w-[200px]"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Mis Autoevaluaciones
                            </Button>

                            <Button
                                onPress={goJefatura}
                                size="lg"
                                variant="bordered"
                                className="border-2 border-slate-300 text-slate-700 dark:border-slate-600 dark:text-slate-300 font-semibold px-8 py-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 hover:scale-105 transition-all duration-300 min-w-[200px]"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Mis Evaluaciones
                            </Button>
                        </div>
                    </CardBody>
                </Card>

                {/* Proceso de evaluación */}
                <div className="mb-12">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">
                            Proceso de Evaluación
                        </h2>
                        <p className="text-slate-600 dark:text-slate-300 text-lg max-w-2xl mx-auto">
                            Un proceso estructurado en 2 etapas diseñado para maximizar tu desarrollo profesional
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {pasos.map((paso, index) => (
                            <Card
                                key={index}
                                className={`group bg-gradient-to-br ${paso.bgGradient} backdrop-blur-xl border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105`}
                            >
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-4 w-full">
                                        <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${paso.iconBg} shadow-lg group-hover:rotate-6 transition-transform duration-300`}>
                                            <div className="text-white">
                                                {paso.icon}
                                            </div>
                                        </div>
                                        <Chip
                                            color={paso.color as any}
                                            variant="flat"
                                            className="font-bold"
                                        >
                                            Paso {paso.numero}
                                        </Chip>
                                    </div>
                                </CardHeader>
                                <CardBody className="pt-0">
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">
                                        {paso.title}
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                        {paso.text}
                                    </p>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Criterios de evaluación mejorados */}
                <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl dark:bg-slate-900/80">
                    <CardHeader className="pb-6">
                        <div className="flex items-center gap-4 w-full">
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                                    Criterios de Evaluación
                                </h2>
                                <p className="text-slate-600 dark:text-slate-300">
                                    Metodología transparente y objetiva
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    <Divider />
                    <CardBody className="pt-6">
                        <div className="grid sm:grid-cols-2 gap-6">
                            {criterios.map((criterio, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-4 p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 hover:bg-slate-100/80 dark:hover:bg-slate-700/50 transition-colors duration-200"
                                >
                                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md flex-shrink-0">
                                        <div className="text-white">
                                            {criterio.icon}
                                        </div>
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                        {criterio.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardBody>
                </Card>

                {/* Footer info adicional */}
                <div className="mt-12 text-center">
                    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border border-blue-200/50 dark:border-blue-800/50">
                        <CardBody className="p-8">
                            <div className="flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                ¿Necesitas ayuda?
                            </h3>
                            <p className="text-blue-700 dark:text-blue-300">
                                contacta al equipo de RRHH para asistencia personalizada.
                            </p>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
}