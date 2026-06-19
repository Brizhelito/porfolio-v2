export interface StackCategory {
  name: string;
  tools: string[];
}

interface StackCatalogProps {
  categories: StackCategory[];
  /** Map of tool name → expedient titles that use it */
  toolUsage?: Record<string, string[]>;
}

// Category config: icon path + accent color
const CATEGORY_CONFIG: Record<string, { icon: string; accent: string }> = {
  Frontend: {
    icon: 'M4 6h16M4 12h16M4 18h7',
    accent: '#C9A961',
  },
  Backend: {
    icon: 'M5 12h14M12 5v14',
    accent: '#5C7156',
  },
  'Edge & Cloud': {
    icon: 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z',
    accent: '#2D4A5C',
  },
  DevOps: {
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
    accent: '#B23A28',
  },
};

export default function StackCatalog({
  categories,
  toolUsage,
}: StackCatalogProps) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Card catalog frame */}
      <div className="relative rounded-paper border-2 border-[var(--color-archive-kraft)]/40 bg-[var(--color-bg-primary)] shadow-paper p-6 sm:p-8">
        {/* Decorative top bar */}
        <div className="absolute -top-3 left-6 right-6 flex justify-center">
          <div className="texture-folder rounded px-4 py-1">
            <span className="font-stamp text-stamp-label text-[var(--color-archive-ink)]">
              CLASIFICADOR
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mt-2">
          {categories.map((cat) => {
            const config = CATEGORY_CONFIG[cat.name] ?? {
              icon: 'M4 6h16M4 12h16M4 18h16',
              accent: '#C9A961',
            };

            return (
              <div
                key={cat.name}
                className="group relative rounded-paper border border-[var(--color-archive-kraft)]/25 overflow-hidden transition-all hover:shadow-paper"
              >
                {/* Top accent bar */}
                <div
                  className="h-1 w-full transition-all group-hover:h-1.5"
                  style={{ backgroundColor: config.accent }}
                />

                <div className="p-5">
                  {/* Category header */}
                  <div className="flex items-center gap-3 mb-4">
                    {/* Icon container */}
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-paper flex items-center justify-center border"
                      style={{
                        borderColor: `${config.accent}40`,
                        backgroundColor: `${config.accent}08`,
                      }}
                    >
                      <svg
                        className="w-5 h-5"
                        style={{ color: config.accent }}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d={config.icon}
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-stamp text-stamp-title text-[var(--color-text-primary)]">
                        {cat.name}
                      </h3>
                      <p className="font-mono text-[11px] text-[var(--color-text-secondary)]/60">
                        {cat.tools.length} herramientas
                      </p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div
                    className="border-t border-dashed mb-4"
                    style={{ borderColor: `${config.accent}25` }}
                  />

                  {/* Tools list */}
                  <div className="space-y-1.5">
                    {cat.tools.map((tool) => {
                      const usedIn = toolUsage?.[tool];
                      return (
                        <div
                          key={tool}
                          className="flex items-start gap-3 py-1.5 px-2 rounded transition-colors hover:bg-[var(--color-bg-secondary)]/30"
                        >
                          {/* Bullet */}
                          <span
                            className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: `${config.accent}99` }}
                          />

                          <div className="min-w-0">
                            <p className="font-mono text-body-sm text-[var(--color-text-primary)]">
                              {tool}
                            </p>
                            {/* Cross-reference to expedients */}
                            {usedIn && usedIn.length > 0 && (
                              <p className="font-mono text-[11px] text-[var(--color-text-secondary)] mt-0.5">
                                <span className="text-sm font-bold text-[var(--color-accent-gold)]">→</span>{' '}
                                {usedIn.join(', ')}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
