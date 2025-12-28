/**
 * 公司管理系统 - 本体模型
 * Company Management System Ontology Model
 * 
 * 布局设计:
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │  [顶部] 基础数据：部门、员工、币种、汇率     [接口] IAuditable, IApprovable │
 * ├──────────────────┬──────────────────┬──────────────────┬────────────────────┤
 * │  [左侧] 销售线    │  [中间] 产品/库存 │  [右侧] 采购线    │  [最右] 拍卖系统   │
 * │  客户 ← 联系人    │  产品 ← 分类      │  供应商 ← 联系人  │  委托人 → 合同     │
 * │  ↓               │  ↓               │  ↓                │  ↓                │
 * │  报价 → 订单      │  仓库 → 库存      │  询价 → 采购单    │  拍品 → 鉴定       │
 * │  ↓               │  ↓               │  ↓                │  ↓                │
 * │  发货             │  物流 → 运输      │  入库             │  拍卖会 → 场次     │
 * │  ↓               │  ↓               │  ↓                │  ↓                │
 * │  应收 → 收款      │  报关 / 发票      │  应付 → 付款      │  竞拍 → 成交       │
 * └──────────────────┴──────────────────┴──────────────────┴────────────────────┘
 * 
 * 模块划分:
 * === 企业管理模块 ===
 * 1. 基础数据 (部门、员工、币种)
 * 2. 客户管理 (客户、联系人)
 * 3. 供应商管理 (供应商、联系人)
 * 4. 产品管理 (产品、分类)
 * 5. 采购管理 (询价、采购单、入库)
 * 6. 销售管理 (报价、销售单、发货)
 * 7. 库存管理 (仓库、库存)
 * 8. 财务管理 (应收、应付、收付款)
 * 9. 物流管理 (物流公司、运输单)
 * 10. 外贸管理 (报关、汇率)
 * 
 * === 拍卖业务模块 ===
 * 11. 委托管理 (委托人、委托合同)
 * 12. 拍品管理 (拍卖品、分类、鉴定)
 * 13. 拍卖活动 (拍卖会、场次、标的)
 * 14. 竞拍管理 (竞拍人、出价、保证金)
 * 15. 成交结算 (成交记录、结算单、佣金)
 */

import type { Property, ObjectType, LinkType, Interface, Action, OntologyNode, OntologyEdge, Ontology } from '../types/ontology';

const now = () => new Date().toISOString();

// ============================================
// Object Type IDs
// ============================================
const IDS = {
  // 基础
  DEPARTMENT: 'erp-department',
  EMPLOYEE: 'erp-employee',
  CURRENCY: 'erp-currency',
  // 客户
  CUSTOMER: 'erp-customer',
  CUSTOMER_CONTACT: 'erp-customer-contact',
  // 供应商
  SUPPLIER: 'erp-supplier',
  SUPPLIER_CONTACT: 'erp-supplier-contact',
  // 产品
  PRODUCT: 'erp-product',
  PRODUCT_CATEGORY: 'erp-product-category',
  // 采购
  PURCHASE_INQUIRY: 'erp-purchase-inquiry',
  PURCHASE_ORDER: 'erp-purchase-order',
  PURCHASE_RECEIPT: 'erp-purchase-receipt',
  // 销售
  SALES_QUOTATION: 'erp-sales-quotation',
  SALES_ORDER: 'erp-sales-order',
  SALES_SHIPMENT: 'erp-sales-shipment',
  // 库存
  WAREHOUSE: 'erp-warehouse',
  INVENTORY: 'erp-inventory',
  // 财务
  RECEIVABLE: 'erp-receivable',
  PAYABLE: 'erp-payable',
  PAYMENT_RECEIPT: 'erp-payment-receipt',
  PAYMENT_VOUCHER: 'erp-payment-voucher',
  INVOICE: 'erp-invoice',
  // 物流
  LOGISTICS_COMPANY: 'erp-logistics-company',
  TRANSPORT_ORDER: 'erp-transport-order',
  // 外贸
  CUSTOMS_DECLARATION: 'erp-customs-declaration',
  EXCHANGE_RATE: 'erp-exchange-rate',
  
  // ========== 拍卖系统 ==========
  // 委托管理
  CONSIGNOR: 'auc-consignor',
  CONSIGNMENT_CONTRACT: 'auc-consignment-contract',
  // 拍品管理
  AUCTION_ITEM: 'auc-auction-item',
  AUCTION_CATEGORY: 'auc-auction-category',
  APPRAISAL: 'auc-appraisal',
  // 拍卖活动
  AUCTION_EVENT: 'auc-auction-event',
  AUCTION_SESSION: 'auc-auction-session',
  AUCTION_LOT: 'auc-auction-lot',
  // 竞拍管理
  BIDDER: 'auc-bidder',
  BID: 'auc-bid',
  DEPOSIT: 'auc-deposit',
  // 成交结算
  AUCTION_RESULT: 'auc-auction-result',
  SETTLEMENT: 'auc-settlement',
  COMMISSION: 'auc-commission',
  
  // 接口
  AUDITABLE: 'erp-auditable',
  APPROVABLE: 'erp-approvable',
};

// ============================================
// Properties Definitions
// ============================================

// 部门属性
const departmentProps: Property[] = [
  { id: 'dept-code', name: 'dept_code', displayName: '部门编码', type: 'string', required: true },
  { id: 'dept-name', name: 'name', displayName: '部门名称', type: 'string', required: true },
  { id: 'dept-manager', name: 'manager_id', displayName: '部门经理', type: 'reference', required: false },
  { id: 'dept-parent', name: 'parent_id', displayName: '上级部门', type: 'reference', required: false },
  { id: 'dept-status', name: 'status', displayName: '状态', type: 'string', required: true },
];

// 员工属性
const employeeProps: Property[] = [
  { id: 'emp-code', name: 'employee_code', displayName: '员工编号', type: 'string', required: true },
  { id: 'emp-name', name: 'name', displayName: '姓名', type: 'string', required: true },
  { id: 'emp-phone', name: 'phone', displayName: '手机号', type: 'string', required: true },
  { id: 'emp-email', name: 'email', displayName: '邮箱', type: 'string', required: true },
  { id: 'emp-position', name: 'position', displayName: '职位', type: 'string', required: true },
  { id: 'emp-hire-date', name: 'hire_date', displayName: '入职日期', type: 'date', required: true },
  { id: 'emp-status', name: 'status', displayName: '状态', type: 'string', required: true },
];

// 币种属性
const currencyProps: Property[] = [
  { id: 'cur-code', name: 'currency_code', displayName: '币种代码', type: 'string', required: true },
  { id: 'cur-name', name: 'name', displayName: '币种名称', type: 'string', required: true },
  { id: 'cur-symbol', name: 'symbol', displayName: '符号', type: 'string', required: true },
  { id: 'cur-rate', name: 'exchange_rate', displayName: '汇率', type: 'number', required: true },
];

// 客户属性
const customerProps: Property[] = [
  { id: 'cust-code', name: 'customer_code', displayName: '客户编码', type: 'string', required: true },
  { id: 'cust-name', name: 'company_name', displayName: '公司名称', type: 'string', required: true },
  { id: 'cust-short', name: 'short_name', displayName: '简称', type: 'string', required: false },
  { id: 'cust-country', name: 'country', displayName: '国家', type: 'string', required: true },
  { id: 'cust-city', name: 'city', displayName: '城市', type: 'string', required: false },
  { id: 'cust-address', name: 'address', displayName: '详细地址', type: 'string', required: false },
  { id: 'cust-type', name: 'customer_type', displayName: '客户类型', type: 'string', required: true },
  { id: 'cust-credit', name: 'credit_limit', displayName: '信用额度', type: 'number', required: false },
  { id: 'cust-payment-terms', name: 'payment_terms', displayName: '付款条款', type: 'string', required: false },
  { id: 'cust-trade-terms', name: 'trade_terms', displayName: '贸易条款', type: 'string', required: false },
  { id: 'cust-status', name: 'status', displayName: '状态', type: 'string', required: true },
];

// 客户联系人属性
const customerContactProps: Property[] = [
  { id: 'cc-name', name: 'name', displayName: '姓名', type: 'string', required: true },
  { id: 'cc-position', name: 'position', displayName: '职位', type: 'string', required: false },
  { id: 'cc-phone', name: 'phone', displayName: '电话', type: 'string', required: true },
  { id: 'cc-email', name: 'email', displayName: '邮箱', type: 'string', required: true },
  { id: 'cc-wechat', name: 'wechat', displayName: '微信', type: 'string', required: false },
  { id: 'cc-primary', name: 'is_primary', displayName: '主要联系人', type: 'boolean', required: true },
];

// 供应商属性
const supplierProps: Property[] = [
  { id: 'sup-code', name: 'supplier_code', displayName: '供应商编码', type: 'string', required: true },
  { id: 'sup-name', name: 'company_name', displayName: '公司名称', type: 'string', required: true },
  { id: 'sup-country', name: 'country', displayName: '国家', type: 'string', required: true },
  { id: 'sup-address', name: 'address', displayName: '地址', type: 'string', required: false },
  { id: 'sup-type', name: 'supplier_type', displayName: '供应商类型', type: 'string', required: true },
  { id: 'sup-rating', name: 'rating', displayName: '评级', type: 'string', required: false },
  { id: 'sup-payment-terms', name: 'payment_terms', displayName: '付款条款', type: 'string', required: false },
  { id: 'sup-lead-time', name: 'lead_time_days', displayName: '交货周期(天)', type: 'number', required: false },
  { id: 'sup-status', name: 'status', displayName: '状态', type: 'string', required: true },
];

// 产品属性
const productProps: Property[] = [
  { id: 'prod-code', name: 'product_code', displayName: '产品编码', type: 'string', required: true },
  { id: 'prod-name', name: 'name', displayName: '产品名称', type: 'string', required: true },
  { id: 'prod-name-en', name: 'name_en', displayName: '英文名称', type: 'string', required: false },
  { id: 'prod-spec', name: 'specification', displayName: '规格型号', type: 'string', required: false },
  { id: 'prod-unit', name: 'unit', displayName: '单位', type: 'string', required: true },
  { id: 'prod-hs-code', name: 'hs_code', displayName: 'HS编码', type: 'string', required: false },
  { id: 'prod-cost', name: 'cost_price', displayName: '成本价', type: 'number', required: true },
  { id: 'prod-sell', name: 'selling_price', displayName: '销售价', type: 'number', required: true },
  { id: 'prod-min-stock', name: 'min_stock', displayName: '最低库存', type: 'number', required: false },
  { id: 'prod-status', name: 'status', displayName: '状态', type: 'string', required: true },
];

// 产品分类属性
const productCategoryProps: Property[] = [
  { id: 'cat-code', name: 'category_code', displayName: '分类编码', type: 'string', required: true },
  { id: 'cat-name', name: 'name', displayName: '分类名称', type: 'string', required: true },
  { id: 'cat-parent', name: 'parent_id', displayName: '上级分类', type: 'reference', required: false },
  { id: 'cat-level', name: 'level', displayName: '层级', type: 'number', required: true },
];

// 采购询价单属性
const purchaseInquiryProps: Property[] = [
  { id: 'pi-no', name: 'inquiry_no', displayName: '询价单号', type: 'string', required: true },
  { id: 'pi-date', name: 'inquiry_date', displayName: '询价日期', type: 'date', required: true },
  { id: 'pi-deadline', name: 'deadline', displayName: '截止日期', type: 'date', required: false },
  { id: 'pi-items', name: 'items', displayName: '询价明细', type: 'array', required: true },
  { id: 'pi-remark', name: 'remark', displayName: '备注', type: 'string', required: false },
  { id: 'pi-status', name: 'status', displayName: '状态', type: 'string', required: true },
];

