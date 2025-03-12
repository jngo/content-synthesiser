import { memo } from "react";
import { Handle, NodeProps, NodeToolbar, Position } from 'reactflow';
import { BaseNode } from "./base-node";
import { Button } from "@/components/ui/button";
import { Network, Loader2 } from "lucide-react"

interface IdeaNodeData {
  label: string;
  toolbarVisible?: boolean;
  isExpanding?: boolean;
  onExpand?: (nodeId: string) => void;
}

const IdeaNode = memo(({ data, selected, id }: NodeProps<IdeaNodeData>) => {
  const label = data?.label as string;
  
  const handleExpandClick = () => {
    if (data.onExpand && !data.isExpanding) {
      data.onExpand(id);
    }
  };
  
  return (
    <BaseNode selected={selected} className="w-56 text-sm">
      <div>{label}</div>

      <NodeToolbar isVisible={data.toolbarVisible} position={Position.Bottom}>
        <Button 
          variant="ghost" 
          size="icon" 
          className="p-1" 
          onClick={handleExpandClick}
          disabled={data.isExpanding}
        >
          {data.isExpanding ? (
            <Loader2 size={8} className="animate-spin" />
          ) : (
            <Network size={8} />
          )}
        </Button>
      </NodeToolbar>

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