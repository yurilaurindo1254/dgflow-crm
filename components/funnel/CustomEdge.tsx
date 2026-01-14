"use client";

import { 
  BaseEdge, 
  EdgeLabelRenderer, 
  EdgeProps, 
  getBezierPath
} from '@xyflow/react';
import { Badge } from '@/components/ui/badge';

export function CustomEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const conversionRate = (data as { conversionRate?: number } | undefined)?.conversionRate || 0;

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={{
        ...(style as React.CSSProperties),
        strokeWidth: 2,
        stroke: '#27272a'
      }} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <Badge 
            variant="outline" 
            className="bg-zinc-950 border-white/10 text-primary-500 font-bold px-2 py-0.5 shadow-lg backdrop-blur-md"
          >
            {conversionRate}%
          </Badge>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
