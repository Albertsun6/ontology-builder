import { useState } from 'react';
import {
  XMarkIcon,
  AcademicCapIcon,
  ChatBubbleBottomCenterTextIcon,
  CubeTransparentIcon,
  ArrowPathIcon,
  DocumentCheckIcon,
  LightBulbIcon,
  RocketLaunchIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

interface MethodologyProps {
  isOpen?: boolean;
  onClose?: () => void;
}

type PhaseId = 'understand' | 'design' | 'iterate' | 'optimize' | 'document';

interface Phase {
  id: PhaseId;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  steps: string[];
  outputs: string[];
  example: string;
}

export const Methodology = ({ isOpen, onClose }: MethodologyProps) => {
  const [activePhase, setActivePhase] = useState<PhaseId>('understand');

  const phases: Phase[] = [
    {
      id: 'understand',
      title: '需求理解',
      subtitle: 'Understand',
      icon: LightBulbIcon,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/20',
      steps: [
        '倾听用户描述，识别核心需求',
        '参考行业标杆（如 Palantir Ontology）',
        '提取核心概念和术语',
        '确认技术可行性',
      ],
      outputs: ['核心概念清单', '参考标杆分析', '可行性评估'],
      example: '用户提出"做本体论建模工具" → 分析 Palantir Ontology 核心概念 → 确定对象类型、属性、链接、动作等核心概念',
    },
    {
      id: 'design',
      title: '架构设计',
      subtitle: 'Design',
      icon: CubeTransparentIcon,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      steps: [
        '选择技术栈（React + TypeScript + Vite）',
        '设计状态管理方案（Zustand + 持久化）',
        '规划可视化方案（React Flow）',
        '定义数据模型和类型',
      ],
      outputs: ['技术选型文档', '数据模型定义', '组件结构设计'],
      example: '确定使用 React Flow 实现画布 → 设计 ObjectType、LinkType 等核心类型 → 规划 Canvas、Panel、Toolbar 等组件',
    },
    {
      id: 'iterate',
      title: '迭代开发',
      subtitle: 'Iterate',
      icon: ArrowPathIcon,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      steps: [
        '核心功能优先实现',
        '快速交付可运行版本',
        '根据反馈持续迭代',
        '每次迭代解决一个问题',
      ],
      outputs: ['可运行的功能模块', '用户反馈记录', '迭代版本'],
      example: '先实现基础画布 → 用户反馈"动作不可见" → 添加动作可视化 → 用户反馈"无法编辑" → 添加参数编辑器',
    },
    {
      id: 'optimize',
      title: '优化增强',
      subtitle: 'Optimize',
      icon: RocketLaunchIcon,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      steps: [
        '代码结构优化（组件抽取、UI 复用）',
        '扩展功能（图数据库视图）',
        '完善示例数据',
        'UI/UX 改进（悬浮菜单整合）',
      ],
      outputs: ['优化后的代码', '新增功能', '改进的用户体验'],
      example: '抽取共享 UI 组件 → 添加图数据库视图 → 整合悬浮菜单减少按钮重叠',
    },
    {
      id: 'document',
      title: '文档沉淀',
      subtitle: 'Document',
      icon: DocumentCheckIcon,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/20',
      steps: [
        '记录每次对话和决策（Chatlog）',
        '编写使用说明（HelpGuide）',
        '沉淀方法论（Methodology）',
        '生成开发规范（.cursorrules）',
      ],
      outputs: ['对话记录', '使用文档', '方法论总结', '开发规范'],
      example: '每次功能完成后更新 Chatlog → 创建前端帮助指南 → 抽象开发方法论 → 生成 Cursor 规则文件',
    },
  ];

  const principles = [
    {
      icon: ChatBubbleBottomCenterTextIcon,
      title: '对话驱动',
      description: '通过自然语言对话理解需求，降低沟通成本',
    },
    {
      icon: ArrowPathIcon,
      title: '快速迭代',
      description: '小步快跑，每次解决一个具体问题',
    },
    {
      icon: CheckCircleIcon,
      title: '即时反馈',
      description: '每个功能立即可见、可验证',
    },
    {
      icon: DocumentCheckIcon,
      title: '文档同步',
      description: '开发与文档同步进行，知识实时沉淀',
    },
  ];

  const currentPhase = phases.find((p) => p.id === activePhase)!;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-4xl bg-gradient-to-b from-slate-900 to-slate-950 
        shadow-2xl shadow-black/50 flex flex-col animate-slide-in-right">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 
          bg-gradient-to-r from-amber-900/50 to-orange-900/50 border-b border-amber-800/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-600/20">
              <AcademicCapIcon className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI 协作开发方法论</h2>
              <p className="text-sm text-amber-300/70">Conversational Development Methodology</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto">
          {/* 核心原则 */}
          <div className="px-6 py-6 border-b border-slate-800">
            <h3 className="text-lg font-semibold text-white mb-4">核心原则</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {principles.map((principle, i) => (
                <div
                  key={i}
                  className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 text-center"
                >
                  <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <principle.icon className="w-5 h-5 text-amber-400" />
                  </div>
                  <h4 className="font-medium text-white text-sm mb-1">{principle.title}</h4>
                  <p className="text-xs text-gray-400">{principle.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 开发阶段流程 */}
          <div className="px-6 py-6">
            <h3 className="text-lg font-semibold text-white mb-4">开发阶段</h3>
            
            {/* 阶段导航 */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
              {phases.map((phase, i) => (
                <div key={phase.id} className="flex items-center">
                  <button
                    onClick={() => setActivePhase(phase.id)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap
                      transition-all duration-200
                      ${activePhase === phase.id
                        ? `${phase.bgColor} ${phase.color} border border-current`
                        : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700/50'
                      }
                    `}
                  >
                    <phase.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{phase.title}</span>
                  </button>
                  {i < phases.length - 1 && (
                    <ArrowRightIcon className="w-4 h-4 text-gray-600 mx-1 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>

            {/* 当前阶段详情 */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
              <div className={`px-6 py-4 ${currentPhase.bgColor} border-b border-slate-700`}>
                <div className="flex items-center gap-3">
                  <currentPhase.icon className={`w-6 h-6 ${currentPhase.color}`} />
                  <div>
                    <h4 className="font-semibold text-white">{currentPhase.title}</h4>
                    <p className="text-sm text-gray-300">{currentPhase.subtitle}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* 关键步骤 */}
                <div>
                  <h5 className="text-sm font-medium text-gray-300 mb-3">关键步骤</h5>
                  <div className="space-y-2">
                    {currentPhase.steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className={`
                          w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                          ${currentPhase.bgColor} ${currentPhase.color}
                        `}>
                          {i + 1}
                        </span>
                        <span className="text-gray-300 text-sm pt-0.5">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 输出物 */}
                <div>
                  <h5 className="text-sm font-medium text-gray-300 mb-3">输出物</h5>
                  <div className="flex flex-wrap gap-2">
                    {currentPhase.outputs.map((output, i) => (
                      <span
                        key={i}
                        className={`px-3 py-1 rounded-full text-xs ${currentPhase.bgColor} ${currentPhase.color}`}
                      >
                        {output}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 实例 */}
                <div>
                  <h5 className="text-sm font-medium text-gray-300 mb-3">本项目实例</h5>
                  <div className="bg-slate-900 rounded-lg p-4 text-sm text-gray-400 leading-relaxed">
                    {currentPhase.example}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 最佳实践 */}
          <div className="px-6 py-6 border-t border-slate-800">
            <h3 className="text-lg font-semibold text-white mb-4">最佳实践</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <h4 className="font-medium text-green-400 mb-2">✅ 推荐做法</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• 每次只提出一个明确的需求</li>
                  <li>• 及时反馈功能是否符合预期</li>
                  <li>• 保持对话记录便于回溯</li>
                  <li>• 先实现核心功能再优化</li>
                  <li>• 使用示例数据验证功能</li>
                </ul>
              </div>
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <h4 className="font-medium text-red-400 mb-2">❌ 避免做法</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• 一次性提出过多需求</li>
                  <li>• 需求描述过于模糊</li>
                  <li>• 跳过验证直接继续开发</li>
                  <li>• 过早进行性能优化</li>
                  <li>• 忽略文档和知识沉淀</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 底部 */}
        <div className="px-6 py-4 bg-slate-900/80 border-t border-slate-800">
          <p className="text-xs text-gray-500 text-center">
            🎓 AI 协作开发方法论 · 基于本项目实践总结 · 持续迭代优化
          </p>
        </div>
      </div>

      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Methodology;