// 采购订单属性
const purchaseOrderProps: Property[] = [
  { id: 'po-no', name: 'po_no', displayName: '采购单号', type: 'string', required: true },
  { id: 'po-date', name: 'order_date', displayName: '订单日期', type: 'date', required: true },
  { id: 'po-delivery', name: 'delivery_date', displayName: '交货日期', type: 'date', required: true },
  { id: 'po-currency', name: 'currency', displayName: '币种', type: 'string', required: true },
  { id: 'po-amount', name: 'total_amount', displayName: '总金额', type: 'number', required: true },
  { id: 'po-items', name: 'items', displayName: '订单明细', type: 'array', required: true },
  { id: 'po-payment-terms', name: 'payment_terms', displayName: '付款条款', type: 'string', required: true },
  { id: 'po-status', name: 'status', displayName: '状态', type: 'string', required: true },
];

// 采购入库单属性
const purchaseReceiptProps: Property[] = [
  { id: 'pr-no', name: 'receipt_no', displayName: '入库单号', type: 'string', required: true },
  { id: 'pr-date', name: 'receipt_date', displayName: '入库日期', type: 'date', required: true },
  { id: 'pr-items', name: 'items', displayName: '入库明细', type: 'array', required: true },
  { id: 'pr-quality', name: 'quality_status', displayName: '质检状态', type: 'string', required: true },
  { id: 'pr-remark', name: 'remark', displayName: '备注', type: 'string', required: false },
  { id: 'pr-status', name: 'status', displayName: '状态', type: 'string', required: true },
];

// 销售报价单属性
const salesQuotationProps: Property[] = [
  { id: 'sq-no', name: 'quotation_no', displayName: '报价单号', type: 'string', required: true },
  { id: 'sq-date', name: 'quotation_date', displayName: '报价日期', type: 'date', required: true },
  { id: 'sq-valid', name: 'valid_until', displayName: '有效期至', type: 'date', required: true },
  { id: 'sq-currency', name: 'currency', displayName: '币种', type: 'string', required: true },
  { id: 'sq-amount', name: 'total_amount', displayName: '总金额', type: 'number', required: true },
  { id: 'sq-items', name: 'items', displayName: '报价明细', type: 'array', required: true },
  { id: 'sq-trade-terms', name: 'trade_terms', displayName: '贸易条款', type: 'string', required: true },
  { id: 'sq-status', name: 'status', displayName: '状态', type: 'string', required: true },
];

// 销售订单属性
const salesOrderProps: Property[] = [
  { id: 'so-no', name: 'so_no', displayName: '销售单号', type: 'string', required: true },
  { id: 'so-date', name: 'order_date', displayName: '订单日期', type: 'date', required: true },
  { id: 'so-delivery', name: 'delivery_date', displayName: '交货日期', type: 'date', required: true },
  { id: 'so-currency', name: 'currency', displayName: '币种', type: 'string', required: true },
  { id: 'so-amount', name: 'total_amount', displayName: '总金额', type: 'number', required: true },
  { id: 'so-items', name: 'items', displayName: '订单明细', type: 'array', required: true },
  { id: 'so-trade-terms', name: 'trade_terms', displayName: '贸易条款', type: 'string', required: true },
  { id: 'so-payment-terms', name: 'payment_terms', displayName: '付款条款', type: 'string', required: true },
  { id: 'so-ship-to', name: 'ship_to', displayName: '收货地址', type: 'string', required: true },
  { id: 'so-status', name: 'status', displayName: '状态', type: 'string', required: true },
];

// 销售发货单属性
const salesShipmentProps: Property[] = [
  { id: 'ss-no', name: 'shipment_no', displayName: '发货单号', type: 'string', required: true },
  { id: 'ss-date', name: 'shipment_date', displayName: '发货日期', type: 'date', required: true },
  { id: 'ss-items', name: 'items', displayName: '发货明细', type: 'array', required: true },
  { id: 'ss-tracking', name: 'tracking_no', displayName: '物流单号', type: 'string', required: false },
  { id: 'ss-status', name: 'status', displayName: '状态', type: 'string', required: true },
];

// 仓库属性
const warehouseProps: Property[] = [
  { id: 'wh-code', name: 'warehouse_code', displayName: '仓库编码', type: 'string', required: true },
  { id: 'wh-name', name: 'name', displayName: '仓库名称', type: 'string', required: true },
  { id: 'wh-address', name: 'address', displayName: '地址', type: 'string', required: true },
  { id: 'wh-type', name: 'warehouse_type', displayName: '仓库类型', type: 'string', required: true },
  { id: 'wh-status', name: 'status', displayName: '状态', type: 'string', required: true },
];

// 库存属性
const inventoryProps: Property[] = [
  { id: 'inv-qty', name: 'quantity', displayName: '库存数量', type: 'number', required: true },
  { id: 'inv-reserved', name: 'reserved_qty', displayName: '预留数量', type: 'number', required: false },
  { id: 'inv-available', name: 'available_qty', displayName: '可用数量', type: 'number', required: true },
  { id: 'inv-batch', name: 'batch_no', displayName: '批次号', type: 'string', required: false },
  { id: 'inv-location', name: 'location', displayName: '库位', type: 'string', required: false },
];

// 应收账款属性
const receivableProps: Property[] = [
  { id: 'ar-no', name: 'ar_no', displayName: '应收单号', type: 'string', required: true },
  { id: 'ar-amount', name: 'amount', displayName: '应收金额', type: 'number', required: true },
  { id: 'ar-currency', name: 'currency', displayName: '币种', type: 'string', required: true },
  { id: 'ar-due', name: 'due_date', displayName: '到期日', type: 'date', required: true },
  { id: 'ar-received', name: 'received_amount', displayName: '已收金额', type: 'number', required: true },
  { id: 'ar-status', name: 'status', displayName: '状态', type: 'string', required: true },
];

// 应付账款属性
const payableProps: Property[] = [
  { id: 'ap-no', name: 'ap_no', displayName: '应付单号', type: 'string', required: true },
  { id: 'ap-amount', name: 'amount', displayName: '应付金额', type: 'number', required: true },
  { id: 'ap-currency', name: 'currency', displayName: '币种', type: 'string', required: true },
  { id: 'ap-due', name: 'due_date', displayName: '到期日', type: 'date', required: true },
  { id: 'ap-paid', name: 'paid_amount', displayName: '已付金额', type: 'number', required: true },
  { id: 'ap-status', name: 'status', displayName: '状态', type: 'string', required: true },
];

// 收款单属性
const paymentReceiptProps: Property[] = [
  { id: 'rcpt-no', name: 'receipt_no', displayName: '收款单号', type: 'string', required: true },
  { id: 'rcpt-date', name: 'receipt_date', displayName: '收款日期', type: 'date', required: true },
  { id: 'rcpt-amount', name: 'amount', displayName: '收款金额', type: 'number', required: true },
  { id: 'rcpt-currency', name: 'currency', displayName: '币种', type: 'string', required: true },
  { id: 'rcpt-method', name: 'payment_method', displayName: '收款方式', type: 'string', required: true },
  { id: 'rcpt-bank', name: 'bank_account', displayName: '收款账户', type: 'string', required: false },
];

// 付款单属性
const paymentVoucherProps: Property[] = [
  { id: 'pv-no', name: 'voucher_no', displayName: '付款单号', type: 'string', required: true },
  { id: 'pv-date', name: 'payment_date', displayName: '付款日期', type: 'date', required: true },
  { id: 'pv-amount', name: 'amount', displayName: '付款金额', type: 'number', required: true },
  { id: 'pv-currency', name: 'currency', displayName: '币种', type: 'string', required: true },
  { id: 'pv-method', name: 'payment_method', displayName: '付款方式', type: 'string', required: true },
  { id: 'pv-bank', name: 'bank_account', displayName: '付款账户', type: 'string', required: false },
];

// 发票属性
const invoiceProps: Property[] = [
  { id: 'inv-no', name: 'invoice_no', displayName: '发票号', type: 'string', required: true },
  { id: 'inv-type', name: 'invoice_type', displayName: '发票类型', type: 'string', required: true },
  { id: 'inv-date', name: 'invoice_date', displayName: '开票日期', type: 'date', required: true },
  { id: 'inv-amount', name: 'amount', displayName: '金额', type: 'number', required: true },
  { id: 'inv-tax', name: 'tax_amount', displayName: '税额', type: 'number', required: true },
  { id: 'inv-total', name: 'total_amount', displayName: '价税合计', type: 'number', required: true },
  { id: 'inv-status', name: 'status', displayName: '状态', type: 'string', required: true },
];

// 物流公司属性
const logisticsCompanyProps: Property[] = [
  { id: 'lc-code', name: 'company_code', displayName: '公司编码', type: 'string', required: true },
  { id: 'lc-name', name: 'name', displayName: '公司名称', type: 'string', required: true },
  { id: 'lc-type', name: 'logistics_type', displayName: '物流类型', type: 'string', required: true },
  { id: 'lc-contact', name: 'contact', displayName: '联系人', type: 'string', required: false },
  { id: 'lc-phone', name: 'phone', displayName: '联系电话', type: 'string', required: false },
];

// 运输单属性
const transportOrderProps: Property[] = [
  { id: 'to-no', name: 'transport_no', displayName: '运输单号', type: 'string', required: true },
  { id: 'to-type', name: 'transport_type', displayName: '运输方式', type: 'string', required: true },
  { id: 'to-from', name: 'from_address', displayName: '发货地址', type: 'string', required: true },
  { id: 'to-to', name: 'to_address', displayName: '收货地址', type: 'string', required: true },
  { id: 'to-tracking', name: 'tracking_no', displayName: '跟踪单号', type: 'string', required: false },
  { id: 'to-cost', name: 'freight_cost', displayName: '运费', type: 'number', required: false },
  { id: 'to-status', name: 'status', displayName: '状态', type: 'string', required: true },
];

// 报关单属性
const customsDeclarationProps: Property[] = [
  { id: 'cd-no', name: 'declaration_no', displayName: '报关单号', type: 'string', required: true },
  { id: 'cd-type', name: 'declaration_type', displayName: '报关类型', type: 'string', required: true },
  { id: 'cd-port', name: 'customs_port', displayName: '报关口岸', type: 'string', required: true },
  { id: 'cd-date', name: 'declaration_date', displayName: '报关日期', type: 'date', required: true },
  { id: 'cd-items', name: 'items', displayName: '报关明细', type: 'array', required: true },
  { id: 'cd-total', name: 'total_value', displayName: '申报总值', type: 'number', required: true },
  { id: 'cd-currency', name: 'currency', displayName: '币种', type: 'string', required: true },
  { id: 'cd-status', name: 'status', displayName: '状态', type: 'string', required: true },
];

// 汇率属性
const exchangeRateProps: Property[] = [
  { id: 'er-from', name: 'from_currency', displayName: '源币种', type: 'string', required: true },
  { id: 'er-to', name: 'to_currency', displayName: '目标币种', type: 'string', required: true },
  { id: 'er-rate', name: 'rate', displayName: '汇率', type: 'number', required: true },
  { id: 'er-date', name: 'effective_date', displayName: '生效日期', type: 'date', required: true },
];

// 接口属性
const auditableProps: Property[] = [
  { id: 'aud-created', name: 'created_at', displayName: '创建时间', type: 'datetime', required: true },
  { id: 'aud-updated', name: 'updated_at', displayName: '更新时间', type: 'datetime', required: true },
  { id: 'aud-created-by', name: 'created_by', displayName: '创建人', type: 'reference', required: true },
  { id: 'aud-updated-by', name: 'updated_by', displayName: '更新人', type: 'reference', required: false },
];

const approvableProps: Property[] = [
  { id: 'appr-status', name: 'approval_status', displayName: '审批状态', type: 'string', required: true },
  { id: 'appr-by', name: 'approved_by', displayName: '审批人', type: 'reference', required: false },
  { id: 'appr-at', name: 'approved_at', displayName: '审批时间', type: 'datetime', required: false },
  { id: 'appr-remark', name: 'approval_remark', displayName: '审批备注', type: 'string', required: false },
];

