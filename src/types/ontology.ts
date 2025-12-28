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
  cardinality: 'one-to-one' | 'one-to-many' | 'many-to-many';
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

export interface ActionRule {
  id: string;
  type: 'validation' | 'transformation' | 'side-effect';
  condition?: string;
  action: string;
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
