// Core Ontology Types - Inspired by Palantir Ontology

export type PropertyType = 
  | 'string' 
  | 'number' 
  | 'boolean' 
  | 'date' 
  | 'datetime' 
  | 'array' 
  | 'object' 
  | 'reference';

export interface Property {
  id: string;
  name: string;
  displayName: string;
  type: PropertyType;
  required: boolean;
  description?: string;
  defaultValue?: unknown;
  validation?: PropertyValidation;
  referenceType?: string; // For reference type, points to another ObjectType
}

export interface PropertyValidation {
  min?: number;
  max?: number;
  pattern?: string;
  enum?: string[];
}

export interface ObjectType {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  icon?: string;
  color?: string;
  primaryKey: string;
  properties: Property[];
  interfaces?: string[]; // Interface IDs this object implements
  createdAt: string;
  updatedAt: string;
}

export interface LinkType {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  sourceObjectTypeId: string;
  targetObjectTypeId: string;
  cardinality: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';
  sourceRole?: string;
  targetRole?: string;
  properties?: Property[];
  createdAt: string;
  updatedAt: string;
}

export interface Interface {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  properties: Property[];
  createdAt: string;
  updatedAt: string;
}

export interface Action {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  objectTypeId: string;
  parameters: ActionParameter[];
  rules?: ActionRule[];
  createdAt: string;
  updatedAt: string;
}

export interface ActionParameter {
  id: string;
  name: string;
  type: PropertyType;
  required: boolean;
  description?: string;
}

// 执行规则类型
export type ActionRuleType = 
  | 'create_object'      // 创建新对象
  | 'update_property'    // 更新属性
  | 'create_link'        // 创建链接
  | 'delete_link'        // 删除链接
  | 'validation'         // 验证规则
  | 'webhook'            // 调用外部API
  | 'notification';      // 发送通知

export interface ActionRule {
  id: string;
  type: ActionRuleType;
  name: string;
  description?: string;
  enabled: boolean;
  order: number;  // 执行顺序
  config: ActionRuleConfig;
}

// 规则配置 - 根据类型不同有不同的配置
export type ActionRuleConfig = 
  | CreateObjectConfig
  | UpdatePropertyConfig
  | CreateLinkConfig
  | DeleteLinkConfig
  | ValidationConfig
  | WebhookConfig
  | NotificationConfig;

export interface CreateObjectConfig {
  type: 'create_object';
  targetObjectTypeId: string;  // 要创建的对象类型
  propertyMappings: PropertyMapping[];  // 属性映射
}

export interface UpdatePropertyConfig {
  type: 'update_property';
  targetProperty: string;  // 要更新的属性
  valueSource: 'parameter' | 'expression' | 'constant';
  value: string;  // 参数名、表达式或常量值
}

export interface CreateLinkConfig {
  type: 'create_link';
  linkTypeId: string;  // 链接类型
  targetSource: 'parameter' | 'created_object' | 'expression' | 'source';
  targetValue: string;
}

export interface DeleteLinkConfig {
  type: 'delete_link';
  linkTypeId: string;
  condition?: string;
}

export interface ValidationConfig {
  type: 'validation';
  condition: string;  // 验证条件表达式
  errorMessage: string;  // 验证失败时的错误消息
}

export interface WebhookConfig {
  type: 'webhook';
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  bodyTemplate?: string;
}

export interface NotificationConfig {
  type: 'notification';
  channel: 'email' | 'sms' | 'push' | 'internal';
  recipientSource: 'parameter' | 'property' | 'constant';
  recipient: string;
  messageTemplate: string;
}

export interface PropertyMapping {
  targetProperty: string;  // 目标对象的属性
  sourceType: 'parameter' | 'source_property' | 'property' | 'expression' | 'constant';
  sourceValue: string;
}

export interface Ontology {
  id: string;
  name: string;
  description?: string;
  version: string;
  objectTypes: ObjectType[];
  linkTypes: LinkType[];
  interfaces: Interface[];
  actions: Action[];
  createdAt: string;
  updatedAt: string;
}

// Canvas Node Types for React Flow
export interface ObjectTypeNode {
  id: string;
  type: 'objectType';
  position: { x: number; y: number };
  data: ObjectType;
}

export interface InterfaceNode {
  id: string;
  type: 'interface';
  position: { x: number; y: number };
  data: Interface;
}

export type OntologyNode = ObjectTypeNode | InterfaceNode;

export interface OntologyEdge {
  id: string;
  source: string;
  target: string;
  type: 'link' | 'implements';
  data?: LinkType;
  animated?: boolean;
  label?: string;
}
