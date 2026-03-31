export function formatThreadTime(value: number) {
  return new Date(value).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function formatResponseTime(response: { createdAt?: number; timestamp?: string }) {
  const created = response.createdAt ? new Date(response.createdAt) : null;
  if (!created || Number.isNaN(created.getTime())) return response.timestamp || '';
  const now = new Date();
  const isToday = created.getDate() === now.getDate()
    && created.getMonth() === now.getMonth()
    && created.getFullYear() === now.getFullYear();
  const time = created.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (isToday) return `Today · ${time}`;
  const date = created.toLocaleDateString([], { month: 'short', day: 'numeric' });
  return `${date} · ${time}`;
}

export function formatLabelFor(format: string) {
  const map: Record<string, string> = {
    table: 'Table',
    bar: 'Bar Chart',
    line: 'Line Chart',
    area: 'Area Chart',
    pie: 'Pie Chart',
    donut: 'Donut Chart',
    sankey: 'Sankey Diagram',
    text: 'Text',
    flow: 'Flow',
    briefing: 'Briefing Card',
    insights: 'Insights'
  };
  return map[format] || 'View';
}

export function supportsTimeRange(format: string) {
  return ['bar', 'line', 'area', 'pie', 'donut', 'sankey', 'flow'].includes(format);
}

export function rangeFactor(range: string) {
  const map: Record<string, number> = { '7D': 0.88, '30D': 1, '90D': 1.08, '1Y': 1.18 };
  return map[range] || 1;
}

export function summarizeText(value: string, max = 86) {
  if (!value) return '';
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

export function escapeHtml(value: unknown) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function storyToneClass(tone: string) {
  const map: Record<string, string> = {
    critical: 'tone-critical',
    elevated: 'tone-elevated',
    monitor: 'tone-monitor'
  };
  return map[tone] || 'tone-monitor';
}

export function storyTrendMeta(trend: string) {
  const map: Record<string, { label: string; icon: string; className: string }> = {
    worsening: { label: 'Worsening', icon: '↑', className: 'trend-worsening' },
    improving: { label: 'Improving', icon: '↓', className: 'trend-improving' },
    stable: { label: 'Stable', icon: '—', className: 'trend-stable' },
    watch: { label: 'Watch', icon: '•', className: 'trend-watch' }
  };
  return map[trend] || map.stable;
}

export function monthToPercent(month: string) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const index = months.indexOf(month);
  if (index < 0) return 0;
  return (index / 11) * 100;
}
