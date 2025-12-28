/**
 * Force-directed graph visualization component
 * 力导向图可视化组件 - 类似 Obsidian 风格
 */

import { useEffect, useRef, useState, useCallback } from 'react';

interface GraphNode {
  id: string;
  label: string;
  displayName: string;
  color: string;
  icon?: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx?: number | null;  // Fixed position when dragging
  fy?: number | null;
  connections: number;
}

interface GraphLink {
  source: string;
  target: string;
  type: string;
  displayName: string;
}

interface ForceGraphProps {
  nodes: {
    label: string;
    displayName: string;
    color?: string;
    icon?: string;
  }[];
  links: {
    fromLabel: string;
    toLabel: string;
    type: string;
    displayName: string;
  }[];
  onNodeClick?: (nodeId: string) => void;
  selectedNode?: string | null;
  height?: number;
}

export function ForceGraph({ 
  nodes: inputNodes, 
  links: inputLinks, 
  onNodeClick,
  selectedNode,
  height = 500 
}: ForceGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const nodesRef = useRef<GraphNode[]>([]);
  const linksRef = useRef<GraphLink[]>([]);
  
  // Interaction state
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isSimulating, setIsSimulating] = useState(true);
  
  const dragStartRef = useRef({ x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  // Initialize nodes and links
  useEffect(() => {
    // Count connections for each node
    const connectionCount = new Map<string, number>();
    inputLinks.forEach(link => {
      connectionCount.set(link.fromLabel, (connectionCount.get(link.fromLabel) || 0) + 1);
      connectionCount.set(link.toLabel, (connectionCount.get(link.toLabel) || 0) + 1);
    });

    // Create graph nodes with random initial positions
    const width = containerRef.current?.clientWidth || 800;
    const centerX = width / 2;
    const centerY = height / 2;
    
    nodesRef.current = inputNodes.map((node, i) => {
      const angle = (i / inputNodes.length) * 2 * Math.PI;
      const radius = Math.min(width, height) * 0.3;
      return {
        id: node.label,
        label: node.label,
        displayName: node.displayName,
        color: node.color || '#6366f1',
        icon: node.icon,
        x: centerX + radius * Math.cos(angle) + (Math.random() - 0.5) * 50,
        y: centerY + radius * Math.sin(angle) + (Math.random() - 0.5) * 50,
        vx: 0,
        vy: 0,
        connections: connectionCount.get(node.label) || 0,
      };
    });

    linksRef.current = inputLinks.map(link => ({
      source: link.fromLabel,
      target: link.toLabel,
      type: link.type,
      displayName: link.displayName,
    }));

    setIsSimulating(true);
  }, [inputNodes, inputLinks, height]);

  // Force simulation
  const simulate = useCallback(() => {
    const nodes = nodesRef.current;
    const links = linksRef.current;
    const width = containerRef.current?.clientWidth || 800;
    const centerX = width / 2;
    const centerY = height / 2;

    // Physics parameters
    const repulsionStrength = 3000;
    const attractionStrength = 0.008;
    const centerStrength = 0.01;
    const damping = 0.85;
    const minDistance = 80;

    // Apply forces
    nodes.forEach(nodeA => {
      if (nodeA.fx !== null && nodeA.fx !== undefined) {
        nodeA.x = nodeA.fx;
        nodeA.vx = 0;
      }
      if (nodeA.fy !== null && nodeA.fy !== undefined) {
        nodeA.y = nodeA.fy;
        nodeA.vy = 0;
      }

      // Repulsion from other nodes
      nodes.forEach(nodeB => {
        if (nodeA.id === nodeB.id) return;
        
        const dx = nodeA.x - nodeB.x;
        const dy = nodeA.y - nodeB.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        
        if (dist < minDistance * 3) {
          const force = repulsionStrength / (dist * dist);
          if (nodeA.fx === null || nodeA.fx === undefined) {
            nodeA.vx += (dx / dist) * force * 0.1;
          }
          if (nodeA.fy === null || nodeA.fy === undefined) {
            nodeA.vy += (dy / dist) * force * 0.1;
          }
        }
      });

      // Center gravity
      if (nodeA.fx === null || nodeA.fx === undefined) {
        nodeA.vx += (centerX - nodeA.x) * centerStrength;
      }
      if (nodeA.fy === null || nodeA.fy === undefined) {
        nodeA.vy += (centerY - nodeA.y) * centerStrength;
      }
    });

    // Attraction along links
    links.forEach(link => {
      const source = nodes.find(n => n.id === link.source);
      const target = nodes.find(n => n.id === link.target);
      if (!source || !target) return;

      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const targetDist = minDistance * 2;
      
      const force = (dist - targetDist) * attractionStrength;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;

      if (source.fx === null || source.fx === undefined) {
        source.vx += fx;
        source.vy += fy;
      }
      if (target.fx === null || target.fx === undefined) {
        target.vx -= fx;
        target.vy -= fy;
      }
    });

    // Update positions
    let totalMovement = 0;
    nodes.forEach(node => {
      if (node.fx === null || node.fx === undefined) {
        node.vx *= damping;
        node.vy *= damping;
        node.x += node.vx;
        node.y += node.vy;
        totalMovement += Math.abs(node.vx) + Math.abs(node.vy);
      }
    });

    // Stop simulation if stable
    if (totalMovement < 0.5) {
      setIsSimulating(false);
    }

    return totalMovement > 0.1;
  }, [height]);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let running = true;

    const render = () => {
      if (!running) return;

      const width = containerRef.current?.clientWidth || 800;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      // Clear
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // Apply transform
      ctx.save();
      ctx.translate(transform.x, transform.y);
      ctx.scale(transform.scale, transform.scale);

      const nodes = nodesRef.current;
      const links = linksRef.current;

      // Draw links
      links.forEach(link => {
        const source = nodes.find(n => n.id === link.source);
        const target = nodes.find(n => n.id === link.target);
        if (!source || !target) return;

        const isHighlighted = 
          selectedNode === source.id || 
          selectedNode === target.id ||
          hoveredNode === source.id ||
          hoveredNode === target.id;

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.strokeStyle = isHighlighted ? 'rgba(139, 92, 246, 0.8)' : 'rgba(100, 116, 139, 0.3)';
        ctx.lineWidth = isHighlighted ? 2 : 1;
        ctx.stroke();

        // Draw arrow
        if (isHighlighted) {
          const angle = Math.atan2(target.y - source.y, target.x - source.x);
          const arrowSize = 8;
          const midX = (source.x + target.x) / 2;
          const midY = (source.y + target.y) / 2;
          
          ctx.beginPath();
          ctx.moveTo(
            midX + arrowSize * Math.cos(angle),
            midY + arrowSize * Math.sin(angle)
          );
          ctx.lineTo(
            midX - arrowSize * Math.cos(angle - Math.PI / 6),
            midY - arrowSize * Math.sin(angle - Math.PI / 6)
          );
          ctx.lineTo(
            midX - arrowSize * Math.cos(angle + Math.PI / 6),
            midY - arrowSize * Math.sin(angle + Math.PI / 6)
          );
          ctx.closePath();
          ctx.fillStyle = 'rgba(139, 92, 246, 0.8)';
          ctx.fill();
        }

        // Draw link label on hover
        if (isHighlighted) {
          const midX = (source.x + target.x) / 2;
          const midY = (source.y + target.y) / 2;
          ctx.font = '10px sans-serif';
          ctx.fillStyle = 'rgba(203, 213, 225, 0.9)';
          ctx.textAlign = 'center';
          ctx.fillText(link.displayName, midX, midY - 8);
        }
      });

      // Draw nodes
      nodes.forEach(node => {
        const isSelected = selectedNode === node.id;
        const isHovered = hoveredNode === node.id;
        const isConnected = selectedNode && links.some(
          l => (l.source === selectedNode && l.target === node.id) ||
               (l.target === selectedNode && l.source === node.id)
        );

        // Node size based on connections
        const baseRadius = 20;
        const radius = baseRadius + Math.min(node.connections * 2, 15);

        // Glow effect
        if (isSelected || isHovered) {
          const gradient = ctx.createRadialGradient(
            node.x, node.y, radius,
            node.x, node.y, radius * 2.5
          );
          gradient.addColorStop(0, `${node.color}40`);
          gradient.addColorStop(1, 'transparent');
          ctx.fillStyle = gradient;
          ctx.fillRect(node.x - radius * 2.5, node.y - radius * 2.5, radius * 5, radius * 5);
        }

        // Node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        
        const opacity = (!selectedNode || isSelected || isConnected || isHovered) ? 1 : 0.3;
        ctx.fillStyle = isSelected || isHovered 
          ? node.color 
          : `${node.color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
        ctx.fill();

        // Border
        ctx.strokeStyle = isSelected ? '#fff' : isHovered ? '#e2e8f0' : 'rgba(255,255,255,0.2)';
        ctx.lineWidth = isSelected ? 3 : isHovered ? 2 : 1;
        ctx.stroke();

        // Icon or first letter
        ctx.font = `${radius * 0.8}px sans-serif`;
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.icon || node.displayName[0], node.x, node.y);

        // Label
        ctx.font = '11px sans-serif';
        ctx.fillStyle = opacity === 1 ? '#e2e8f0' : 'rgba(226, 232, 240, 0.3)';
        ctx.textAlign = 'center';
        ctx.fillText(node.displayName, node.x, node.y + radius + 14);

        // Connection count badge
        if (node.connections > 0 && (isSelected || isHovered)) {
          const badgeX = node.x + radius * 0.7;
          const badgeY = node.y - radius * 0.7;
          ctx.beginPath();
          ctx.arc(badgeX, badgeY, 10, 0, Math.PI * 2);
          ctx.fillStyle = '#8b5cf6';
          ctx.fill();
          ctx.font = 'bold 9px sans-serif';
          ctx.fillStyle = '#fff';
          ctx.fillText(String(node.connections), badgeX, badgeY);
        }
      });

      ctx.restore();

      // Simulation status indicator
      if (isSimulating) {
        ctx.font = '11px sans-serif';
        ctx.fillStyle = 'rgba(74, 222, 128, 0.8)';
        ctx.textAlign = 'left';
        ctx.fillText('● 布局优化中...', 10, 20);
      }

      // Run simulation
      if (isSimulating) {
        simulate();
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      running = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [transform, hoveredNode, selectedNode, isSimulating, simulate, height]);

  // Get node at position
  const getNodeAtPosition = useCallback((clientX: number, clientY: number): GraphNode | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left - transform.x) / transform.scale;
    const y = (clientY - rect.top - transform.y) / transform.scale;

    for (const node of nodesRef.current) {
      const radius = 20 + Math.min(node.connections * 2, 15);
      const dx = x - node.x;
      const dy = y - node.y;
      if (dx * dx + dy * dy < radius * radius) {
        return node;
      }
    }
    return null;
  }, [transform]);

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const node = getNodeAtPosition(e.clientX, e.clientY);
    if (node) {
      setDraggedNode(node.id);
      node.fx = node.x;
      node.fy = node.y;
      dragStartRef.current = { x: e.clientX, y: e.clientY };
    } else {
      isPanningRef.current = true;
      panStartRef.current = { 
        x: e.clientX, 
        y: e.clientY, 
        tx: transform.x, 
        ty: transform.y 
      };
    }
  }, [getNodeAtPosition, transform]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggedNode) {
      const node = nodesRef.current.find(n => n.id === draggedNode);
      if (node) {
        const dx = (e.clientX - dragStartRef.current.x) / transform.scale;
        const dy = (e.clientY - dragStartRef.current.y) / transform.scale;
        node.fx = node.x + dx;
        node.fy = node.y + dy;
        node.x = node.fx;
        node.y = node.fy;
        dragStartRef.current = { x: e.clientX, y: e.clientY };
        setIsSimulating(true);
      }
    } else if (isPanningRef.current) {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      setTransform(t => ({
        ...t,
        x: panStartRef.current.tx + dx,
        y: panStartRef.current.ty + dy,
      }));
    } else {
      const node = getNodeAtPosition(e.clientX, e.clientY);
      setHoveredNode(node?.id || null);
    }
  }, [draggedNode, getNodeAtPosition, transform.scale]);

  const handleMouseUp = useCallback(() => {
    if (draggedNode) {
      const node = nodesRef.current.find(n => n.id === draggedNode);
      if (node) {
        node.fx = null;
        node.fy = null;
      }
      setDraggedNode(null);
    }
    isPanningRef.current = false;
  }, [draggedNode]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const node = getNodeAtPosition(e.clientX, e.clientY);
    if (node && onNodeClick) {
      onNodeClick(node.id);
    }
  }, [getNodeAtPosition, onNodeClick]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(3, transform.scale * scaleFactor));

    // Zoom towards mouse position
    const scaleChange = newScale - transform.scale;
    const newX = transform.x - mouseX * scaleChange / transform.scale;
    const newY = transform.y - mouseY * scaleChange / transform.scale;

    setTransform({ x: newX, y: newY, scale: newScale });
  }, [transform]);

  // Reset view
  const resetView = useCallback(() => {
    setTransform({ x: 0, y: 0, scale: 1 });
    setIsSimulating(true);
  }, []);

  // Restart simulation
  const restartSimulation = useCallback(() => {
    const width = containerRef.current?.clientWidth || 800;
    const centerX = width / 2;
    const centerY = height / 2;
    
    nodesRef.current.forEach((node, i) => {
      const angle = (i / nodesRef.current.length) * 2 * Math.PI;
      const radius = Math.min(width, height) * 0.3;
      node.x = centerX + radius * Math.cos(angle) + (Math.random() - 0.5) * 100;
      node.y = centerY + radius * Math.sin(angle) + (Math.random() - 0.5) * 100;
      node.vx = 0;
      node.vy = 0;
      node.fx = null;
      node.fy = null;
    });
    setIsSimulating(true);
  }, [height]);

  return (
    <div ref={containerRef} className="relative w-full rounded-lg overflow-hidden bg-slate-900">
      {/* Controls */}
      <div className="absolute top-3 right-3 z-10 flex gap-2">
        <button
          onClick={restartSimulation}
          className="px-3 py-1.5 text-xs bg-slate-700/80 hover:bg-slate-600 text-white rounded-lg backdrop-blur-sm transition-colors"
          title="重新布局"
        >
          🔄 重排
        </button>
        <button
          onClick={resetView}
          className="px-3 py-1.5 text-xs bg-slate-700/80 hover:bg-slate-600 text-white rounded-lg backdrop-blur-sm transition-colors"
          title="重置视图"
        >
          ⊙ 重置
        </button>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-3 left-3 z-10 text-xs text-gray-500 bg-slate-900/80 px-2 py-1 rounded backdrop-blur-sm">
        拖拽节点 · 滚轮缩放 · 右键平移
      </div>

      {/* Zoom indicator */}
      <div className="absolute bottom-3 right-3 z-10 text-xs text-gray-500 bg-slate-900/80 px-2 py-1 rounded backdrop-blur-sm">
        {Math.round(transform.scale * 100)}%
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        style={{ height: `${height}px`, cursor: draggedNode ? 'grabbing' : hoveredNode ? 'pointer' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
        onWheel={handleWheel}
      />

      {/* Selected node info panel */}
      {selectedNode && (
        <div className="absolute top-3 left-3 z-10 bg-slate-800/95 border border-slate-600 rounded-lg p-3 max-w-[200px] backdrop-blur-sm">
          {(() => {
            const node = nodesRef.current.find(n => n.id === selectedNode);
            if (!node) return null;
            const connectedLinks = linksRef.current.filter(
              l => l.source === selectedNode || l.target === selectedNode
            );
            return (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <span 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-sm"
                    style={{ backgroundColor: node.color }}
                  >
                    {node.icon || node.displayName[0]}
                  </span>
                  <span className="font-medium text-white text-sm">{node.displayName}</span>
                </div>
                <div className="text-xs text-gray-400 mb-2">
                  <span className="font-mono text-violet-400">:{node.label}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {connectedLinks.length} 个关系连接
                </div>
                {connectedLinks.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-700 space-y-1">
                    {connectedLinks.slice(0, 5).map((link, i) => (
                      <div key={i} className="text-xs text-gray-400 truncate">
                        {link.source === selectedNode ? '→' : '←'} {link.displayName}
                      </div>
                    ))}
                    {connectedLinks.length > 5 && (
                      <div className="text-xs text-gray-500">+{connectedLinks.length - 5} 更多...</div>
                    )}
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}

export default ForceGraph;
