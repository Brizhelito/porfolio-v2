import { useState } from 'react';
import { t, type Locale } from '@lib/i18n';

export interface ToolEntry {
  name: string;
  status: 'active' | 'reference' | 'available';
  relatedExpedients: Array<{
    id: string;
    title: string;
    number: string;
  }>;
}

export interface InventorySection {
  name: string;
  sectionCode: string;
  description: string;
  tools: ToolEntry[];
}

export interface StackCategory {
  name: string;
  tools: string[];
}

interface StackCatalogProps {
  categories: InventorySection[] | StackCategory[];
  toolUsage?: Record<string, string[]>;
  locale?: Locale;
  compact?: boolean;
}

const STATUS_STYLES = {
  active: {
    dot: 'bg-[var(--color-stamp-green)]',
    text: 'text-[var(--color-stamp-green)]',
  },
  reference: {
    dot: 'bg-[var(--color-stamp-blue)]',
    text: 'text-[var(--color-stamp-blue)]',
  },
  available: {
    dot: 'bg-[var(--color-archive-kraft)]',
    text: 'text-[var(--color-text-secondary)]',
  },
};

const STATUS_KEYS: Record<string, string> = {
  active: 'common.active',
  reference: 'tools.reference',
  available: 'common.available',
};

function isInventorySectionArray(
  categories: InventorySection[] | StackCategory[]
): categories is InventorySection[] {
  return categories.length > 0 && 'sectionCode' in categories[0];
}

const CODE_MAP: Record<string, string> = {
  Frontend: 'ARH-FE',
  Mobile: 'ARH-MB',
  Backend: 'ARH-BE',
  Database: 'ARH-DB',
  'Edge & Cloud': 'ARH-EC',
  DevOps: 'ARH-DO',
  'Auth & Security': 'ARH-AU',
  Architecture: 'ARH-AR',
};

const DESC_KEYS: Record<string, string> = {
  Frontend: 'tools.descFrontend',
  Mobile: 'tools.descMobile',
  Backend: 'tools.descBackend',
  Database: 'tools.descDatabase',
  'Edge & Cloud': 'tools.descEdgeCloud',
  DevOps: 'tools.descDevOps',
  'Auth & Security': 'tools.descAuthSecurity',
  Architecture: 'tools.descArchitecture',
};

function buildInventorySections(
  categories: StackCategory[],
  toolUsage?: Record<string, string[]>,
  locale: Locale = 'es'
): InventorySection[] {
  return categories.map((cat) => {
    const tools: ToolEntry[] = cat.tools.map((tool) => {
      const relatedTitles = toolUsage?.[tool] ?? [];
      const status: ToolEntry['status'] =
        relatedTitles.length > 0 ? 'active' : 'available';

      return {
        name: tool,
        status,
        relatedExpedients: relatedTitles.map((title) => ({
          id: '',
          title,
          number: '',
        })),
      };
    });

    return {
      name: cat.name,
      sectionCode: CODE_MAP[cat.name] ?? `ARH-${cat.name.slice(0, 2).toUpperCase()}`,
      description: DESC_KEYS[cat.name] ? t(locale, DESC_KEYS[cat.name]) : cat.name,
      tools,
    };
  });
}

