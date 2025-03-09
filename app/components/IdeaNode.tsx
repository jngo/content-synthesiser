import { memo } from "react";
import { Handle, NodeProps, Position } from 'reactflow';
import { BaseNode } from "./base-node";

const IdeaNode = memo(({ data, selected }: NodeProps) => {
  const label = data?.label as string;
  
  return (
    <BaseNode selected={selected} className="w-56 text-sm">
      <div>{label}</div>

      <Handle
        type="target"
        position={Position.Top}
      />
      <Handle
        type="source"
        position={Position.Bottom}
      />
    </BaseNode>
  );
});

IdeaNode.displayName = "IdeaNode";

export default IdeaNode;