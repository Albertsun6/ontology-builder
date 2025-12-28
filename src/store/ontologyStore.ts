import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { 
  Ontology, 
  ObjectType, 
  LinkType, 
  Interface, 
  Action, 
  Property,
  OntologyNode,
  OntologyEdge 
} from '../types/ontology';

interface OntologyState {
  // Current ontology
  ontology: Ontology | null;
  
  // Canvas state
  nodes: OntologyNode[];
  edges: OntologyEdge[];
  
  // Selection state
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  
  // UI state
  isPanelOpen: boolean;
  panelMode: 'create' | 'edit' | null;
  panelType: 'objectType' | 'linkType' | 'interface' | 'action' | null;
  
  // Actions
  createOntology: (name: string, description?: string) => void;
  
  // Object Type actions
  addObjectType: (objectType: Omit<ObjectType, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateObjectType: (id: string, updates: Partial<ObjectType>) => void;
  deleteObjectType: (id: string) => void;
  
  // Link Type actions
  addLinkType: (linkType: Omit<LinkType, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateLinkType: (id: string, updates: Partial<LinkType>) => void;
  deleteLinkType: (id: string) => void;
  
  // Interface actions
  addInterface: (iface: Omit<Interface, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateInterface: (id: string, updates: Partial<Interface>) => void;
  deleteInterface: (id: string) => void;
  
  // Action actions
  addAction: (action: Omit<Action, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateAction: (id: string, updates: Partial<Action>) => void;
  deleteAction: (id: string) => void;
  
  // Canvas actions
  setNodes: (nodes: OntologyNode[]) => void;
  setEdges: (edges: OntologyEdge[]) => void;
  updateNodePosition: (id: string, position: { x: number; y: number }) => void;
  
  // Selection actions
  setSelectedNode: (id: string | null) => void;
  setSelectedEdge: (id: string | null) => void;
  
  // Panel actions
  openPanel: (mode: 'create' | 'edit', type: 'objectType' | 'linkType' | 'interface' | 'action') => void;
  closePanel: () => void;
  
  // Import/Export
  exportOntology: () => string;
  importOntology: (json: string) => void;
  
  // Reset
  reset: () => void;
}

const now = () => new Date().toISOString();

// Demo Data IDs
const CUSTOMER_ID = 'demo-customer';
const ORDER_ID = 'demo-order';
const PRODUCT_ID = 'demo-product';
const EMPLOYEE_ID = 'demo-employee';
const CATEGORY_ID = 'demo-category';
const TRACKABLE_ID = 'demo-trackable';

// Demo Properties
const customerProperties: Property[] = [
  { id: 'cust-id', name: 'customer_id', displayName: '客户ID', type: 'string', required: true },
  { id: 'cust-name', name: 'name', displayName: '姓名', type: 'string', required: true },
  { id: 'cust-email', name: 'email', displayName: '邮箱', type: 'string', required: true },
  { id: 'cust-phone', name: 'phone', displayName: '电话', type: 'string', required: false },
  { id: 'cust-created', name: 'created_at', displayName: '创建时间', type: 'datetime', required: true },
  { id: 'cust-vip', name: 'is_vip', displayName: 'VIP会员', type: 'boolean', required: false },
];

const orderProperties: Property[] = [
  { id: 'ord-id', name: 'order_id', displayName: '订单号', type: 'string', required: true },
  { id: 'ord-total', name: 'total_amount', displayName: '订单金额', type: 'number', required: true },
  { id: 'ord-status', name: 'status', displayName: '状态', type: 'string', required: true },
  { id: 'ord-date', name: 'order_date', displayName: '下单日期', type: 'datetime', required: true },
  { id: 'ord-address', name: 'shipping_address', displayName: '收货地址', type: 'string', required: true },
];

const productProperties: Property[] = [
  { id: 'prod-id', name: 'product_id', displayName: '产品ID', type: 'string', required: true },
  { id: 'prod-name', name: 'name', displayName: '产品名称', type: 'string', required: true },
  { id: 'prod-price', name: 'price', displayName: '价格', type: 'number', required: true },
  { id: 'prod-stock', name: 'stock', displayName: '库存数量', type: 'number', required: true },
  { id: 'prod-desc', name: 'description', displayName: '描述', type: 'string', required: false },
  { id: 'prod-active', name: 'is_active', displayName: '是否上架', type: 'boolean', required: true },
];

const employeeProperties: Property[] = [
  { id: 'emp-id', name: 'employee_id', displayName: '员工ID', type: 'string', required: true },
  { id: 'emp-name', name: 'name', displayName: '姓名', type: 'string', required: true },
  { id: 'emp-dept', name: 'department', displayName: '部门', type: 'string', required: true },
  { id: 'emp-role', name: 'role', displayName: '职位', type: 'string', required: true },
  { id: 'emp-hire', name: 'hire_date', displayName: '入职日期', type: 'date', required: true },
];

const categoryProperties: Property[] = [
  { id: 'cat-id', name: 'category_id', displayName: '分类ID', type: 'string', required: true },
  { id: 'cat-name', name: 'name', displayName: '分类名称', type: 'string', required: true },
  { id: 'cat-parent', name: 'parent_id', displayName: '父分类', type: 'reference', required: false },
];

const trackableProperties: Property[] = [
  { id: 'track-created', name: 'created_at', displayName: '创建时间', type: 'datetime', required: true },
  { id: 'track-updated', name: 'updated_at', displayName: '更新时间', type: 'datetime', required: true },
  { id: 'track-by', name: 'created_by', displayName: '创建人', type: 'reference', required: false },
];

// Demo Object Types
const demoObjectTypes: ObjectType[] = [
  {
    id: CUSTOMER_ID,
    name: 'customer',
    displayName: '客户',
    description: '系统中的客户实体，包含客户基本信息',
    icon: '👤',
    color: '#6366f1',
    primaryKey: 'cust-id',
    properties: customerProperties,
    interfaces: ['ITrackable'],
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: ORDER_ID,
    name: 'order',
    displayName: '订单',
    description: '客户的购买订单',
    icon: '📄',
    color: '#10b981',
    primaryKey: 'ord-id',
    properties: orderProperties,
    interfaces: ['ITrackable'],
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: PRODUCT_ID,
    name: 'product',
    displayName: '产品',
    description: '可销售的产品',
    icon: '📦',
    color: '#f59e0b',
    primaryKey: 'prod-id',
    properties: productProperties,
    interfaces: ['ITrackable'],
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: EMPLOYEE_ID,
    name: 'employee',
    displayName: '员工',
    description: '公司员工信息',
    icon: '🏢',
    color: '#8b5cf6',
    primaryKey: 'emp-id',
    properties: employeeProperties,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: CATEGORY_ID,
    name: 'category',
    displayName: '产品分类',
    description: '产品的分类层级',
    icon: '📊',
    color: '#06b6d4',
    primaryKey: 'cat-id',
    properties: categoryProperties,
    createdAt: now(),
    updatedAt: now(),
  },
];

// Demo Link Types
const demoLinkTypes: LinkType[] = [
  {
    id: 'link-customer-order',
    name: 'customer_orders',
    displayName: '客户订单',
    description: '客户与其订单的关系',
    sourceObjectTypeId: CUSTOMER_ID,
    targetObjectTypeId: ORDER_ID,
    cardinality: 'one-to-many',
    sourceRole: '下单客户',
    targetRole: '客户订单',
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'link-order-product',
    name: 'order_products',
    displayName: '订单商品',
    description: '订单中包含的产品',
    sourceObjectTypeId: ORDER_ID,
    targetObjectTypeId: PRODUCT_ID,
    cardinality: 'many-to-many',
    sourceRole: '所属订单',
    targetRole: '订单商品',
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'link-product-category',
    name: 'product_category',
    displayName: '产品分类',
    description: '产品所属的分类',
    sourceObjectTypeId: PRODUCT_ID,
    targetObjectTypeId: CATEGORY_ID,
    cardinality: 'many-to-many',
    sourceRole: '分类下产品',
    targetRole: '所属分类',
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'link-order-employee',
    name: 'order_handler',
    displayName: '订单处理人',
    description: '处理订单的员工',
    sourceObjectTypeId: ORDER_ID,
    targetObjectTypeId: EMPLOYEE_ID,
    cardinality: 'many-to-many',
    sourceRole: '处理的订单',
    targetRole: '处理人',
    createdAt: now(),
    updatedAt: now(),
  },
];

// Demo Interface
const demoInterfaces: Interface[] = [
  {
    id: TRACKABLE_ID,
    name: 'ITrackable',
    displayName: '可追踪',
    description: '具有创建和更新时间跟踪的对象',
    properties: trackableProperties,
    createdAt: now(),
    updatedAt: now(),
  },
];

// Demo Actions
const demoActions: Action[] = [
  {
    id: 'action-create-order',
    name: 'create_order',
    displayName: '创建订单',
    description: '为客户创建新订单',
    objectTypeId: CUSTOMER_ID,
    parameters: [
      { id: 'param-products', name: 'products', type: 'array', required: true, description: '订单商品列表' },
      { id: 'param-address', name: 'address', type: 'string', required: true, description: '收货地址' },
    ],
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'action-update-stock',
    name: 'update_stock',
    displayName: '更新库存',
    description: '更新产品库存数量',
    objectTypeId: PRODUCT_ID,
    parameters: [
      { id: 'param-quantity', name: 'quantity', type: 'number', required: true, description: '调整数量' },
      { id: 'param-reason', name: 'reason', type: 'string', required: false, description: '调整原因' },
    ],
    createdAt: now(),
    updatedAt: now(),
  },
];

// Demo Nodes (for canvas)
const demoNodes: OntologyNode[] = [
  { id: CUSTOMER_ID, type: 'objectType', position: { x: 100, y: 200 }, data: demoObjectTypes[0] },
  { id: ORDER_ID, type: 'objectType', position: { x: 400, y: 100 }, data: demoObjectTypes[1] },
  { id: PRODUCT_ID, type: 'objectType', position: { x: 700, y: 200 }, data: demoObjectTypes[2] },
  { id: EMPLOYEE_ID, type: 'objectType', position: { x: 400, y: 400 }, data: demoObjectTypes[3] },
  { id: CATEGORY_ID, type: 'objectType', position: { x: 1000, y: 200 }, data: demoObjectTypes[4] },
  { id: TRACKABLE_ID, type: 'interface', position: { x: 400, y: -50 }, data: demoInterfaces[0] },
];

// Demo Edges (for canvas)
const demoEdges: OntologyEdge[] = [
  { id: 'link-customer-order', source: CUSTOMER_ID, target: ORDER_ID, type: 'link', data: demoLinkTypes[0], label: '客户订单' },
  { id: 'link-order-product', source: ORDER_ID, target: PRODUCT_ID, type: 'link', data: demoLinkTypes[1], label: '订单商品' },
  { id: 'link-product-category', source: PRODUCT_ID, target: CATEGORY_ID, type: 'link', data: demoLinkTypes[2], label: '产品分类' },
  { id: 'link-order-employee', source: ORDER_ID, target: EMPLOYEE_ID, type: 'link', data: demoLinkTypes[3], label: '订单处理人' },
];

// Initial Ontology with Demo Data
const demoOntology: Ontology = {
  id: 'demo-ontology',
  name: '电商系统本体',
  description: '一个电商系统的本体论模型示例，包含客户、订单、产品等核心业务对象',
  version: '1.0.0',
  objectTypes: demoObjectTypes,
  linkTypes: demoLinkTypes,
  interfaces: demoInterfaces,
  actions: demoActions,
  createdAt: now(),
  updatedAt: now(),
};

const initialOntology: Ontology = demoOntology;

export const useOntologyStore = create<OntologyState>()(
  persist(
    (set, get) => ({
      ontology: initialOntology,
      nodes: demoNodes,
      edges: demoEdges,
      selectedNodeId: null,
      selectedEdgeId: null,
      isPanelOpen: false,
      panelMode: null,
      panelType: null,

      createOntology: (name, description) => {
        const newOntology: Ontology = {
          id: uuidv4(),
          name,
          description,
          version: '1.0.0',
          objectTypes: [],
          linkTypes: [],
          interfaces: [],
          actions: [],
          createdAt: now(),
          updatedAt: now(),
        };
        set({ ontology: newOntology, nodes: [], edges: [] });
      },

      addObjectType: (objectType) => {
        const id = uuidv4();
        const newObjectType: ObjectType = {
          ...objectType,
          id,
          createdAt: now(),
          updatedAt: now(),
        };
        
        set((state) => {
          if (!state.ontology) return state;
          
          // Create node for canvas
          const newNode: OntologyNode = {
            id,
            type: 'objectType',
            position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
            data: newObjectType,
          };
          
          return {
            ontology: {
              ...state.ontology,
              objectTypes: [...state.ontology.objectTypes, newObjectType],
              updatedAt: now(),
            },
            nodes: [...state.nodes, newNode],
          };
        });
        
        return id;
      },

      updateObjectType: (id, updates) => {
        set((state) => {
          if (!state.ontology) return state;
          
          const updatedObjectTypes = state.ontology.objectTypes.map((ot) =>
            ot.id === id ? { ...ot, ...updates, updatedAt: now() } : ot
          );
          
          const updatedNodes = state.nodes.map((node) =>
            node.id === id && node.type === 'objectType'
              ? { ...node, data: { ...node.data, ...updates, updatedAt: now() } }
              : node
          );
          
          return {
            ontology: {
              ...state.ontology,
              objectTypes: updatedObjectTypes,
              updatedAt: now(),
            },
            nodes: updatedNodes,
          };
        });
      },

      deleteObjectType: (id) => {
        set((state) => {
          if (!state.ontology) return state;
          
          return {
            ontology: {
              ...state.ontology,
              objectTypes: state.ontology.objectTypes.filter((ot) => ot.id !== id),
              linkTypes: state.ontology.linkTypes.filter(
                (lt) => lt.sourceObjectTypeId !== id && lt.targetObjectTypeId !== id
              ),
              updatedAt: now(),
            },
            nodes: state.nodes.filter((node) => node.id !== id),
            edges: state.edges.filter((edge) => edge.source !== id && edge.target !== id),
            selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
          };
        });
      },

      addLinkType: (linkType) => {
        const id = uuidv4();
        const newLinkType: LinkType = {
          ...linkType,
          id,
          createdAt: now(),
          updatedAt: now(),
        };
        
        set((state) => {
          if (!state.ontology) return state;
          
          const newEdge: OntologyEdge = {
            id,
            source: linkType.sourceObjectTypeId,
            target: linkType.targetObjectTypeId,
            type: 'link',
            data: newLinkType,
            label: linkType.displayName,
          };
          
          return {
            ontology: {
              ...state.ontology,
              linkTypes: [...state.ontology.linkTypes, newLinkType],
              updatedAt: now(),
            },
            edges: [...state.edges, newEdge],
          };
        });
        
        return id;
      },

      updateLinkType: (id, updates) => {
        set((state) => {
          if (!state.ontology) return state;
          
          const updatedLinkTypes = state.ontology.linkTypes.map((lt) =>
            lt.id === id ? { ...lt, ...updates, updatedAt: now() } : lt
          );
          
          const updatedEdges = state.edges.map((edge) =>
            edge.id === id
              ? { 
                  ...edge, 
                  data: edge.data ? { ...edge.data, ...updates, updatedAt: now() } : undefined,
                  label: updates.displayName || edge.label,
                }
              : edge
          );
          
          return {
            ontology: {
              ...state.ontology,
              linkTypes: updatedLinkTypes,
              updatedAt: now(),
            },
            edges: updatedEdges,
          };
        });
      },

      deleteLinkType: (id) => {
        set((state) => {
          if (!state.ontology) return state;
          
          return {
            ontology: {
              ...state.ontology,
              linkTypes: state.ontology.linkTypes.filter((lt) => lt.id !== id),
              updatedAt: now(),
            },
            edges: state.edges.filter((edge) => edge.id !== id),
            selectedEdgeId: state.selectedEdgeId === id ? null : state.selectedEdgeId,
          };
        });
      },

      addInterface: (iface) => {
        const id = uuidv4();
        const newInterface: Interface = {
          ...iface,
          id,
          createdAt: now(),
          updatedAt: now(),
        };
        
        set((state) => {
          if (!state.ontology) return state;
          
          const newNode: OntologyNode = {
            id,
            type: 'interface',
            position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
            data: newInterface,
          };
          
          return {
            ontology: {
              ...state.ontology,
              interfaces: [...state.ontology.interfaces, newInterface],
              updatedAt: now(),
            },
            nodes: [...state.nodes, newNode],
          };
        });
        
        return id;
      },

      updateInterface: (id, updates) => {
        set((state) => {
          if (!state.ontology) return state;
          
          const updatedInterfaces = state.ontology.interfaces.map((i) =>
            i.id === id ? { ...i, ...updates, updatedAt: now() } : i
          );
          
          const updatedNodes = state.nodes.map((node) =>
            node.id === id && node.type === 'interface'
              ? { ...node, data: { ...node.data, ...updates, updatedAt: now() } }
              : node
          );
          
          return {
            ontology: {
              ...state.ontology,
              interfaces: updatedInterfaces,
              updatedAt: now(),
            },
            nodes: updatedNodes,
          };
        });
      },

      deleteInterface: (id) => {
        set((state) => {
          if (!state.ontology) return state;
          
          return {
            ontology: {
              ...state.ontology,
              interfaces: state.ontology.interfaces.filter((i) => i.id !== id),
              updatedAt: now(),
            },
            nodes: state.nodes.filter((node) => node.id !== id),
            edges: state.edges.filter((edge) => edge.source !== id && edge.target !== id),
            selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
          };
        });
      },

      addAction: (action) => {
        const id = uuidv4();
        const newAction: Action = {
          ...action,
          id,
          createdAt: now(),
          updatedAt: now(),
        };
        
        set((state) => {
          if (!state.ontology) return state;
          
          return {
            ontology: {
              ...state.ontology,
              actions: [...state.ontology.actions, newAction],
              updatedAt: now(),
            },
          };
        });
        
        return id;
      },

      updateAction: (id, updates) => {
        set((state) => {
          if (!state.ontology) return state;
          
          return {
            ontology: {
              ...state.ontology,
              actions: state.ontology.actions.map((a) =>
                a.id === id ? { ...a, ...updates, updatedAt: now() } : a
              ),
              updatedAt: now(),
            },
          };
        });
      },

      deleteAction: (id) => {
        set((state) => {
          if (!state.ontology) return state;
          
          return {
            ontology: {
              ...state.ontology,
              actions: state.ontology.actions.filter((a) => a.id !== id),
              updatedAt: now(),
            },
          };
        });
      },

      setNodes: (nodes) => set({ nodes }),
      
      setEdges: (edges) => set({ edges }),
      
      updateNodePosition: (id, position) => {
        set((state) => ({
          nodes: state.nodes.map((node) =>
            node.id === id ? { ...node, position } : node
          ),
        }));
      },

      setSelectedNode: (id) => set({ selectedNodeId: id, selectedEdgeId: null }),
      
      setSelectedEdge: (id) => set({ selectedEdgeId: id, selectedNodeId: null }),

      openPanel: (mode, type) => set({ isPanelOpen: true, panelMode: mode, panelType: type }),
      
      closePanel: () => set({ isPanelOpen: false, panelMode: null, panelType: null }),

      exportOntology: () => {
        const state = get();
        const exportData = {
          ontology: state.ontology,
          nodes: state.nodes,
          edges: state.edges,
        };
        return JSON.stringify(exportData, null, 2);
      },

      importOntology: (json) => {
        try {
          const data = JSON.parse(json);
          set({
            ontology: data.ontology,
            nodes: data.nodes || [],
            edges: data.edges || [],
            selectedNodeId: null,
            selectedEdgeId: null,
          });
        } catch (error) {
          console.error('Failed to import ontology:', error);
        }
      },

      reset: () => {
        set({
          ontology: demoOntology,
          nodes: demoNodes,
          edges: demoEdges,
          selectedNodeId: null,
          selectedEdgeId: null,
          isPanelOpen: false,
          panelMode: null,
          panelType: null,
        });
      },
    }),
    {
      name: 'ontology-storage',
      version: 2, // Increment this to reset storage and load demo data
      migrate: (persistedState: unknown, version: number) => {
        // If old version or no nodes, return demo data
        if (version < 2) {
          return {
            ontology: demoOntology,
            nodes: demoNodes,
            edges: demoEdges,
            selectedNodeId: null,
            selectedEdgeId: null,
            isPanelOpen: false,
            panelMode: null,
            panelType: null,
          };
        }
        return persistedState as OntologyState;
      },
    }
  )
);
