import { memo } from "react";
import { Handle, NodeProps, Position } from 'reactflow';
import { BaseNode } from "./base-node";

const SynthesisNode = memo(({ data, selected }: NodeProps) => {
  const label = data?.label as string;
  
  return (
    <BaseNode selected={selected} className="w-80 text-sm font-bold">
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

SynthesisNode.displayName = "SynthesisNode";

export default SynthesisNode;