// ============================================
// 拍卖系统 - Properties Definitions
// ============================================

// 委托人属性
const consignorProps: Property[] = [
  { id: 'csgn-code', name: 'consignor_code', displayName: '委托人编码', type: 'string', required: true },
  { id: 'csgn-name', name: 'name', displayName: '姓名/公司名', type: 'string', required: true },
  { id: 'csgn-type', name: 'consignor_type', displayName: '委托人类型', type: 'string', required: true }, // 个人/机构
  { id: 'csgn-id-type', name: 'id_type', displayName: '证件类型', type: 'string', required: true },
  { id: 'csgn-id-no', name: 'id_number', displayName: '证件号码', type: 'string', required: true },
  { id: 'csgn-phone', name: 'phone', displayName: '联系电话', type: 'string', required: true },
  { id: 'csgn-email', name: 'email', displayName: '邮箱', type: 'string', required: false },
  { id: 'csgn-address', name: 'address', displayName: '地址', type: 'string', required: false },
  { id: 'csgn-bank', name: 'bank_account', displayName: '银行账户', type: 'string', required: false },
  { id: 'csgn-status', name: 'status', displayName: '状态', type: 'string', required: true },
];

// 委托合同属性
const consignmentContractProps: Property[] = [
  { id: 'cc-no', name: 'contract_no', displayName: '合同编号', type: 'string', required: true },
  { id: 'cc-sign-date', name: 'sign_date', displayName: '签约日期', type: 'date', required: true },
  { id: 'cc-start', name: 'start_date', displayName: '委托开始日', type: 'date', required: true },
  { id: 'cc-end', name: 'end_date', displayName: '委托结束日', type: 'date', required: true },
  { id: 'cc-reserve', name: 'reserve_price', displayName: '保留价', type: 'number', required: false },
  { id: 'cc-commission-rate', name: 'commission_rate', displayName: '佣金比例(%)', type: 'number', required: true },
  { id: 'cc-insurance', name: 'insurance_rate', displayName: '保险费率(%)', type: 'number', required: false },
  { id: 'cc-terms', name: 'terms', displayName: '合同条款', type: 'string', required: false },
  { id: 'cc-status', name: 'status', displayName: '状态', type: 'string', required: true },
];

// 拍卖品属性
const auctionItemProps: Property[] = [
  { id: 'ai-code', name: 'item_code', displayName: '拍品编号', type: 'string', required: true },
  { id: 'ai-name', name: 'name', displayName: '拍品名称', type: 'string', required: true },
  { id: 'ai-desc', name: 'description', displayName: '拍品描述', type: 'string', required: true },
  { id: 'ai-origin', name: 'origin', displayName: '来源/产地', type: 'string', required: false },
  { id: 'ai-era', name: 'era', displayName: '年代', type: 'string', required: false },
  { id: 'ai-material', name: 'material', displayName: '材质', type: 'string', required: false },
  { id: 'ai-size', name: 'size', displayName: '尺寸', type: 'string', required: false },
  { id: 'ai-weight', name: 'weight', displayName: '重量', type: 'string', required: false },
  { id: 'ai-condition', name: 'condition', displayName: '品相', type: 'string', required: true },
  { id: 'ai-provenance', name: 'provenance', displayName: '流传记录', type: 'string', required: false },
  { id: 'ai-images', name: 'images', displayName: '图片', type: 'array', required: true },
  { id: 'ai-status', name: 'status', displayName: '状态', type: 'string', required: true },
];

// 拍卖品分类属性
const auctionCategoryProps: Property[] = [
  { id: 'ac-code', name: 'category_code', displayName: '分类编码', type: 'string', required: true },
  { id: 'ac-name', name: 'name', displayName: '分类名称', type: 'string', required: true },
  { id: 'ac-parent', name: 'parent_id', displayName: '上级分类', type: 'reference', required: false },
  { id: 'ac-desc', name: 'description', displayName: '分类描述', type: 'string', required: false },
];

// 鉴定记录属性
const appraisalProps: Property[] = [
  { id: 'apr-no', name: 'appraisal_no', displayName: '鉴定编号', type: 'string', required: true },
  { id: 'apr-date', name: 'appraisal_date', displayName: '鉴定日期', type: 'date', required: true },
  { id: 'apr-expert', name: 'expert_name', displayName: '鉴定专家', type: 'string', required: true },
  { id: 'apr-result', name: 'result', displayName: '鉴定结论', type: 'string', required: true },
  { id: 'apr-auth', name: 'authenticity', displayName: '真伪判定', type: 'string', required: true },
  { id: 'apr-low', name: 'estimate_low', displayName: '估价下限', type: 'number', required: true },
  { id: 'apr-high', name: 'estimate_high', displayName: '估价上限', type: 'number', required: true },
  { id: 'apr-remark', name: 'remark', displayName: '鉴定备注', type: 'string', required: false },
];

// 拍卖会属性
const auctionEventProps: Property[] = [
  { id: 'ae-code', name: 'event_code', displayName: '拍卖会编号', type: 'string', required: true },
  { id: 'ae-name', name: 'name', displayName: '拍卖会名称', type: 'string', required: true },
  { id: 'ae-type', name: 'auction_type', displayName: '拍卖类型', type: 'string', required: true }, // 现场/网络/同步
  { id: 'ae-start', name: 'start_date', displayName: '开始日期', type: 'date', required: true },
  { id: 'ae-end', name: 'end_date', displayName: '结束日期', type: 'date', required: true },
  { id: 'ae-venue', name: 'venue', displayName: '拍卖地点', type: 'string', required: false },
  { id: 'ae-preview-start', name: 'preview_start', displayName: '预展开始', type: 'datetime', required: false },
  { id: 'ae-preview-end', name: 'preview_end', displayName: '预展结束', type: 'datetime', required: false },
  { id: 'ae-desc', name: 'description', displayName: '活动说明', type: 'string', required: false },
  { id: 'ae-status', name: 'status', displayName: '状态', type: 'string', required: true },
];

// 拍卖场次属性
const auctionSessionProps: Property[] = [
  { id: 'as-code', name: 'session_code', displayName: '场次编号', type: 'string', required: true },
  { id: 'as-name', name: 'name', displayName: '场次名称', type: 'string', required: true },
  { id: 'as-seq', name: 'sequence', displayName: '场次顺序', type: 'number', required: true },
  { id: 'as-start', name: 'start_time', displayName: '开始时间', type: 'datetime', required: true },
  { id: 'as-auctioneer', name: 'auctioneer', displayName: '拍卖师', type: 'string', required: false },
  { id: 'as-status', name: 'status', displayName: '状态', type: 'string', required: true },
];

// 拍卖标的属性
const auctionLotProps: Property[] = [
  { id: 'al-no', name: 'lot_no', displayName: '标的号', type: 'string', required: true },
  { id: 'al-seq', name: 'sequence', displayName: '拍卖顺序', type: 'number', required: true },
  { id: 'al-start-price', name: 'starting_price', displayName: '起拍价', type: 'number', required: true },
  { id: 'al-reserve', name: 'reserve_price', displayName: '保留价', type: 'number', required: false },
  { id: 'al-increment', name: 'bid_increment', displayName: '加价幅度', type: 'number', required: true },
  { id: 'al-estimate-low', name: 'estimate_low', displayName: '估价下限', type: 'number', required: false },
  { id: 'al-estimate-high', name: 'estimate_high', displayName: '估价上限', type: 'number', required: false },
  { id: 'al-currency', name: 'currency', displayName: '币种', type: 'string', required: true },
  { id: 'al-status', name: 'status', displayName: '状态', type: 'string', required: true },
];

// 竞拍人属性
const bidderProps: Property[] = [
  { id: 'bid-code', name: 'bidder_code', displayName: '竞拍号', type: 'string', required: true },
  { id: 'bid-name', name: 'name', displayName: '姓名/公司名', type: 'string', required: true },
  { id: 'bid-type', name: 'bidder_type', displayName: '竞拍人类型', type: 'string', required: true },
  { id: 'bid-id-type', name: 'id_type', displayName: '证件类型', type: 'string', required: true },
  { id: 'bid-id-no', name: 'id_number', displayName: '证件号码', type: 'string', required: true },
  { id: 'bid-phone', name: 'phone', displayName: '联系电话', type: 'string', required: true },
  { id: 'bid-email', name: 'email', displayName: '邮箱', type: 'string', required: false },
  { id: 'bid-paddle', name: 'paddle_no', displayName: '号牌号', type: 'string', required: false },
  { id: 'bid-credit', name: 'credit_limit', displayName: '授信额度', type: 'number', required: false },
  { id: 'bid-status', name: 'status', displayName: '状态', type: 'string', required: true },
];

// 出价记录属性
const bidRecordProps: Property[] = [
  { id: 'br-no', name: 'bid_no', displayName: '出价编号', type: 'string', required: true },
  { id: 'br-time', name: 'bid_time', displayName: '出价时间', type: 'datetime', required: true },
  { id: 'br-amount', name: 'bid_amount', displayName: '出价金额', type: 'number', required: true },
  { id: 'br-type', name: 'bid_type', displayName: '出价方式', type: 'string', required: true }, // 现场/电话/网络/书面
  { id: 'br-valid', name: 'is_valid', displayName: '是否有效', type: 'boolean', required: true },
  { id: 'br-highest', name: 'is_highest', displayName: '是否最高', type: 'boolean', required: true },
];

// 保证金属性
const depositProps: Property[] = [
  { id: 'dep-no', name: 'deposit_no', displayName: '保证金编号', type: 'string', required: true },
  { id: 'dep-amount', name: 'amount', displayName: '保证金金额', type: 'number', required: true },
  { id: 'dep-currency', name: 'currency', displayName: '币种', type: 'string', required: true },
  { id: 'dep-pay-date', name: 'payment_date', displayName: '缴纳日期', type: 'date', required: true },
  { id: 'dep-method', name: 'payment_method', displayName: '支付方式', type: 'string', required: true },
  { id: 'dep-refund', name: 'refund_amount', displayName: '退还金额', type: 'number', required: false },
  { id: 'dep-refund-date', name: 'refund_date', displayName: '退还日期', type: 'date', required: false },
  { id: 'dep-status', name: 'status', displayName: '状态', type: 'string', required: true },
];

// 成交记录属性
const auctionResultProps: Property[] = [
  { id: 'ar-no', name: 'result_no', displayName: '成交编号', type: 'string', required: true },
  { id: 'ar-hammer', name: 'hammer_price', displayName: '落槌价', type: 'number', required: true },
  { id: 'ar-premium', name: 'buyer_premium', displayName: '买家佣金', type: 'number', required: true },
  { id: 'ar-total', name: 'total_price', displayName: '成交总价', type: 'number', required: true },
  { id: 'ar-currency', name: 'currency', displayName: '币种', type: 'string', required: true },
  { id: 'ar-time', name: 'hammer_time', displayName: '落槌时间', type: 'datetime', required: true },
  { id: 'ar-status', name: 'status', displayName: '状态', type: 'string', required: true }, // 成交/流拍/撤拍
];

// 结算单属性
const settlementProps: Property[] = [
  { id: 'stl-no', name: 'settlement_no', displayName: '结算单号', type: 'string', required: true },
  { id: 'stl-type', name: 'settlement_type', displayName: '结算类型', type: 'string', required: true }, // 买家结算/卖家结算
  { id: 'stl-amount', name: 'amount', displayName: '结算金额', type: 'number', required: true },
  { id: 'stl-currency', name: 'currency', displayName: '币种', type: 'string', required: true },
  { id: 'stl-due', name: 'due_date', displayName: '应付日期', type: 'date', required: true },
  { id: 'stl-paid', name: 'paid_amount', displayName: '已付金额', type: 'number', required: true },
  { id: 'stl-pay-date', name: 'payment_date', displayName: '付款日期', type: 'date', required: false },
  { id: 'stl-status', name: 'status', displayName: '状态', type: 'string', required: true },
];

