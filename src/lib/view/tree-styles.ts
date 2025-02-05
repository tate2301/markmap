export const treeStyles = `
.enhanced-tree .node {
  cursor: pointer;
}

.enhanced-tree .node.highlight rect {
  stroke-width: 3px !important;
  filter: drop-shadow(0 0 4px rgba(76, 175, 80, 0.6));
}

.enhanced-tree .node:hover rect {
  stroke: #2196F3;
  stroke-width: 2px;
}
`;
