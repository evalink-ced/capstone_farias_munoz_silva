// features/evaluacion/autoevaluacion/components/SimpleTabs.tsx
import { memo } from "react";

type TabItem = { key: string; title: string; content: React.ReactNode };

const SimpleTabs = memo(function SimpleTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: TabItem[];
  active: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="w-full">
      <div className="mb-8 flex rounded-2xl bg-gray-100/80 p-2 backdrop-blur-sm">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={`flex-1 rounded-xl px-6 py-4 text-sm font-medium transition-all duration-300 ${
              active === t.key ? "scale-105 bg-white text-gray-900 shadow-lg" : "text-gray-600 hover:bg-white/50 hover:text-gray-800"
            }`}
            aria-pressed={active === t.key}
            aria-controls={`panel-${t.key}`}
          >
            {t.title}
          </button>
        ))}
      </div>
      <div className="pb-8">
        {tabs.map((t) => (
          <div key={t.key} id={`panel-${t.key}`} hidden={active !== t.key}>
            {t.content}
          </div>
        ))}
      </div>
    </div>
  );
});

export default SimpleTabs;
