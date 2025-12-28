import { useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import Canvas from './components/Canvas';
import Header from './components/Header';
import Toolbar from './components/Toolbar';
import Panel from './components/Panel';
import ActionList from './components/ActionList';
import HelpGuide from './components/HelpGuide';
import { ChatlogViewer } from './components/ChatlogViewer';
import { GraphDatabaseView } from './components/GraphDatabaseView';
import { FloatingMenu } from './components/FloatingMenu';
import { Methodology } from './components/Methodology';

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
        
        {/* 各面板 - 由 FloatingMenu 控制 */}
        <HelpGuide 
          isOpen={showHelp} 
          onClose={() => setShowHelp(false)} 
        />
        <ChatlogViewer 
          isOpen={showChatlog} 
          onClose={() => setShowChatlog(false)} 
        />
        <GraphDatabaseView 
          isOpen={showGraphDB} 
          onClose={() => setShowGraphDB(false)} 
        />
        <Methodology
          isOpen={showMethodology}
          onClose={() => setShowMethodology(false)}
        />
      </div>
    </ReactFlowProvider>
  );
}

export default App;
