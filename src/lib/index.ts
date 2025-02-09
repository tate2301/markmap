import { IEnhancedNode } from "./view";

export interface NodeContextMenuProps {
    node: IEnhancedNode | null;
    position: { x: number; y: number } | null;
    onClose: () => void;
    onAction: (action: string) => void;
}
  

export { type IEnhancedNode as INode, MindmapConfig, MindmapProps, Direction } from "./view/types"
export {Transformer} from "./core/transform"