// 佣金属性
const commissionProps: Property[] = [
  { id: 'cms-no', name: 'commission_no', displayName: '佣金编号', type: 'string', required: true },
  { id: 'cms-type', name: 'commission_type', displayName: '佣金类型', type: 'string', required: true }, // 买家佣金/卖家佣金
  { id: 'cms-rate', name: 'rate', displayName: '佣金比例(%)', type: 'number', required: true },
  { id: 'cms-base', name: 'base_amount', displayName: '计算基数', type: 'number', required: true },
  { id: 'cms-amount', name: 'amount', displayName: '佣金金额', type: 'number', required: true },
  { id: 'cms-currency', name: 'currency', displayName: '币种', type: 'string', required: true },
  { id: 'cms-status', name: 'status', displayName: '状态', type: 'string', required: true },
];

// ============================================
// Object Types
// ============================================
export const tradeErpObjectTypes: ObjectType[] = [
  // 基础数据
  {
    id: IDS.DEPARTMENT, name: 'department', displayName: '部门', description: '公司组织架构中的部门',
    icon: '🏢', color: '#6366f1', primaryKey: 'dept-code', properties: departmentProps,
    createdAt: now(), updatedAt: now(),
  },
  {
    id: IDS.EMPLOYEE, name: 'employee', displayName: '员工', description: '公司员工信息',
    icon: '👤', color: '#8b5cf6', primaryKey: 'emp-code', properties: employeeProps, interfaces: ['IAuditable'],
    createdAt: now(), updatedAt: now(),
  },
  {
    id: IDS.CURRENCY, name: 'currency', displayName: '币种', description: '系统支持的币种',
    icon: '💱', color: '#f59e0b', primaryKey: 'cur-code', properties: currencyProps,
    createdAt: now(), updatedAt: now(),
  },
  // 客户管理
  {
    id: IDS.CUSTOMER, name: 'customer', displayName: '客户', description: '国内外贸易客户',
    icon: '🤝', color: '#10b981', primaryKey: 'cust-code', properties: customerProps, interfaces: ['IAuditable'],
    createdAt: now(), updatedAt: now(),
  },
  {
    id: IDS.CUSTOMER_CONTACT, name: 'customer_contact', displayName: '客户联系人', description: '客户公司的联系人',
    icon: '📞', color: '#06b6d4', primaryKey: 'cc-name', properties: customerContactProps,
    createdAt: now(), updatedAt: now(),
  },
  // 供应商管理
  {
    id: IDS.SUPPLIER, name: 'supplier', displayName: '供应商', description: '产品供应商',
    icon: '🏭', color: '#ec4899', primaryKey: 'sup-code', properties: supplierProps, interfaces: ['IAuditable'],
    createdAt: now(), updatedAt: now(),
  },
  {
    id: IDS.SUPPLIER_CONTACT, name: 'supplier_contact', displayName: '供应商联系人', description: '供应商的联系人',
    icon: '📱', color: '#f472b6', primaryKey: 'cc-name', properties: customerContactProps,
    createdAt: now(), updatedAt: now(),
  },
  // 产品管理
  {
    id: IDS.PRODUCT, name: 'product', displayName: '产品', description: '贸易产品信息',
    icon: '📦', color: '#f97316', primaryKey: 'prod-code', properties: productProps, interfaces: ['IAuditable'],
    createdAt: now(), updatedAt: now(),
  },
  {
    id: IDS.PRODUCT_CATEGORY, name: 'product_category', displayName: '产品分类', description: '产品分类层级',
    icon: '📁', color: '#fb923c', primaryKey: 'cat-code', properties: productCategoryProps,
    createdAt: now(), updatedAt: now(),
  },
  // 采购管理
  {
    id: IDS.PURCHASE_INQUIRY, name: 'purchase_inquiry', displayName: '采购询价单', description: '向供应商询价',
    icon: '❓', color: '#a855f7', primaryKey: 'pi-no', properties: purchaseInquiryProps, interfaces: ['IAuditable', 'IApprovable'],
    createdAt: now(), updatedAt: now(),
  },
  {
    id: IDS.PURCHASE_ORDER, name: 'purchase_order', displayName: '采购订单', description: '向供应商采购的订单',
    icon: '📝', color: '#9333ea', primaryKey: 'po-no', properties: purchaseOrderProps, interfaces: ['IAuditable', 'IApprovable'],
    createdAt: now(), updatedAt: now(),
  },
  {
    id: IDS.PURCHASE_RECEIPT, name: 'purchase_receipt', displayName: '采购入库单', description: '采购商品的入库记录',
    icon: '📥', color: '#7c3aed', primaryKey: 'pr-no', properties: purchaseReceiptProps, interfaces: ['IAuditable'],
    createdAt: now(), updatedAt: now(),
  },
  // 销售管理
  {
    id: IDS.SALES_QUOTATION, name: 'sales_quotation', displayName: '销售报价单', description: '向客户报价',
    icon: '💰', color: '#22c55e', primaryKey: 'sq-no', properties: salesQuotationProps, interfaces: ['IAuditable', 'IApprovable'],
    createdAt: now(), updatedAt: now(),
  },
  {
    id: IDS.SALES_ORDER, name: 'sales_order', displayName: '销售订单', description: '客户的销售订单',
    icon: '📋', color: '#16a34a', primaryKey: 'so-no', properties: salesOrderProps, interfaces: ['IAuditable', 'IApprovable'],
    createdAt: now(), updatedAt: now(),
  },
  {
    id: IDS.SALES_SHIPMENT, name: 'sales_shipment', displayName: '销售发货单', description: '销售商品的发货记录',
    icon: '📤', color: '#15803d', primaryKey: 'ss-no', properties: salesShipmentProps, interfaces: ['IAuditable'],
    createdAt: now(), updatedAt: now(),
  },
  // 库存管理
  {
    id: IDS.WAREHOUSE, name: 'warehouse', displayName: '仓库', description: '库存存放仓库',
    icon: '🏪', color: '#0ea5e9', primaryKey: 'wh-code', properties: warehouseProps,
    createdAt: now(), updatedAt: now(),
  },
  {
    id: IDS.INVENTORY, name: 'inventory', displayName: '库存', description: '产品库存记录',
    icon: '📊', color: '#0284c7', primaryKey: 'inv-qty', properties: inventoryProps,
    createdAt: now(), updatedAt: now(),
  },
  // 财务管理
  {
    id: IDS.RECEIVABLE, name: 'account_receivable', displayName: '应收账款', description: '客户应收款项',
    icon: '💵', color: '#eab308', primaryKey: 'ar-no', properties: receivableProps, interfaces: ['IAuditable'],
    createdAt: now(), updatedAt: now(),
  },
  {
    id: IDS.PAYABLE, name: 'account_payable', displayName: '应付账款', description: '供应商应付款项',
    icon: '💸', color: '#ca8a04', primaryKey: 'ap-no', properties: payableProps, interfaces: ['IAuditable'],
    createdAt: now(), updatedAt: now(),
  },
  {
    id: IDS.PAYMENT_RECEIPT, name: 'payment_receipt', displayName: '收款单', description: '客户收款记录',
    icon: '🧾', color: '#a3e635', primaryKey: 'rcpt-no', properties: paymentReceiptProps, interfaces: ['IAuditable', 'IApprovable'],
    createdAt: now(), updatedAt: now(),
  },
  {
    id: IDS.PAYMENT_VOUCHER, name: 'payment_voucher', displayName: '付款单', description: '供应商付款记录',
    icon: '💳', color: '#84cc16', primaryKey: 'pv-no', properties: paymentVoucherProps, interfaces: ['IAuditable', 'IApprovable'],
    createdAt: now(), updatedAt: now(),
  },
  {
    id: IDS.INVOICE, name: 'invoice', displayName: '发票', description: '增值税发票',
    icon: '🧾', color: '#65a30d', primaryKey: 'inv-no', properties: invoiceProps, interfaces: ['IAuditable'],
    createdAt: now(), updatedAt: now(),
  },
  // 物流管理
  {
    id: IDS.LOGISTICS_COMPANY, name: 'logistics_company', displayName: '物流公司', description: '合作物流公司',
    icon: '🚚', color: '#64748b', primaryKey: 'lc-code', properties: logisticsCompanyProps,
    createdAt: now(), updatedAt: now(),
  },
  {
    id: IDS.TRANSPORT_ORDER, name: 'transport_order', displayName: '运输单', description: '货物运输订单',
    icon: '🚢', color: '#475569', primaryKey: 'to-no', properties: transportOrderProps, interfaces: ['IAuditable'],
    createdAt: now(), updatedAt: now(),
  },
  // 外贸管理
  {
    id: IDS.CUSTOMS_DECLARATION, name: 'customs_declaration', displayName: '报关单', description: '进出口报关单据',
    icon: '🛃', color: '#ef4444', primaryKey: 'cd-no', properties: customsDeclarationProps, interfaces: ['IAuditable', 'IApprovable'],
    createdAt: now(), updatedAt: now(),
  },
  {
    id: IDS.EXCHANGE_RATE, name: 'exchange_rate', displayName: '汇率', description: '货币汇率记录',
    icon: '📈', color: '#dc2626', primaryKey: 'er-from', properties: exchangeRateProps,
    createdAt: now(), updatedAt: now(),
  },
  
  // ========== 拍卖系统 Object Types ==========
  // 委托管理
  {
    id: IDS.CONSIGNOR, name: 'consignor', displayName: '委托人', description: '拍品委托方',
    icon: '🎭', color: '#7c3aed', primaryKey: 'csgn-code', properties: consignorProps, interfaces: ['IAuditable'],
    createdAt: now(), updatedAt: now(),
  },
  {
    id: IDS.CONSIGNMENT_CONTRACT, name: 'consignment_contract', displayName: '委托合同', description: '拍品委托合同',
    icon: '📜', color: '#8b5cf6', primaryKey: 'cc-no', properties: consignmentContractProps, interfaces: ['IAuditable', 'IApprovable'],
    createdAt: now(), updatedAt: now(),
  },
  // 拍品管理
  {
    id: IDS.AUCTION_ITEM, name: 'auction_item', displayName: '拍卖品', description: '待拍卖的物品',
    icon: '🏺', color: '#c026d3', primaryKey: 'ai-code', properties: auctionItemProps, interfaces: ['IAuditable'],
    createdAt: now(), updatedAt: now(),
  },
  {
    id: IDS.AUCTION_CATEGORY, name: 'auction_category', displayName: '拍品分类', description: '拍卖品分类',
    icon: '🏷️', color: '#d946ef', primaryKey: 'ac-code', properties: auctionCategoryProps,
    createdAt: now(), updatedAt: now(),
  },
  {
    id: IDS.APPRAISAL, name: 'appraisal', displayName: '鉴定记录', description: '拍品鉴定估价',
    icon: '🔍', color: '#a855f7', primaryKey: 'apr-no', properties: appraisalProps, interfaces: ['IAuditable'],
    createdAt: now(), updatedAt: now(),
  },
  // 拍卖活动
  {
    id: IDS.AUCTION_EVENT, name: 'auction_event', displayName: '拍卖会', description: '拍卖活动/专场',
    icon: '🎪', color: '#0891b2', primaryKey: 'ae-code', properties: auctionEventProps, interfaces: ['IAuditable', 'IApprovable'],
    createdAt: now(), updatedAt: now(),
  },
  {
    id: IDS.AUCTION_SESSION, name: 'auction_session', displayName: '拍卖场次', description: '拍卖会具体场次',
    icon: '🎬', color: '#0e7490', primaryKey: 'as-code', properties: auctionSessionProps, interfaces: ['IAuditable'],
    createdAt: now(), updatedAt: now(),
  },
  {
    id: IDS.AUCTION_LOT, name: 'auction_lot', displayName: '拍卖标的', description: '上拍的具体标的',
    icon: '🔨', color: '#06b6d4', primaryKey: 'al-no', properties: auctionLotProps, interfaces: ['IAuditable'],
    createdAt: now(), updatedAt: now(),
  },
  // 竞拍管理
  {
    id: IDS.BIDDER, name: 'bidder', displayName: '竞拍人', description: '参与竞拍的买家',
    icon: '🙋', color: '#059669', primaryKey: 'bid-code', properties: bidderProps, interfaces: ['IAuditable'],
    createdAt: now(), updatedAt: now(),
  },
  {
    id: IDS.BID, name: 'bid', displayName: '出价记录', description: '竞价出价记录',
    icon: '💹', color: '#10b981', primaryKey: 'br-no', properties: bidRecordProps,
    createdAt: now(), updatedAt: now(),
  },
  {
    id: IDS.DEPOSIT, name: 'deposit', displayName: '保证金', description: '竞拍保证金',
    icon: '💎', color: '#34d399', primaryKey: 'dep-no', properties: depositProps, interfaces: ['IAuditable'],
    createdAt: now(), updatedAt: now(),
  },
  // 成交结算
  {
    id: IDS.AUCTION_RESULT, name: 'auction_result', displayName: '成交记录', description: '拍卖成交结果',
    icon: '🏆', color: '#f59e0b', primaryKey: 'ar-no', properties: auctionResultProps, interfaces: ['IAuditable'],
    createdAt: now(), updatedAt: now(),
  },
  {
    id: IDS.SETTLEMENT, name: 'settlement', displayName: '结算单', description: '拍卖结算单',
    icon: '📑', color: '#d97706', primaryKey: 'stl-no', properties: settlementProps, interfaces: ['IAuditable', 'IApprovable'],
    createdAt: now(), updatedAt: now(),
  },
  {
    id: IDS.COMMISSION, name: 'commission', displayName: '佣金', description: '拍卖佣金记录',
    icon: '💰', color: '#ea580c', primaryKey: 'cms-no', properties: commissionProps, interfaces: ['IAuditable'],
    createdAt: now(), updatedAt: now(),
  },
];

