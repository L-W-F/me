interface Properties {
  className?: string[];
  [key: string]: any;
}

interface Node {
  type: 'root' | 'element' | 'text';
  tagName?: string;
  value?: string;
  properties?: Properties;
  children?: Node[];
}

interface Fragment {
  name?: string;
  _textData?: string;
  _children?: Fragment[];
  getAttributes?: () => [string, any][];
  getChildren?: () => Fragment[];
}

export function fragment2hast(fragment: Fragment): Node {
  if (!fragment) {
    return fragment;
  }

  function handleNode(frag: Fragment): Node {
    if (!frag) {
      return frag;
    }

    const properties: Properties = {};

    if (frag.getAttributes) {
      for (const [key, value] of frag.getAttributes()) {
        if (key === 'class') {
          properties.className = Array.isArray(value)
            ? value
            : value.split(' ');
        } else {
          properties[key] = value;
        }
      }
    }

    const children = [];

    if (frag.getChildren) {
      for (const child of frag.getChildren()) {
        children.push(handleNode(child));
      }
    }

    return {
      type: frag.name ? 'element' : 'text',
      tagName: frag.name,
      value: frag._textData,
      properties,
      children,
    };
  }

  return {
    type: 'root',
    children: fragment._children ? fragment._children.map(handleNode) : [],
  };
}
