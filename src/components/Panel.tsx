import { useState, useEffect } from 'react';
import { XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useOntologyStore } from '../store/ontologyStore';
import PropertyEditor from './editors/PropertyEditor';
import ParameterEditor from './editors/ParameterEditor';
import RuleEditor from './editors/RuleEditor';
import type { Property, ActionParameter, ActionRule } from '../types/ontology';

// Color options for objects
const colorOptions = [
  '#6366f1', // Indigo
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#ec4899', // Pink
  '#3b82f6', // Blue
];

// Icon options
const iconOptions = ['📦', '👤', '🏢', '📄', '💰', '🚀', '⚙️', '📊', '🔗', '📱', '🖥️', '🎯'];

export default function Panel() {
  const {
    isPanelOpen,
    panelMode,
    panelType,
    closePanel,
    selectedNodeId,
    selectedEdgeId,
    selectedActionId,
  } = useOntologyStore();

  if (!isPanelOpen || !panelType) return null;

  return (
    <div className="fixed right-0 top-0 bottom-0 w-[420px] z-50 panel-enter">
      <div className="h-full glass border-l border-surface-700 flex flex-col">
        {panelType === 'objectType' && (
          <ObjectTypePanel 
            mode={panelMode!} 
            onClose={closePanel}
            selectedId={selectedNodeId}
          />
        )}
        {panelType === 'interface' && (
          <InterfacePanel 
            mode={panelMode!} 
            onClose={closePanel}
            selectedId={selectedNodeId}
          />
        )}
        {panelType === 'linkType' && (
          <LinkTypePanel 
            mode={panelMode!} 
            onClose={closePanel}
            selectedId={selectedEdgeId}
          />
        )}
        {panelType === 'action' && (
          <ActionPanel 
            mode={panelMode!} 
            onClose={closePanel}
            selectedId={selectedActionId}
          />
        )}
      </div>
    </div>
  );
}

