import { useState, lazy, Suspense } from 'react';
import { ReactFlowProvider } from '@xyflow/react';

// Layout Components - Always loaded
import Canvas from './components/Canvas';
import Header from './components/Header';
import Toolbar from './components/Toolbar';
import Panel from './components/Panel';
import ActionList from './components/panels/ActionList';
import { FloatingMenu } from './components/FloatingMenu';

// Lazy loaded panel components - Only loaded when needed
const HelpGuide = lazy(() => import('./components/panels/HelpGuide'));
const ChatlogViewer = lazy(() => import('./components/panels/ChatlogViewer'));
const GraphDatabaseView = lazy(() => import('./components/panels/GraphDatabaseView'));
const Methodology = lazy(() => import('./components/panels/Methodology'));

// Loading fallback for lazy components
function PanelLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-gray-400 text-sm">加载中...</span>
      </div>
    </div>
  );
}

function App() {
  const [showHelp, setShowHelp] = useState(false);
  const [showChatlog, setShowChatlog] = useState(false);
  const [showGraphDB, setShowGraphDB] = useState(false);
  const [showMethodology, setShowMethodology] = useState(false);

  return (
    <ReactFlowProvider>
      <div className="h-screen w-screen overflow-hidden bg-surface-950">
        <Header />
        <main className="h-full pt-16">
          <Canvas />
        </main>
        <Toolbar />
        <Panel />
        <ActionList />
        
        {/* 悬浮菜单 */}
        <FloatingMenu
          onOpenHelp={() => setShowHelp(true)}
          onOpenChatlog={() => setShowChatlog(true)}
          onOpenGraphDB={() => setShowGraphDB(true)}
          onOpenMethodology={() => setShowMethodology(true)}
        />
        
        {/* 延迟加载的面板组件 */}
        <Suspense fallback={<PanelLoader />}>
          {showHelp && (
            <HelpGuide 
              isOpen={showHelp} 
              onClose={() => setShowHelp(false)} 
            />
          )}
          {showChatlog && (
            <ChatlogViewer 
              isOpen={showChatlog} 
              onClose={() => setShowChatlog(false)} 
            />
          )}
          {showGraphDB && (
            <GraphDatabaseView 
              isOpen={showGraphDB} 
              onClose={() => setShowGraphDB(false)} 
            />
          )}
          {showMethodology && (
            <Methodology
              isOpen={showMethodology}
              onClose={() => setShowMethodology(false)}
            />
          )}
        </Suspense>
      </div>
    </ReactFlowProvider>
  );
}

export default App;
