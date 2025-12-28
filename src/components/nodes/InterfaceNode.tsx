import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { PuzzlePieceIcon } from '@heroicons/react/24/outline';
import type { Interface } from '../../types/ontology';
import { useOntologyStore } from '../../store/ontologyStore';

interface InterfaceNodeProps {
  data: Interface;
  selected?: boolean;
}

const InterfaceNode = memo(({ data, selected }: InterfaceNodeProps) => {
  const setSelectedNode = useOntologyStore((state) => state.setSelectedNode);
  const openPanel = useOntologyStore((state) => state.openPanel);

  const handleDoubleClick = () => {
    setSelectedNode(data.id);
    openPanel('edit', 'interface');
  };

  const visibleProperties = data.properties.slice(0, 4);
  const remainingCount = data.properties.length - 4;

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className={`
        min-w-[220px] max-w-[280px] rounded-xl overflow-hidden
        bg-gradient-to-b from-surface-800/90 to-surface-900/90
        border-2 border-dashed transition-all duration-200
        ${selected ? 'border-purple-500 node-selected' : 'border-purple-500/40 hover:border-purple-500/60'}
      `}
      style={{
        boxShadow: selected 
          ? '0 0 30px rgba(139, 92, 246, 0.2)' 
          : '0 4px 20px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* Header */}
      <div 
        className="px-4 py-3 flex items-center gap-3"
        style={{ 
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, transparent 100%)',
          borderBottom: '1px dashed rgba(139, 92, 246, 0.3)',
        }}
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-500/20">
          <PuzzlePieceIcon className="w-5 h-5 text-purple-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-purple-400 font-medium">
              Interface
            </span>
          </div>
          <h3 className="font-display font-semibold text-surface-100 truncate">
            {data.displayName}
          </h3>
        </div>
      </div>

      {/* Properties */}
      <div className="px-4 py-3 space-y-1.5">
        {visibleProperties.map((prop) => (
          <div 
            key={prop.id} 
            className="flex items-center justify-between gap-2 text-sm"
          >
            <span className="text-surface-300 truncate">{prop.displayName}</span>
            <span className={`type-badge type-${prop.type} flex-shrink-0`}>
              {prop.type}
            </span>
          </div>
        ))}
        {remainingCount > 0 && (
          <p className="text-xs text-surface-500 pt-1">
            + {remainingCount} 更多属性
          </p>
        )}
        {data.properties.length === 0 && (
          <p className="text-xs text-surface-500 italic">暂无属性定义</p>
        )}
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-purple-400 !border-2 !border-surface-700"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-purple-400 !border-2 !border-surface-700"
      />
    </div>
  );
});

InterfaceNode.displayName = 'InterfaceNode';

export default InterfaceNode;
