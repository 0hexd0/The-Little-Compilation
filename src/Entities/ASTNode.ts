import { ASTNodeType } from "./ASTNodeType";

export class ASTNode {
  private type: ASTNodeType;
  private text: string;
  private children: ASTNode[];

  constructor(type: ASTNodeType, text: string) {
    this.type = type;
    this.text = text;
    this.children = [];
  }

  getType() {
    return this.type;
  }

  getText() {
    return this.text;
  }

  addChild(child: ASTNode) {
    this.children.push(child);
  }

  getChildren() {
    return this.children;
  }
}
