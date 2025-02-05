import React, { useEffect, useRef, useState } from 'react';
import { SimpleTree, SimpleTreeOptions } from '../simple-tree';
import { Direction, INode } from '../types';
import { Controls } from './Controls';
import { DevToolbar } from './DevToolbar';
import { MarkmapFactory } from '../markmap-simple-tree';

export interface MindmapConfig {
  initialDirection?: Direction;
  width?: number;
  height?: number;
  backgroundColor?: string;
  controls?: {
    show?: boolean;
    position?: {
      top?: string;
      right?: string;
      bottom?: string;
      left?: string;
    };
    showDirectionControl?: boolean;
    showDataControl?: boolean;
  };
}

export interface MindmapProps {
  data: INode;
  config?: MindmapConfig;
  onNodeClick?: (node: INode) => void;
  onNodeShiftClick?: (node: INode) => void;
  onDirectionChange?: (direction: Direction) => void;
  className?: string;
  style?: React.CSSProperties;
}

const defaultConfig: MindmapConfig = {
  initialDirection: Direction.CENTER,
  backgroundColor: '#f5f5f5',
  controls: {
    show: true,
    position: {
      top: '20px',
      right: '20px',
    },
    showDirectionControl: true,
    showDataControl: true,
  },
};

export const Mindmap = ({
  data,
  config = {},
  onNodeClick,
  onNodeShiftClick,
  onDirectionChange,
  className,
  style,
}: MindmapProps) => {
  const mergedConfig = { ...defaultConfig, ...config };
  const containerRef = useRef<HTMLDivElement>(null);
  const treeRef = useRef<SimpleTree | null>(null);
  const [currentData, setCurrentData] = useState<INode>(data);
  const [highlightNode, setHighlightNode] = useState<INode | null>(null);
  const [direction, setDirection] = useState<Direction>(Direction.CENTER); //mergedConfig.initialDirection!);
  const [selectedNode, setSelectedNode] = useState<INode | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [totalNodes, setTotalNodes] = useState(0);

  const initializeTree = () => {
    if (!containerRef.current) return;

    const treeOptions: SimpleTreeOptions = {
      direction,
      width: mergedConfig.width || containerRef.current.clientWidth,
      height: mergedConfig.height || containerRef.current.clientHeight,
    };

    treeRef.current = MarkmapFactory.create(containerRef.current, treeOptions);

    // Set custom handler if onNodeClick is provided
    if (onNodeClick) {
      (treeRef.current as any).setCustomNodeHandler(
        (node: INode, event: React.MouseEvent) => {
          if (event.shiftKey) {
            if (node.children?.length) {
              node.children.forEach((child) => {
                if (!child.payload) child.payload = { fold: 0 };
                child.payload.fold = 1;
              });
              renderData(currentData);
            }
            onNodeShiftClick?.(node);
          } else {
            setSelectedNode(node);
            onNodeClick?.(node);
          }
        },
      );
    }

    renderData(currentData);
  };

  useEffect(() => {
    initializeTree();
    return () => {
      treeRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    setCurrentData(data);
  }, [data]);

  useEffect(() => {
    if (treeRef.current && currentData) {
      treeRef.current.setDirection(direction);
    }
  }, [direction, currentData]);

  useEffect(() => {
    setTotalNodes(countNodes(currentData));
  }, [currentData]);

  useEffect(() => {
    if (!treeRef.current) return;

    const svg = (treeRef.current as any).svg;
    svg.on('zoom.dev', (event: any) => {
      setZoomLevel(event.transform.k);
    });

    return () => svg.on('zoom.dev', null);
  }, []);

  const handleDirectionChange = (newDirection: Direction) => {
    setDirection(newDirection);
    onDirectionChange?.(newDirection);
  };

  const handleNodeClick = (node: INode, event: React.MouseEvent) => {
    if (event.shiftKey) {
      setHighlightNode(node);
      onNodeShiftClick?.(node);
    } else {
      setSelectedNode(node);
      onNodeClick?.(node);
    }
  };

  const renderData = (data: INode) => {
    if (treeRef.current) {
      treeRef.current.setCustomNodeHandler(handleNodeClick);
      treeRef.current.render(data);
    }
  };

  const countNodes = (node: INode): number => {
    return (
      1 +
      (node.children?.reduce((sum, child) => sum + countNodes(child), 0) || 0)
    );
  };

  const handleFitView = () => {
    treeRef.current?.fitView();
  };

  const handleCenterSelected = () => {
    if (selectedNode) {
      treeRef.current?.centerNode(selectedNode);
    }
  };

  const handleEnsureVisible = () => {
    if (selectedNode) {
      treeRef.current?.ensureVisible(selectedNode);
    }
  };

  const handleResetView = () => {
    treeRef.current?.resetView();
  };

  const handleExpandAll = () => {
    const expandNode = (node: INode) => {
      if (!node.payload) node.payload = { fold: 0 };
      node.payload.fold = 0;
      node.children?.forEach(expandNode);
    };
    expandNode(currentData);
    renderData(currentData);
  };

  const handleCollapseAll = () => {
    const collapseNode = (node: INode) => {
      if (!node.payload) node.payload = { fold: 0 };
      node.payload.fold = 1;
      node.children?.forEach(collapseNode);
    };
    collapseNode(currentData);
    renderData(currentData);
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        background: mergedConfig.backgroundColor,
        paddingTop: '48px',
        ...style,
      }}
    >
      <DevToolbar
        totalNodes={totalNodes}
        zoomLevel={zoomLevel}
        selectedNode={selectedNode}
        highlightedNode={highlightNode}
        onFitView={handleFitView}
        onCenterSelected={handleCenterSelected}
        onEnsureVisible={handleEnsureVisible}
        onResetView={handleResetView}
        onExpandAll={handleExpandAll}
        onCollapseAll={handleCollapseAll}
      />
      {mergedConfig.controls?.show && (
        <Controls
          direction={direction}
          onDirectionChange={handleDirectionChange}
          onDataTypeChange={() => {}} // This will be removed since data control is moving to playground
          style={{
            position: 'fixed',
            ...mergedConfig.controls.position,
          }}
          showDirectionControl={mergedConfig.controls.showDirectionControl}
          showDataControl={mergedConfig.controls.showDataControl}
        />
      )}
    </div>
  );
};
