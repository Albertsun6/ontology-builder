import { useState, useMemo } from 'react';
import {
  XMarkIcon,
  CircleStackIcon,
  CubeIcon,
  ArrowsRightLeftIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  CommandLineIcon,
  ChartBarIcon,
  CodeBracketIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  KeyIcon,
  HashtagIcon,
  LinkIcon,
  SparklesIcon,
  ServerIcon,
  CpuChipIcon,
  ChartPieIcon,
  TableCellsIcon,
  BeakerIcon,
} from '@heroicons/react/24/outline';
import { useOntologyStore } from '../../store/ontologyStore';

type TabType = 'overview' | 'visual' | 'schema' | 'cypher' | 'analytics' | 'export';

interface GraphDatabaseViewProps {
  isOpen?: boolean;
  onClose?: () => void;
  showTrigger?: boolean;
}

interface NodeLabel {
  label: string;
  displayName: string;
  properties: PropertyInfo[];
  color: string | undefined;
  icon: string | undefined;
}

interface PropertyInfo {
  name: string;
  type: string;
  required: boolean;
  isKey: boolean;
}

interface Relationship {
  type: string;
  displayName: string;
  fromLabel: string;
  toLabel: string;
  cardinality: string;
}

export const GraphDatabaseView = ({ isOpen: externalIsOpen, onClose, showTrigger = false }: GraphDatabaseViewProps) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'nodes' | 'relationships'>('all');

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  const { ontology } = useOntologyStore();

  // Generate graph database Schema
  const graphSchema = useMemo(() => {
    if (!ontology) {
      return { nodeLabels: [] as NodeLabel[], relationships: [] as Relationship[] };
    }
    const nodeLabels: NodeLabel[] = ontology.objectTypes.map((ot) => ({
      label: ot.name.toUpperCase(),
      displayName: ot.displayName,
      properties: ot.properties.map((p) => ({
        name: p.name,
        type: mapToNeo4jType(p.type),
        required: p.required,
        isKey: ot.properties.find(prop => prop.id === ot.primaryKey)?.name === p.name,
      })),
      color: ot.color,
      icon: ot.icon,
    }));

    const relationships: Relationship[] = ontology.linkTypes.map((lt) => {
      const source = ontology.objectTypes.find((ot) => ot.id === lt.sourceObjectTypeId);
      const target = ontology.objectTypes.find((ot) => ot.id === lt.targetObjectTypeId);
      return {
        type: lt.name.toUpperCase(),
        displayName: lt.displayName,
        fromLabel: source?.name.toUpperCase() || 'UNKNOWN',
        toLabel: target?.name.toUpperCase() || 'UNKNOWN',
        cardinality: lt.cardinality,
      };
    });

    return { nodeLabels, relationships };
  }, [ontology]);

  // Analytics data
  const analytics = useMemo(() => {
    const totalProperties = graphSchema.nodeLabels.reduce((sum, n) => sum + n.properties.length, 0);
    const avgPropsPerNode = graphSchema.nodeLabels.length > 0 
      ? (totalProperties / graphSchema.nodeLabels.length).toFixed(1) 
      : '0';
    
    // Find most connected nodes
    const nodeConnections = new Map<string, number>();
    graphSchema.relationships.forEach(rel => {
      nodeConnections.set(rel.fromLabel, (nodeConnections.get(rel.fromLabel) || 0) + 1);
      nodeConnections.set(rel.toLabel, (nodeConnections.get(rel.toLabel) || 0) + 1);
    });
    
    const sortedByConnections = Array.from(nodeConnections.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Cardinality distribution
    const cardinalityCount = {
      'one-to-one': 0,
      'one-to-many': 0,
      'many-to-one': 0,
      'many-to-many': 0,
    };
    graphSchema.relationships.forEach(rel => {
      cardinalityCount[rel.cardinality as keyof typeof cardinalityCount]++;
    });

    return {
      totalNodes: graphSchema.nodeLabels.length,
      totalRelationships: graphSchema.relationships.length,
      totalProperties,
      avgPropsPerNode,
      topConnected: sortedByConnections,
      cardinalityCount,
      density: graphSchema.nodeLabels.length > 1 
        ? (graphSchema.relationships.length / (graphSchema.nodeLabels.length * (graphSchema.nodeLabels.length - 1))).toFixed(3)
        : '0',
    };
  }, [graphSchema]);

  // Filtered schema based on search
  const filteredSchema = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return {
      nodeLabels: graphSchema.nodeLabels.filter(n => 
        (filterType === 'all' || filterType === 'nodes') &&
        (n.label.toLowerCase().includes(term) || n.displayName.toLowerCase().includes(term))
      ),
      relationships: graphSchema.relationships.filter(r =>
        (filterType === 'all' || filterType === 'relationships') &&
        (r.type.toLowerCase().includes(term) || r.displayName.toLowerCase().includes(term))
      ),
    };
  }, [graphSchema, searchTerm, filterType]);

  // Generate Cypher statements
  const cypherStatements = useMemo(() => {
    const statements: { title: string; code: string; description: string; category: string }[] = [];

    // 1. Constraints
    const constraints = graphSchema.nodeLabels.map((node) => {
      const keyProp = node.properties.find((p) => p.isKey);
      if (keyProp) {
        return `CREATE CONSTRAINT ${node.label.toLowerCase()}_${keyProp.name}_unique IF NOT EXISTS
FOR (n:${node.label})
REQUIRE n.${keyProp.name} IS UNIQUE;`;
      }
      return null;
    }).filter(Boolean);

    if (constraints.length > 0) {
      statements.push({
        title: '唯一性约束',
        code: constraints.join('\n\n'),
        description: '为主键创建唯一性约束',
        category: 'schema',
      });
    }

    // 2. Indexes
    const indexes = graphSchema.nodeLabels.map((node) => {
      const indexableProps = node.properties.filter((p) => !p.isKey && p.required);
      if (indexableProps.length > 0) {
        return `CREATE INDEX ${node.label.toLowerCase()}_idx IF NOT EXISTS
FOR (n:${node.label})
ON (${indexableProps.map((p) => `n.${p.name}`).join(', ')});`;
      }
      return null;
    }).filter(Boolean);

    if (indexes.length > 0) {
      statements.push({
        title: '索引创建',
        code: indexes.join('\n\n'),
        description: '为常用查询字段创建索引',
        category: 'schema',
      });
    }

    // 3. Create nodes
    const createNodes = graphSchema.nodeLabels.slice(0, 3).map((node) => {
      const props = node.properties.slice(0, 4)
        .map((p) => `  ${p.name}: ${getExampleValue(p.type)}`)
        .join(',\n');
      return `CREATE (n:${node.label} {\n${props}\n})`;
    });

    statements.push({
      title: '创建节点',
      code: createNodes.join('\n\n'),
      description: 'CREATE 语句示例',
      category: 'crud',
    });

    // 4. Create relationships
    const createRels = graphSchema.relationships.slice(0, 3).map((rel) => {
      return `MATCH (a:${rel.fromLabel}), (b:${rel.toLabel})
WHERE a.id = $fromId AND b.id = $toId
CREATE (a)-[:${rel.type}]->(b)`;
    });

    if (createRels.length > 0) {
      statements.push({
        title: '创建关系',
        code: createRels.join('\n\n'),
        description: '建立节点间关系',
        category: 'crud',
      });
    }

    // 5. Query patterns
    if (graphSchema.nodeLabels.length > 0) {
      const queries: string[] = [];
      const firstNode = graphSchema.nodeLabels[0];
      
      queries.push(`// 分页查询 ${firstNode.displayName}
MATCH (n:${firstNode.label})
RETURN n
ORDER BY n.created_at DESC
SKIP $skip LIMIT $limit`);

      if (graphSchema.relationships.length > 0) {
        const firstRel = graphSchema.relationships[0];
        queries.push(`// 查询 ${firstRel.displayName} 关系图
MATCH path = (a:${firstRel.fromLabel})-[r:${firstRel.type}]->(b:${firstRel.toLabel})
RETURN path LIMIT 25`);
      }

      queries.push(`// 聚合统计
MATCH (n:${firstNode.label})
RETURN count(n) as total,
       date(max(n.created_at)) as lastCreated`);

      statements.push({
        title: '常用查询',
        code: queries.join('\n\n'),
        description: 'MATCH 查询模式',
        category: 'query',
      });
    }

    // 6. Advanced patterns
    if (graphSchema.nodeLabels.length >= 2 && graphSchema.relationships.length >= 2) {
      const advQueries = [
        `// 多跳路径查询
MATCH path = (start)-[*1..3]-(end)
WHERE start.id = $startId
RETURN path, length(path) as hops
ORDER BY hops`,

        `// 聚合度数统计
MATCH (n)-[r]-()
RETURN labels(n)[0] as label, 
       count(DISTINCT n) as nodes,
       count(r) as relationships
ORDER BY relationships DESC`,
      ];

      statements.push({
        title: '高级查询',
        code: advQueries.join('\n\n'),
        description: '路径和聚合分析',
        category: 'advanced',
      });
    }

    return statements;
  }, [graphSchema]);

  // Export schema
  const exportSchema = useMemo(() => {
    const lines: string[] = [
      '// ========================================',
      '// Neo4j Graph Database Schema',
      '// Generated from Ontology Builder',
      `// Date: ${new Date().toISOString()}`,
      `// Nodes: ${graphSchema.nodeLabels.length}`,
      `// Relationships: ${graphSchema.relationships.length}`,
      '// ========================================',
      '',
    ];

    // Node labels section
    lines.push('// ╔════════════════════════════════════╗');
    lines.push('// ║          NODE LABELS               ║');
    lines.push('// ╚════════════════════════════════════╝');
    lines.push('');

    graphSchema.nodeLabels.forEach((node) => {
      lines.push(`// ${node.icon || '●'} ${node.displayName}`);
      lines.push(`// Label: :${node.label}`);
      lines.push('// Properties:');
      node.properties.forEach((p) => {
        const markers = [];
        if (p.isKey) markers.push('PRIMARY KEY');
        if (p.required) markers.push('NOT NULL');
        const markerStr = markers.length > 0 ? ` [${markers.join(', ')}]` : '';
        lines.push(`//   ${p.name}: ${p.type}${markerStr}`);
      });
      lines.push('');
    });

    // Relationships section
    lines.push('// ╔════════════════════════════════════╗');
    lines.push('// ║         RELATIONSHIPS              ║');
    lines.push('// ╚════════════════════════════════════╝');
    lines.push('');

    graphSchema.relationships.forEach((rel) => {
      lines.push(`// ${rel.displayName}`);
      lines.push(`// Pattern: (:${rel.fromLabel})-[:${rel.type}]->(:${rel.toLabel})`);
      lines.push(`// Cardinality: ${rel.cardinality}`);
      lines.push('');
    });

    // Constraints
    lines.push('// ╔════════════════════════════════════╗');
    lines.push('// ║          CONSTRAINTS               ║');
    lines.push('// ╚════════════════════════════════════╝');
    lines.push('');

    graphSchema.nodeLabels.forEach((node) => {
      const keyProp = node.properties.find((p) => p.isKey);
      if (keyProp) {
        lines.push(`CREATE CONSTRAINT ${node.label.toLowerCase()}_${keyProp.name}_unique IF NOT EXISTS`);
        lines.push(`FOR (n:${node.label})`);
        lines.push(`REQUIRE n.${keyProp.name} IS UNIQUE;`);
        lines.push('');
      }
    });

    // Indexes
    lines.push('// ╔════════════════════════════════════╗');
    lines.push('// ║           INDEXES                  ║');
    lines.push('// ╚════════════════════════════════════╝');
    lines.push('');

    graphSchema.nodeLabels.forEach((node) => {
      const indexableProps = node.properties.filter((p) => !p.isKey && p.required);
      if (indexableProps.length > 0) {
        lines.push(`CREATE INDEX ${node.label.toLowerCase()}_idx IF NOT EXISTS`);
        lines.push(`FOR (n:${node.label})`);
        lines.push(`ON (${indexableProps.map((p) => `n.${p.name}`).join(', ')});`);
        lines.push('');
      }
    });

    return lines.join('\n');
  }, [graphSchema]);

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const toggleNodeExpand = (label: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(label)) {
      newExpanded.delete(label);
    } else {
      newExpanded.add(label);
    }
    setExpandedNodes(newExpanded);
  };

  const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: '概览', icon: ChartBarIcon },
    { id: 'visual', label: '可视化', icon: SparklesIcon },
    { id: 'schema', label: 'Schema', icon: CubeIcon },
    { id: 'cypher', label: 'Cypher', icon: CommandLineIcon },
    { id: 'analytics', label: '分析', icon: ChartPieIcon },
    { id: 'export', label: '导出', icon: CodeBracketIcon },
  ];

  return (
    <>
      {showTrigger && (
        <button
          onClick={() => setInternalIsOpen(true)}
          className="fixed bottom-6 right-44 z-40 flex items-center gap-2 px-4 py-3 
            bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500
            text-white rounded-full shadow-lg shadow-violet-900/30
            transition-all duration-300 hover:scale-105"
          title="图数据库视图"
        >
          <CircleStackIcon className="w-5 h-5" />
          <span className="text-sm font-medium">图数据库</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
          />

          <div className="relative w-full max-w-4xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 
            shadow-2xl shadow-black/50 flex flex-col animate-slide-in-right">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 
              bg-gradient-to-r from-violet-900/60 to-purple-900/40 border-b border-violet-700/30">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500/30 to-purple-600/30 border border-violet-500/30">
                  <CircleStackIcon className="w-7 h-7 text-violet-300" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    图数据库视图
                    <span className="px-2 py-0.5 text-xs font-normal bg-violet-500/20 text-violet-300 rounded-full">
                      Neo4j
                    </span>
                  </h2>
                  <p className="text-sm text-violet-300/60">Graph Database Schema & Cypher Generator</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-400 hover:text-white" />
              </button>
            </div>

            {/* Tab navigation */}
            <div className="flex border-b border-slate-700/50 bg-slate-800/30">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all
                    ${activeTab === tab.id
                      ? 'text-violet-300 border-b-2 border-violet-400 bg-violet-500/10'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                    }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="p-6 space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-4 gap-4">
                    <StatCard 
                      icon={CubeIcon} 
                      value={analytics.totalNodes} 
                      label="节点类型" 
                      color="indigo"
                    />
                    <StatCard 
                      icon={ArrowsRightLeftIcon} 
                      value={analytics.totalRelationships} 
                      label="关系类型" 
                      color="cyan"
                    />
                    <StatCard 
                      icon={HashtagIcon} 
                      value={analytics.totalProperties} 
                      label="属性总数" 
                      color="amber"
                    />
                    <StatCard 
                      icon={LinkIcon} 
                      value={analytics.density} 
                      label="图密度" 
                      color="emerald"
                    />
                  </div>

                  {/* Mapping explanation */}
                  <div className="bg-gradient-to-br from-slate-800/60 to-slate-800/30 rounded-xl p-5 border border-slate-700/50">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <BeakerIcon className="w-5 h-5 text-violet-400" />
                      本体 → 图数据库 映射规则
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <MappingRow from="对象类型 (ObjectType)" to="节点标签 (:Label)" />
                      <MappingRow from="属性 (Property)" to="节点属性 {key: value}" />
                      <MappingRow from="链接类型 (LinkType)" to="关系 -[:TYPE]->" />
                      <MappingRow from="主键 (PrimaryKey)" to="唯一性约束 UNIQUE" />
                    </div>
                  </div>

                  {/* Quick preview */}
                  <div className="bg-gradient-to-br from-slate-800/60 to-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden">
                    <div className="px-5 py-3 border-b border-slate-700/50 flex items-center justify-between">
                      <h3 className="font-semibold text-white flex items-center gap-2">
                        <TableCellsIcon className="w-5 h-5 text-violet-400" />
                        Schema 概览
                      </h3>
                      <span className="text-xs text-gray-500">前 8 项</span>
                    </div>
                    <div className="p-4 grid grid-cols-4 gap-3">
                      {graphSchema.nodeLabels.slice(0, 8).map((node) => (
                        <div 
                          key={node.label}
                          className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 
                            cursor-pointer transition-colors border border-slate-600/30"
                          onClick={() => {
                            setActiveTab('schema');
                            setSelectedNode(node.label);
                          }}
                        >
                          <span 
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                            style={{ backgroundColor: `${node.color}25` }}
                          >
                            {node.icon || '📦'}
                          </span>
                          <div className="overflow-hidden">
                            <div className="text-sm font-medium text-white truncate">{node.displayName}</div>
                            <div className="text-xs text-gray-500">{node.properties.length} 属性</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Visual Tab */}
              {activeTab === 'visual' && (
                <div className="p-6 space-y-6">
                  {/* Interactive graph visualization */}
                  <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/80 rounded-xl border border-slate-700/50 overflow-hidden">
                    <div className="px-5 py-3 border-b border-slate-700/50 flex items-center justify-between">
                      <h3 className="font-semibold text-white flex items-center gap-2">
                        <SparklesIcon className="w-5 h-5 text-violet-400" />
                        Schema 可视化
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 rounded-full bg-indigo-500"></span> 节点
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-8 h-0.5 bg-cyan-500"></span> 关系
                        </span>
                      </div>
                    </div>
                    <div className="p-6 min-h-[400px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800/50 via-slate-900/80 to-slate-950">
                      <div className="relative w-full h-[350px]">
                        {/* Render nodes in a circle */}
                        {graphSchema.nodeLabels.map((node, i) => {
                          const totalNodes = graphSchema.nodeLabels.length;
                          const angle = (i / totalNodes) * 2 * Math.PI - Math.PI / 2;
                          const radius = 140;
                          const centerX = 50;
                          const centerY = 50;
                          const x = centerX + radius * Math.cos(angle) / 3.5;
                          const y = centerY + radius * Math.sin(angle) / 2;
                          
                          const relatedRels = graphSchema.relationships.filter(
                            r => r.fromLabel === node.label || r.toLabel === node.label
                          );
                          
                          return (
                            <div
                              key={node.label}
                              className={`absolute transform -translate-x-1/2 -translate-y-1/2 
                                cursor-pointer transition-all duration-300 group
                                ${selectedNode === node.label ? 'scale-110 z-10' : 'hover:scale-105'}`}
                              style={{ left: `${x}%`, top: `${y}%` }}
                              onClick={() => setSelectedNode(selectedNode === node.label ? null : node.label)}
                            >
                              <div 
                                className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl
                                  border-2 shadow-lg transition-all
                                  ${selectedNode === node.label ? 'ring-4 ring-violet-500/50' : ''}`}
                                style={{
                                  backgroundColor: `${node.color}20`,
                                  borderColor: node.color,
                                  boxShadow: `0 0 25px ${node.color}40`,
                                }}
                              >
                                {node.icon || '📦'}
                              </div>
                              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                <div className="text-xs font-medium text-white text-center">{node.displayName}</div>
                                <div className="text-xs text-gray-500 text-center">
                                  {relatedRels.length} 关系
                                </div>
                              </div>
                              
                              {/* Hover tooltip */}
                              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 
                                opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                                <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl min-w-[180px]">
                                  <div className="font-mono text-indigo-400 text-sm mb-2">:{node.label}</div>
                                  <div className="space-y-1 text-xs">
                                    {node.properties.slice(0, 4).map(p => (
                                      <div key={p.name} className="flex items-center gap-2">
                                        {p.isKey && <KeyIcon className="w-3 h-3 text-yellow-400" />}
                                        <span className="text-gray-300">{p.name}</span>
                                        <span className="text-gray-500">:</span>
                                        <span className="text-amber-400">{p.type}</span>
                                      </div>
                                    ))}
                                    {node.properties.length > 4 && (
                                      <div className="text-gray-500">+{node.properties.length - 4} more</div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        
                        {/* SVG lines for relationships */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: -1 }}>
                          <defs>
                            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                              <polygon points="0 0, 10 3.5, 0 7" fill="#06b6d4" fillOpacity="0.6" />
                            </marker>
                          </defs>
                          {graphSchema.relationships.slice(0, 20).map((rel, i) => {
                            const fromIdx = graphSchema.nodeLabels.findIndex(n => n.label === rel.fromLabel);
                            const toIdx = graphSchema.nodeLabels.findIndex(n => n.label === rel.toLabel);
                            if (fromIdx === -1 || toIdx === -1) return null;
                            
                            const totalNodes = graphSchema.nodeLabels.length;
                            const fromAngle = (fromIdx / totalNodes) * 2 * Math.PI - Math.PI / 2;
                            const toAngle = (toIdx / totalNodes) * 2 * Math.PI - Math.PI / 2;
                            const radius = 140;
                            
                            const x1 = 50 + radius * Math.cos(fromAngle) / 3.5;
                            const y1 = 50 + radius * Math.sin(fromAngle) / 2;
                            const x2 = 50 + radius * Math.cos(toAngle) / 3.5;
                            const y2 = 50 + radius * Math.sin(toAngle) / 2;
                            
                            const isHighlighted = selectedNode === rel.fromLabel || selectedNode === rel.toLabel;
                            
                            return (
                              <line
                                key={i}
                                x1={`${x1}%`}
                                y1={`${y1}%`}
                                x2={`${x2}%`}
                                y2={`${y2}%`}
                                stroke={isHighlighted ? '#06b6d4' : '#475569'}
                                strokeWidth={isHighlighted ? 2 : 1}
                                strokeOpacity={isHighlighted ? 0.8 : 0.3}
                                markerEnd={isHighlighted ? 'url(#arrowhead)' : undefined}
                              />
                            );
                          })}
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Selected node details */}
                  {selectedNode && (
                    <div className="bg-gradient-to-br from-violet-900/20 to-purple-900/10 rounded-xl border border-violet-500/30 p-5">
                      <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                        <CubeIcon className="w-5 h-5 text-violet-400" />
                        {graphSchema.nodeLabels.find(n => n.label === selectedNode)?.displayName}
                        <span className="font-mono text-indigo-400 text-sm">:{selectedNode}</span>
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-sm text-gray-400 mb-2">关联关系 (出)</h5>
                          <div className="space-y-1">
                            {graphSchema.relationships.filter(r => r.fromLabel === selectedNode).map(r => (
                              <div key={r.type} className="text-sm flex items-center gap-2">
                                <span className="text-cyan-400">-[:{r.type}]-&gt;</span>
                                <span className="text-gray-300">{r.toLabel}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h5 className="text-sm text-gray-400 mb-2">关联关系 (入)</h5>
                          <div className="space-y-1">
                            {graphSchema.relationships.filter(r => r.toLabel === selectedNode).map(r => (
                              <div key={r.type} className="text-sm flex items-center gap-2">
                                <span className="text-gray-300">{r.fromLabel}</span>
                                <span className="text-cyan-400">-[:{r.type}]-&gt;</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Schema Tab */}
              {activeTab === 'schema' && (
                <div className="p-6 space-y-6">
                  {/* Search and filter */}
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="text"
                        placeholder="搜索节点或关系..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg 
                          text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
                      {(['all', 'nodes', 'relationships'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => setFilterType(type)}
                          className={`px-4 py-2 text-sm transition-colors
                            ${filterType === type 
                              ? 'bg-violet-600 text-white' 
                              : 'text-gray-400 hover:text-white hover:bg-slate-700'}`}
                        >
                          {type === 'all' ? '全部' : type === 'nodes' ? '节点' : '关系'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Node labels */}
                  {(filterType === 'all' || filterType === 'nodes') && filteredSchema.nodeLabels.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <CubeIcon className="w-5 h-5 text-indigo-400" />
                        节点类型
                        <span className="text-sm font-normal text-gray-500">({filteredSchema.nodeLabels.length})</span>
                      </h3>
                      <div className="space-y-2">
                        {filteredSchema.nodeLabels.map((node) => (
                          <div
                            key={node.label}
                            className="bg-slate-800/40 rounded-lg border border-slate-700/50 overflow-hidden"
                          >
                            <button
                              onClick={() => toggleNodeExpand(node.label)}
                              className="w-full flex items-center gap-3 p-4 hover:bg-slate-700/30 transition-colors"
                            >
                              <span
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                                style={{ backgroundColor: `${node.color}25` }}
                              >
                                {node.icon || '📦'}
                              </span>
                              <div className="flex-1 text-left">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-indigo-400 font-medium">:{node.label}</span>
                                  <span className="text-gray-400 text-sm">({node.displayName})</span>
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5">
                                  {node.properties.length} 属性 · 
                                  {node.properties.filter(p => p.required).length} 必填
                                </div>
                              </div>
                              {expandedNodes.has(node.label) 
                                ? <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                                : <ChevronRightIcon className="w-5 h-5 text-gray-500" />
                              }
                            </button>
                            
                            {expandedNodes.has(node.label) && (
                              <div className="px-4 pb-4 pt-0">
                                <div className="ml-13 bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="text-gray-500 text-xs uppercase">
                                        <th className="text-left pb-2">属性名</th>
                                        <th className="text-left pb-2">类型</th>
                                        <th className="text-left pb-2">约束</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/30">
                                      {node.properties.map((prop) => (
                                        <tr key={prop.name}>
                                          <td className="py-2 text-gray-300 flex items-center gap-2">
                                            {prop.isKey && <KeyIcon className="w-4 h-4 text-yellow-400" />}
                                            {prop.name}
                                          </td>
                                          <td className="py-2">
                                            <span className="font-mono text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                                              {prop.type}
                                            </span>
                                          </td>
                                          <td className="py-2">
                                            {prop.isKey && (
                                              <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded mr-1">
                                                PRIMARY
                                              </span>
                                            )}
                                            {prop.required && (
                                              <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">
                                                NOT NULL
                                              </span>
                                            )}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Relationships */}
                  {(filterType === 'all' || filterType === 'relationships') && filteredSchema.relationships.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <ArrowsRightLeftIcon className="w-5 h-5 text-cyan-400" />
                        关系类型
                        <span className="text-sm font-normal text-gray-500">({filteredSchema.relationships.length})</span>
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {filteredSchema.relationships.map((rel) => (
                          <div
                            key={rel.type}
                            className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/50 hover:border-cyan-500/30 transition-colors"
                          >
                            <div className="font-mono text-sm mb-2">
                              <span className="text-indigo-400">(:{rel.fromLabel})</span>
                              <span className="text-gray-500">-[</span>
                              <span className="text-cyan-400 font-medium">:{rel.type}</span>
                              <span className="text-gray-500">]-&gt;</span>
                              <span className="text-indigo-400">(:{rel.toLabel})</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span>{rel.displayName}</span>
                              <span className="px-2 py-0.5 bg-slate-700/50 rounded">{rel.cardinality}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Cypher Tab */}
              {activeTab === 'cypher' && (
                <div className="p-6 space-y-4">
                  {/* Category filter */}
                  <div className="flex gap-2">
                    {['all', 'schema', 'crud', 'query', 'advanced'].map((cat) => (
                      <button
                        key={cat}
                        className="px-3 py-1.5 text-xs rounded-full bg-slate-800 text-gray-400 hover:bg-slate-700 hover:text-white transition-colors"
                      >
                        {cat === 'all' ? '全部' : cat === 'schema' ? 'Schema' : cat === 'crud' ? 'CRUD' : cat === 'query' ? '查询' : '高级'}
                      </button>
                    ))}
                  </div>

                  {cypherStatements.map((stmt, i) => (
                    <div key={i} className="bg-slate-800/40 rounded-xl border border-slate-700/50 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 bg-slate-800/60 border-b border-slate-700/50">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 text-xs rounded-full
                            ${stmt.category === 'schema' ? 'bg-violet-500/20 text-violet-400' :
                              stmt.category === 'crud' ? 'bg-green-500/20 text-green-400' :
                              stmt.category === 'query' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-amber-500/20 text-amber-400'}`}
                          >
                            {stmt.category.toUpperCase()}
                          </span>
                          <div>
                            <h4 className="font-medium text-white text-sm">{stmt.title}</h4>
                            <p className="text-xs text-gray-500">{stmt.description}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => copyToClipboard(stmt.code, `cypher-${i}`)}
                          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        >
                          {copiedText === `cypher-${i}` ? (
                            <CheckIcon className="w-4 h-4 text-green-400" />
                          ) : (
                            <DocumentDuplicateIcon className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      <pre className="p-4 text-sm font-mono text-gray-300 overflow-x-auto bg-slate-900/50">
                        <code>{stmt.code}</code>
                      </pre>
                    </div>
                  ))}
                </div>
              )}

              {/* Analytics Tab */}
              {activeTab === 'analytics' && (
                <div className="p-6 space-y-6">
                  {/* Overview stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 rounded-xl p-5 border border-indigo-500/20">
                      <div className="text-3xl font-bold text-white mb-1">{analytics.avgPropsPerNode}</div>
                      <div className="text-sm text-indigo-300/70">平均属性/节点</div>
                    </div>
                    <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 rounded-xl p-5 border border-cyan-500/20">
                      <div className="text-3xl font-bold text-white mb-1">{analytics.density}</div>
                      <div className="text-sm text-cyan-300/70">图密度系数</div>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 rounded-xl p-5 border border-emerald-500/20">
                      <div className="text-3xl font-bold text-white mb-1">
                        {analytics.totalNodes > 0 ? Math.round(analytics.totalRelationships / analytics.totalNodes * 10) / 10 : 0}
                      </div>
                      <div className="text-sm text-emerald-300/70">平均关系度</div>
                    </div>
                  </div>

                  {/* Top connected nodes */}
                  <div className="bg-slate-800/40 rounded-xl border border-slate-700/50 overflow-hidden">
                    <div className="px-5 py-3 border-b border-slate-700/50">
                      <h3 className="font-semibold text-white flex items-center gap-2">
                        <CpuChipIcon className="w-5 h-5 text-violet-400" />
                        连接度 Top 5
                      </h3>
                    </div>
                    <div className="p-4">
                      <div className="space-y-3">
                        {analytics.topConnected.map(([label, count], i) => {
                          const node = graphSchema.nodeLabels.find(n => n.label === label);
                          const maxCount = analytics.topConnected[0]?.[1] || 1;
                          return (
                            <div key={label} className="flex items-center gap-3">
                              <span className="w-6 text-center text-gray-500 text-sm">#{i + 1}</span>
                              <span 
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                                style={{ backgroundColor: `${node?.color || '#6366f1'}25` }}
                              >
                                {node?.icon || '📦'}
                              </span>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm text-white">{node?.displayName || label}</span>
                                  <span className="text-sm text-gray-500">{count} 关系</span>
                                </div>
                                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                                    style={{ width: `${(count / maxCount) * 100}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Cardinality distribution */}
                  <div className="bg-slate-800/40 rounded-xl border border-slate-700/50 overflow-hidden">
                    <div className="px-5 py-3 border-b border-slate-700/50">
                      <h3 className="font-semibold text-white flex items-center gap-2">
                        <ChartPieIcon className="w-5 h-5 text-violet-400" />
                        基数分布
                      </h3>
                    </div>
                    <div className="p-4 grid grid-cols-4 gap-3">
                      {Object.entries(analytics.cardinalityCount).map(([card, count]) => (
                        <div key={card} className="bg-slate-700/30 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold text-white mb-1">{count}</div>
                          <div className="text-xs text-gray-500">{card}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Export Tab */}
              {activeTab === 'export' && (
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">导出完整 Schema</h3>
                      <p className="text-sm text-gray-400">Neo4j 兼容的 Cypher 脚本</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const blob = new Blob([exportSchema], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'schema.cypher';
                          a.click();
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 
                          text-white rounded-lg transition-colors text-sm"
                      >
                        <ServerIcon className="w-4 h-4" />
                        下载文件
                      </button>
                      <button
                        onClick={() => copyToClipboard(exportSchema, 'export-all')}
                        className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 
                          text-white rounded-lg transition-colors text-sm"
                      >
                        {copiedText === 'export-all' ? (
                          <>
                            <CheckIcon className="w-4 h-4" />
                            已复制
                          </>
                        ) : (
                          <>
                            <DocumentDuplicateIcon className="w-4 h-4" />
                            复制全部
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-800/40 rounded-xl border border-slate-700/50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-800/60 border-b border-slate-700/50">
                      <span className="text-xs text-gray-500 font-mono">schema.cypher</span>
                      <span className="text-xs text-gray-500">{exportSchema.split('\n').length} lines</span>
                    </div>
                    <pre className="p-4 text-sm font-mono text-gray-300 overflow-x-auto max-h-[450px] overflow-y-auto bg-slate-900/50">
                      {exportSchema}
                    </pre>
                  </div>

                  <div className="bg-violet-500/10 border border-violet-500/30 rounded-lg p-4">
                    <p className="text-sm text-violet-300">
                      💡 <strong>使用方法：</strong>将导出的脚本复制到 Neo4j Browser 或 Aura 中执行，即可创建完整的图数据库 Schema。
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                🔮 图数据库视图 · 支持 Neo4j 5.x 语法
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  {analytics.totalNodes} Nodes
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                  {analytics.totalRelationships} Relationships
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-right { animation: slide-in-right 0.3s ease-out; }
      `}</style>
    </>
  );
};

// Helper components
function StatCard({ icon: Icon, value, label, color }: { 
  icon: React.ElementType; 
  value: number | string; 
  label: string; 
  color: string;
}) {
  const colorClasses = {
    indigo: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30 text-indigo-400',
    cyan: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-400',
    amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400',
    emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400',
  };
  const cls = colorClasses[color as keyof typeof colorClasses] || colorClasses.indigo;
  
  return (
    <div className={`bg-gradient-to-br ${cls} border rounded-xl p-4`}>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-white/5">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="text-2xl font-bold text-white">{value}</div>
          <div className="text-xs opacity-70">{label}</div>
        </div>
      </div>
    </div>
  );
}

function MappingRow({ from, to }: { from: string; to: string }) {
  return (
    <div className="flex items-center gap-3 text-sm bg-slate-700/20 rounded-lg p-3">
      <span className="text-gray-400 flex-1">{from}</span>
      <span className="text-violet-400">→</span>
      <span className="text-white font-medium flex-1">{to}</span>
    </div>
  );
}

// Type mapping
function mapToNeo4jType(type: string): string {
  const typeMap: Record<string, string> = {
    string: 'STRING',
    number: 'INTEGER',
    boolean: 'BOOLEAN',
    date: 'DATE',
    datetime: 'DATETIME',
    array: 'LIST',
    object: 'MAP',
    reference: 'STRING',
  };
  return typeMap[type] || 'STRING';
}

// Example value generator
function getExampleValue(type: string): string {
  const examples: Record<string, string> = {
    STRING: '"example_value"',
    INTEGER: '123',
    BOOLEAN: 'true',
    DATE: 'date("2025-01-01")',
    DATETIME: 'datetime()',
    LIST: '["item1", "item2"]',
    MAP: '{key: "value"}',
  };
  return examples[type] || '"value"';
}

export default GraphDatabaseView;
