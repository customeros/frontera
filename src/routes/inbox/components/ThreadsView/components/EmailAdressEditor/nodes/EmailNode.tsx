import {
  TextNode,
  type Spread,
  type NodeKey,
  type LexicalNode,
  type EditorConfig,
  type DOMExportOutput,
  $applyNodeReplacement,
  type DOMConversionMap,
  type SerializedTextNode,
  type DOMConversionOutput,
} from 'lexical';

export type SerializedEmailNode = Spread<
  {
    email: string;
  },
  SerializedTextNode
>;

function $convertEmailElement(
  domNode: HTMLElement,
): DOMConversionOutput | null {
  const textContent = domNode.textContent;

  if (textContent !== null) {
    const node = $createEmailNode(textContent);

    return {
      node,
    };
  }

  return null;
}

export class EmailNode extends TextNode {
  __email: string;

  static getType(): string {
    return 'email';
  }

  static clone(node: EmailNode): EmailNode {
    return new EmailNode(node.__email, node.__text, node.__key);
  }

  static importJSON(serializedNode: SerializedEmailNode): EmailNode {
    const node = $createEmailNode(serializedNode.email);

    node.setTextContent(serializedNode.text);
    node.setFormat(serializedNode.format);
    node.setDetail(serializedNode.detail);
    node.setMode(serializedNode.mode);
    node.setStyle(serializedNode.style);

    return node;
  }

  constructor(email: string, text?: string, key?: NodeKey) {
    super(text ?? email, key);
    this.__email = email;
  }

  exportJSON(): SerializedEmailNode {
    return {
      ...super.exportJSON(),
      email: this.__email,
      type: 'email',
      version: 1,
    };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config);

    dom.className =
      'email hover:bg-grayModern-100 bg-grayModern-25 rounded-md px-1 py-0.5 hover:cursor-pointer text-sm';

    dom.setAttribute('data-lexical-email', 'true');

    return dom;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('p');

    element.setAttribute('data-lexical-email', 'true');
    element.textContent = this.__text;

    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      p: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-email')) {
          return null;
        }

        return {
          conversion: $convertEmailElement,
          priority: 1,
        };
      },
    };
  }

  isTextEntity(): true {
    return true;
  }

  canInsertTextBefore(): boolean {
    return true;
  }

  canInsertTextAfter(): boolean {
    return true;
  }
}

export function $createEmailNode(email: string): EmailNode {
  const emailNode = new EmailNode(email);

  emailNode.setMode('segmented').toggleDirectionless();

  return $applyNodeReplacement(emailNode);
}

export function $isEmailNode(
  node: LexicalNode | null | undefined,
): node is EmailNode {
  return node instanceof EmailNode;
}
