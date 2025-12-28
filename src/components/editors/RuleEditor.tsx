import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  PlayIcon,
  CubeIcon,
  PencilSquareIcon,
  LinkIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import type { 
  ActionRule, 
  ActionRuleType, 
  ActionRuleConfig,
  CreateObjectConfig,
  UpdatePropertyConfig,
  CreateLinkConfig,
  ValidationConfig,
  WebhookConfig,
  NotificationConfig,
  Ontology,
  ObjectType,
  LinkType,
  Property,
} from '../../types/ontology';
import { useOntologyStore } from '../../store/ontologyStore';

interface RuleEditorProps {
  rules: ActionRule[];
  onChange: (rules: ActionRule[]) => void;
  objectTypeId: string;
}

const ruleTypes: { value: ActionRuleType; label: string; icon: React.ElementType; color: string }[] = [
  { value: 'create_object', label: '创建对象', icon: CubeIcon, color: 'text-green-400' },
  { value: 'update_property', label: '更新属性', icon: PencilSquareIcon, color: 'text-blue-400' },
  { value: 'create_link', label: '创建链接', icon: LinkIcon, color: 'text-cyan-400' },
  { value: 'validation', label: '验证规则', icon: ShieldCheckIcon, color: 'text-yellow-400' },
  { value: 'webhook', label: '调用接口', icon: GlobeAltIcon, color: 'text-purple-400' },
  { value: 'notification', label: '发送通知', icon: BellIcon, color: 'text-pink-400' },
];

