import { 
  DocumentTextIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useOntologyStore } from '../store/ontologyStore';

export default function Header() {
  const { ontology } = useOntologyStore();

  if (!ontology) return null;

  const stats = {
    objects: ontology.objectTypes.length,
    links: ontology.linkTypes.length,
    interfaces: ontology.interfaces.length,
    actions: ontology.actions.length,
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 glass border-b border-surface-700">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left - Title */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-onto-500 to-purple-600 flex items-center justify-center">
              <DocumentTextIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-surface-100">
                {ontology.name}
              </h1>
              <p className="text-xs text-surface-500">v{ontology.version}</p>
            </div>
          </div>
        </div>

        {/* Center - Stats */}
        <div className="flex items-center gap-6">
          <StatBadge label="对象类型" value={stats.objects} color="indigo" />
          <StatBadge label="链接" value={stats.links} color="cyan" />
          <StatBadge label="接口" value={stats.interfaces} color="purple" />
          <StatBadge label="动作" value={stats.actions} color="yellow" />
        </div>

        {/* Right - Last updated */}
        <div className="flex items-center gap-2 text-surface-500 text-sm">
          <ClockIcon className="w-4 h-4" />
          <span>更新于 {formatTime(ontology.updatedAt)}</span>
        </div>
      </div>
    </header>
  );
}

function StatBadge({ 
  label, 
  value, 
  color 
}: { 
  label: string; 
  value: number; 
  color: 'indigo' | 'cyan' | 'purple' | 'yellow' 
}) {
  const colorClasses = {
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  };

  return (
    <div className={`px-3 py-1.5 rounded-lg border ${colorClasses[color]} flex items-center gap-2`}>
      <span className="font-mono font-semibold">{value}</span>
      <span className="text-xs opacity-70">{label}</span>
    </div>
  );
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
  
  return date.toLocaleDateString('zh-CN', { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