// ============================================
// Interfaces
// ============================================
export const tradeErpInterfaces: Interface[] = [
  {
    id: IDS.AUDITABLE, name: 'IAuditable', displayName: '可审计', description: '具有创建/更新追踪的对象',
    properties: auditableProps, createdAt: now(), updatedAt: now(),
  },
  {
    id: IDS.APPROVABLE, name: 'IApprovable', displayName: '可审批', description: '需要审批流程的单据',
    properties: approvableProps, createdAt: now(), updatedAt: now(),
  },
];

// ============================================
// Link Types
// ============================================
export const tradeErpLinkTypes: LinkType[] = [
  // 组织架构
  { id: 'link-emp-dept', name: 'employee_department', displayName: '员工部门', sourceObjectTypeId: IDS.EMPLOYEE, targetObjectTypeId: IDS.DEPARTMENT, cardinality: 'many-to-one', sourceRole: '所属部门', targetRole: '部门员工', createdAt: now(), updatedAt: now() },
  // 客户关系
  { id: 'link-cust-contact', name: 'customer_contacts', displayName: '客户联系人', sourceObjectTypeId: IDS.CUSTOMER, targetObjectTypeId: IDS.CUSTOMER_CONTACT, cardinality: 'one-to-many', sourceRole: '所属客户', targetRole: '联系人', createdAt: now(), updatedAt: now() },
  { id: 'link-cust-emp', name: 'customer_salesperson', displayName: '客户业务员', sourceObjectTypeId: IDS.CUSTOMER, targetObjectTypeId: IDS.EMPLOYEE, cardinality: 'many-to-one', sourceRole: '负责业务员', targetRole: '负责客户', createdAt: now(), updatedAt: now() },
  // 供应商关系
  { id: 'link-sup-contact', name: 'supplier_contacts', displayName: '供应商联系人', sourceObjectTypeId: IDS.SUPPLIER, targetObjectTypeId: IDS.SUPPLIER_CONTACT, cardinality: 'one-to-many', sourceRole: '所属供应商', targetRole: '联系人', createdAt: now(), updatedAt: now() },
  { id: 'link-sup-emp', name: 'supplier_buyer', displayName: '供应商采购员', sourceObjectTypeId: IDS.SUPPLIER, targetObjectTypeId: IDS.EMPLOYEE, cardinality: 'many-to-one', sourceRole: '负责采购员', targetRole: '负责供应商', createdAt: now(), updatedAt: now() },
  // 产品关系
  { id: 'link-prod-cat', name: 'product_category', displayName: '产品分类', sourceObjectTypeId: IDS.PRODUCT, targetObjectTypeId: IDS.PRODUCT_CATEGORY, cardinality: 'many-to-one', sourceRole: '所属分类', targetRole: '分类产品', createdAt: now(), updatedAt: now() },
  { id: 'link-prod-sup', name: 'product_supplier', displayName: '产品供应商', sourceObjectTypeId: IDS.PRODUCT, targetObjectTypeId: IDS.SUPPLIER, cardinality: 'many-to-many', sourceRole: '供应商', targetRole: '供应产品', createdAt: now(), updatedAt: now() },
  // 采购流程
  { id: 'link-pi-sup', name: 'inquiry_supplier', displayName: '询价供应商', sourceObjectTypeId: IDS.PURCHASE_INQUIRY, targetObjectTypeId: IDS.SUPPLIER, cardinality: 'many-to-one', sourceRole: '询价供应商', targetRole: '收到询价', createdAt: now(), updatedAt: now() },
  { id: 'link-po-sup', name: 'order_supplier', displayName: '采购单供应商', sourceObjectTypeId: IDS.PURCHASE_ORDER, targetObjectTypeId: IDS.SUPPLIER, cardinality: 'many-to-one', sourceRole: '采购供应商', targetRole: '采购订单', createdAt: now(), updatedAt: now() },
  { id: 'link-po-pi', name: 'order_inquiry', displayName: '采购单询价', sourceObjectTypeId: IDS.PURCHASE_ORDER, targetObjectTypeId: IDS.PURCHASE_INQUIRY, cardinality: 'many-to-one', sourceRole: '来源询价', targetRole: '生成订单', createdAt: now(), updatedAt: now() },
  { id: 'link-pr-po', name: 'receipt_order', displayName: '入库单采购单', sourceObjectTypeId: IDS.PURCHASE_RECEIPT, targetObjectTypeId: IDS.PURCHASE_ORDER, cardinality: 'many-to-one', sourceRole: '来源采购单', targetRole: '入库记录', createdAt: now(), updatedAt: now() },
  { id: 'link-pr-wh', name: 'receipt_warehouse', displayName: '入库仓库', sourceObjectTypeId: IDS.PURCHASE_RECEIPT, targetObjectTypeId: IDS.WAREHOUSE, cardinality: 'many-to-one', sourceRole: '入库仓库', targetRole: '入库记录', createdAt: now(), updatedAt: now() },
  // 销售流程
  { id: 'link-sq-cust', name: 'quotation_customer', displayName: '报价客户', sourceObjectTypeId: IDS.SALES_QUOTATION, targetObjectTypeId: IDS.CUSTOMER, cardinality: 'many-to-one', sourceRole: '报价客户', targetRole: '收到报价', createdAt: now(), updatedAt: now() },
  { id: 'link-so-cust', name: 'order_customer', displayName: '订单客户', sourceObjectTypeId: IDS.SALES_ORDER, targetObjectTypeId: IDS.CUSTOMER, cardinality: 'many-to-one', sourceRole: '订单客户', targetRole: '销售订单', createdAt: now(), updatedAt: now() },
  { id: 'link-so-sq', name: 'order_quotation', displayName: '订单报价', sourceObjectTypeId: IDS.SALES_ORDER, targetObjectTypeId: IDS.SALES_QUOTATION, cardinality: 'many-to-one', sourceRole: '来源报价', targetRole: '生成订单', createdAt: now(), updatedAt: now() },
  { id: 'link-ss-so', name: 'shipment_order', displayName: '发货订单', sourceObjectTypeId: IDS.SALES_SHIPMENT, targetObjectTypeId: IDS.SALES_ORDER, cardinality: 'many-to-one', sourceRole: '来源订单', targetRole: '发货记录', createdAt: now(), updatedAt: now() },
  { id: 'link-ss-wh', name: 'shipment_warehouse', displayName: '发货仓库', sourceObjectTypeId: IDS.SALES_SHIPMENT, targetObjectTypeId: IDS.WAREHOUSE, cardinality: 'many-to-one', sourceRole: '发货仓库', targetRole: '发货记录', createdAt: now(), updatedAt: now() },
  // 库存关系
  { id: 'link-inv-prod', name: 'inventory_product', displayName: '库存产品', sourceObjectTypeId: IDS.INVENTORY, targetObjectTypeId: IDS.PRODUCT, cardinality: 'many-to-one', sourceRole: '库存产品', targetRole: '库存记录', createdAt: now(), updatedAt: now() },
  { id: 'link-inv-wh', name: 'inventory_warehouse', displayName: '库存仓库', sourceObjectTypeId: IDS.INVENTORY, targetObjectTypeId: IDS.WAREHOUSE, cardinality: 'many-to-one', sourceRole: '存放仓库', targetRole: '库存记录', createdAt: now(), updatedAt: now() },
  // 财务关系
  { id: 'link-ar-so', name: 'receivable_order', displayName: '应收销售单', sourceObjectTypeId: IDS.RECEIVABLE, targetObjectTypeId: IDS.SALES_ORDER, cardinality: 'many-to-one', sourceRole: '来源订单', targetRole: '应收记录', createdAt: now(), updatedAt: now() },
  { id: 'link-ar-cust', name: 'receivable_customer', displayName: '应收客户', sourceObjectTypeId: IDS.RECEIVABLE, targetObjectTypeId: IDS.CUSTOMER, cardinality: 'many-to-one', sourceRole: '应收客户', targetRole: '应收账款', createdAt: now(), updatedAt: now() },
  { id: 'link-ap-po', name: 'payable_order', displayName: '应付采购单', sourceObjectTypeId: IDS.PAYABLE, targetObjectTypeId: IDS.PURCHASE_ORDER, cardinality: 'many-to-one', sourceRole: '来源订单', targetRole: '应付记录', createdAt: now(), updatedAt: now() },
  { id: 'link-ap-sup', name: 'payable_supplier', displayName: '应付供应商', sourceObjectTypeId: IDS.PAYABLE, targetObjectTypeId: IDS.SUPPLIER, cardinality: 'many-to-one', sourceRole: '应付供应商', targetRole: '应付账款', createdAt: now(), updatedAt: now() },
  { id: 'link-rcpt-ar', name: 'receipt_receivable', displayName: '收款应收', sourceObjectTypeId: IDS.PAYMENT_RECEIPT, targetObjectTypeId: IDS.RECEIVABLE, cardinality: 'many-to-one', sourceRole: '冲销应收', targetRole: '收款记录', createdAt: now(), updatedAt: now() },
  { id: 'link-pv-ap', name: 'payment_payable', displayName: '付款应付', sourceObjectTypeId: IDS.PAYMENT_VOUCHER, targetObjectTypeId: IDS.PAYABLE, cardinality: 'many-to-one', sourceRole: '冲销应付', targetRole: '付款记录', createdAt: now(), updatedAt: now() },
  // 物流关系
  { id: 'link-to-lc', name: 'transport_logistics', displayName: '运输物流公司', sourceObjectTypeId: IDS.TRANSPORT_ORDER, targetObjectTypeId: IDS.LOGISTICS_COMPANY, cardinality: 'many-to-one', sourceRole: '承运公司', targetRole: '运输订单', createdAt: now(), updatedAt: now() },
  { id: 'link-to-ss', name: 'transport_shipment', displayName: '运输发货单', sourceObjectTypeId: IDS.TRANSPORT_ORDER, targetObjectTypeId: IDS.SALES_SHIPMENT, cardinality: 'many-to-one', sourceRole: '发货单', targetRole: '运输记录', createdAt: now(), updatedAt: now() },
  // 报关关系
  { id: 'link-cd-so', name: 'customs_sales', displayName: '报关销售单', sourceObjectTypeId: IDS.CUSTOMS_DECLARATION, targetObjectTypeId: IDS.SALES_ORDER, cardinality: 'many-to-one', sourceRole: '来源订单', targetRole: '报关记录', createdAt: now(), updatedAt: now() },
  { id: 'link-cd-to', name: 'customs_transport', displayName: '报关运输单', sourceObjectTypeId: IDS.CUSTOMS_DECLARATION, targetObjectTypeId: IDS.TRANSPORT_ORDER, cardinality: 'many-to-one', sourceRole: '关联运输', targetRole: '报关记录', createdAt: now(), updatedAt: now() },
  
  // ========== 拍卖系统 Link Types ==========
  // 委托关系
  { id: 'link-contract-consignor', name: 'contract_consignor', displayName: '合同委托人', sourceObjectTypeId: IDS.CONSIGNMENT_CONTRACT, targetObjectTypeId: IDS.CONSIGNOR, cardinality: 'many-to-one', sourceRole: '委托人', targetRole: '委托合同', createdAt: now(), updatedAt: now() },
  { id: 'link-item-contract', name: 'item_contract', displayName: '拍品合同', sourceObjectTypeId: IDS.AUCTION_ITEM, targetObjectTypeId: IDS.CONSIGNMENT_CONTRACT, cardinality: 'many-to-one', sourceRole: '委托合同', targetRole: '委托拍品', createdAt: now(), updatedAt: now() },
  // 拍品关系
  { id: 'link-item-category', name: 'item_category', displayName: '拍品分类', sourceObjectTypeId: IDS.AUCTION_ITEM, targetObjectTypeId: IDS.AUCTION_CATEGORY, cardinality: 'many-to-one', sourceRole: '所属分类', targetRole: '分类拍品', createdAt: now(), updatedAt: now() },
  { id: 'link-appraisal-item', name: 'appraisal_item', displayName: '鉴定拍品', sourceObjectTypeId: IDS.APPRAISAL, targetObjectTypeId: IDS.AUCTION_ITEM, cardinality: 'many-to-one', sourceRole: '鉴定拍品', targetRole: '鉴定记录', createdAt: now(), updatedAt: now() },
  // 拍卖活动关系
  { id: 'link-session-event', name: 'session_event', displayName: '场次拍卖会', sourceObjectTypeId: IDS.AUCTION_SESSION, targetObjectTypeId: IDS.AUCTION_EVENT, cardinality: 'many-to-one', sourceRole: '所属拍卖会', targetRole: '拍卖场次', createdAt: now(), updatedAt: now() },
  { id: 'link-lot-session', name: 'lot_session', displayName: '标的场次', sourceObjectTypeId: IDS.AUCTION_LOT, targetObjectTypeId: IDS.AUCTION_SESSION, cardinality: 'many-to-one', sourceRole: '所属场次', targetRole: '场次标的', createdAt: now(), updatedAt: now() },
  { id: 'link-lot-item', name: 'lot_item', displayName: '标的拍品', sourceObjectTypeId: IDS.AUCTION_LOT, targetObjectTypeId: IDS.AUCTION_ITEM, cardinality: 'many-to-one', sourceRole: '拍卖拍品', targetRole: '上拍记录', createdAt: now(), updatedAt: now() },
  // 竞拍关系
  { id: 'link-deposit-bidder', name: 'deposit_bidder', displayName: '保证金竞拍人', sourceObjectTypeId: IDS.DEPOSIT, targetObjectTypeId: IDS.BIDDER, cardinality: 'many-to-one', sourceRole: '缴纳人', targetRole: '保证金', createdAt: now(), updatedAt: now() },
  { id: 'link-deposit-event', name: 'deposit_event', displayName: '保证金拍卖会', sourceObjectTypeId: IDS.DEPOSIT, targetObjectTypeId: IDS.AUCTION_EVENT, cardinality: 'many-to-one', sourceRole: '参拍活动', targetRole: '保证金', createdAt: now(), updatedAt: now() },
  { id: 'link-bid-lot', name: 'bid_lot', displayName: '出价标的', sourceObjectTypeId: IDS.BID, targetObjectTypeId: IDS.AUCTION_LOT, cardinality: 'many-to-one', sourceRole: '竞拍标的', targetRole: '出价记录', createdAt: now(), updatedAt: now() },
  { id: 'link-bid-bidder', name: 'bid_bidder', displayName: '出价人', sourceObjectTypeId: IDS.BID, targetObjectTypeId: IDS.BIDDER, cardinality: 'many-to-one', sourceRole: '出价人', targetRole: '出价记录', createdAt: now(), updatedAt: now() },
  // 成交结算关系
  { id: 'link-result-lot', name: 'result_lot', displayName: '成交标的', sourceObjectTypeId: IDS.AUCTION_RESULT, targetObjectTypeId: IDS.AUCTION_LOT, cardinality: 'one-to-one', sourceRole: '成交标的', targetRole: '成交记录', createdAt: now(), updatedAt: now() },
  { id: 'link-result-bidder', name: 'result_bidder', displayName: '成交买家', sourceObjectTypeId: IDS.AUCTION_RESULT, targetObjectTypeId: IDS.BIDDER, cardinality: 'many-to-one', sourceRole: '买受人', targetRole: '成交记录', createdAt: now(), updatedAt: now() },
  { id: 'link-settlement-result', name: 'settlement_result', displayName: '结算成交', sourceObjectTypeId: IDS.SETTLEMENT, targetObjectTypeId: IDS.AUCTION_RESULT, cardinality: 'many-to-one', sourceRole: '成交记录', targetRole: '结算单', createdAt: now(), updatedAt: now() },
  { id: 'link-settlement-bidder', name: 'settlement_bidder', displayName: '结算买家', sourceObjectTypeId: IDS.SETTLEMENT, targetObjectTypeId: IDS.BIDDER, cardinality: 'many-to-one', sourceRole: '结算方', targetRole: '结算单', createdAt: now(), updatedAt: now() },
  { id: 'link-settlement-consignor', name: 'settlement_consignor', displayName: '结算委托人', sourceObjectTypeId: IDS.SETTLEMENT, targetObjectTypeId: IDS.CONSIGNOR, cardinality: 'many-to-one', sourceRole: '结算方', targetRole: '结算单', createdAt: now(), updatedAt: now() },
  { id: 'link-commission-result', name: 'commission_result', displayName: '佣金成交', sourceObjectTypeId: IDS.COMMISSION, targetObjectTypeId: IDS.AUCTION_RESULT, cardinality: 'many-to-one', sourceRole: '关联成交', targetRole: '佣金记录', createdAt: now(), updatedAt: now() },
];

