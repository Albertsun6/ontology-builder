import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { CubeIcon, KeyIcon, BoltIcon } from '@heroicons/react/24/outline';
import type { ObjectType } from '../../types/ontology';
import { useOntologyStore } from '../../store/ontologyStore';

interface ObjectTypeNodeProps extends NodeProps {
  data: ObjectType;
}

const ObjectTypeNode = memo(({ data, selected }: ObjectTypeNodeProps) => {
  const setSelectedNode = useOntologyStore((state) => state.setSelectedNode);
  const openPanel = useOntologyStore((state) => state.openPanel);
  const ontology = useOntologyStore((state) => state.ontology);
  
  // 获取关联到这个对象类型的动作
  const relatedActions = ontology?.actions.filter(a => a.objectTypeId === data.id) || [];

  const handleDoubleClick = () => {
    setSelectedNode(data.id);
    openPanel('edit', 'objectType');
  };

  const visibleProperties = data.properties.slice(0, 5);
  const remainingCount = data.properties.length - 5;

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className={`
        min-w-[240px] max-w-[320px] rounded-xl overflow-hidden
        bg-gradient-to-b from-surface-800 to-surface-900
        border-2 transition-all duration-200
        ${selected ? 'border-indigo-500 node-selected' : 'border-surface-600 hover:border-surface-500'}
      `}
      style={{
        boxShadow: selected 
          ? '0 0 30px rgba(99, 102, 241, 0.2)' 
          : '0 4px 20px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* Header */}
      <div 
        className="px-4 py-3 flex items-center gap-3"
        style={{ 
          background: `linear-gradient(135deg, ${data.color || '#6366f1'}22 0%, transparent 100%)`,
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${data.color || '#6366f1'}33` }}
        >
          {data.icon ? (
            <span className="text-lg">{data.icon}</span>
          ) : (
            <CubeIcon className="w-5 h-5" style={{ color: data.color || '#6366f1' }} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-surface-100 truncate">
            {data.displayName}
          </h3>
          <p className="text-xs text-surface-500 font-mono truncate">{data.name}</p>
        </div>
      </div>

      {/* Properties */}
      <div className="px-4 py-3 space-y-1.5">
        {visibleProperties.map((prop) => (
          <div 
            key={prop.id} 
            className="flex items-center justify-between gap-2 text-sm"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {prop.id === data.primaryKey && (
                <KeyIcon className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />
              )}
              <span className={`truncate ${prop.required ? 'text-surface-200' : 'text-surface-400'}`}>
                {prop.displayName}
              </span>
            </div>
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
          <p className="text-xs text-surface-500 italic">暂无属性</p>
        )}
      </div>

      {/* Interfaces badge */}
      {data.interfaces && data.interfaces.length > 0 && (
        <div className="px-4 pb-3">
          <div className="flex flex-wrap gap-1">
            {data.interfaces.map((iface, idx) => (
              <span 
                key={idx}
                className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-400 rounded-full"
              >
                {iface}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {relatedActions.length > 0 && (
        <div className="px-4 pb-3 border-t border-surface-700 pt-2">
          <div className="flex items-center gap-1.5 mb-1.5">
            <BoltIcon className="w-3.5 h-3.5 text-yellow-500" />
            <span className="text-xs text-surface-400 font-medium">动作</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {relatedActions.map((action) => (
              <span 
                key={action.id}
                className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded-full"
              >
                {action.displayName}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-surface-400 !border-2 !border-surface-700"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-surface-700"
      />
    </div>
  );
});

ObjectTypeNode.displayName = 'ObjectTypeNode';

export default ObjectTypeNode;
