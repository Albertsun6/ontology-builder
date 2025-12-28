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
} from '@heroicons/react/24/outline';
import { useOntologyStore } from '../../store/ontologyStore';

type TabType = 'overview' | 'schema' | 'cypher' | 'export';

interface GraphDatabaseViewProps {
  isOpen?: boolean;
  onClose?: () => void;
  showTrigger?: boolean;
}

export const GraphDatabaseView = ({ isOpen: externalIsOpen, onClose, showTrigger = false }: GraphDatabaseViewProps) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  const { ontology } = useOntologyStore();

  // 生成图数据库 Schema
  const graphSchema = useMemo(() => {
    if (!ontology) {
      return { nodeLabels: [], relationships: [] };
    }
    const nodeLabels = ontology.objectTypes.map((ot) => ({
      label: ot.name.toUpperCase(),
      displayName: ot.displayName,
      properties: ot.properties.map((p) => ({
        name: p.name,
        type: mapToNeo4jType(p.type),
        required: p.required,
        isKey: p.name === ot.primaryKey,
      })),
      color: ot.color,
      icon: ot.icon,
    }));

    const relationships = ontology.linkTypes.map((lt) => {
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

  // 生成 Cypher 语句
  const cypherStatements = useMemo(() => {
    const statements: { title: string; code: string; description: string }[] = [];

    // 1. 创建约束语句
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
        title: '创建唯一性约束',
        code: constraints.join('\n\n'),
        description: '为每个节点类型的主键创建唯一性约束',
      });
    }

    // 2. 创建节点示例
    const createNodes = graphSchema.nodeLabels.map((node) => {
      const props = node.properties
        .map((p) => `  ${p.name}: ${getExampleValue(p.type)}`)
        .join(',\n');
      return `CREATE (n:${node.label} {\n${props}\n})`;
    });

    statements.push({
      title: '创建节点示例',
      code: createNodes.join('\n\n'),
      description: '创建各类型节点的示例语句',
    });

    // 3. 创建关系示例
    const createRels = graphSchema.relationships.map((rel) => {
      return `MATCH (a:${rel.fromLabel}), (b:${rel.toLabel})
WHERE a.id = $fromId AND b.id = $toId
CREATE (a)-[:${rel.type}]->(b)`;
    });

    if (createRels.length > 0) {
      statements.push({
        title: '创建关系示例',
        code: createRels.join('\n\n'),
        description: '建立节点间关系的示例语句',
      });
    }

    // 4. 查询示例
    const queries: string[] = [];
    
    // 查询所有节点
    if (graphSchema.nodeLabels.length > 0) {
      const firstNode = graphSchema.nodeLabels[0];
      queries.push(`// 查询所有 ${firstNode.displayName}
MATCH (n:${firstNode.label})
RETURN n LIMIT 10`);
    }

    // 查询关系
    if (graphSchema.relationships.length > 0) {
      const firstRel = graphSchema.relationships[0];
      queries.push(`// 查询 ${firstRel.displayName} 关系
MATCH (a:${firstRel.fromLabel})-[r:${firstRel.type}]->(b:${firstRel.toLabel})
RETURN a, r, b LIMIT 10`);
    }

    // 路径查询
    if (graphSchema.nodeLabels.length >= 2) {
      queries.push(`// 查找两个节点间的路径
MATCH path = shortestPath((a)-[*]-(b))
WHERE a.id = $startId AND b.id = $endId
RETURN path`);
    }

    if (queries.length > 0) {
      statements.push({
        title: '常用查询',
        code: queries.join('\n\n'),
        description: 'Cypher 查询语句示例',
      });
    }

    return statements;
  }, [graphSchema]);

  // 导出完整 Schema
  const exportSchema = useMemo(() => {
    const lines: string[] = [
      '// ========================================',
      '// Neo4j Graph Database Schema',
      '// Generated from Ontology Builder',
      `// Date: ${new Date().toISOString()}`,
      '// ========================================',
      '',
      '// === Node Labels ===',
      '',
    ];

    graphSchema.nodeLabels.forEach((node) => {
      lines.push(`// ${node.displayName} (${node.label})`);
      lines.push(`// Properties:`);
      node.properties.forEach((p) => {
        const keyMark = p.isKey ? ' [PRIMARY KEY]' : '';
        const reqMark = p.required ? ' (required)' : '';
        lines.push(`//   - ${p.name}: ${p.type}${keyMark}${reqMark}`);
      });
      lines.push('');
    });

    lines.push('// === Relationships ===');
    lines.push('');

    graphSchema.relationships.forEach((rel) => {
      lines.push(`// ${rel.displayName}`);
      lines.push(`// (${rel.fromLabel})-[:${rel.type}]->(${rel.toLabel})`);
      lines.push(`// Cardinality: ${rel.cardinality}`);
      lines.push('');
    });

    lines.push('// === Constraints ===');
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

    lines.push('// === Indexes ===');
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

  const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: '概览', icon: ChartBarIcon },
    { id: 'schema', label: 'Schema', icon: CubeIcon },
    { id: 'cypher', label: 'Cypher', icon: CommandLineIcon },
    { id: 'export', label: '导出', icon: CodeBracketIcon },
  ];

  return (
    <>
      {/* 触发按钮 - 仅在 showTrigger 为 true 时显示 */}
      {showTrigger && (
        <button
          onClick={() => setInternalIsOpen(true)}
          className="fixed bottom-6 right-44 z-40 flex items-center gap-2 px-4 py-3 
            bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500
            text-white rounded-full shadow-lg shadow-violet-900/30
            transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-violet-800/40"
          title="图数据库视图"
        >
          <CircleStackIcon className="w-5 h-5" />
          <span className="text-sm font-medium">图数据库</span>
        </button>
      )}

      {/* 面板 */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          <div className="relative w-full max-w-3xl bg-gradient-to-b from-slate-900 to-slate-950 
            shadow-2xl shadow-black/50 flex flex-col animate-slide-in-right">
            {/* 头部 */}
            <div className="flex items-center justify-between px-6 py-4 
              bg-gradient-to-r from-violet-900/50 to-purple-900/50 border-b border-violet-800/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-600/20">
                  <CircleStackIcon className="w-6 h-6 text-violet-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">图数据库视图</h2>
                  <p className="text-sm text-violet-300/70">Neo4j / Graph Database Schema</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Tab 导航 */}
            <div className="flex border-b border-slate-800">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors
                    ${activeTab === tab.id
                      ? 'text-violet-400 border-b-2 border-violet-400 bg-violet-500/10'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                    }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 内容区域 */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* 统计卡片 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 
                      border border-indigo-500/30 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-500/20">
                          <CubeIcon className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-white">
                            {graphSchema.nodeLabels.length}
                          </div>
                          <div className="text-sm text-indigo-300/70">节点类型 (Labels)</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 
                      border border-cyan-500/30 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-cyan-500/20">
                          <ArrowsRightLeftIcon className="w-6 h-6 text-cyan-400" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-white">
                            {graphSchema.relationships.length}
                          </div>
                          <div className="text-sm text-cyan-300/70">关系类型 (Types)</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 概念映射说明 */}
                  <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                    <h3 className="text-lg font-semibold text-white mb-4">本体 → 图数据库 映射</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="w-28 text-gray-400">对象类型</span>
                        <span className="text-violet-400">→</span>
                        <span className="text-white font-medium">节点标签 (Node Label)</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="w-28 text-gray-400">属性</span>
                        <span className="text-violet-400">→</span>
                        <span className="text-white font-medium">节点属性 (Properties)</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="w-28 text-gray-400">链接类型</span>
                        <span className="text-violet-400">→</span>
                        <span className="text-white font-medium">关系类型 (Relationship Type)</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="w-28 text-gray-400">主键</span>
                        <span className="text-violet-400">→</span>
                        <span className="text-white font-medium">唯一性约束 (Unique Constraint)</span>
                      </div>
                    </div>
                  </div>

                  {/* 图可视化预览 */}
                  <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                    <h3 className="text-lg font-semibold text-white mb-4">图结构预览</h3>
                    <div className="bg-slate-900 rounded-lg p-6 min-h-[200px] flex items-center justify-center">
                      <div className="flex flex-wrap items-center justify-center gap-4">
                        {graphSchema.nodeLabels.map((node, i) => (
                          <div key={node.label} className="flex items-center gap-2">
                            <div
                              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl
                                border-2 shadow-lg"
                              style={{
                                backgroundColor: `${node.color}20`,
                                borderColor: node.color,
                                boxShadow: `0 0 20px ${node.color}40`,
                              }}
                            >
                              {node.icon || '📦'}
                            </div>
                            {i < graphSchema.nodeLabels.length - 1 && graphSchema.relationships.length > 0 && (
                              <div className="flex items-center gap-1 text-gray-500">
                                <div className="w-8 h-0.5 bg-gray-600"></div>
                                <span className="text-xs">→</span>
                                <div className="w-8 h-0.5 bg-gray-600"></div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'schema' && (
                <div className="space-y-6">
                  {/* 节点类型 */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <CubeIcon className="w-5 h-5 text-indigo-400" />
                      节点类型 (Node Labels)
                    </h3>
                    <div className="space-y-3">
                      {graphSchema.nodeLabels.map((node) => (
                        <div
                          key={node.label}
                          className="bg-slate-800/50 rounded-lg p-4 border border-slate-700"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <span
                              className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                              style={{ backgroundColor: `${node.color}30` }}
                            >
                              {node.icon || '📦'}
                            </span>
                            <div>
                              <span className="font-mono text-indigo-400 font-medium">
                                :{node.label}
                              </span>
                              <span className="text-gray-400 text-sm ml-2">
                                ({node.displayName})
                              </span>
                            </div>
                          </div>
                          <div className="ml-11 space-y-1">
                            {node.properties.map((prop) => (
                              <div key={prop.name} className="flex items-center gap-2 text-sm">
                                <span className="text-gray-300">{prop.name}</span>
                                <span className="text-gray-500">:</span>
                                <span className="text-amber-400 font-mono text-xs">{prop.type}</span>
                                {prop.isKey && (
                                  <span className="px-1.5 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded">
                                    KEY
                                  </span>
                                )}
                                {prop.required && !prop.isKey && (
                                  <span className="text-red-400 text-xs">*</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 关系类型 */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <ArrowsRightLeftIcon className="w-5 h-5 text-cyan-400" />
                      关系类型 (Relationship Types)
                    </h3>
                    <div className="space-y-3">
                      {graphSchema.relationships.map((rel) => (
                        <div
                          key={rel.type}
                          className="bg-slate-800/50 rounded-lg p-4 border border-slate-700"
                        >
                          <div className="flex items-center gap-2 font-mono text-sm">
                            <span className="text-indigo-400">(:{rel.fromLabel})</span>
                            <span className="text-gray-500">-[</span>
                            <span className="text-cyan-400 font-medium">:{rel.type}</span>
                            <span className="text-gray-500">]-&gt;</span>
                            <span className="text-indigo-400">(:{rel.toLabel})</span>
                          </div>
                          <div className="mt-2 text-sm text-gray-400">
                            {rel.displayName} · 基数: {rel.cardinality}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'cypher' && (
                <div className="space-y-6">
                  {cypherStatements.map((stmt, i) => (
                    <div key={i} className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 bg-slate-800/80 border-b border-slate-700">
                        <div>
                          <h4 className="font-medium text-white">{stmt.title}</h4>
                          <p className="text-xs text-gray-400 mt-0.5">{stmt.description}</p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(stmt.code, `cypher-${i}`)}
                          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                          title="复制"
                        >
                          {copiedText === `cypher-${i}` ? (
                            <CheckIcon className="w-4 h-4 text-green-400" />
                          ) : (
                            <DocumentDuplicateIcon className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      <pre className="p-4 text-sm font-mono text-gray-300 overflow-x-auto whitespace-pre-wrap">
                        {stmt.code}
                      </pre>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'export' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">导出完整 Schema</h3>
                      <p className="text-sm text-gray-400">Neo4j 兼容的 Cypher 脚本</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(exportSchema, 'export-all')}
                      className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 
                        text-white rounded-lg transition-colors"
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

                  <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                    <pre className="p-4 text-sm font-mono text-gray-300 overflow-x-auto whitespace-pre max-h-[500px] overflow-y-auto">
                      {exportSchema}
                    </pre>
                  </div>

                  <div className="bg-violet-500/10 border border-violet-500/30 rounded-lg p-4">
                    <p className="text-sm text-violet-300">
                      💡 <strong>提示：</strong>将导出的脚本复制到 Neo4j Browser 中执行，即可创建对应的图数据库 Schema。
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 底部 */}
            <div className="px-6 py-4 bg-slate-900/80 border-t border-slate-800">
              <p className="text-xs text-gray-500 text-center">
                🔮 图数据库 · 支持 Neo4j 语法 · 基于 Cypher 查询语言
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

// 类型映射
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

// 生成示例值
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
