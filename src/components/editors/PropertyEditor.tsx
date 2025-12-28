import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  PlusIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';
import type { Property, PropertyType } from '../../types/ontology';

interface PropertyEditorProps {
  properties: Property[];
  onChange: (properties: Property[]) => void;
  primaryKey?: string;
  onPrimaryKeyChange?: (id: string) => void;
}

const propertyTypes: { value: PropertyType; label: string }[] = [
  { value: 'string', label: '字符串' },
  { value: 'number', label: '数字' },
  { value: 'boolean', label: '布尔值' },
  { value: 'date', label: '日期' },
  { value: 'datetime', label: '日期时间' },
  { value: 'array', label: '数组' },
  { value: 'object', label: '对象' },
  { value: 'reference', label: '引用' },
];

export default function PropertyEditor({
  properties,
  onChange,
  primaryKey,
  onPrimaryKeyChange,
}: PropertyEditorProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const addProperty = () => {
    const newProperty: Property = {
      id: uuidv4(),
      name: `property_${properties.length + 1}`,
      displayName: `属性 ${properties.length + 1}`,
      type: 'string',
      required: false,
    };
    onChange([...properties, newProperty]);
    setExpandedId(newProperty.id);
  };

  const updateProperty = (id: string, updates: Partial<Property>) => {
    onChange(
      properties.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deleteProperty = (id: string) => {
    onChange(properties.filter((p) => p.id !== id));
    if (primaryKey === id && onPrimaryKeyChange) {
      onPrimaryKeyChange('');
    }
  };

  const moveProperty = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= properties.length) return;
    
    const newProperties = [...properties];
    [newProperties[index], newProperties[newIndex]] = [newProperties[newIndex], newProperties[index]];
    onChange(newProperties);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-surface-300">属性</h4>
        <button
          onClick={addProperty}
          className="flex items-center gap-1 text-sm text-onto-400 hover:text-onto-300 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          添加属性
        </button>
      </div>

      {properties.length === 0 ? (
        <p className="text-sm text-surface-500 text-center py-4 border border-dashed border-surface-600 rounded-lg">
          暂无属性，点击上方按钮添加
        </p>
      ) : (
        <div className="space-y-2">
          {properties.map((prop, index) => (
            <div
              key={prop.id}
              className={`
                border rounded-lg transition-all duration-200
                ${expandedId === prop.id 
                  ? 'border-onto-500/50 bg-onto-500/5' 
                  : 'border-surface-600 bg-surface-800/50'
                }
              `}
            >
              {/* Collapsed header */}
              <div
                className="flex items-center gap-3 px-3 py-2 cursor-pointer"
                onClick={() => setExpandedId(expandedId === prop.id ? null : prop.id)}
              >
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); moveProperty(index, 'up'); }}
                    disabled={index === 0}
                    className="text-surface-500 hover:text-surface-300 disabled:opacity-30"
                  >
                    <ChevronUpIcon className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); moveProperty(index, 'down'); }}
                    disabled={index === properties.length - 1}
                    className="text-surface-500 hover:text-surface-300 disabled:opacity-30"
                  >
                    <ChevronDownIcon className="w-3 h-3" />
                  </button>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {primaryKey === prop.id && (
                      <KeyIcon className="w-3.5 h-3.5 text-yellow-500" />
                    )}
                    <span className="text-sm font-medium text-surface-200 truncate">
                      {prop.displayName}
                    </span>
                    {prop.required && (
                      <span className="text-red-400 text-xs">*</span>
                    )}
                  </div>
                  <span className="text-xs text-surface-500 font-mono">{prop.name}</span>
                </div>
                
                <span className={`type-badge type-${prop.type}`}>{prop.type}</span>
                
                <button
                  onClick={(e) => { e.stopPropagation(); deleteProperty(prop.id); }}
                  className="p-1 text-surface-500 hover:text-red-400 transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Expanded content */}
              {expandedId === prop.id && (
                <div className="px-3 pb-3 space-y-3 border-t border-surface-700 pt-3 mt-1">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="input-label">属性名称</label>
                      <input
                        type="text"
                        value={prop.name}
                        onChange={(e) => updateProperty(prop.id, { name: e.target.value })}
                        className="input-field font-mono text-sm"
                        placeholder="property_name"
                      />
                    </div>
                    <div>
                      <label className="input-label">显示名称</label>
                      <input
                        type="text"
                        value={prop.displayName}
                        onChange={(e) => updateProperty(prop.id, { displayName: e.target.value })}
                        className="input-field text-sm"
                        placeholder="显示名称"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="input-label">数据类型</label>
                      <select
                        value={prop.type}
                        onChange={(e) => updateProperty(prop.id, { type: e.target.value as PropertyType })}
                        className="select-field text-sm"
                      >
                        {propertyTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-end gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={prop.required}
                          onChange={(e) => updateProperty(prop.id, { required: e.target.checked })}
                          className="w-4 h-4 rounded bg-surface-700 border-surface-600 text-onto-500 focus:ring-onto-500"
                        />
                        <span className="text-sm text-surface-300">必填</span>
                      </label>
                      {onPrimaryKeyChange && (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={primaryKey === prop.id}
                            onChange={(e) => onPrimaryKeyChange(e.target.checked ? prop.id : '')}
                            className="w-4 h-4 rounded bg-surface-700 border-surface-600 text-yellow-500 focus:ring-yellow-500"
                          />
                          <span className="text-sm text-surface-300">主键</span>
                        </label>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="input-label">描述</label>
                    <input
                      type="text"
                      value={prop.description || ''}
                      onChange={(e) => updateProperty(prop.id, { description: e.target.value })}
                      className="input-field text-sm"
                      placeholder="属性描述（可选）"
                    />
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
