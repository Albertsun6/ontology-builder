/**
 * Layout algorithms for automatic node arrangement
 * 布局算法：自动排列画布节点
 */

import Dagre from '@dagrejs/dagre';
import type { OntologyNode, OntologyEdge } from '../types/ontology';

export type LayoutDirection = 'TB' | 'BT' | 'LR' | 'RL';
export type LayoutAlgorithm = 'dagre' | 'grid' | 'circular' | 'force';

export interface LayoutOptions {
  algorithm: LayoutAlgorithm;
  direction?: LayoutDirection;
  nodeWidth?: number;
  nodeHeight?: number;
  nodeSpacing?: number;
  rankSpacing?: number;
}

const DEFAULT_NODE_WIDTH = 280;
const DEFAULT_NODE_HEIGHT = 120;
const DEFAULT_NODE_SPACING = 80;
const DEFAULT_RANK_SPACING = 150;

/**
 * Dagre hierarchical layout
 * 层次布局：适合展示有向图的上下游关系
 */
export function dagreLayout(
  nodes: OntologyNode[],
  edges: OntologyEdge[],
  options: Partial<LayoutOptions> = {}
): OntologyNode[] {
  const {
    direction = 'TB',
    nodeWidth = DEFAULT_NODE_WIDTH,
    nodeHeight = DEFAULT_NODE_HEIGHT,
    nodeSpacing = DEFAULT_NODE_SPACING,
    rankSpacing = DEFAULT_RANK_SPACING,
  } = options;

  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  
  g.setGraph({ 
    rankdir: direction,
    nodesep: nodeSpacing,
    ranksep: rankSpacing,
    marginx: 50,
    marginy: 50,
  });

  // Add nodes to graph
  nodes.forEach((node) => {
    g.setNode(node.id, { 
      width: nodeWidth, 
      height: node.type === 'interface' ? nodeHeight * 0.8 : nodeHeight 
    });
  });

  // Add edges to graph
  edges.forEach((edge) => {
    if (g.hasNode(edge.source) && g.hasNode(edge.target)) {
      g.setEdge(edge.source, edge.target);
    }
  });

  // Run layout algorithm
  Dagre.layout(g);

  // Apply new positions to nodes
  return nodes.map((node) => {
    const graphNode = g.node(node.id);
    if (graphNode) {
      return {
        ...node,
        position: {
          x: graphNode.x - nodeWidth / 2,
          y: graphNode.y - nodeHeight / 2,
        },
      };
    }
    return node;
  });
}

/**
 * Grid layout
 * 网格布局：简单整齐，按类型分组
 */
export function gridLayout(
  nodes: OntologyNode[],
  options: Partial<LayoutOptions> = {}
): OntologyNode[] {
  const {
    nodeWidth = DEFAULT_NODE_WIDTH,
    nodeHeight = DEFAULT_NODE_HEIGHT,
    nodeSpacing = DEFAULT_NODE_SPACING,
  } = options;

  // Separate nodes by type
  const objectNodes = nodes.filter(n => n.type === 'objectType');
  const interfaceNodes = nodes.filter(n => n.type === 'interface');

  const cellWidth = nodeWidth + nodeSpacing;
  const cellHeight = nodeHeight + nodeSpacing;
  const startX = 100;
  const startY = 150;

  // Calculate grid dimensions
  const cols = Math.ceil(Math.sqrt(objectNodes.length));

  const result: OntologyNode[] = [];

  // Layout interfaces at top
  interfaceNodes.forEach((node, i) => {
    result.push({
      ...node,
      position: {
        x: startX + i * cellWidth,
        y: 20,
      },
    });
  });

  // Layout object types in grid
  objectNodes.forEach((node, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    result.push({
      ...node,
      position: {
        x: startX + col * cellWidth,
        y: startY + row * cellHeight,
      },
    });
  });

  return result;
}

/**
 * Circular layout
 * 圆形布局：所有节点排列在圆周上
 */
export function circularLayout(
  nodes: OntologyNode[],
  options: Partial<LayoutOptions> = {}
): OntologyNode[] {
  const { nodeWidth = DEFAULT_NODE_WIDTH } = options;

  // Separate by type
  const objectNodes = nodes.filter(n => n.type === 'objectType');
  const interfaceNodes = nodes.filter(n => n.type === 'interface');

  const totalObjects = objectNodes.length;
  const radius = Math.max(300, totalObjects * 50);
  const centerX = radius + 100;
  const centerY = radius + 150;

  const result: OntologyNode[] = [];

  // Interfaces in inner circle
  const innerRadius = radius * 0.4;
  interfaceNodes.forEach((node, i) => {
    const angle = (i / Math.max(1, interfaceNodes.length)) * 2 * Math.PI - Math.PI / 2;
    result.push({
      ...node,
      position: {
        x: centerX + innerRadius * Math.cos(angle) - nodeWidth / 2,
        y: centerY + innerRadius * Math.sin(angle) - 60,
      },
    });
  });

  // Object types in outer circle
  objectNodes.forEach((node, i) => {
    const angle = (i / totalObjects) * 2 * Math.PI - Math.PI / 2;
    result.push({
      ...node,
      position: {
        x: centerX + radius * Math.cos(angle) - nodeWidth / 2,
        y: centerY + radius * Math.sin(angle) - 60,
      },
    });
  });

  return result;
}

