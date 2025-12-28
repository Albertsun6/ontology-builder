import { useState } from 'react';
import {
  CubeIcon,
  PuzzlePieceIcon,
  LinkIcon,
  BoltIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  TrashIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useOntologyStore } from '../store/ontologyStore';

export default function Toolbar() {
  const { ontology, openPanel, exportOntology, importOntology, reset } = useOntologyStore();
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState('');

  const handleExport = () => {
    const data = exportOntology();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${ontology?.name || 'ontology'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (importData.trim()) {
      importOntology(importData);
      setImportData('');
      setShowImportModal(false);
    }
  };

  const tools = [
    { 
      icon: CubeIcon, 
      label: '对象类型', 
      onClick: () => openPanel('create', 'objectType'),
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10 hover:bg-indigo-500/20',
    },
    { 
      icon: PuzzlePieceIcon, 
      label: '接口', 
      onClick: () => openPanel('create', 'interface'),
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10 hover:bg-purple-500/20',
    },
    { 
      icon: LinkIcon, 
      label: '链接类型', 
      onClick: () => openPanel('create', 'linkType'),
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10 hover:bg-cyan-500/20',
    },
    { 
      icon: BoltIcon, 
      label: '动作', 
      onClick: () => openPanel('create', 'action'),
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10 hover:bg-yellow-500/20',
    },
  ];

  return (
    <>
      <div className="fixed left-6 top-1/2 -translate-y-1/2 z-50">
        <div className="glass border border-surface-700 rounded-2xl p-2 space-y-2 shadow-2xl">
          {/* Logo */}
          <div className="flex items-center justify-center w-12 h-12 mb-2">
            <SparklesIcon className="w-7 h-7 text-onto-400" />
          </div>
          
          <div className="h-px bg-surface-700 mx-1" />
          
          {/* Tools */}
          {tools.map((tool, index) => (
            <button
              key={index}
              onClick={tool.onClick}
              className={`
                w-12 h-12 flex items-center justify-center rounded-xl
                ${tool.bgColor} ${tool.color}
                transition-all duration-200 group relative
              `}
              title={tool.label}
            >
              <tool.icon className="w-6 h-6" />
              <span className="absolute left-full ml-3 px-2 py-1 bg-surface-800 text-surface-200 text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {tool.label}
              </span>
            </button>
          ))}
          
          <div className="h-px bg-surface-700 mx-1" />
          
          {/* Actions */}
          <button
            onClick={handleExport}
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-surface-800/50 hover:bg-surface-700 text-surface-400 hover:text-surface-200 transition-all duration-200 group relative"
            title="导出"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            <span className="absolute left-full ml-3 px-2 py-1 bg-surface-800 text-surface-200 text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              导出
            </span>
          </button>
          
          <button
            onClick={() => setShowImportModal(true)}
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-surface-800/50 hover:bg-surface-700 text-surface-400 hover:text-surface-200 transition-all duration-200 group relative"
            title="导入"
          >
            <ArrowUpTrayIcon className="w-5 h-5" />
            <span className="absolute left-full ml-3 px-2 py-1 bg-surface-800 text-surface-200 text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              导入
            </span>
          </button>
          
          <div className="h-px bg-surface-700 mx-1" />
          
          <button
            onClick={reset}
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all duration-200 group relative"
            title="重置"
          >
            <TrashIcon className="w-5 h-5" />
            <span className="absolute left-full ml-3 px-2 py-1 bg-surface-800 text-surface-200 text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              重置
            </span>
          </button>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-surface-800 border border-surface-600 rounded-2xl p-6 w-full max-w-lg mx-4 animate-fade-in">
            <h3 className="text-lg font-display font-semibold text-surface-100 mb-4">导入本体</h3>
            <textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              className="input-field h-64 font-mono text-sm resize-none"
              placeholder="粘贴 JSON 数据..."
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowImportModal(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button onClick={handleImport} className="btn-primary">
                导入
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
