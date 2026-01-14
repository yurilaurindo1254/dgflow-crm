"use client";

import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { MetricNode } from './MetricNode';
import { CustomEdge } from './CustomEdge';
import { NodeDetailsSheet, NodeData } from './NodeDetailsSheet';
import { Button } from '@/components/ui/button';
import { Plus, Save, MousePointer2 } from 'lucide-react';

const nodeTypes = {
  ad_source: MetricNode,
  page: MetricNode,
  checkout: MetricNode,
  purchase: MetricNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

interface FunnelCanvasProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
}

export function FunnelCanvas({ initialNodes = [], initialEdges = [] }: FunnelCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeData, setSelectedNodeData] = React.useState<NodeData | null>(null);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, type: 'custom' }, eds)),
    [setEdges],
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNodeData(node.data as unknown as NodeData);
    setIsSheetOpen(true);
  }, []);

  const addNode = (type: keyof typeof nodeTypes) => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { type, label: `Nova ${type}`, sparkline: [] },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  return (
    <div className="w-full h-[calc(100vh-200px)] bg-zinc-950 rounded-2xl border border-white/5 overflow-hidden relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
      >
        <Background color="#18181b" variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls className="bg-zinc-900! border-white/5! fill-white!" />
        <MiniMap 
          nodeColor="#27272a" 
          maskColor="rgba(0, 0, 0, 0.7)" 
          className="bg-zinc-900/50! border-white/5!"
        />
        
        <Panel position="top-right" className="flex gap-2">
            <Button variant="outline" size="sm" className="bg-zinc-900 border-white/5 gap-2 hover:bg-zinc-800">
                <MousePointer2 size={14} /> Selecionar
            </Button>
            <Button variant="outline" size="sm" className="bg-primary-500/10 border-primary-500/20 text-primary-500 gap-2 hover:bg-primary-500/20">
                <Save size={14} /> Salvar Funil
            </Button>
        </Panel>

        <Panel position="bottom-center" className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 p-2 rounded-2xl flex gap-2 shadow-2xl">
            <Button variant="ghost" size="sm" onClick={() => addNode('ad_source')} className="text-zinc-400 hover:text-white hover:bg-white/5 gap-2">
                <Plus size={14} /> Tráfego
            </Button>
            <Button variant="ghost" size="sm" onClick={() => addNode('page')} className="text-zinc-400 hover:text-white hover:bg-white/5 gap-2">
                <Plus size={14} /> Página
            </Button>
            <Button variant="ghost" size="sm" onClick={() => addNode('checkout')} className="text-zinc-400 hover:text-white hover:bg-white/5 gap-2">
                <Plus size={14} /> Checkout
            </Button>
            <Button variant="ghost" size="sm" onClick={() => addNode('purchase')} className="text-zinc-400 hover:text-white hover:bg-white/5 gap-2">
                <Plus size={14} /> Venda
            </Button>
        </Panel>
      </ReactFlow>

      <NodeDetailsSheet 
        isOpen={isSheetOpen} 
        onOpenChange={setIsSheetOpen} 
        nodeData={selectedNodeData} 
      />
    </div>
  );
}
