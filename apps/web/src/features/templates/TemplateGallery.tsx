import type { TemplateSpec } from "@zaria/shared";
import { Panel } from "../../components/Panel";

interface TemplateGalleryProps {
  templates: TemplateSpec[];
  selectedTemplateId: string;
  onSelect: (id: string) => void;
}

export const TemplateGallery = ({
  templates,
  selectedTemplateId,
  onSelect
}: TemplateGalleryProps) => {
  return (
    <Panel title="Template Gallery" subtitle="ZARIA Ultra-Premium template system">
      <div className="grid gap-3">
        {templates.map((template) => {
          const isSelected = template.id === selectedTemplateId;
          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onSelect(template.id)}
              className={`rounded-2xl border p-3 text-left transition ${
                isSelected
                  ? "border-zaria-gold-500 bg-zaria-gold-100"
                  : "border-zaria-purple-200 bg-zaria-purple-50/60 hover:border-zaria-purple-400"
              }`}
            >
              <p className="font-display text-lg text-zaria-purple-800">{template.name}</p>
              <p className="mt-1 text-sm text-zaria-purple-700">{template.description}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs uppercase tracking-[0.12em] text-zaria-purple-600">
                <span>{template.coverStyle}</span>
                <span>{template.pageStyle}</span>
                <span>{template.typography.headingFont}</span>
              </div>
              <div className="mt-3 flex gap-2">
                <span
                  className="h-4 w-10 rounded-full border border-zaria-purple-100"
                  style={{ backgroundColor: template.palette.white }}
                />
                <span
                  className="h-4 w-10 rounded-full border border-zaria-purple-100"
                  style={{ backgroundColor: template.palette.purple }}
                />
                <span
                  className="h-4 w-10 rounded-full border border-zaria-purple-100"
                  style={{ backgroundColor: template.palette.gold }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </Panel>
  );
};
