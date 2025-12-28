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
  ArrowsPointingOutIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { useOntologyStore } from '../store/ontologyStore';
import { LAYOUT_ALGORITHMS, LAYOUT_DIRECTIONS, type LayoutAlgorithm, type LayoutDirection } from '../utils/layoutAlgorithms';

export default function Toolbar() {
  const { ontology, openPanel, exportOntology, importOntology, reset, autoLayout } = useOntologyStore();
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState('');
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<LayoutAlgorithm>('dagre');
  const [selectedDirection, setSelectedDirection] = useState<LayoutDirection>('TB');

  const handleAutoLayout = () => {
    autoLayout(selectedAlgorithm, selectedDirection);
    setShowLayoutMenu(false);
  };

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
          
          {/* Auto Layout */}
          <div className="relative">
            <button
              onClick={() => setShowLayoutMenu(!showLayoutMenu)}
              className="w-12 h-12 flex items-center justify-center rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-all duration-200 group relative"
              title="自动布局"
            >
              <ArrowsPointingOutIcon className="w-5 h-5" />
              <span className="absolute left-full ml-3 px-2 py-1 bg-surface-800 text-surface-200 text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                自动布局
              </span>
            </button>
            
            {/* Layout Menu */}
            {showLayoutMenu && (
              <div className="absolute left-full ml-3 top-0 bg-surface-800 border border-surface-600 rounded-xl shadow-2xl p-4 min-w-[280px] z-50 animate-fade-in">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white">自动布局</h3>
                  <button 
                    onClick={() => setShowLayoutMenu(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    ×
                  </button>
                </div>
                
                {/* Algorithm Selection */}
                <div className="mb-4">
                  <label className="text-xs text-gray-400 mb-2 block">布局算法</label>
                  <div className="space-y-1">
                    {LAYOUT_ALGORITHMS.map((algo) => (
                      <button
                        key={algo.id}
                        onClick={() => setSelectedAlgorithm(algo.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors
                          ${selectedAlgorithm === algo.id 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-surface-700/50 text-gray-300 hover:bg-surface-700 border border-transparent'}`}
                      >
                        <span className="text-lg">{algo.icon}</span>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{algo.name}</div>
                          <div className="text-xs text-gray-500">{algo.description}</div>
                        </div>
                        {selectedAlgorithm === algo.id && (
                          <ChevronRightIcon className="w-4 h-4 text-emerald-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Direction (only for dagre) */}
                {selectedAlgorithm === 'dagre' && (
                  <div className="mb-4">
                    <label className="text-xs text-gray-400 mb-2 block">布局方向</label>
                    <div className="flex gap-2">
                      {LAYOUT_DIRECTIONS.map((dir) => (
                        <button
                          key={dir.id}
                          onClick={() => setSelectedDirection(dir.id)}
                          className={`flex-1 flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors
                            ${selectedDirection === dir.id 
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                              : 'bg-surface-700/50 text-gray-400 hover:bg-surface-700 border border-transparent'}`}
                          title={dir.name}
                        >
                          <span className="text-lg">{dir.icon}</span>
                          <span className="text-xs">{dir.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Apply Button */}
                <button
                  onClick={handleAutoLayout}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowsPointingOutIcon className="w-4 h-4" />
                  应用布局
                </button>
              </div>
            )}
          </div>
          
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
