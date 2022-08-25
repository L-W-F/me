export function toHast(raw) {
  if (!raw) {
    return raw;
  }

  function handleNode(node) {
    if (!node) {
      return node;
    }

    const properties = {};

    if (node.getAttributes) {
      for (const [key, value] of node.getAttributes()) {
        if (key === 'class') {
          properties.className = Array.isArray(value) ? value : [value];
        } else {
          properties[key] = value;
        }
      }
    }

    const children = [];

    if (node.getChildren) {
      for (const child of node.getChildren()) {
        children.push(handleNode(child));
      }
    }

    return {
      type: node.name ? 'element' : 'text',
      tagName: node.name,
      value: node._textData,
      properties,
      children,
    };
  }

  return {
    type: 'root',
    children: raw._children ? raw._children.map(handleNode) : [],
  };
}
