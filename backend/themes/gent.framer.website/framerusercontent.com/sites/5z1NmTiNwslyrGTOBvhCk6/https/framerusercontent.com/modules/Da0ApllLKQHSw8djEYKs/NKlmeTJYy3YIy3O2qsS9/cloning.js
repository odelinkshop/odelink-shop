import React from "react"; // It walks every level of the element tree: each nested container, stack, frame gets rendersWithMotion = false
// It preserves all other props (styles, events, Framer props)
// It prevents Framer from rewrapping anything in internal motion components, which stops layout animation flickers, re-renders, and performance loss
export function sanitizeChildrenRecursively(node) {
  if (!(/*#__PURE__*/ React.isValidElement(node))) return node; // Clone node with motion props disabled
  const sanitizedProps = {
    ...node.props,
    rendersWithMotion: false,
    layoutId: undefined,
    scopeId: undefined,
  }; // If there are nested children, recurse into them
  if (node.props.children) {
    sanitizedProps.children = React.Children.map(
      node.props.children,
      sanitizeChildrenRecursively
    );
  }
  return /*#__PURE__*/ React.cloneElement(node, sanitizedProps);
}
export const __FramerMetadata__ = {
  exports: {
    sanitizeChildrenRecursively: {
      type: "function",
      annotations: { framerContractVersion: "1" },
    },
    __FramerMetadata__: { type: "variable" },
  },
};
//# sourceMappingURL=./cloning.map
