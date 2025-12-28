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
  selectedActionId: string | null;
  
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
  setSelectedAction: (id: string | null) => void;
  
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

// Demo Actions with Rules
const demoActions: Action[] = [
  {
    id: 'action-create-order',
    name: 'create_order',
    displayName: '创建订单',
    description: '为客户创建新订单，包含完整的业务流程',
    objectTypeId: CUSTOMER_ID,
    parameters: [
      { id: 'param-products', name: 'products', type: 'array', required: true, description: '订单商品列表' },
      { id: 'param-address', name: 'address', type: 'string', required: true, description: '收货地址' },
      { id: 'param-note', name: 'note', type: 'string', required: false, description: '订单备注' },
      { id: 'param-express', name: 'express_type', type: 'string', required: false, description: '快递类型' },
    ],
    rules: [
      {
        id: 'rule-validate-products',
        type: 'validation',
        name: '验证商品列表',
        description: '确保订单至少包含一件商品',
        enabled: true,
        order: 0,
        config: {
          type: 'validation',
          condition: 'params.products.length > 0',
          errorMessage: '订单必须至少包含一件商品',
        },
      },
      {
        id: 'rule-validate-address',
        type: 'validation',
        name: '验证收货地址',
        description: '确保收货地址不为空',
        enabled: true,
        order: 1,
        config: {
          type: 'validation',
          condition: 'params.address && params.address.length > 10',
          errorMessage: '请填写完整的收货地址',
        },
      },
      {
        id: 'rule-create-order',
        type: 'create_object',
        name: '创建订单对象',
        description: '创建新的订单记录',
        enabled: true,
        order: 2,
        config: {
          type: 'create_object',
          targetObjectTypeId: ORDER_ID,
          propertyMappings: [
            { targetProperty: 'shipping_address', sourceType: 'parameter', sourceValue: 'address' },
            { targetProperty: 'status', sourceType: 'constant', sourceValue: 'pending' },
            { targetProperty: 'order_date', sourceType: 'expression', sourceValue: 'now()' },
          ],
        },
      },
      {
        id: 'rule-link-order',
        type: 'create_link',
        name: '关联订单到客户',
        description: '建立客户与订单的关联关系',
        enabled: true,
        order: 3,
        config: {
          type: 'create_link',
          linkTypeId: 'link-customer-order',
          targetSource: 'created_object',
          targetValue: 'new_order',
        },
      },
      {
        id: 'rule-webhook-erp',
        type: 'webhook',
        name: '同步到ERP系统',
        description: '将订单信息推送到ERP系统',
        enabled: true,
        order: 4,
        config: {
          type: 'webhook',
          url: 'https://api.erp.example.com/orders',
          method: 'POST',
          bodyTemplate: '{"orderId": "{{new_order.id}}", "customer": "{{source.customer_id}}", "products": {{params.products}}}',
        },
      },
      {
        id: 'rule-notify-customer',
        type: 'notification',
        name: '通知客户',
        description: '发送订单创建成功通知',
        enabled: true,
        order: 5,
        config: {
          type: 'notification',
          channel: 'email',
          recipientSource: 'property',
          recipient: 'email',
          messageTemplate: '尊敬的{{source.name}}，您的订单已创建成功！订单号：{{new_order.order_id}}',
        },
      },
    ],
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'action-update-stock',
    name: 'update_stock',
    displayName: '更新库存',
    description: '更新产品库存数量，支持入库和出库',
    objectTypeId: PRODUCT_ID,
    parameters: [
      { id: 'param-quantity', name: 'quantity', type: 'number', required: true, description: '调整数量（正数入库，负数出库）' },
      { id: 'param-reason', name: 'reason', type: 'string', required: true, description: '调整原因' },
      { id: 'param-operator', name: 'operator_id', type: 'reference', required: false, description: '操作人ID' },
    ],
    rules: [
      {
        id: 'rule-validate-quantity',
        type: 'validation',
        name: '验证库存数量',
        description: '确保出库时库存充足',
        enabled: true,
        order: 0,
        config: {
          type: 'validation',
          condition: 'source.stock + params.quantity >= 0',
          errorMessage: '库存不足，无法完成出库操作',
        },
      },
      {
        id: 'rule-update-stock',
        type: 'update_property',
        name: '更新库存数量',
        description: '修改产品的库存属性',
        enabled: true,
        order: 1,
        config: {
          type: 'update_property',
          targetProperty: 'stock',
          valueSource: 'expression',
          value: 'source.stock + params.quantity',
        },
      },
      {
        id: 'rule-webhook-wms',
        type: 'webhook',
        name: '同步到仓储系统',
        description: '通知WMS系统库存变更',
        enabled: true,
        order: 2,
        config: {
          type: 'webhook',
          url: 'https://api.wms.example.com/inventory',
          method: 'PUT',
          bodyTemplate: '{"productId": "{{source.product_id}}", "newStock": {{source.stock + params.quantity}}, "reason": "{{params.reason}}"}',
        },
      },
    ],
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'action-cancel-order',
    name: 'cancel_order',
    displayName: '取消订单',
    description: '取消未发货的订单',
    objectTypeId: ORDER_ID,
    parameters: [
      { id: 'param-cancel-reason', name: 'cancel_reason', type: 'string', required: true, description: '取消原因' },
      { id: 'param-refund', name: 'need_refund', type: 'boolean', required: true, description: '是否需要退款' },
    ],
    rules: [
      {
        id: 'rule-validate-status',
        type: 'validation',
        name: '验证订单状态',
        description: '只能取消未发货的订单',
        enabled: true,
        order: 0,
        config: {
          type: 'validation',
          condition: 'source.status === "pending" || source.status === "confirmed"',
          errorMessage: '只能取消未发货的订单',
        },
      },
      {
        id: 'rule-update-status',
        type: 'update_property',
        name: '更新订单状态',
        description: '将订单状态改为已取消',
        enabled: true,
        order: 1,
        config: {
          type: 'update_property',
          targetProperty: 'status',
          valueSource: 'constant',
          value: 'cancelled',
        },
      },
      {
        id: 'rule-notify-cancel',
        type: 'notification',
        name: '通知取消',
        description: '发送订单取消通知',
        enabled: true,
        order: 2,
        config: {
          type: 'notification',
          channel: 'internal',
          recipientSource: 'constant',
          recipient: 'order_management_team',
          messageTemplate: '订单 {{source.order_id}} 已被取消，原因：{{params.cancel_reason}}',
        },
      },
    ],
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'action-assign-handler',
    name: 'assign_handler',
    displayName: '分配处理人',
    description: '为订单分配处理员工',
    objectTypeId: ORDER_ID,
    parameters: [
      { id: 'param-employee-id', name: 'employee_id', type: 'reference', required: true, description: '员工ID' },
      { id: 'param-priority', name: 'priority', type: 'string', required: false, description: '处理优先级' },
    ],
    rules: [
      {
        id: 'rule-create-handler-link',
        type: 'create_link',
        name: '建立处理人关联',
        description: '将员工与订单关联',
        enabled: true,
        order: 0,
        config: {
          type: 'create_link',
          linkTypeId: 'link-order-employee',
          targetSource: 'parameter',
          targetValue: 'employee_id',
        },
      },
      {
        id: 'rule-update-order-status',
        type: 'update_property',
        name: '更新订单状态',
        description: '将订单状态改为处理中',
        enabled: true,
        order: 1,
        config: {
          type: 'update_property',
          targetProperty: 'status',
          valueSource: 'constant',
          value: 'processing',
        },
      },
      {
        id: 'rule-notify-employee',
        type: 'notification',
        name: '通知员工',
        description: '通知被分配的员工',
        enabled: true,
        order: 2,
        config: {
          type: 'notification',
          channel: 'push',
          recipientSource: 'parameter',
          recipient: 'employee_id',
          messageTemplate: '您有新的订单需要处理：{{source.order_id}}',
        },
      },
    ],
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'action-update-vip',
    name: 'update_vip_status',
    displayName: '更新VIP状态',
    description: '更新客户的VIP会员状态',
    objectTypeId: CUSTOMER_ID,
    parameters: [
      { id: 'param-vip-status', name: 'is_vip', type: 'boolean', required: true, description: '是否为VIP' },
      { id: 'param-vip-level', name: 'vip_level', type: 'string', required: false, description: 'VIP等级' },
    ],
    rules: [
      {
        id: 'rule-update-vip',
        type: 'update_property',
        name: '更新VIP属性',
        description: '修改客户的VIP状态',
        enabled: true,
        order: 0,
        config: {
          type: 'update_property',
          targetProperty: 'is_vip',
          valueSource: 'parameter',
          value: 'is_vip',
        },
      },
      {
        id: 'rule-notify-vip',
        type: 'notification',
        name: '发送VIP欢迎通知',
        description: '向新VIP客户发送欢迎邮件',
        enabled: true,
        order: 1,
        config: {
          type: 'notification',
          channel: 'email',
          recipientSource: 'property',
          recipient: 'email',
          messageTemplate: '恭喜您成为我们的VIP会员！享受专属优惠和服务。',
        },
      },
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
      selectedActionId: null,
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
      
      setSelectedEdge: (id) => set({ selectedEdgeId: id, selectedNodeId: null, selectedActionId: null }),
      
      setSelectedAction: (id) => set({ selectedActionId: id, selectedNodeId: null, selectedEdgeId: null }),

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
            selectedActionId: null,
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
          selectedActionId: null,
          isPanelOpen: false,
          panelMode: null,
          panelType: null,
        });
      },
    }),
    {
      name: 'ontology-storage',
      version: 3, // Increment this to reset storage and load demo data
      migrate: (persistedState: unknown, version: number) => {
        // If old version or no nodes, return demo data
        if (version < 3) {
          return {
            ontology: demoOntology,
            nodes: demoNodes,
            edges: demoEdges,
            selectedNodeId: null,
            selectedEdgeId: null,
            selectedActionId: null,
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