/**
 * Force-directed layout simulation
 * 力导向布局：模拟物理力使相关节点靠近
 */
export function forceLayout(
  nodes: OntologyNode[],
  edges: OntologyEdge[],
  options: Partial<LayoutOptions> = {}
): OntologyNode[] {
  const { 
    nodeWidth = DEFAULT_NODE_WIDTH,
    nodeSpacing = DEFAULT_NODE_SPACING * 2,
  } = options;

  // Initialize positions randomly if not set
  const positions: Map<string, { x: number; y: number; vx: number; vy: number }> = new Map();
  
  nodes.forEach((node, i) => {
    const angle = (i / nodes.length) * 2 * Math.PI;
    const radius = 400;
    positions.set(node.id, {
      x: 500 + radius * Math.cos(angle),
      y: 400 + radius * Math.sin(angle),
      vx: 0,
      vy: 0,
    });
  });

  // Build adjacency for attraction
  const adjacency = new Map<string, Set<string>>();
  edges.forEach((edge) => {
    if (!adjacency.has(edge.source)) adjacency.set(edge.source, new Set());
    if (!adjacency.has(edge.target)) adjacency.set(edge.target, new Set());
    adjacency.get(edge.source)!.add(edge.target);
    adjacency.get(edge.target)!.add(edge.source);
  });

  // Run simulation iterations
  const iterations = 100;
  const repulsionStrength = 5000;
  const attractionStrength = 0.05;
  const damping = 0.9;

  for (let iter = 0; iter < iterations; iter++) {
    // Apply repulsion between all nodes
    nodes.forEach((nodeA) => {
      const posA = positions.get(nodeA.id)!;
      nodes.forEach((nodeB) => {
        if (nodeA.id === nodeB.id) return;
        const posB = positions.get(nodeB.id)!;
        
        const dx = posA.x - posB.x;
        const dy = posA.y - posB.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const minDist = nodeWidth + nodeSpacing;
        
        if (dist < minDist * 2) {
          const force = repulsionStrength / (dist * dist);
          posA.vx += (dx / dist) * force;
          posA.vy += (dy / dist) * force;
        }
      });
    });

    // Apply attraction between connected nodes
    edges.forEach((edge) => {
      const posA = positions.get(edge.source);
      const posB = positions.get(edge.target);
      if (!posA || !posB) return;

      const dx = posB.x - posA.x;
      const dy = posB.y - posA.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const targetDist = nodeWidth + nodeSpacing * 1.5;
      
      const force = (dist - targetDist) * attractionStrength;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      
      posA.vx += fx;
      posA.vy += fy;
      posB.vx -= fx;
      posB.vy -= fy;
    });

    // Update positions
    positions.forEach((pos) => {
      pos.x += pos.vx;
      pos.y += pos.vy;
      pos.vx *= damping;
      pos.vy *= damping;
    });
  }

  // Apply positions and normalize to positive coordinates
  let minX = Infinity, minY = Infinity;
  positions.forEach((pos) => {
    minX = Math.min(minX, pos.x);
    minY = Math.min(minY, pos.y);
  });

  return nodes.map((node) => {
    const pos = positions.get(node.id)!;
    return {
      ...node,
      position: {
        x: pos.x - minX + 100,
        y: pos.y - minY + 100,
      },
    };
  });
}

/**
 * Main layout function - dispatches to appropriate algorithm
 */
export function applyLayout(
  nodes: OntologyNode[],
  edges: OntologyEdge[],
  options: LayoutOptions
): OntologyNode[] {
  switch (options.algorithm) {
    case 'dagre':
      return dagreLayout(nodes, edges, options);
    case 'grid':
      return gridLayout(nodes, options);
    case 'circular':
      return circularLayout(nodes, options);
    case 'force':
      return forceLayout(nodes, edges, options);
    default:
      return dagreLayout(nodes, edges, options);
  }
}

/**
 * Get layout algorithm info for UI
 */
export const LAYOUT_ALGORITHMS = [
  {
    id: 'dagre' as LayoutAlgorithm,
    name: '层次布局',
    description: '按依赖关系分层排列，适合展示业务流程',
    icon: '📊',
  },
  {
    id: 'grid' as LayoutAlgorithm,
    name: '网格布局',
    description: '整齐的网格排列，接口在顶部',
    icon: '⊞',
  },
  {
    id: 'circular' as LayoutAlgorithm,
    name: '圆形布局',
    description: '节点围成圆形，接口在中心',
    icon: '⭕',
  },
  {
    id: 'force' as LayoutAlgorithm,
    name: '力导向布局',
    description: '相关联的节点靠近，模拟物理力',
    icon: '🔮',
  },
];

export const LAYOUT_DIRECTIONS = [
  { id: 'TB' as LayoutDirection, name: '从上到下', icon: '↓' },
  { id: 'BT' as LayoutDirection, name: '从下到上', icon: '↑' },
  { id: 'LR' as LayoutDirection, name: '从左到右', icon: '→' },
  { id: 'RL' as LayoutDirection, name: '从右到左', icon: '←' },
];
