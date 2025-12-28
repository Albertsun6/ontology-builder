import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  PlusIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import type { ActionParameter, PropertyType } from '../../types/ontology';

interface ParameterEditorProps {
  parameters: ActionParameter[];
  onChange: (parameters: ActionParameter[]) => void;
}

const parameterTypes: { value: PropertyType; label: string }[] = [
  { value: 'string', label: '字符串' },
  { value: 'number', label: '数字' },
  { value: 'boolean', label: '布尔值' },
  { value: 'date', label: '日期' },
  { value: 'datetime', label: '日期时间' },
  { value: 'array', label: '数组' },
  { value: 'object', label: '对象' },
  { value: 'reference', label: '引用' },
];

export default function ParameterEditor({
  parameters,
  onChange,
}: ParameterEditorProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const addParameter = () => {
    const newParam: ActionParameter = {
      id: uuidv4(),
      name: `param_${parameters.length + 1}`,
      type: 'string',
      required: false,
    };
    onChange([...parameters, newParam]);
    setExpandedId(newParam.id);
  };

  const updateParameter = (id: string, updates: Partial<ActionParameter>) => {
    onChange(
      parameters.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deleteParameter = (id: string) => {
    onChange(parameters.filter((p) => p.id !== id));
  };

  const moveParameter = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= parameters.length) return;
    
    const newParams = [...parameters];
    [newParams[index], newParams[newIndex]] = [newParams[newIndex], newParams[index]];
    onChange(newParams);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-surface-300">参数列表</h4>
        <button
          onClick={addParameter}
          className="flex items-center gap-1 text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          添加参数
        </button>
      </div>

      {parameters.length === 0 ? (
        <p className="text-sm text-surface-500 text-center py-4 border border-dashed border-surface-600 rounded-lg">
          暂无参数，点击上方按钮添加
        </p>
      ) : (
        <div className="space-y-2">
          {parameters.map((param, index) => (
            <div
              key={param.id}
              className={`
                border rounded-lg transition-all duration-200
                ${expandedId === param.id 
                  ? 'border-yellow-500/50 bg-yellow-500/5' 
                  : 'border-surface-600 bg-surface-800/50'
                }
              `}
            >
              {/* Collapsed header */}
              <div
                className="flex items-center gap-3 px-3 py-2 cursor-pointer"
                onClick={() => setExpandedId(expandedId === param.id ? null : param.id)}
              >
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); moveParameter(index, 'up'); }}
                    disabled={index === 0}
                    className="text-surface-500 hover:text-surface-300 disabled:opacity-30"
                  >
                    <ChevronUpIcon className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); moveParameter(index, 'down'); }}
                    disabled={index === parameters.length - 1}
                    className="text-surface-500 hover:text-surface-300 disabled:opacity-30"
                  >
                    <ChevronDownIcon className="w-3 h-3" />
                  </button>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-surface-200 truncate font-mono">
                      {param.name}
                    </span>
                    {param.required && (
                      <span className="text-red-400 text-xs">必填</span>
                    )}
                  </div>
                  {param.description && (
                    <span className="text-xs text-surface-500 truncate block">{param.description}</span>
                  )}
                </div>
                
                <span className={`type-badge type-${param.type}`}>{param.type}</span>
                
                <button
                  onClick={(e) => { e.stopPropagation(); deleteParameter(param.id); }}
                  className="p-1 text-surface-500 hover:text-red-400 transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Expanded content */}
              {expandedId === param.id && (
                <div className="px-3 pb-3 space-y-3 border-t border-surface-700 pt-3 mt-1">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="input-label">参数名称 *</label>
                      <input
                        type="text"
                        value={param.name}
                        onChange={(e) => updateParameter(param.id, { name: e.target.value.replace(/\s/g, '_').toLowerCase() })}
                        className="input-field font-mono text-sm"
                        placeholder="param_name"
                      />
                    </div>
                    <div>
                      <label className="input-label">数据类型</label>
                      <select
                        value={param.type}
                        onChange={(e) => updateParameter(param.id, { type: e.target.value as PropertyType })}
                        className="select-field text-sm"
                      >
                        {parameterTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="input-label">描述</label>
                    <input
                      type="text"
                      value={param.description || ''}
                      onChange={(e) => updateParameter(param.id, { description: e.target.value })}
                      className="input-field text-sm"
                      placeholder="参数描述（可选）"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={param.required}
                        onChange={(e) => updateParameter(param.id, { required: e.target.checked })}
                        className="w-4 h-4 rounded bg-surface-700 border-surface-600 text-yellow-500 focus:ring-yellow-500"
                      />
                      <span className="text-sm text-surface-300">必填参数</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
