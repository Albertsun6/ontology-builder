import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { 
  Ontology, 
  ObjectType, 
  LinkType, 
  Interface, 
  Action, 
  OntologyNode,
  OntologyEdge 
} from '../types/ontology';
import { applyLayout, type LayoutOptions, type LayoutAlgorithm, type LayoutDirection } from '../utils/layoutAlgorithms';
import { 
  tradeErpOntology, 
  tradeErpNodes, 
  tradeErpEdges 
} from './tradeErpDemo';

// Apply default layout (hierarchical, left-to-right)
const defaultLayoutNodes = applyLayout(tradeErpNodes, tradeErpEdges, {
  algorithm: 'dagre',
  direction: 'LR',
  nodeWidth: 280,
  nodeHeight: 120,
  nodeSpacing: 100,
  rankSpacing: 200,
});

interface OntologyState {
  // Current ontology
  ontology: Ontology | null;
  
  // Canvas state
  nodes: OntologyNode[];
  edges: OntologyEdge[];
  
  // Selection state
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  selectedActionId: string | null;
  
  // UI state
  isPanelOpen: boolean;
  panelMode: 'create' | 'edit' | null;
  panelType: 'objectType' | 'linkType' | 'interface' | 'action' | null;
  
  // Actions
  createOntology: (name: string, description?: string) => void;
  