// ============================================
// Actions
// ============================================
export const tradeErpActions: Action[] = [
  // 客户动作
  {
    id: 'action-create-customer', name: 'create_customer', displayName: '新建客户', description: '创建新客户并分配业务员',
    objectTypeId: IDS.EMPLOYEE, parameters: [
      { id: 'p-cust-name', name: 'company_name', type: 'string', required: true, description: '公司名称' },
      { id: 'p-cust-country', name: 'country', type: 'string', required: true, description: '国家' },
      { id: 'p-cust-type', name: 'customer_type', type: 'string', required: true, description: '客户类型' },
    ],
    rules: [
      { id: 'r-cc-1', type: 'validation', name: '验证公司名称', enabled: true, order: 0, config: { type: 'validation', condition: 'params.company_name.length >= 2', errorMessage: '公司名称至少2个字符' } },
      { id: 'r-cc-2', type: 'create_object', name: '创建客户', enabled: true, order: 1, config: { type: 'create_object', targetObjectTypeId: IDS.CUSTOMER, propertyMappings: [{ targetProperty: 'company_name', sourceType: 'parameter', sourceValue: 'company_name' }, { targetProperty: 'country', sourceType: 'parameter', sourceValue: 'country' }, { targetProperty: 'status', sourceType: 'constant', sourceValue: 'active' }] } },
      { id: 'r-cc-3', type: 'create_link', name: '分配业务员', enabled: true, order: 2, config: { type: 'create_link', linkTypeId: 'link-cust-emp', targetSource: 'source', targetValue: '' } },
    ],
    createdAt: now(), updatedAt: now(),
  },
  // 采购动作
  {
    id: 'action-create-po', name: 'create_purchase_order', displayName: '创建采购订单', description: '根据询价单创建采购订单',
    objectTypeId: IDS.PURCHASE_INQUIRY, parameters: [
      { id: 'p-po-delivery', name: 'delivery_date', type: 'date', required: true, description: '交货日期' },
      { id: 'p-po-terms', name: 'payment_terms', type: 'string', required: true, description: '付款条款' },
    ],
    rules: [
      { id: 'r-cpo-1', type: 'validation', name: '验证询价状态', enabled: true, order: 0, config: { type: 'validation', condition: 'source.status === "confirmed"', errorMessage: '只能从已确认的询价单创建采购订单' } },
      { id: 'r-cpo-2', type: 'create_object', name: '创建采购订单', enabled: true, order: 1, config: { type: 'create_object', targetObjectTypeId: IDS.PURCHASE_ORDER, propertyMappings: [{ targetProperty: 'delivery_date', sourceType: 'parameter', sourceValue: 'delivery_date' }, { targetProperty: 'payment_terms', sourceType: 'parameter', sourceValue: 'payment_terms' }, { targetProperty: 'status', sourceType: 'constant', sourceValue: 'pending' }] } },
      { id: 'r-cpo-3', type: 'update_property', name: '更新询价状态', enabled: true, order: 2, config: { type: 'update_property', targetProperty: 'status', valueSource: 'constant', value: 'converted' } },
    ],
    createdAt: now(), updatedAt: now(),
  },
  // 销售动作
  {
    id: 'action-create-so', name: 'create_sales_order', displayName: '创建销售订单', description: '将报价单转为销售订单',
    objectTypeId: IDS.SALES_QUOTATION, parameters: [
      { id: 'p-so-delivery', name: 'delivery_date', type: 'date', required: true, description: '交货日期' },
      { id: 'p-so-ship-to', name: 'ship_to', type: 'string', required: true, description: '收货地址' },
    ],
    rules: [
      { id: 'r-cso-1', type: 'validation', name: '验证报价有效期', enabled: true, order: 0, config: { type: 'validation', condition: 'new Date(source.valid_until) >= new Date()', errorMessage: '报价单已过期' } },
      { id: 'r-cso-2', type: 'create_object', name: '创建销售订单', enabled: true, order: 1, config: { type: 'create_object', targetObjectTypeId: IDS.SALES_ORDER, propertyMappings: [{ targetProperty: 'delivery_date', sourceType: 'parameter', sourceValue: 'delivery_date' }, { targetProperty: 'ship_to', sourceType: 'parameter', sourceValue: 'ship_to' }, { targetProperty: 'status', sourceType: 'constant', sourceValue: 'pending' }] } },
      { id: 'r-cso-3', type: 'update_property', name: '更新报价状态', enabled: true, order: 2, config: { type: 'update_property', targetProperty: 'status', valueSource: 'constant', value: 'converted' } },
      { id: 'r-cso-4', type: 'notification', name: '通知仓库', enabled: true, order: 3, config: { type: 'notification', channel: 'internal', recipientSource: 'constant', recipient: 'warehouse_team', messageTemplate: '新销售订单待备货：{{new_order.so_no}}' } },
    ],
    createdAt: now(), updatedAt: now(),
  },
  // 发货动作
  {
    id: 'action-create-shipment', name: 'create_shipment', displayName: '创建发货单', description: '为销售订单创建发货单',
    objectTypeId: IDS.SALES_ORDER, parameters: [
      { id: 'p-ship-wh', name: 'warehouse_id', type: 'reference', required: true, description: '发货仓库' },
      { id: 'p-ship-items', name: 'items', type: 'array', required: true, description: '发货明细' },
    ],
    rules: [
      { id: 'r-cs-1', type: 'validation', name: '验证订单状态', enabled: true, order: 0, config: { type: 'validation', condition: 'source.status === "confirmed"', errorMessage: '只能对已确认的订单发货' } },
      { id: 'r-cs-2', type: 'create_object', name: '创建发货单', enabled: true, order: 1, config: { type: 'create_object', targetObjectTypeId: IDS.SALES_SHIPMENT, propertyMappings: [{ targetProperty: 'items', sourceType: 'parameter', sourceValue: 'items' }, { targetProperty: 'status', sourceType: 'constant', sourceValue: 'pending' }] } },
      { id: 'r-cs-3', type: 'webhook', name: '扣减库存', enabled: true, order: 2, config: { type: 'webhook', url: '/api/inventory/deduct', method: 'POST', bodyTemplate: '{"warehouse_id": "{{params.warehouse_id}}", "items": {{params.items}}}' } },
    ],
    createdAt: now(), updatedAt: now(),
  },
  // 财务动作
  {
    id: 'action-create-ar', name: 'create_receivable', displayName: '生成应收账款', description: '根据销售订单生成应收账款',
    objectTypeId: IDS.SALES_ORDER, parameters: [],
    rules: [
      { id: 'r-ar-1', type: 'validation', name: '验证订单已发货', enabled: true, order: 0, config: { type: 'validation', condition: 'source.status === "shipped"', errorMessage: '订单必须已发货才能生成应收' } },
      { id: 'r-ar-2', type: 'create_object', name: '创建应收账款', enabled: true, order: 1, config: { type: 'create_object', targetObjectTypeId: IDS.RECEIVABLE, propertyMappings: [{ targetProperty: 'amount', sourceType: 'property', sourceValue: 'total_amount' }, { targetProperty: 'currency', sourceType: 'property', sourceValue: 'currency' }, { targetProperty: 'received_amount', sourceType: 'constant', sourceValue: '0' }, { targetProperty: 'status', sourceType: 'constant', sourceValue: 'pending' }] } },
      { id: 'r-ar-3', type: 'create_link', name: '关联订单', enabled: true, order: 2, config: { type: 'create_link', linkTypeId: 'link-ar-so', targetSource: 'source', targetValue: '' } },
    ],
    createdAt: now(), updatedAt: now(),
  },
  // 审批动作
  {
    id: 'action-approve', name: 'approve_document', displayName: '审批通过', description: '审批单据',
    objectTypeId: IDS.PURCHASE_ORDER, parameters: [
      { id: 'p-appr-remark', name: 'remark', type: 'string', required: false, description: '审批备注' },
    ],
    rules: [
      { id: 'r-appr-1', type: 'validation', name: '验证待审批状态', enabled: true, order: 0, config: { type: 'validation', condition: 'source.status === "pending_approval"', errorMessage: '当前状态不可审批' } },
      { id: 'r-appr-2', type: 'update_property', name: '更新审批状态', enabled: true, order: 1, config: { type: 'update_property', targetProperty: 'approval_status', valueSource: 'constant', value: 'approved' } },
      { id: 'r-appr-3', type: 'update_property', name: '更新单据状态', enabled: true, order: 2, config: { type: 'update_property', targetProperty: 'status', valueSource: 'constant', value: 'confirmed' } },
      { id: 'r-appr-4', type: 'notification', name: '通知创建人', enabled: true, order: 3, config: { type: 'notification', channel: 'internal', recipientSource: 'property', recipient: 'created_by', messageTemplate: '您的单据 {{source.po_no}} 已审批通过' } },
    ],
    createdAt: now(), updatedAt: now(),
  },
  
  // ========== 拍卖系统 Actions ==========
  // 委托征集
  {
    id: 'action-create-consignment', name: 'create_consignment', displayName: '征集拍品', description: '创建委托合同并登记拍品',
    objectTypeId: IDS.CONSIGNOR, parameters: [
      { id: 'p-item-name', name: 'item_name', type: 'string', required: true, description: '拍品名称' },
      { id: 'p-item-desc', name: 'description', type: 'string', required: true, description: '拍品描述' },
      { id: 'p-reserve', name: 'reserve_price', type: 'number', required: false, description: '保留价' },
      { id: 'p-commission', name: 'commission_rate', type: 'number', required: true, description: '佣金比例' },
    ],
    rules: [
      { id: 'r-csg-1', type: 'validation', name: '验证委托人状态', enabled: true, order: 0, config: { type: 'validation', condition: 'source.status === "active"', errorMessage: '委托人状态无效' } },
      { id: 'r-csg-2', type: 'create_object', name: '创建委托合同', enabled: true, order: 1, config: { type: 'create_object', targetObjectTypeId: IDS.CONSIGNMENT_CONTRACT, propertyMappings: [{ targetProperty: 'reserve_price', sourceType: 'parameter', sourceValue: 'reserve_price' }, { targetProperty: 'commission_rate', sourceType: 'parameter', sourceValue: 'commission_rate' }, { targetProperty: 'status', sourceType: 'constant', sourceValue: 'draft' }] } },
      { id: 'r-csg-3', type: 'create_object', name: '创建拍品', enabled: true, order: 2, config: { type: 'create_object', targetObjectTypeId: IDS.AUCTION_ITEM, propertyMappings: [{ targetProperty: 'name', sourceType: 'parameter', sourceValue: 'item_name' }, { targetProperty: 'description', sourceType: 'parameter', sourceValue: 'description' }, { targetProperty: 'status', sourceType: 'constant', sourceValue: 'pending' }] } },
    ],
    createdAt: now(), updatedAt: now(),
  },
  // 拍品鉴定
  {
    id: 'action-appraise-item', name: 'appraise_item', displayName: '鉴定估价', description: '对拍品进行鉴定估价',
    objectTypeId: IDS.AUCTION_ITEM, parameters: [
      { id: 'p-expert', name: 'expert_name', type: 'string', required: true, description: '鉴定专家' },
      { id: 'p-auth', name: 'authenticity', type: 'string', required: true, description: '真伪判定' },
      { id: 'p-low', name: 'estimate_low', type: 'number', required: true, description: '估价下限' },
      { id: 'p-high', name: 'estimate_high', type: 'number', required: true, description: '估价上限' },
    ],
    rules: [
      { id: 'r-apr-1', type: 'create_object', name: '创建鉴定记录', enabled: true, order: 0, config: { type: 'create_object', targetObjectTypeId: IDS.APPRAISAL, propertyMappings: [{ targetProperty: 'expert_name', sourceType: 'parameter', sourceValue: 'expert_name' }, { targetProperty: 'authenticity', sourceType: 'parameter', sourceValue: 'authenticity' }, { targetProperty: 'estimate_low', sourceType: 'parameter', sourceValue: 'estimate_low' }, { targetProperty: 'estimate_high', sourceType: 'parameter', sourceValue: 'estimate_high' }] } },
      { id: 'r-apr-2', type: 'update_property', name: '更新拍品状态', enabled: true, order: 1, config: { type: 'update_property', targetProperty: 'status', valueSource: 'constant', value: 'appraised' } },
    ],
    createdAt: now(), updatedAt: now(),
  },
  // 上拍
  {
    id: 'action-create-lot', name: 'create_lot', displayName: '上拍', description: '将拍品安排到拍卖场次',
    objectTypeId: IDS.AUCTION_ITEM, parameters: [
      { id: 'p-session', name: 'session_id', type: 'reference', required: true, description: '拍卖场次' },
      { id: 'p-start-price', name: 'starting_price', type: 'number', required: true, description: '起拍价' },
      { id: 'p-increment', name: 'bid_increment', type: 'number', required: true, description: '加价幅度' },
    ],
    rules: [
      { id: 'r-lot-1', type: 'validation', name: '验证拍品已鉴定', enabled: true, order: 0, config: { type: 'validation', condition: 'source.status === "appraised"', errorMessage: '拍品必须先完成鉴定' } },
      { id: 'r-lot-2', type: 'create_object', name: '创建拍卖标的', enabled: true, order: 1, config: { type: 'create_object', targetObjectTypeId: IDS.AUCTION_LOT, propertyMappings: [{ targetProperty: 'starting_price', sourceType: 'parameter', sourceValue: 'starting_price' }, { targetProperty: 'bid_increment', sourceType: 'parameter', sourceValue: 'bid_increment' }, { targetProperty: 'status', sourceType: 'constant', sourceValue: 'pending' }] } },
      { id: 'r-lot-3', type: 'update_property', name: '更新拍品状态', enabled: true, order: 2, config: { type: 'update_property', targetProperty: 'status', valueSource: 'constant', value: 'listed' } },
    ],
    createdAt: now(), updatedAt: now(),
  },
  // 竞拍人登记
  {
    id: 'action-register-bidder', name: 'register_bidder', displayName: '竞拍登记', description: '竞拍人缴纳保证金参与拍卖',
    objectTypeId: IDS.BIDDER, parameters: [
      { id: 'p-event', name: 'event_id', type: 'reference', required: true, description: '参与的拍卖会' },
      { id: 'p-deposit', name: 'deposit_amount', type: 'number', required: true, description: '保证金金额' },
    ],
    rules: [
      { id: 'r-reg-1', type: 'validation', name: '验证竞拍人状态', enabled: true, order: 0, config: { type: 'validation', condition: 'source.status === "active"', errorMessage: '竞拍人状态无效' } },
      { id: 'r-reg-2', type: 'create_object', name: '创建保证金记录', enabled: true, order: 1, config: { type: 'create_object', targetObjectTypeId: IDS.DEPOSIT, propertyMappings: [{ targetProperty: 'amount', sourceType: 'parameter', sourceValue: 'deposit_amount' }, { targetProperty: 'status', sourceType: 'constant', sourceValue: 'paid' }] } },
      { id: 'r-reg-3', type: 'notification', name: '发送号牌通知', enabled: true, order: 2, config: { type: 'notification', channel: 'sms', recipientSource: 'property', recipient: 'phone', messageTemplate: '您已成功登记参拍，号牌号：{{source.paddle_no}}' } },
    ],
    createdAt: now(), updatedAt: now(),
  },
  // 出价
  {
    id: 'action-place-bid', name: 'place_bid', displayName: '出价', description: '竞拍人出价竞拍',
    objectTypeId: IDS.AUCTION_LOT, parameters: [
      { id: 'p-bidder', name: 'bidder_id', type: 'reference', required: true, description: '竞拍人' },
      { id: 'p-amount', name: 'bid_amount', type: 'number', required: true, description: '出价金额' },
      { id: 'p-type', name: 'bid_type', type: 'string', required: true, description: '出价方式' },
    ],
    rules: [
      { id: 'r-bid-1', type: 'validation', name: '验证出价金额', enabled: true, order: 0, config: { type: 'validation', condition: 'params.bid_amount >= source.starting_price', errorMessage: '出价不得低于起拍价' } },
      { id: 'r-bid-2', type: 'create_object', name: '创建出价记录', enabled: true, order: 1, config: { type: 'create_object', targetObjectTypeId: IDS.BID, propertyMappings: [{ targetProperty: 'bid_amount', sourceType: 'parameter', sourceValue: 'bid_amount' }, { targetProperty: 'bid_type', sourceType: 'parameter', sourceValue: 'bid_type' }, { targetProperty: 'is_valid', sourceType: 'constant', sourceValue: 'true' }, { targetProperty: 'is_highest', sourceType: 'constant', sourceValue: 'true' }] } },
      { id: 'r-bid-3', type: 'webhook', name: '实时推送最高价', enabled: true, order: 2, config: { type: 'webhook', url: '/api/auction/broadcast', method: 'POST', bodyTemplate: '{"lot_id": "{{source.id}}", "highest_bid": {{params.bid_amount}}}' } },
    ],
    createdAt: now(), updatedAt: now(),
  },
  // 落槌成交
  {
    id: 'action-hammer-down', name: 'hammer_down', displayName: '落槌成交', description: '标的成交落槌',
    objectTypeId: IDS.AUCTION_LOT, parameters: [
      { id: 'p-hammer', name: 'hammer_price', type: 'number', required: true, description: '落槌价' },
      { id: 'p-winner', name: 'winner_id', type: 'reference', required: true, description: '买受人' },
    ],
    rules: [
      { id: 'r-hm-1', type: 'validation', name: '验证标的状态', enabled: true, order: 0, config: { type: 'validation', condition: 'source.status === "bidding"', errorMessage: '标的不在竞拍中' } },
      { id: 'r-hm-2', type: 'create_object', name: '创建成交记录', enabled: true, order: 1, config: { type: 'create_object', targetObjectTypeId: IDS.AUCTION_RESULT, propertyMappings: [{ targetProperty: 'hammer_price', sourceType: 'parameter', sourceValue: 'hammer_price' }, { targetProperty: 'status', sourceType: 'constant', sourceValue: 'sold' }] } },
      { id: 'r-hm-3', type: 'update_property', name: '更新标的状态', enabled: true, order: 2, config: { type: 'update_property', targetProperty: 'status', valueSource: 'constant', value: 'sold' } },
      { id: 'r-hm-4', type: 'notification', name: '通知买家', enabled: true, order: 3, config: { type: 'notification', channel: 'email', recipientSource: 'parameter', recipient: 'winner_id.email', messageTemplate: '恭喜您成功竞得拍品！落槌价：{{params.hammer_price}}' } },
    ],
    createdAt: now(), updatedAt: now(),
  },
  // 生成结算单
  {
    id: 'action-create-settlement', name: 'create_settlement', displayName: '生成结算单', description: '根据成交记录生成买家结算单',
    objectTypeId: IDS.AUCTION_RESULT, parameters: [
      { id: 'p-premium-rate', name: 'premium_rate', type: 'number', required: true, description: '买家佣金比例' },
    ],
    rules: [
      { id: 'r-stl-1', type: 'validation', name: '验证成交状态', enabled: true, order: 0, config: { type: 'validation', condition: 'source.status === "sold"', errorMessage: '非成交状态无法结算' } },
      { id: 'r-stl-2', type: 'create_object', name: '创建买家结算单', enabled: true, order: 1, config: { type: 'create_object', targetObjectTypeId: IDS.SETTLEMENT, propertyMappings: [{ targetProperty: 'settlement_type', sourceType: 'constant', sourceValue: 'buyer' }, { targetProperty: 'status', sourceType: 'constant', sourceValue: 'pending' }] } },
      { id: 'r-stl-3', type: 'create_object', name: '创建佣金记录', enabled: true, order: 2, config: { type: 'create_object', targetObjectTypeId: IDS.COMMISSION, propertyMappings: [{ targetProperty: 'commission_type', sourceType: 'constant', sourceValue: 'buyer' }, { targetProperty: 'rate', sourceType: 'parameter', sourceValue: 'premium_rate' }, { targetProperty: 'status', sourceType: 'constant', sourceValue: 'pending' }] } },
      { id: 'r-stl-4', type: 'update_property', name: '更新成交状态', enabled: true, order: 3, config: { type: 'update_property', targetProperty: 'status', valueSource: 'constant', value: 'settling' } },
    ],
    createdAt: now(), updatedAt: now(),
  },
];

