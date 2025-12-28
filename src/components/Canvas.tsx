import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge,
  type Node,
  BackgroundVariant,
  ConnectionMode,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useOntologyStore } from '../store/ontologyStore';
import ObjectTypeNode from './nodes/ObjectTypeNode';
import InterfaceNode from './nodes/InterfaceNode';

const nodeTypes = {
  objectType: ObjectTypeNode,
  interface: InterfaceNode,
};

const defaultEdgeOptions = {
  type: 'smoothstep',
  animated: true,
  style: { stroke: '#06b6d4', strokeWidth: 2 },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: '#06b6d4',
  },
};

export default function Canvas() {
  const {
    nodes: storeNodes,
    edges: storeEdges,
    setNodes: setStoreNodes,
    setEdges: setStoreEdges,
    setSelectedNode,
    setSelectedEdge,
    updateNodePosition,
    addLinkType,
    openPanel,
    ontology,
  } = useOntologyStore();

  const [nodes, setNodes, onNodesChange] = useNodesState(storeNodes as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(storeEdges as Edge[]);

  // Sync with store when store changes
  useMemo(() => {
    setNodes(storeNodes as Node[]);
  }, [storeNodes, setNodes]);

  useMemo(() => {
    setEdges(storeEdges as Edge[]);
  }, [storeEdges, setEdges]);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      
      // Find source and target object types
      const sourceNode = storeNodes.find((n) => n.id === connection.source);
      const targetNode = storeNodes.find((n) => n.id === connection.target);
      
      if (sourceNode?.type === 'objectType' && targetNode?.type === 'objectType') {
        // Create a new link type
        addLinkType({
          name: `${sourceNode.data.name}_to_${targetNode.data.name}`,
          displayName: `${sourceNode.data.displayName} → ${targetNode.data.displayName}`,
          sourceObjectTypeId: connection.source,
          targetObjectTypeId: connection.target,
          cardinality: 'one-to-many',
        });
      } else {
        // Just add the edge visually
        setEdges((eds) => addEdge(connection, eds));
      }
    },
    [storeNodes, addLinkType, setEdges]
  );

  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node) => {
      updateNodePosition(node.id, node.position);
    },
    [updateNodePosition]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNode(node.id);
    },
    [setSelectedNode]
  );

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      setSelectedEdge(edge.id);
    },
    [setSelectedEdge]
  );

  const onEdgeDoubleClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      setSelectedEdge(edge.id);
      openPanel('edit', 'linkType');
    },
    [setSelectedEdge, openPanel]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, [setSelectedNode, setSelectedEdge]);

  return (
    <div className="w-full h-full canvas-bg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onEdgeDoubleClick={onEdgeDoubleClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        snapToGrid
        snapGrid={[12, 12]}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="rgba(99, 102, 241, 0.15)"
        />
        <Controls 
          className="!bottom-6 !left-6"
          showInteractive={false}
        />
        <MiniMap
          className="!bottom-6 !right-6"
          nodeColor={(node) => {
            if (node.type === 'objectType') return '#6366f1';
            if (node.type === 'interface') return '#8b5cf6';
            return '#64748b';
          }}
          maskColor="rgba(10, 14, 23, 0.8)"
        />
      </ReactFlow>
    </div>
  );
}
