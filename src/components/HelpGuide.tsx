import { useState } from 'react';
import {
  QuestionMarkCircleIcon,
  XMarkIcon,
  CubeIcon,
  PuzzlePieceIcon,
  LinkIcon,
  BoltIcon,
  ArrowsPointingOutIcon,
  CursorArrowRaysIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  RocketLaunchIcon,
  CommandLineIcon,
  CircleStackIcon,
  ServerStackIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

interface Section {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  content: React.ReactNode;
}

interface HelpGuideProps {
  isOpen?: boolean;
  onClose?: () => void;
  showTrigger?: boolean;
}

export default function HelpGuide({ isOpen: externalIsOpen, onClose, showTrigger = false }: HelpGuideProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  const sections: Section[] = [
    {
      id: 'overview',
      title: '概述',
      icon: QuestionMarkCircleIcon,
      color: 'text-onto-400',
      content: (
        <div className="space-y-4">
          <p className="text-surface-300 leading-relaxed">
            <strong className="text-surface-100">本体论建模工具</strong> 是一个可视化的本体论设计平台，
            灵感来自 Palantir Foundry 的 Ontology。它帮助你定义和管理业务领域中的核心概念及其关系。
          </p>
          
          <div className="bg-surface-800/50 rounded-lg p-4 border border-surface-700">
            <h4 className="font-medium text-surface-200 mb-2">核心概念</h4>
            <ul className="space-y-2 text-sm text-surface-400">
              <li className="flex items-center gap-2">
                <CubeIcon className="w-4 h-4 text-indigo-400" />
                <span><strong className="text-indigo-400">对象类型</strong> - 业务实体的定义（如客户、订单）</span>
              </li>
              <li className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-cyan-400" />
                <span><strong className="text-cyan-400">链接类型</strong> - 对象之间的关系</span>
              </li>
              <li className="flex items-center gap-2">
                <PuzzlePieceIcon className="w-4 h-4 text-purple-400" />
                <span><strong className="text-purple-400">接口</strong> - 共享属性的抽象定义</span>
              </li>
              <li className="flex items-center gap-2">
                <BoltIcon className="w-4 h-4 text-yellow-400" />
                <span><strong className="text-yellow-400">动作</strong> - 可执行的业务操作</span>
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'objects',
      title: '对象类型',
      icon: CubeIcon,
      color: 'text-indigo-400',
      content: (
        <div className="space-y-4">
          <p className="text-surface-300 leading-relaxed">
            对象类型代表业务领域中的实体，如客户、产品、订单等。每个对象类型包含多个属性来描述其特征。
          </p>
          
          <div className="bg-surface-800/50 rounded-lg p-4 border border-surface-700">
            <h4 className="font-medium text-surface-200 mb-3">创建对象类型</h4>
            <ol className="space-y-2 text-sm text-surface-400 list-decimal list-inside">
              <li>点击左侧工具栏的 <span className="text-indigo-400">📦 对象类型</span> 按钮</li>
              <li>填写类型名称（英文标识符）和显示名称（中文）</li>
              <li>选择颜色和图标用于可视化</li>
              <li>添加属性，设置数据类型和约束</li>
              <li>指定一个属性作为主键</li>
              <li>点击保存</li>
            </ol>
          </div>

          <div className="bg-surface-800/50 rounded-lg p-4 border border-surface-700">
            <h4 className="font-medium text-surface-200 mb-3">属性类型</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="type-badge type-string">string</span>
                <span className="text-surface-400">文本字符串</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="type-badge type-number">number</span>
                <span className="text-surface-400">数字</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="type-badge type-boolean">boolean</span>
                <span className="text-surface-400">布尔值</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="type-badge type-date">date</span>
                <span className="text-surface-400">日期</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="type-badge type-datetime">datetime</span>
                <span className="text-surface-400">日期时间</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="type-badge type-array">array</span>
                <span className="text-surface-400">数组</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="type-badge type-object">object</span>
                <span className="text-surface-400">对象</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="type-badge type-reference">reference</span>
                <span className="text-surface-400">引用</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'links',
      title: '链接类型',
      icon: LinkIcon,
      color: 'text-cyan-400',
      content: (
        <div className="space-y-4">
          <p className="text-surface-300 leading-relaxed">
            链接类型定义对象之间的关系。例如，"客户"与"订单"之间的"下单"关系。
          </p>
          
          <div className="bg-surface-800/50 rounded-lg p-4 border border-surface-700">
            <h4 className="font-medium text-surface-200 mb-3">创建链接（两种方式）</h4>
            
            <div className="space-y-3 text-sm text-surface-400">
              <div>
                <p className="font-medium text-cyan-400 mb-1">方式一：连线创建</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>从源对象节点的右侧连接点拖拽</li>
                  <li>连接到目标对象的左侧连接点</li>
                  <li>自动创建链接类型</li>
                  <li>双击链接线编辑详情</li>
                </ol>
              </div>
              
              <div>
                <p className="font-medium text-cyan-400 mb-1">方式二：工具栏创建</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>点击左侧工具栏的 🔗 按钮</li>
                  <li>选择源对象和目标对象</li>
                  <li>设置关系基数</li>
                  <li>保存</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="bg-surface-800/50 rounded-lg p-4 border border-surface-700">
            <h4 className="font-medium text-surface-200 mb-3">基数类型</h4>
            <ul className="space-y-2 text-sm text-surface-400">
              <li><strong className="text-surface-200">一对一</strong> - 一个源对象只能关联一个目标对象</li>
              <li><strong className="text-surface-200">一对多</strong> - 一个源对象可以关联多个目标对象</li>
              <li><strong className="text-surface-200">多对多</strong> - 双向都可以有多个关联</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'actions',
      title: '动作',
      icon: BoltIcon,
      color: 'text-yellow-400',
      content: (
        <div className="space-y-4">
          <p className="text-surface-300 leading-relaxed">
            动作是可以在对象上执行的业务操作。每个动作有参数（输入）和执行规则（逻辑）。
          </p>
          
          <div className="bg-surface-800/50 rounded-lg p-4 border border-surface-700">
            <h4 className="font-medium text-surface-200 mb-3">动作结构</h4>
            <pre className="text-xs text-surface-400 bg-surface-900 rounded p-3 overflow-x-auto">
{`动作: 创建订单
├── 关联对象: 客户
├── 参数:
│   ├── products (数组, 必填)
│   └── address (字符串, 必填)
└── 执行规则:
    ├── #1 验证: products.length > 0
    ├── #2 创建对象: Order
    └── #3 创建链接: customer_orders`}
            </pre>
          </div>

          <div className="bg-surface-800/50 rounded-lg p-4 border border-surface-700">
            <h4 className="font-medium text-surface-200 mb-3">执行规则类型</h4>
            <ul className="space-y-2 text-sm text-surface-400">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400"></span>
                <strong className="text-green-400">创建对象</strong> - 创建新的对象实例
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                <strong className="text-blue-400">更新属性</strong> - 修改对象的属性值
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <strong className="text-cyan-400">创建链接</strong> - 建立对象间的关系
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                <strong className="text-yellow-400">验证规则</strong> - 检查条件是否满足
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                <strong className="text-purple-400">调用接口</strong> - 发送 Webhook 请求
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-pink-400"></span>
                <strong className="text-pink-400">发送通知</strong> - 发送消息通知
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'canvas',
      title: '画布操作',
      icon: ArrowsPointingOutIcon,
      color: 'text-emerald-400',
      content: (
        <div className="space-y-4">
          <p className="text-surface-300 leading-relaxed">
            画布是可视化建模的核心区域，支持拖拽、缩放和连线操作。
          </p>
          
          <div className="bg-surface-800/50 rounded-lg p-4 border border-surface-700">
            <h4 className="font-medium text-surface-200 mb-3">操作指南</h4>
            <ul className="space-y-2 text-sm text-surface-400">
              <li className="flex items-center gap-2">
                <CursorArrowRaysIcon className="w-4 h-4 text-emerald-400" />
                <span><strong>拖拽节点</strong> - 按住节点拖动调整位置</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">🖱️</span>
                <span><strong>双击节点</strong> - 打开编辑面板</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">🔗</span>
                <span><strong>双击连线</strong> - 编辑链接类型</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">🔍</span>
                <span><strong>滚轮缩放</strong> - 放大/缩小画布</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✋</span>
                <span><strong>拖拽画布</strong> - 在空白区域拖动平移</span>
              </li>
            </ul>
          </div>

          <div className="bg-surface-800/50 rounded-lg p-4 border border-surface-700">
            <h4 className="font-medium text-surface-200 mb-3">控制按钮</h4>
            <p className="text-sm text-surface-400">
              画布左下角有缩放控制按钮，右下角有小地图导航。
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'import-export',
      title: '导入导出',
      icon: DocumentArrowDownIcon,
      color: 'text-orange-400',
      content: (
        <div className="space-y-4">
          <p className="text-surface-300 leading-relaxed">
            你的本体模型会自动保存到浏览器本地存储。同时支持 JSON 格式的导入导出，方便备份和迁移。
          </p>
          
          <div className="bg-surface-800/50 rounded-lg p-4 border border-surface-700">
            <h4 className="font-medium text-surface-200 mb-3 flex items-center gap-2">
              <DocumentArrowDownIcon className="w-4 h-4 text-orange-400" />
              导出
            </h4>
            <ol className="space-y-1 text-sm text-surface-400 list-decimal list-inside">
              <li>点击左侧工具栏的下载图标</li>
              <li>自动下载 JSON 文件</li>
              <li>文件包含完整的本体定义和画布布局</li>
            </ol>
          </div>

          <div className="bg-surface-800/50 rounded-lg p-4 border border-surface-700">
            <h4 className="font-medium text-surface-200 mb-3 flex items-center gap-2">
              <DocumentArrowUpIcon className="w-4 h-4 text-orange-400" />
              导入
            </h4>
            <ol className="space-y-1 text-sm text-surface-400 list-decimal list-inside">
              <li>点击左侧工具栏的上传图标</li>
              <li>在弹窗中粘贴 JSON 数据</li>
              <li>点击导入按钮</li>
            </ol>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <p className="text-sm text-yellow-400">
              ⚠️ 导入会覆盖当前的所有数据，请先导出备份！
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'use-cases',
      title: '开发用途',
      icon: RocketLaunchIcon,
      color: 'text-rose-400',
      content: (
        <div className="space-y-4">
          <p className="text-surface-300 leading-relaxed">
            本体论建模工具在软件开发过程中扮演<strong className="text-surface-100">需求到代码之间的桥梁</strong>角色，
            帮助团队在动手写代码之前把业务模型想清楚、画清楚。
          </p>
          
          {/* 核心用途 */}
          <div className="bg-surface-800/50 rounded-lg p-4 border border-surface-700">
            <h4 className="font-medium text-surface-200 mb-3">🎯 核心用途</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <CubeIcon className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-indigo-400">领域建模</strong>
                  <p className="text-surface-400">在项目初期定义核心实体、属性和关系，作为技术设计的基础</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CommandLineIcon className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-cyan-400">API 设计</strong>
                  <p className="text-surface-400">对象类型 → REST 资源，动作 → API 端点，链接 → 嵌套资源</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CircleStackIcon className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-400">数据库设计</strong>
                  <p className="text-surface-400">直接映射到数据库表结构、字段定义和关联表</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ServerStackIcon className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-purple-400">微服务边界</strong>
                  <p className="text-surface-400">根据对象类型的聚合关系确定服务划分</p>
                </div>
              </div>
            </div>
          </div>

          {/* 开发流程 */}
          <div className="bg-surface-800/50 rounded-lg p-4 border border-surface-700">
            <h4 className="font-medium text-surface-200 mb-3">🔧 开发流程中的位置</h4>
            <div className="flex items-center justify-between text-xs text-surface-400 bg-surface-900 rounded-lg p-3">
              <span className="px-2 py-1 rounded bg-surface-700">需求分析</span>
              <span>→</span>
              <span className="px-2 py-1 rounded bg-rose-500/20 text-rose-400 font-medium">本体建模</span>
              <span>→</span>
              <span className="px-2 py-1 rounded bg-surface-700">技术设计</span>
              <span>→</span>
              <span className="px-2 py-1 rounded bg-surface-700">编码实现</span>
              <span>→</span>
              <span className="px-2 py-1 rounded bg-surface-700">测试部署</span>
            </div>
          </div>

          {/* 应用场景 */}
          <div className="bg-surface-800/50 rounded-lg p-4 border border-surface-700">
            <h4 className="font-medium text-surface-200 mb-3">📋 应用场景</h4>
            <div className="space-y-2 text-sm text-surface-400">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                <strong className="text-surface-300">新项目启动</strong> - 团队共同定义业务模型
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                <strong className="text-surface-300">需求变更评估</strong> - 评估修改影响范围和工作量
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                <strong className="text-surface-300">新成员入职</strong> - 快速理解业务概念和系统结构
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                <strong className="text-surface-300">前后端协作</strong> - 共享数据模型定义，减少沟通成本
              </div>
            </div>
          </div>

          {/* 执行规则对应 */}
          <div className="bg-surface-800/50 rounded-lg p-4 border border-surface-700">
            <h4 className="font-medium text-surface-200 mb-3">⚡ 执行规则 → 代码逻辑</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 bg-surface-900 rounded px-2 py-1.5">
                <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                <span className="text-surface-300">validation</span>
                <span className="text-surface-500">→ 参数校验</span>
              </div>
              <div className="flex items-center gap-2 bg-surface-900 rounded px-2 py-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400"></span>
                <span className="text-surface-300">create_object</span>
                <span className="text-surface-500">→ INSERT</span>
              </div>
              <div className="flex items-center gap-2 bg-surface-900 rounded px-2 py-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                <span className="text-surface-300">update_property</span>
                <span className="text-surface-500">→ UPDATE</span>
              </div>
              <div className="flex items-center gap-2 bg-surface-900 rounded px-2 py-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span className="text-surface-300">create_link</span>
                <span className="text-surface-500">→ 关联表</span>
              </div>
              <div className="flex items-center gap-2 bg-surface-900 rounded px-2 py-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                <span className="text-surface-300">webhook</span>
                <span className="text-surface-500">→ 外部调用</span>
              </div>
              <div className="flex items-center gap-2 bg-surface-900 rounded px-2 py-1.5">
                <span className="w-2 h-2 rounded-full bg-pink-400"></span>
                <span className="text-surface-300">notification</span>
                <span className="text-surface-500">→ 消息推送</span>
              </div>
            </div>
          </div>

          {/* 适用项目 */}
          <div className="bg-surface-800/50 rounded-lg p-4 border border-surface-700">
            <h4 className="font-medium text-surface-200 mb-3 flex items-center gap-2">
              <UserGroupIcon className="w-4 h-4 text-rose-400" />
              适用项目类型
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-surface-300">企业管理系统 (ERP/CRM)</span>
                <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-surface-300">电商平台</span>
                <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-surface-300">SaaS 应用</span>
                <span className="text-yellow-400">⭐⭐⭐⭐</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-surface-300">数据平台</span>
                <span className="text-yellow-400">⭐⭐⭐⭐</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      {/* Help Button - 仅在 showTrigger 为 true 时显示 */}
      {showTrigger && (
        <button
          onClick={() => setInternalIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-onto-600 hover:bg-onto-500 text-white shadow-lg shadow-onto-600/30 flex items-center justify-center transition-all hover:scale-105"
          title="使用帮助"
        >
          <QuestionMarkCircleIcon className="w-6 h-6" />
        </button>
      )}

      {/* Help Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />
          
          {/* Modal */}
          <div className="relative bg-surface-900 border border-surface-700 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl animate-fade-in flex">
            {/* Sidebar */}
            <div className="w-56 bg-surface-800/50 border-r border-surface-700 p-4 flex-shrink-0">
              <h2 className="font-display font-bold text-lg text-surface-100 mb-4 px-2">
                使用帮助
              </h2>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`
                      w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left
                      transition-all duration-200
                      ${activeSection === section.id 
                        ? 'bg-surface-700 text-surface-100' 
                        : 'text-surface-400 hover:bg-surface-700/50 hover:text-surface-200'
                      }
                    `}
                  >
                    <section.icon className={`w-4 h-4 ${section.color}`} />
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-surface-700">
                <div className="flex items-center gap-3">
                  {(() => {
                    const section = sections.find(s => s.id === activeSection);
                    if (!section) return null;
                    const Icon = section.icon;
                    return (
                      <>
                        <div className={`p-2 rounded-lg bg-surface-800 ${section.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <h3 className="font-display font-semibold text-lg text-surface-100">
                          {section.title}
                        </h3>
                      </>
                    );
                  })()}
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 text-surface-400 hover:text-surface-200 hover:bg-surface-700 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6">
                {sections.find(s => s.id === activeSection)?.content}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-surface-700 bg-surface-800/30">
                <p className="text-xs text-surface-500 text-center">
                  本体论建模工具 v1.0.0 · 灵感来自 Palantir Ontology
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