// Object Type Panel
function ObjectTypePanel({ 
  mode, 
  onClose, 
  selectedId 
}: { 
  mode: 'create' | 'edit'; 
  onClose: () => void; 
  selectedId: string | null;
}) {
  const { ontology, addObjectType, updateObjectType, deleteObjectType } = useOntologyStore();
  
  const existingObject = mode === 'edit' && selectedId 
    ? ontology?.objectTypes.find(o => o.id === selectedId) 
    : null;

  const [name, setName] = useState(existingObject?.name || '');
  const [displayName, setDisplayName] = useState(existingObject?.displayName || '');
  const [description, setDescription] = useState(existingObject?.description || '');
  const [color, setColor] = useState(existingObject?.color || colorOptions[0]);
  const [icon, setIcon] = useState(existingObject?.icon || '📦');
  const [properties, setProperties] = useState<Property[]>(existingObject?.properties || []);
  const [primaryKey, setPrimaryKey] = useState(existingObject?.primaryKey || '');

  useEffect(() => {
    if (existingObject) {
      setName(existingObject.name);
      setDisplayName(existingObject.displayName);
      setDescription(existingObject.description || '');
      setColor(existingObject.color || colorOptions[0]);
      setIcon(existingObject.icon || '📦');
      setProperties(existingObject.properties);
      setPrimaryKey(existingObject.primaryKey);
    }
  }, [existingObject]);

  const handleSave = () => {
    if (!name || !displayName) return;

    if (mode === 'create') {
      addObjectType({
        name,
        displayName,
        description,
        color,
        icon,
        properties,
        primaryKey: primaryKey || properties[0]?.id || '',
      });
    } else if (selectedId) {
      updateObjectType(selectedId, {
        name,
        displayName,
        description,
        color,
        icon,
        properties,
        primaryKey,
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (selectedId && confirm('确定要删除这个对象类型吗？')) {
      deleteObjectType(selectedId);
      onClose();
    }
  };

  return (
    <>
      <PanelHeader 
        title={mode === 'create' ? '创建对象类型' : '编辑对象类型'} 
        onClose={onClose} 
      />
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="input-label">类型名称 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.replace(/\s/g, '_').toLowerCase())}
              className="input-field font-mono"
              placeholder="object_type_name"
            />
          </div>
          
          <div>
            <label className="input-label">显示名称 *</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="input-field"
              placeholder="对象类型显示名称"
            />
          </div>
          
          <div>
            <label className="input-label">描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field resize-none h-20"
              placeholder="描述这个对象类型..."
            />
          </div>
        </div>

        {/* Appearance */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-surface-300">外观</h4>
          
          <div>
            <label className="input-label">颜色</label>
            <div className="flex gap-2 flex-wrap">
              {colorOptions.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-lg transition-all ${
                    color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-surface-800' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          
          <div>
            <label className="input-label">图标</label>
            <div className="flex gap-2 flex-wrap">
              {iconOptions.map((i) => (
                <button
                  key={i}
                  onClick={() => setIcon(i)}
                  className={`w-10 h-10 rounded-lg bg-surface-700 hover:bg-surface-600 text-xl flex items-center justify-center transition-all ${
                    icon === i ? 'ring-2 ring-onto-500' : ''
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Properties */}
        <PropertyEditor
          properties={properties}
          onChange={setProperties}
          primaryKey={primaryKey}
          onPrimaryKeyChange={setPrimaryKey}
        />
      </div>

      <PanelFooter 
        onSave={handleSave} 
        onDelete={mode === 'edit' ? handleDelete : undefined}
        saveDisabled={!name || !displayName}
      />
    </>
  );
}

// Interface Panel
function InterfacePanel({ 
  mode, 
  onClose, 
  selectedId 
}: { 
  mode: 'create' | 'edit'; 
  onClose: () => void; 
  selectedId: string | null;
}) {
  const { ontology, addInterface, updateInterface, deleteInterface } = useOntologyStore();
  
  const existingInterface = mode === 'edit' && selectedId 
    ? ontology?.interfaces.find(i => i.id === selectedId) 
    : null;

  const [name, setName] = useState(existingInterface?.name || '');
  const [displayName, setDisplayName] = useState(existingInterface?.displayName || '');
  const [description, setDescription] = useState(existingInterface?.description || '');
  const [properties, setProperties] = useState<Property[]>(existingInterface?.properties || []);

  useEffect(() => {
    if (existingInterface) {
      setName(existingInterface.name);
      setDisplayName(existingInterface.displayName);
      setDescription(existingInterface.description || '');
      setProperties(existingInterface.properties);
    }
  }, [existingInterface]);

  const handleSave = () => {
    if (!name || !displayName) return;

    if (mode === 'create') {
      addInterface({ name, displayName, description, properties });
    } else if (selectedId) {
      updateInterface(selectedId, { name, displayName, description, properties });
    }
    onClose();
  };

  const handleDelete = () => {
    if (selectedId && confirm('确定要删除这个接口吗？')) {
      deleteInterface(selectedId);
      onClose();
    }
  };

  return (
    <>
      <PanelHeader 
        title={mode === 'create' ? '创建接口' : '编辑接口'} 
        onClose={onClose} 
      />
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="input-label">接口名称 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.replace(/\s/g, '_'))}
              className="input-field font-mono"
              placeholder="IInterfaceName"
            />
          </div>
          
          <div>
            <label className="input-label">显示名称 *</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="input-field"
              placeholder="接口显示名称"
            />
          </div>
          
          <div>
            <label className="input-label">描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field resize-none h-20"
              placeholder="描述这个接口..."
            />
          </div>
        </div>

        <PropertyEditor
          properties={properties}
          onChange={setProperties}
        />
      </div>

      <PanelFooter 
        onSave={handleSave} 
        onDelete={mode === 'edit' ? handleDelete : undefined}
        saveDisabled={!name || !displayName}
      />
    </>
  );
}

// Link Type Panel
function LinkTypePanel({ 
  mode, 
  onClose, 
  selectedId 
}: { 
  mode: 'create' | 'edit'; 
  onClose: () => void; 
  selectedId: string | null;
}) {
  const { ontology, addLinkType, updateLinkType, deleteLinkType } = useOntologyStore();
  
  const existingLink = mode === 'edit' && selectedId 
    ? ontology?.linkTypes.find(l => l.id === selectedId) 
    : null;

  const [name, setName] = useState(existingLink?.name || '');
  const [displayName, setDisplayName] = useState(existingLink?.displayName || '');
  const [description, setDescription] = useState(existingLink?.description || '');
  const [sourceObjectTypeId, setSourceObjectTypeId] = useState(existingLink?.sourceObjectTypeId || '');
  const [targetObjectTypeId, setTargetObjectTypeId] = useState(existingLink?.targetObjectTypeId || '');
  const [cardinality, setCardinality] = useState<'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many'>(
    existingLink?.cardinality || 'one-to-many'
  );

  useEffect(() => {
    if (existingLink) {
      setName(existingLink.name);
      setDisplayName(existingLink.displayName);
      setDescription(existingLink.description || '');
      setSourceObjectTypeId(existingLink.sourceObjectTypeId);
      setTargetObjectTypeId(existingLink.targetObjectTypeId);
      setCardinality(existingLink.cardinality);
    }
  }, [existingLink]);

  const handleSave = () => {
    if (!name || !displayName || !sourceObjectTypeId || !targetObjectTypeId) return;

    if (mode === 'create') {
      addLinkType({ 
        name, 
        displayName, 
        description, 
        sourceObjectTypeId, 
        targetObjectTypeId, 
        cardinality 
      });
    } else if (selectedId) {
      updateLinkType(selectedId, { 
        name, 
        displayName, 
        description, 
        sourceObjectTypeId, 
        targetObjectTypeId, 
        cardinality 
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (selectedId && confirm('确定要删除这个链接类型吗？')) {
      deleteLinkType(selectedId);
      onClose();
    }
  };

  return (
    <>
      <PanelHeader 
        title={mode === 'create' ? '创建链接类型' : '编辑链接类型'} 
        onClose={onClose} 
      />
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="input-label">链接名称 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.replace(/\s/g, '_').toLowerCase())}
              className="input-field font-mono"
              placeholder="link_type_name"
            />
          </div>
          
          <div>
            <label className="input-label">显示名称 *</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="input-field"
              placeholder="链接显示名称"
            />
          </div>
          
          <div>
            <label className="input-label">描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field resize-none h-20"
              placeholder="描述这个链接类型..."
            />
          </div>

          <div>
            <label className="input-label">源对象类型 *</label>
            <select
              value={sourceObjectTypeId}
              onChange={(e) => setSourceObjectTypeId(e.target.value)}
              className="select-field"
            >
              <option value="">选择源对象类型</option>
              {ontology?.objectTypes.map((ot) => (
                <option key={ot.id} value={ot.id}>{ot.displayName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="input-label">目标对象类型 *</label>
            <select
              value={targetObjectTypeId}
              onChange={(e) => setTargetObjectTypeId(e.target.value)}
              className="select-field"
            >
              <option value="">选择目标对象类型</option>
              {ontology?.objectTypes.map((ot) => (
                <option key={ot.id} value={ot.id}>{ot.displayName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="input-label">基数</label>
            <select
              value={cardinality}
              onChange={(e) => setCardinality(e.target.value as typeof cardinality)}
              className="select-field"
            >
              <option value="one-to-one">一对一</option>
              <option value="one-to-many">一对多</option>
              <option value="many-to-one">多对一</option>
              <option value="many-to-many">多对多</option>
            </select>
          </div>
        </div>
      </div>

      <PanelFooter 
        onSave={handleSave} 
        onDelete={mode === 'edit' ? handleDelete : undefined}
        saveDisabled={!name || !displayName || !sourceObjectTypeId || !targetObjectTypeId}
      />
    </>
  );
}

// Action Panel
function ActionPanel({ 
  mode, 
  onClose,
  selectedId
}: { 
  mode: 'create' | 'edit'; 
  onClose: () => void;
  selectedId?: string | null;
}) {
  const { ontology, addAction, updateAction, deleteAction } = useOntologyStore();
  
  const existingAction = mode === 'edit' && selectedId 
    ? ontology?.actions.find(a => a.id === selectedId) 
    : null;

  const [name, setName] = useState(existingAction?.name || '');
  const [displayName, setDisplayName] = useState(existingAction?.displayName || '');
  const [description, setDescription] = useState(existingAction?.description || '');
  const [objectTypeId, setObjectTypeId] = useState(existingAction?.objectTypeId || '');
  const [parameters, setParameters] = useState<ActionParameter[]>(existingAction?.parameters || []);
  const [rules, setRules] = useState<ActionRule[]>(existingAction?.rules || []);

  useEffect(() => {
    if (existingAction) {
      setName(existingAction.name);
      setDisplayName(existingAction.displayName);
      setDescription(existingAction.description || '');
      setObjectTypeId(existingAction.objectTypeId);
      setParameters(existingAction.parameters);
      setRules(existingAction.rules || []);
    }
  }, [existingAction]);

  const handleSave = () => {
    if (!name || !displayName || !objectTypeId) return;

    if (mode === 'create') {
      addAction({ 
        name, 
        displayName, 
        description, 
        objectTypeId,
        parameters,
        rules,
      });
    } else if (selectedId) {
      updateAction(selectedId, {
        name,
        displayName,
        description,
        objectTypeId,
        parameters,
        rules,
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (selectedId && confirm('确定要删除这个动作吗？')) {
      deleteAction(selectedId);
      onClose();
    }
  };

  return (
    <>
      <PanelHeader 
        title={mode === 'create' ? '创建动作' : '编辑动作'} 
        onClose={onClose} 
      />
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="input-label">动作名称 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.replace(/\s/g, '_').toLowerCase())}
              className="input-field font-mono"
              placeholder="action_name"
            />
          </div>
          
          <div>
            <label className="input-label">显示名称 *</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="input-field"
              placeholder="动作显示名称"
            />
          </div>
          
          <div>
            <label className="input-label">描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field resize-none h-20"
              placeholder="描述这个动作..."
            />
          </div>

          <div>
            <label className="input-label">关联对象类型 *</label>
            <select
              value={objectTypeId}
              onChange={(e) => setObjectTypeId(e.target.value)}
              className="select-field"
            >
              <option value="">选择对象类型</option>
              {ontology?.objectTypes.map((ot) => (
                <option key={ot.id} value={ot.id}>{ot.displayName}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Parameter Editor */}
        <ParameterEditor
          parameters={parameters}
          onChange={setParameters}
        />

        {/* Rule Editor */}
        {objectTypeId && (
          <RuleEditor
            rules={rules}
            onChange={setRules}
            objectTypeId={objectTypeId}
          />
        )}
      </div>

      <PanelFooter 
        onSave={handleSave}
        onDelete={mode === 'edit' ? handleDelete : undefined}
        saveDisabled={!name || !displayName || !objectTypeId}
      />
    </>
  );
}

// Shared Components
function PanelHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-surface-700">
      <h2 className="font-display font-semibold text-lg text-surface-100">{title}</h2>
      <button
        onClick={onClose}
        className="p-2 text-surface-400 hover:text-surface-200 hover:bg-surface-700 rounded-lg transition-colors"
      >
        <XMarkIcon className="w-5 h-5" />
      </button>
    </div>
  );
}

function PanelFooter({ 
  onSave, 
  onDelete, 
  saveDisabled 
}: { 
  onSave: () => void; 
  onDelete?: () => void; 
  saveDisabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-surface-700">
      {onDelete ? (
        <button onClick={onDelete} className="btn-danger">
          <TrashIcon className="w-4 h-4" />
          删除
        </button>
      ) : (
        <div />
      )}
      <button 
        onClick={onSave} 
        className="btn-primary"
        disabled={saveDisabled}
      >
        保存
      </button>
    </div>
  );
}