// ============================================
// Nodes Layout
// ============================================
export const tradeErpNodes: OntologyNode[] = [
  // ===============================================
  // 顶部区域 (y: 0) - 接口定义
  // ===============================================
  { id: IDS.AUDITABLE, type: 'interface', position: { x: 800, y: 0 }, data: tradeErpInterfaces[0] },
  { id: IDS.APPROVABLE, type: 'interface', position: { x: 1100, y: 0 }, data: tradeErpInterfaces[1] },

  // ===============================================
  // 第一行 (y: 200) - 基础数据 + 主体
  // ===============================================
  { id: IDS.DEPARTMENT, type: 'objectType', position: { x: 0, y: 200 }, data: tradeErpObjectTypes[0] },
  { id: IDS.EMPLOYEE, type: 'objectType', position: { x: 300, y: 200 }, data: tradeErpObjectTypes[1] },
  { id: IDS.CUSTOMER, type: 'objectType', position: { x: 600, y: 200 }, data: tradeErpObjectTypes[3] },
  { id: IDS.CUSTOMER_CONTACT, type: 'objectType', position: { x: 900, y: 200 }, data: tradeErpObjectTypes[4] },
  { id: IDS.SUPPLIER, type: 'objectType', position: { x: 1200, y: 200 }, data: tradeErpObjectTypes[5] },
  { id: IDS.SUPPLIER_CONTACT, type: 'objectType', position: { x: 1500, y: 200 }, data: tradeErpObjectTypes[6] },

  // ===============================================
  // 第二行 (y: 400) - 产品 & 询价/报价
  // ===============================================
  { id: IDS.PRODUCT_CATEGORY, type: 'objectType', position: { x: 0, y: 400 }, data: tradeErpObjectTypes[8] },
  { id: IDS.PRODUCT, type: 'objectType', position: { x: 300, y: 400 }, data: tradeErpObjectTypes[7] },
  { id: IDS.SALES_QUOTATION, type: 'objectType', position: { x: 600, y: 400 }, data: tradeErpObjectTypes[12] },
  { id: IDS.CURRENCY, type: 'objectType', position: { x: 900, y: 400 }, data: tradeErpObjectTypes[2] },
  { id: IDS.PURCHASE_INQUIRY, type: 'objectType', position: { x: 1200, y: 400 }, data: tradeErpObjectTypes[9] },
  { id: IDS.EXCHANGE_RATE, type: 'objectType', position: { x: 1500, y: 400 }, data: tradeErpObjectTypes[25] },

  // ===============================================
  // 第三行 (y: 600) - 订单
  // ===============================================
  { id: IDS.WAREHOUSE, type: 'objectType', position: { x: 0, y: 600 }, data: tradeErpObjectTypes[15] },
  { id: IDS.INVENTORY, type: 'objectType', position: { x: 300, y: 600 }, data: tradeErpObjectTypes[16] },
  { id: IDS.SALES_ORDER, type: 'objectType', position: { x: 600, y: 600 }, data: tradeErpObjectTypes[13] },
  { id: IDS.INVOICE, type: 'objectType', position: { x: 900, y: 600 }, data: tradeErpObjectTypes[21] },
  { id: IDS.PURCHASE_ORDER, type: 'objectType', position: { x: 1200, y: 600 }, data: tradeErpObjectTypes[10] },

  // ===============================================
  // 第四行 (y: 800) - 发货/入库
  // ===============================================
  { id: IDS.LOGISTICS_COMPANY, type: 'objectType', position: { x: 0, y: 800 }, data: tradeErpObjectTypes[22] },
  { id: IDS.TRANSPORT_ORDER, type: 'objectType', position: { x: 300, y: 800 }, data: tradeErpObjectTypes[23] },
  { id: IDS.SALES_SHIPMENT, type: 'objectType', position: { x: 600, y: 800 }, data: tradeErpObjectTypes[14] },
  { id: IDS.CUSTOMS_DECLARATION, type: 'objectType', position: { x: 900, y: 800 }, data: tradeErpObjectTypes[24] },
  { id: IDS.PURCHASE_RECEIPT, type: 'objectType', position: { x: 1200, y: 800 }, data: tradeErpObjectTypes[11] },

  // ===============================================
  // 第五行 (y: 1000) - 财务
  // ===============================================
  { id: IDS.RECEIVABLE, type: 'objectType', position: { x: 300, y: 1000 }, data: tradeErpObjectTypes[17] },
  { id: IDS.PAYMENT_RECEIPT, type: 'objectType', position: { x: 600, y: 1000 }, data: tradeErpObjectTypes[19] },
  { id: IDS.PAYABLE, type: 'objectType', position: { x: 900, y: 1000 }, data: tradeErpObjectTypes[18] },
  { id: IDS.PAYMENT_VOUCHER, type: 'objectType', position: { x: 1200, y: 1000 }, data: tradeErpObjectTypes[20] },

  // ===============================================
  // 拍卖系统 (x: 2000+) - 独立区域
  // ===============================================
  // 第一行 - 委托
  { id: IDS.CONSIGNOR, type: 'objectType', position: { x: 2000, y: 200 }, data: tradeErpObjectTypes[26] },
  { id: IDS.CONSIGNMENT_CONTRACT, type: 'objectType', position: { x: 2300, y: 200 }, data: tradeErpObjectTypes[27] },
  { id: IDS.AUCTION_CATEGORY, type: 'objectType', position: { x: 2600, y: 200 }, data: tradeErpObjectTypes[29] },
  
  // 第二行 - 拍品
  { id: IDS.AUCTION_ITEM, type: 'objectType', position: { x: 2000, y: 400 }, data: tradeErpObjectTypes[28] },
  { id: IDS.APPRAISAL, type: 'objectType', position: { x: 2300, y: 400 }, data: tradeErpObjectTypes[30] },
  
  // 第三行 - 拍卖活动
  { id: IDS.AUCTION_EVENT, type: 'objectType', position: { x: 2000, y: 600 }, data: tradeErpObjectTypes[31] },
  { id: IDS.AUCTION_SESSION, type: 'objectType', position: { x: 2300, y: 600 }, data: tradeErpObjectTypes[32] },
  { id: IDS.AUCTION_LOT, type: 'objectType', position: { x: 2600, y: 600 }, data: tradeErpObjectTypes[33] },
  
  // 第四行 - 竞拍
  { id: IDS.BIDDER, type: 'objectType', position: { x: 2000, y: 800 }, data: tradeErpObjectTypes[34] },
  { id: IDS.DEPOSIT, type: 'objectType', position: { x: 2300, y: 800 }, data: tradeErpObjectTypes[36] },
  { id: IDS.BID, type: 'objectType', position: { x: 2600, y: 800 }, data: tradeErpObjectTypes[35] },
  
  // 第五行 - 成交结算
  { id: IDS.AUCTION_RESULT, type: 'objectType', position: { x: 2000, y: 1000 }, data: tradeErpObjectTypes[37] },
  { id: IDS.SETTLEMENT, type: 'objectType', position: { x: 2300, y: 1000 }, data: tradeErpObjectTypes[38] },
  { id: IDS.COMMISSION, type: 'objectType', position: { x: 2600, y: 1000 }, data: tradeErpObjectTypes[39] },
];

// ============================================
// Edges
// ============================================
export const tradeErpEdges: OntologyEdge[] = tradeErpLinkTypes.map((lt) => ({
  id: lt.id,
  source: lt.sourceObjectTypeId,
  target: lt.targetObjectTypeId,
  type: 'link',
  data: lt,
  label: lt.displayName,
}));

// ============================================
// Complete Ontology
// ============================================
export const tradeErpOntology: Ontology = {
  id: 'company-management-ontology',
  name: '公司管理系统',
  description: '一个完整的企业级本体模型，包含：\n【企业管理】客户管理、供应商管理、产品管理、采购管理、销售管理、库存管理、财务管理、物流管理、外贸管理\n【拍卖业务】委托管理、拍品管理、拍卖活动、竞拍管理、成交结算',
  version: '2.1.0',
  objectTypes: tradeErpObjectTypes,
  linkTypes: tradeErpLinkTypes,
  interfaces: tradeErpInterfaces,
  actions: tradeErpActions,
  createdAt: now(),
  updatedAt: now(),
};