  // Object Type actions
  addObjectType: (objectType: Omit<ObjectType, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateObjectType: (id: string, updates: Partial<ObjectType>) => void;
  deleteObjectType: (id: string) => void;
  
  // Link Type actions
  addLinkType: (linkType: Omit<LinkType, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateLinkType: (id: string, updates: Partial<LinkType>) => void;
  deleteLinkType: (id: string) => void;
  
  // Interface actions
  addInterface: (iface: Omit<Interface, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateInterface: (id: string, updates: Partial<Interface>) => void;
  deleteInterface: (id: string) => void;
  
  // Action actions
  addAction: (action: Omit<Action, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateAction: (id: string, updates: Partial<Action>) => void;
  deleteAction: (id: string) => void;
  
  // Canvas actions
  setNodes: (nodes: OntologyNode[]) => void;
  setEdges: (edges: OntologyEdge[]) => void;
  updateNodePosition: (id: string, position: { x: number; y: number }) => void;
  
  // Selection actions
  setSelectedNode: (id: string | null) => void;
  setSelectedEdge: (id: string | null) => void;
  setSelectedAction: (id: string | null) => void;
  
  // Panel actions
  openPanel: (mode: 'create' | 'edit', type: 'objectType' | 'linkType' | 'interface' | 'action') => void;
  closePanel: () => void;
  
  // Import/Export
  exportOntology: () => string;
  importOntology: (json: string) => void;
  
  // Reset
  reset: () => void;
  
  // Auto Layout
  autoLayout: (algorithm: LayoutAlgorithm, direction?: LayoutDirection) => void;
}

const now = () => new Date().toISOString();

export const useOntologyStore = create<OntologyState>()(
  persist(
    (set, get) => ({
      ontology: tradeErpOntology,
      nodes: defaultLayoutNodes,
      edges: tradeErpEdges,
      selectedNodeId: null,
      selectedEdgeId: null,
      selectedActionId: null,
      isPanelOpen: false,
      panelMode: null,
      panelType: null,

      createOntology: (name, description) => {
        const newOntology: Ontology = {
          id: uuidv4(),
          name,
          description,
          version: '1.0.0',
          objectTypes: [],
          linkTypes: [],
          interfaces: [],
          actions: [],
          createdAt: now(),
          updatedAt: now(),
        };
        set({ ontology: newOntology, nodes: [], edges: [] });
      },

      addObjectType: (objectType) => {
        const id = uuidv4();
        const newObjectType: ObjectType = {
          ...objectType,
          id,
          createdAt: now(),
          updatedAt: now(),
        };
        
        set((state) => {
          if (!state.ontology) return state;
          
          const newNode: OntologyNode = {
            id,
            type: 'objectType',
            position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
            data: newObjectType,
          };
          
          return {
            ontology: {
              ...state.ontology,
              objectTypes: [...state.ontology.objectTypes, newObjectType],
              updatedAt: now(),
            },
            nodes: [...state.nodes, newNode],
          };
        });
        
        return id;
      },

      updateObjectType: (id, updates) => {
        set((state) => {
          if (!state.ontology) return state;
          
          const updatedObjectTypes = state.ontology.objectTypes.map((ot) =>
            ot.id === id ? { ...ot, ...updates, updatedAt: now() } : ot
          );
          
          const updatedNodes = state.nodes.map((node) =>
            node.id === id && node.type === 'objectType'
              ? { ...node, data: { ...node.data, ...updates, updatedAt: now() } }
              : node
          );
          
          return {
            ontology: {
              ...state.ontology,
              objectTypes: updatedObjectTypes,
              updatedAt: now(),
            },
            nodes: updatedNodes,
          };
        });
      },

      deleteObjectType: (id) => {
        set((state) => {
          if (!state.ontology) return state;
          
          return {
            ontology: {
              ...state.ontology,
              objectTypes: state.ontology.objectTypes.filter((ot) => ot.id !== id),
              linkTypes: state.ontology.linkTypes.filter(
                (lt) => lt.sourceObjectTypeId !== id && lt.targetObjectTypeId !== id
              ),
              updatedAt: now(),
            },
            nodes: state.nodes.filter((node) => node.id !== id),
            edges: state.edges.filter((edge) => edge.source !== id && edge.target !== id),
            selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
          };
        });
      },

      addLinkType: (linkType) => {
        const id = uuidv4();
        const newLinkType: LinkType = {
          ...linkType,
          id,
          createdAt: now(),
          updatedAt: now(),
        };
        
        set((state) => {
          if (!state.ontology) return state;
          
          const newEdge: OntologyEdge = {
            id,
            source: linkType.sourceObjectTypeId,
            target: linkType.targetObjectTypeId,
            type: 'link',
            data: newLinkType,
            label: linkType.displayName,
          };
          
          return {
            ontology: {
              ...state.ontology,
              linkTypes: [...state.ontology.linkTypes, newLinkType],
              updatedAt: now(),
            },
            edges: [...state.edges, newEdge],
          };
        });
        
        return id;
      },

      updateLinkType: (id, updates) => {
        set((state) => {
          if (!state.ontology) return state;
          
          const updatedLinkTypes = state.ontology.linkTypes.map((lt) =>
            lt.id === id ? { ...lt, ...updates, updatedAt: now() } : lt
          );
          
          const updatedEdges = state.edges.map((edge) =>
            edge.id === id
              ? { 
                  ...edge, 
                  data: edge.data ? { ...edge.data, ...updates, updatedAt: now() } : undefined,
                  label: updates.displayName || edge.label,
                }
              : edge
          );
          
          return {
            ontology: {
              ...state.ontology,
              linkTypes: updatedLinkTypes,
              updatedAt: now(),
            },
            edges: updatedEdges,
          };
        });
      },

      deleteLinkType: (id) => {
        set((state) => {
          if (!state.ontology) return state;
          
          return {
            ontology: {
              ...state.ontology,
              linkTypes: state.ontology.linkTypes.filter((lt) => lt.id !== id),
              updatedAt: now(),
            },
            edges: state.edges.filter((edge) => edge.id !== id),
            selectedEdgeId: state.selectedEdgeId === id ? null : state.selectedEdgeId,
          };
        });
      },

      addInterface: (iface) => {
        const id = uuidv4();
        const newInterface: Interface = {
          ...iface,
          id,
          createdAt: now(),
          updatedAt: now(),
        };
        
        set((state) => {
          if (!state.ontology) return state;
          
          const newNode: OntologyNode = {
            id,
            type: 'interface',
            position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
            data: newInterface,
          };
          
          return {
            ontology: {
              ...state.ontology,
              interfaces: [...state.ontology.interfaces, newInterface],
              updatedAt: now(),
            },
            nodes: [...state.nodes, newNode],
          };
        });
        
        return id;
      },

      updateInterface: (id, updates) => {
        set((state) => {
          if (!state.ontology) return state;
          
          const updatedInterfaces = state.ontology.interfaces.map((i) =>
            i.id === id ? { ...i, ...updates, updatedAt: now() } : i
          );
          
          const updatedNodes = state.nodes.map((node) =>
            node.id === id && node.type === 'interface'
              ? { ...node, data: { ...node.data, ...updates, updatedAt: now() } }
              : node
          );
          
          return {
            ontology: {
              ...state.ontology,
              interfaces: updatedInterfaces,
              updatedAt: now(),
            },
            nodes: updatedNodes,
          };
        });
      },

      deleteInterface: (id) => {
        set((state) => {
          if (!state.ontology) return state;
          
          return {
            ontology: {
              ...state.ontology,
              interfaces: state.ontology.interfaces.filter((i) => i.id !== id),
              updatedAt: now(),
            },
            nodes: state.nodes.filter((node) => node.id !== id),
            edges: state.edges.filter((edge) => edge.source !== id && edge.target !== id),
            selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
          };
        });
      },

      addAction: (action) => {
        const id = uuidv4();
        const newAction: Action = {
          ...action,
          id,
          createdAt: now(),
          updatedAt: now(),
        };
        
        set((state) => {
          if (!state.ontology) return state;
          
          return {
            ontology: {
              ...state.ontology,
              actions: [...state.ontology.actions, newAction],
              updatedAt: now(),
            },
          };
        });
        
        return id;
      },

      updateAction: (id, updates) => {
        set((state) => {
          if (!state.ontology) return state;
          
          return {
            ontology: {
              ...state.ontology,
              actions: state.ontology.actions.map((a) =>
                a.id === id ? { ...a, ...updates, updatedAt: now() } : a
              ),
              updatedAt: now(),
            },
          };
        });
      },

      deleteAction: (id) => {
        set((state) => {
          if (!state.ontology) return state;
          
          return {
            ontology: {
              ...state.ontology,
              actions: state.ontology.actions.filter((a) => a.id !== id),
              updatedAt: now(),
            },
          };
        });
      },

      setNodes: (nodes) => set({ nodes }),
      
      setEdges: (edges) => set({ edges }),
      
      updateNodePosition: (id, position) => {
        set((state) => ({
          nodes: state.nodes.map((node) =>
            node.id === id ? { ...node, position } : node
          ),
        }));
      },

      setSelectedNode: (id) => set({ selectedNodeId: id, selectedEdgeId: null }),
      
      setSelectedEdge: (id) => set({ selectedEdgeId: id, selectedNodeId: null, selectedActionId: null }),
      
      setSelectedAction: (id) => set({ selectedActionId: id, selectedNodeId: null, selectedEdgeId: null }),

      openPanel: (mode, type) => set({ isPanelOpen: true, panelMode: mode, panelType: type }),
      
      closePanel: () => set({ isPanelOpen: false, panelMode: null, panelType: null }),

      exportOntology: () => {
        const state = get();
        const exportData = {
          ontology: state.ontology,
          nodes: state.nodes,
          edges: state.edges,
        };
        return JSON.stringify(exportData, null, 2);
      },

      importOntology: (json) => {
        try {
          const data = JSON.parse(json);
          set({
            ontology: data.ontology,
            nodes: data.nodes || [],
            edges: data.edges || [],
            selectedNodeId: null,
            selectedEdgeId: null,
            selectedActionId: null,
          });
        } catch (error) {
          console.error('Failed to import ontology:', error);
        }
      },

      reset: () => {
        set({
          ontology: tradeErpOntology,
          nodes: defaultLayoutNodes,
          edges: tradeErpEdges,
          selectedNodeId: null,
          selectedEdgeId: null,
          selectedActionId: null,
          isPanelOpen: false,
          panelMode: null,
          panelType: null,
        });
      },

      autoLayout: (algorithm, direction = 'TB') => {
        const state = get();
        const options: LayoutOptions = {
          algorithm,
          direction,
          nodeWidth: 280,
          nodeHeight: 120,
          nodeSpacing: 100,
          rankSpacing: 180,
        };
        const newNodes = applyLayout(state.nodes, state.edges, options);
        set({ nodes: newNodes });
      },
    }),
    {
      name: 'ontology-storage',
      version: 9, // Increment to apply default LR layout
      migrate: (persistedState: unknown, version: number) => {
        if (version < 9) {
          return {
            ontology: tradeErpOntology,
            nodes: defaultLayoutNodes,
            edges: tradeErpEdges,
            selectedNodeId: null,
            selectedEdgeId: null,
            selectedActionId: null,
            isPanelOpen: false,
            panelMode: null,
            panelType: null,
          };
        }
        return persistedState as OntologyState;
      },
    }
  )
);
