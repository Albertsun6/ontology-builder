import { useState } from 'react';
import {
  Bars3Icon,
  XMarkIcon,
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  CircleStackIcon,
} from '@heroicons/react/24/outline';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  onClick: () => void;
}

interface FloatingMenuProps {
  onOpenHelp: () => void;
  onOpenChatlog: () => void;
  onOpenGraphDB: () => void;
}

export const FloatingMenu = ({
  onOpenHelp,
  onOpenChatlog,
  onOpenGraphDB,
}: FloatingMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems: MenuItem[] = [
    {
      id: 'help',
      label: '使用帮助',
      icon: QuestionMarkCircleIcon,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20 hover:bg-purple-500/30',
      onClick: () => {
        onOpenHelp();
        setIsOpen(false);
      },
    },
    {
      id: 'chatlog',
      label: '对话记录',
      icon: ChatBubbleLeftRightIcon,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/20 hover:bg-cyan-500/30',
      onClick: () => {
        onOpenChatlog();
        setIsOpen(false);
      },
    },
    {
      id: 'graphdb',
      label: '图数据库',
      icon: CircleStackIcon,
      color: 'text-violet-400',
      bgColor: 'bg-violet-500/20 hover:bg-violet-500/30',
      onClick: () => {
        onOpenGraphDB();
        setIsOpen(false);
      },
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* 菜单项 */}
      <div
        className={`
          absolute bottom-16 right-0 flex flex-col gap-2
          transition-all duration-300 origin-bottom-right
          ${isOpen 
            ? 'opacity-100 scale-100 pointer-events-auto' 
            : 'opacity-0 scale-95 pointer-events-none'
          }
        `}
      >
        {menuItems.map((item, index) => (
          <button
            key={item.id}
            onClick={item.onClick}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-xl
              bg-slate-800/95 backdrop-blur-sm border border-slate-700/50
              shadow-lg shadow-black/30 hover:shadow-xl
              transition-all duration-200 hover:scale-105
              ${isOpen ? 'translate-y-0' : 'translate-y-4'}
            `}
            style={{
              transitionDelay: isOpen ? `${index * 50}ms` : '0ms',
            }}
          >
            <div className={`p-2 rounded-lg ${item.bgColor}`}>
              <item.icon className={`w-5 h-5 ${item.color}`} />
            </div>
            <span className="text-sm font-medium text-white whitespace-nowrap">
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {/* 主按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-14 h-14 rounded-full flex items-center justify-center
          shadow-lg transition-all duration-300 hover:scale-105
          ${isOpen 
            ? 'bg-slate-700 hover:bg-slate-600 shadow-slate-900/50' 
            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-900/40'
          }
        `}
        title={isOpen ? '关闭菜单' : '打开菜单'}
      >
        <div className={`transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}>
          {isOpen ? (
            <XMarkIcon className="w-6 h-6 text-white" />
          ) : (
            <Bars3Icon className="w-6 h-6 text-white" />
          )}
        </div>
      </button>

      {/* 点击外部关闭 */}
      {isOpen && (
        <div
          className="fixed inset-0 -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default FloatingMenu;
