import { memo, useState } from "react";
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
  const [isHovered, setIsHovered] = useState(false);
  
  const handleExpandClick = () => {
    if (data.onExpand && !data.isExpanding) {
      data.onExpand(id);
    }
  };
  
  return (
    <BaseNode
      selected={selected}
      className="w-56 text-sm"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div>{label}</div>

      <NodeToolbar isVisible={isHovered} position={Position.Bottom} offset={-10} className="rounded-md border bg-card p-0 gap-1 flex items-center">
        <Button 
          variant="ghost" 
          size="sm"
          className="p-1 text-xs"
          onClick={handleExpandClick}
          disabled={data.isExpanding}
        >
          {data.isExpanding ? (
            <><Loader2 size={8} strokeWidth={1.5} className="animate-spin" /> Expanding…</>
          ) : (
            <><Network size={8} strokeWidth={1.5} /> Expand</>
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