import { ReactFlowProvider } from '@xyflow/react';
import Canvas from './components/Canvas';
import Header from './components/Header';
import Toolbar from './components/Toolbar';
import Panel from './components/Panel';
import ActionList from './components/ActionList';

function App() {
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
      </div>
    </ReactFlowProvider>
  );
}

export default App;