export default function StackCatalog({
  categories,
  toolUsage,
  locale = 'es',
  compact = false,
}: StackCatalogProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const T = (key: string) => t(locale, key);

  const sections = isInventorySectionArray(categories)
    ? categories
    : buildInventorySections(categories, toolUsage, locale);

  if (compact) {
    return <CompactView sections={sections} locale={locale} />;
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Document header */}
      <div className="relative mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px flex-1 bg-[var(--color-archive-kraft)]/30" />
          <span className="font-stamp text-[10px] tracking-[0.15em] text-[var(--color-text-secondary)]">
            {T('tools.inventoryDocument')}
          </span>
          <div className="h-px flex-1 bg-[var(--color-archive-kraft)]/30" />
        </div>
        <p className="text-center font-mono text-[11px] text-[var(--color-text-secondary)]">
          {T('tools.inventoryRef')}
        </p>
      </div>

      {/* Inventory sections */}
      <div className="space-y-8">
        {sections.map((section) => (
          <InventorySectionComponent
            key={section.sectionCode}
            section={section}
            locale={locale}
            hoveredRow={hoveredRow}
            onHoverRow={setHoveredRow}
          />
        ))}
      </div>

      {/* Document footer */}
      <div className="mt-10 pt-6 border-t border-dashed border-[var(--color-archive-kraft)]/30">
        <div className="flex items-center justify-between">
          <p className="font-handwritten text-sm text-[var(--color-text-secondary)] italic">
            {T('tools.inventoryFooter')}
          </p>
          <p className="font-mono text-[10px] text-[var(--color-text-secondary)]">
            {T('tools.inventoryEnd')}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================================
   Inventory Section Component
   ============================================ */
function InventorySectionComponent({
  section,
  locale,
  hoveredRow,
  onHoverRow,
}: {
  section: InventorySection;
  locale: Locale;
  hoveredRow: string | null;
  onHoverRow: (id: string | null) => void;
}) {
  const T = (key: string) => t(locale, key);

  return (
    <div className="relative">
      {/* Section header */}
      <div className="flex items-start gap-4 mb-3">
        <div className="flex-shrink-0">
          <span className="inline-block font-mono text-[11px] font-semibold tracking-wider text-[var(--color-accent-gold)] bg-[var(--color-accent-gold)]/10 border border-[var(--color-accent-gold)]/20 px-2 py-0.5 rounded-[2px]">
            {section.sectionCode}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <h2 className="font-stamp text-stamp-title text-[var(--color-text-primary)]">
              {section.name}
            </h2>
            <span className="text-[var(--color-archive-kraft)]">·</span>
            <span className="font-handwritten text-sm text-[var(--color-text-secondary)] italic">
              {section.description}
            </span>
          </div>
        </div>
        <div className="flex-shrink-0">
          <span className="font-mono text-[10px] text-[var(--color-text-secondary)]">
            {section.tools.length} {T('tools.entries')}
          </span>
        </div>
      </div>

      {/* Inventory table */}
      <div className="relative border border-[var(--color-archive-kraft)]/20 rounded-[2px] overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[40px_1fr_100px_1fr] sm:grid-cols-[48px_1fr_120px_1fr] gap-2 px-3 py-2 bg-[var(--color-bg-secondary)]/30 border-b border-dashed border-[var(--color-archive-kraft)]/30">
          <span className="font-mono text-[10px] font-semibold tracking-wider text-[var(--color-text-secondary)] uppercase">
            #
          </span>
          <span className="font-mono text-[10px] font-semibold tracking-wider text-[var(--color-text-secondary)] uppercase">
            {T('tools.tool')}
          </span>
          <span className="font-mono text-[10px] font-semibold tracking-wider text-[var(--color-text-secondary)] uppercase">
            {T('tools.status')}
          </span>
          <span className="font-mono text-[10px] font-semibold tracking-wider text-[var(--color-text-secondary)] uppercase hidden sm:block">
            {T('tools.reference')}
          </span>
        </div>

        {/* Table rows */}
        <div>
          {section.tools.map((tool, idx) => {
            const rowId = `${section.sectionCode}-${tool.name}`;
            const isHovered = hoveredRow === rowId;
            const statusStyle = STATUS_STYLES[tool.status];
            const statusKey = STATUS_KEYS[tool.status];

            return (
              <a
                key={tool.name}
                href={
                  tool.relatedExpedients.length > 0
                    ? `/expedientes/${tool.relatedExpedients[0].id}`
                    : '/expedientes'
                }
                className={`
                  grid grid-cols-[40px_1fr_100px_1fr] sm:grid-cols-[48px_1fr_120px_1fr] gap-2 px-3 py-2.5
                  border-b border-dotted border-[var(--color-archive-kraft)]/20
                  transition-all duration-200 cursor-pointer
                  ${isHovered ? 'bg-[var(--color-accent-gold)]/5' : 'hover:bg-[var(--color-accent-gold)]/5'}
                  last:border-b-0
                `}
                onMouseEnter={() => onHoverRow(rowId)}
                onMouseLeave={() => onHoverRow(null)}
                data-seal-react
                title={
                  tool.relatedExpedients.length > 0
                    ? `${T('tools.viewExpedient')}: ${tool.relatedExpedients[0].title}`
                    : T('tools.browseAll')
                }
              >
                {/* # */}
                <span className="font-mono text-[12px] text-[var(--color-text-secondary)] self-center">
                  {String(idx + 1).padStart(2, '0')}
                </span>

                {/* Tool name */}
                <span className="font-mono text-[13px] text-[var(--color-text-primary)] self-center truncate">
                  {tool.name}
                </span>

                {/* Status */}
                <span className={`inline-flex items-center gap-1.5 self-center ${statusStyle.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusStyle.dot}`} />
                  <span className="font-mono text-[10px] tracking-wider hidden sm:inline">
                    {T(statusKey)}
                  </span>
                </span>

                {/* References */}
                <span className="self-center hidden sm:block">
                  {tool.relatedExpedients.length > 0 ? (
                    <span className="font-mono text-[11px] text-[var(--color-accent-gold)] truncate">
                      {'\u2192'} {tool.relatedExpedients.map((e) => e.title).join(', ')}
                    </span>
                  ) : (
                    <span className="font-mono text-[11px] text-[var(--color-text-secondary)]">
                      {'\u2014'}
                    </span>
                  )}
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ============================================
   Compact View (for Landing Page)
   ============================================ */
function CompactView({
  sections,
  locale,
}: {
  sections: InventorySection[];
  locale: Locale;
}) {
  const T = (key: string) => t(locale, key);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="relative rounded-paper border-2 border-[var(--color-archive-kraft)]/40 bg-[var(--color-bg-primary)] shadow-paper p-6 sm:p-8">
        {/* Decorative top bar */}
        <div className="absolute -top-3 left-6 right-6 flex justify-center">
          <div className="texture-folder rounded px-4 py-1">
            <span className="font-stamp text-stamp-label text-[var(--color-archive-ink)]">
              {T('tools.inventory')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mt-2">
          {sections.map((section) => (
            <div
              key={section.sectionCode}
              className="group relative rounded-paper border border-[var(--color-archive-kraft)]/25 overflow-hidden transition-all hover:shadow-paper"
            >
              {/* Top accent bar */}
              <div className="h-1 w-full bg-[var(--color-accent-gold)]/40 transition-all group-hover:h-1.5 group-hover:bg-[var(--color-accent-gold)]/60" />

              <div className="p-5">
                {/* Category header */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-block font-mono text-[10px] font-semibold tracking-wider text-[var(--color-accent-gold)] bg-[var(--color-accent-gold)]/10 border border-[var(--color-accent-gold)]/20 px-1.5 py-0.5 rounded-[2px]">
                    {section.sectionCode}
                  </span>
                  <div>
                    <h3 className="font-stamp text-stamp-title text-[var(--color-text-primary)]">
                      {section.name}
                    </h3>
                    <p className="font-mono text-[11px] text-[var(--color-text-secondary)]">
                      {section.tools.length} {T('tools.toolsCount')}
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-dashed border-[var(--color-archive-kraft)]/25 mb-4" />

                {/* Tools list */}
                <div className="space-y-1.5">
                  {section.tools.map((tool) => (
                    <div
                      key={tool.name}
                      className="flex items-center gap-2 py-1 px-2 rounded transition-colors hover:bg-[var(--color-bg-secondary)]/30"
                    >
                      <span
                        className={`flex-shrink-0 w-1.5 h-1.5 rounded-full ${STATUS_STYLES[tool.status].dot}`}
                      />
                      <span className="font-mono text-[12px] text-[var(--color-text-primary)]">
                        {tool.name}
                      </span>
                      {tool.relatedExpedients.length > 0 && (
                        <span className="font-mono text-[10px] text-[var(--color-accent-gold)] opacity-60">
                          {'\u2192'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