export default function RuleEditor({
  rules,
  onChange,
  objectTypeId,
}: RuleEditorProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { ontology } = useOntologyStore();

  const addRule = (type: ActionRuleType) => {
    const newRule: ActionRule = {
      id: uuidv4(),
      type,
      name: `${ruleTypes.find(r => r.value === type)?.label || '规则'} ${rules.length + 1}`,
      enabled: true,
      order: rules.length,
      config: getDefaultConfig(type),
    };
    onChange([...rules, newRule]);
    setExpandedId(newRule.id);
  };

  const updateRule = (id: string, updates: Partial<ActionRule>) => {
    onChange(
      rules.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const deleteRule = (id: string) => {
    onChange(rules.filter((r) => r.id !== id));
  };

  const moveRule = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= rules.length) return;
    
    const newRules = [...rules];
    [newRules[index], newRules[newIndex]] = [newRules[newIndex], newRules[index]];
    // Update order
    newRules.forEach((r, i) => r.order = i);
    onChange(newRules);
  };

  const getDefaultConfig = (type: ActionRuleType): ActionRuleConfig => {
    switch (type) {
      case 'create_object':
        return { type: 'create_object', targetObjectTypeId: '', propertyMappings: [] };
      case 'update_property':
        return { type: 'update_property', targetProperty: '', valueSource: 'parameter', value: '' };
      case 'create_link':
        return { type: 'create_link', linkTypeId: '', targetSource: 'parameter', targetValue: '' };
      case 'delete_link':
        return { type: 'delete_link', linkTypeId: '' };
      case 'validation':
        return { type: 'validation', condition: '', errorMessage: '' };
      case 'webhook':
        return { type: 'webhook', url: '', method: 'POST' };
      case 'notification':
        return { type: 'notification', channel: 'internal', recipientSource: 'parameter', recipient: '', messageTemplate: '' };
      default:
        return { type: 'validation', condition: '', errorMessage: '' };
    }
  };

  const getRuleIcon = (type: ActionRuleType) => {
    const ruleType = ruleTypes.find(r => r.value === type);
    if (!ruleType) return PlayIcon;
    return ruleType.icon;
  };

  const getRuleColor = (type: ActionRuleType) => {
    const ruleType = ruleTypes.find(r => r.value === type);
    return ruleType?.color || 'text-surface-400';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PlayIcon className="w-4 h-4 text-green-400" />
          <h4 className="text-sm font-medium text-surface-300">执行规则</h4>
        </div>
      </div>

      {/* Add Rule Buttons */}
      <div className="flex flex-wrap gap-2">
        {ruleTypes.map((rt) => (
          <button
            key={rt.value}
            onClick={() => addRule(rt.value)}
            className={`
              flex items-center gap-1.5 px-2 py-1 text-xs rounded-lg
              bg-surface-800 border border-surface-600 
              hover:border-surface-500 transition-all
              ${rt.color}
            `}
          >
            <rt.icon className="w-3.5 h-3.5" />
            {rt.label}
          </button>
        ))}
      </div>

      {rules.length === 0 ? (
        <p className="text-sm text-surface-500 text-center py-4 border border-dashed border-surface-600 rounded-lg">
          暂无执行规则，点击上方按钮添加
        </p>
      ) : (
        <div className="space-y-2">
          {rules.sort((a, b) => a.order - b.order).map((rule, index) => {
            const Icon = getRuleIcon(rule.type);
            return (
              <div
                key={rule.id}
                className={`
                  border rounded-lg transition-all duration-200
                  ${expandedId === rule.id 
                    ? 'border-green-500/50 bg-green-500/5' 
                    : 'border-surface-600 bg-surface-800/50'
                  }
                  ${!rule.enabled ? 'opacity-50' : ''}
                `}
              >
                {/* Header */}
                <div
                  className="flex items-center gap-3 px-3 py-2 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === rule.id ? null : rule.id)}
                >
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); moveRule(index, 'up'); }}
                      disabled={index === 0}
                      className="text-surface-500 hover:text-surface-300 disabled:opacity-30"
                    >
                      <ChevronUpIcon className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); moveRule(index, 'down'); }}
                      disabled={index === rules.length - 1}
                      className="text-surface-500 hover:text-surface-300 disabled:opacity-30"
                    >
                      <ChevronDownIcon className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <div className={`p-1.5 rounded ${getRuleColor(rule.type)} bg-current/10`}>
                    <Icon className={`w-4 h-4 ${getRuleColor(rule.type)}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-surface-200 truncate">
                        {rule.name}
                      </span>
                      <span className="text-xs text-surface-500">
                        #{index + 1}
                      </span>
                    </div>
                    <span className="text-xs text-surface-500">
                      {ruleTypes.find(r => r.value === rule.type)?.label}
                    </span>
                  </div>
                  
                  <label className="flex items-center" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={(e) => updateRule(rule.id, { enabled: e.target.checked })}
                      className="w-4 h-4 rounded bg-surface-700 border-surface-600 text-green-500 focus:ring-green-500"
                    />
                  </label>
                  
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteRule(rule.id); }}
                    className="p-1 text-surface-500 hover:text-red-400 transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* Expanded Content */}
                {expandedId === rule.id && (
                  <div className="px-3 pb-3 space-y-3 border-t border-surface-700 pt-3">
                    <div>
                      <label className="input-label">规则名称</label>
                      <input
                        type="text"
                        value={rule.name}
                        onChange={(e) => updateRule(rule.id, { name: e.target.value })}
                        className="input-field text-sm"
                        placeholder="规则名称"
                      />
                    </div>
                    
                    <div>
                      <label className="input-label">描述</label>
                      <input
                        type="text"
                        value={rule.description || ''}
                        onChange={(e) => updateRule(rule.id, { description: e.target.value })}
                        className="input-field text-sm"
                        placeholder="规则描述（可选）"
                      />
                    </div>

                    {/* Rule-specific config */}
                    <RuleConfigEditor
                      rule={rule}
                      onChange={(config) => updateRule(rule.id, { config })}
                      objectTypeId={objectTypeId}
                      ontology={ontology}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Rule Config Editor Component
function RuleConfigEditor({
  rule,
  onChange,
  objectTypeId,
  ontology,
}: {
  rule: ActionRule;
  onChange: (config: ActionRuleConfig) => void;
  objectTypeId: string;
  ontology: Ontology | null;
}) {
  const config = rule.config;
  const currentObjectType = ontology?.objectTypes.find((ot: ObjectType) => ot.id === objectTypeId);

  switch (config.type) {
    case 'create_object':
      return (
        <div className="space-y-3 p-3 bg-surface-900/50 rounded-lg">
          <h5 className="text-xs font-medium text-green-400 uppercase tracking-wider">创建对象配置</h5>
          <div>
            <label className="input-label">目标对象类型</label>
            <select
              value={(config as CreateObjectConfig).targetObjectTypeId}
              onChange={(e) => onChange({ ...config, targetObjectTypeId: e.target.value } as CreateObjectConfig)}
              className="select-field text-sm"
            >
              <option value="">选择要创建的对象类型</option>
              {ontology?.objectTypes.map((ot: ObjectType) => (
                <option key={ot.id} value={ot.id}>{ot.displayName}</option>
              ))}
            </select>
          </div>
          <p className="text-xs text-surface-500">
            执行动作时将创建一个新的该类型对象
          </p>
        </div>
      );

    case 'update_property':
      return (
        <div className="space-y-3 p-3 bg-surface-900/50 rounded-lg">
          <h5 className="text-xs font-medium text-blue-400 uppercase tracking-wider">更新属性配置</h5>
          <div>
            <label className="input-label">目标属性</label>
            <select
              value={(config as UpdatePropertyConfig).targetProperty}
              onChange={(e) => onChange({ ...config, targetProperty: e.target.value } as UpdatePropertyConfig)}
              className="select-field text-sm"
            >
              <option value="">选择要更新的属性</option>
              {currentObjectType?.properties.map((prop: Property) => (
                <option key={prop.id} value={prop.name}>{prop.displayName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="input-label">值来源</label>
            <select
              value={(config as UpdatePropertyConfig).valueSource}
              onChange={(e) => onChange({ ...config, valueSource: e.target.value as 'parameter' | 'expression' | 'constant' } as UpdatePropertyConfig)}
              className="select-field text-sm"
            >
              <option value="parameter">来自参数</option>
              <option value="constant">常量值</option>
              <option value="expression">表达式</option>
            </select>
          </div>
          <div>
            <label className="input-label">值</label>
            <input
              type="text"
              value={(config as UpdatePropertyConfig).value}
              onChange={(e) => onChange({ ...config, value: e.target.value } as UpdatePropertyConfig)}
              className="input-field text-sm font-mono"
              placeholder={(config as UpdatePropertyConfig).valueSource === 'parameter' ? '参数名' : '值或表达式'}
            />
          </div>
        </div>
      );

    case 'create_link':
      return (
        <div className="space-y-3 p-3 bg-surface-900/50 rounded-lg">
          <h5 className="text-xs font-medium text-cyan-400 uppercase tracking-wider">创建链接配置</h5>
          <div>
            <label className="input-label">链接类型</label>
            <select
              value={(config as CreateLinkConfig).linkTypeId}
              onChange={(e) => onChange({ ...config, linkTypeId: e.target.value } as CreateLinkConfig)}
              className="select-field text-sm"
            >
              <option value="">选择链接类型</option>
              {ontology?.linkTypes
                .filter((lt: LinkType) => lt.sourceObjectTypeId === objectTypeId || lt.targetObjectTypeId === objectTypeId)
                .map((lt: LinkType) => (
                  <option key={lt.id} value={lt.id}>{lt.displayName}</option>
                ))}
            </select>
          </div>
          <div>
            <label className="input-label">目标来源</label>
            <select
              value={(config as CreateLinkConfig).targetSource}
              onChange={(e) => onChange({ ...config, targetSource: e.target.value as 'parameter' | 'created_object' | 'expression' } as CreateLinkConfig)}
              className="select-field text-sm"
            >
              <option value="parameter">来自参数</option>
              <option value="created_object">新创建的对象</option>
              <option value="expression">表达式</option>
            </select>
          </div>
        </div>
      );

    case 'validation':
      return (
        <div className="space-y-3 p-3 bg-surface-900/50 rounded-lg">
          <h5 className="text-xs font-medium text-yellow-400 uppercase tracking-wider">验证规则配置</h5>
          <div>
            <label className="input-label">验证条件</label>
            <input
              type="text"
              value={(config as ValidationConfig).condition}
              onChange={(e) => onChange({ ...config, condition: e.target.value } as ValidationConfig)}
              className="input-field text-sm font-mono"
              placeholder="例: params.quantity > 0"
            />
          </div>
          <div>
            <label className="input-label">错误消息</label>
            <input
              type="text"
              value={(config as ValidationConfig).errorMessage}
              onChange={(e) => onChange({ ...config, errorMessage: e.target.value } as ValidationConfig)}
              className="input-field text-sm"
              placeholder="验证失败时显示的消息"
            />
          </div>
        </div>
      );

    case 'webhook':
      return (
        <div className="space-y-3 p-3 bg-surface-900/50 rounded-lg">
          <h5 className="text-xs font-medium text-purple-400 uppercase tracking-wider">Webhook 配置</h5>
          <div className="grid grid-cols-4 gap-2">
            <div className="col-span-1">
              <label className="input-label">方法</label>
              <select
                value={(config as WebhookConfig).method}
                onChange={(e) => onChange({ ...config, method: e.target.value as 'GET' | 'POST' | 'PUT' | 'DELETE' } as WebhookConfig)}
                className="select-field text-sm"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div className="col-span-3">
              <label className="input-label">URL</label>
              <input
                type="text"
                value={(config as WebhookConfig).url}
                onChange={(e) => onChange({ ...config, url: e.target.value } as WebhookConfig)}
                className="input-field text-sm font-mono"
                placeholder="https://api.example.com/endpoint"
              />
            </div>
          </div>
          <div>
            <label className="input-label">请求体模板 (JSON)</label>
            <textarea
              value={(config as WebhookConfig).bodyTemplate || ''}
              onChange={(e) => onChange({ ...config, bodyTemplate: e.target.value } as WebhookConfig)}
              className="input-field text-sm font-mono resize-none h-20"
              placeholder='{"orderId": "{{params.order_id}}"}'
            />
          </div>
        </div>
      );

    case 'notification':
      return (
        <div className="space-y-3 p-3 bg-surface-900/50 rounded-lg">
          <h5 className="text-xs font-medium text-pink-400 uppercase tracking-wider">通知配置</h5>
          <div>
            <label className="input-label">通知渠道</label>
            <select
              value={(config as NotificationConfig).channel}
              onChange={(e) => onChange({ ...config, channel: e.target.value as 'email' | 'sms' | 'push' | 'internal' } as NotificationConfig)}
              className="select-field text-sm"
            >
              <option value="internal">站内通知</option>
              <option value="email">邮件</option>
              <option value="sms">短信</option>
              <option value="push">推送</option>
            </select>
          </div>
          <div>
            <label className="input-label">接收人</label>
            <input
              type="text"
              value={(config as NotificationConfig).recipient}
              onChange={(e) => onChange({ ...config, recipient: e.target.value } as NotificationConfig)}
              className="input-field text-sm"
              placeholder="接收人参数名或表达式"
            />
          </div>
          <div>
            <label className="input-label">消息模板</label>
            <textarea
              value={(config as NotificationConfig).messageTemplate}
              onChange={(e) => onChange({ ...config, messageTemplate: e.target.value } as NotificationConfig)}
              className="input-field text-sm resize-none h-16"
              placeholder="订单 {{params.order_id}} 已创建"
            />
          </div>
        </div>
      );

    default:
      return null;
  }
}
