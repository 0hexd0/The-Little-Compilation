import { DfaState } from "./Enums/DfaState";
import { isNumber, isAlpha, isOperator } from "./Utils/TypeHelper";
import { Token } from "./Entities/Token";
import { TokenReader } from "./Entities/TokenReader";
import { ASTNode } from "./Entities/ASTNode";
import "./index.scss";
import { ASTNodeType } from "./Entities/ASTNodeType";

export class App {
  private state = DfaState.Initial;

  constructor() {
    const testExpression = "2+3+4+5";
    const dictionary = this.getToken(testExpression + " ");
    const htmlArr = dictionary.map(atom => {
      return `<div class="item">
      <span class="type">${DfaState[atom.type]}</span>
      <div class="value">${atom.value}</div>
      </div>`;
    });
    document.body.innerHTML = htmlArr.join("");
    const reader = new TokenReader(dictionary);
    const AST = this.additive(reader);
    console.log("AST", AST);
    console.log("result", this.calcAST(AST as ASTNode));
  }

  getDfaStateByOperator(operator: string) {
    switch (operator) {
      case "+":
        return DfaState.Plus;
      case "-":
        return DfaState.Minus;
      case "*":
        return DfaState.Star;
      case "/":
        return DfaState.Slash;
      default:
        return DfaState.Plus;
    }
  }

  changeStateTo(newState: DfaState) {
    if (this.state !== newState) {
      this.state = newState;
    }
  }

  getToken(exp: string) {
    const dictionary: Token[] = [];
    let tempId = "";
    let tempNum = "";
    for (let idx = 0; idx < exp.length; idx++) {
      const firstChar = exp[idx];
      switch (this.state) {
        case DfaState.Initial: {
          if (isAlpha(firstChar)) {
            if (firstChar === "i") {
              tempId = "i";
              this.changeStateTo(DfaState.Id_int1);
            } else {
              tempId = firstChar;
              this.changeStateTo(DfaState.Id);
            }
          } else if (isNumber(firstChar)) {
            tempNum = firstChar;
            this.changeStateTo(DfaState.IntLiteral);
          } else if (firstChar === ">") {
            this.changeStateTo(DfaState.GT);
          } else if (firstChar === "=") {
            dictionary.push(new Token(DfaState.Assignment, "="));
            this.changeStateTo(DfaState.Initial);
          } else if (isOperator(firstChar)) {
            const state = this.getDfaStateByOperator(firstChar);
            dictionary.push(new Token(state, firstChar));
            this.changeStateTo(DfaState.Initial);
          }
          break;
        }
        case DfaState.Id_int1: {
          if (firstChar === "n") {
            tempId = tempId + firstChar;
            this.changeStateTo(DfaState.Id_int2);
          } else if (firstChar === "=") {
            dictionary.push(new Token(DfaState.Id, tempId));
            dictionary.push(new Token(DfaState.Assignment, "="));
            tempId = "";
            this.changeStateTo(DfaState.Initial);
          } else if (isOperator(firstChar)) {
            dictionary.push(new Token(DfaState.Id, tempId));
            tempId = "";
            const state = this.getDfaStateByOperator(firstChar);
            dictionary.push(new Token(state, firstChar));
            this.changeStateTo(DfaState.Initial);
          } else {
            tempId = tempId + firstChar;
            this.changeStateTo(DfaState.Id);
          }
          break;
        }
        case DfaState.Id_int2: {
          if (firstChar === "t") {
            tempId = tempId + firstChar;
            this.changeStateTo(DfaState.Id_int3);
          } else if (firstChar === "=") {
            dictionary.push(new Token(DfaState.Id, tempId));
            dictionary.push(new Token(DfaState.Assignment, "="));
            tempId = "";
            this.changeStateTo(DfaState.Initial);
          } else if (isOperator(firstChar)) {
            dictionary.push(new Token(DfaState.Id, tempId));
            tempId = "";
            const state = this.getDfaStateByOperator(firstChar);
            dictionary.push(new Token(state, firstChar));
            this.changeStateTo(DfaState.Initial);
          } else {
            tempId = tempId + firstChar;
            this.changeStateTo(DfaState.Id);
          }
          break;
        }
        case DfaState.Id_int3: {
          if (isAlpha(firstChar) || isNumber(firstChar)) {
            tempId = tempId + firstChar;
            this.changeStateTo(DfaState.Id);
          } else {
            tempId = "";
            dictionary.push(new Token(DfaState.Id_int3, "int"));
            this.changeStateTo(DfaState.Initial);
          }
          break;
        }
        case DfaState.Id: {
          if (isAlpha(firstChar) || isNumber(firstChar)) {
            tempId = tempId + firstChar;
          } else if (firstChar === "=") {
            dictionary.push(new Token(DfaState.Id, tempId));
            dictionary.push(new Token(DfaState.Assignment, "="));
            tempId = "";
            this.changeStateTo(DfaState.Initial);
          } else if (isOperator(firstChar)) {
            dictionary.push(new Token(DfaState.Id, tempId));
            tempId = "";
            const state = this.getDfaStateByOperator(firstChar);
            dictionary.push(new Token(state, firstChar));
            this.changeStateTo(DfaState.Initial);
          } else {
            dictionary.push(new Token(DfaState.Id, tempId));
            tempId = "";
            this.changeStateTo(DfaState.Initial);
          }
          break;
        }
        case DfaState.IntLiteral: {
          if (isNumber(firstChar)) {
            tempNum = tempNum + firstChar;
          } else if (isOperator(firstChar)) {
            dictionary.push(new Token(DfaState.IntLiteral, tempNum));
            tempNum = "";
            const state = this.getDfaStateByOperator(firstChar);
            dictionary.push(new Token(state, firstChar));
            this.changeStateTo(DfaState.Initial);
          } else {
            dictionary.push(new Token(DfaState.IntLiteral, tempNum));
            tempNum = "";
            this.changeStateTo(DfaState.Initial);
          }
          break;
        }
        case DfaState.GT: {
          if (firstChar === "=") {
            dictionary.push(new Token(DfaState.GE, ">="));
          } else {
            dictionary.push(new Token(DfaState.GT, ">"));
          }
          this.changeStateTo(DfaState.Initial);
          break;
        }
      }
    }
    return dictionary;
  }

  additive(tokenReader: TokenReader) {
    let child1 = this.multiplicative(tokenReader);
    if (child1 !== null) {
      while (true) {
        const nextToken = tokenReader.peek();
        if (nextToken && nextToken.type === DfaState.Plus) {
          // 消耗掉加号
          tokenReader.read();
          // 产生节点
          const node = new ASTNode(ASTNodeType.AdditiveExpression, "+");
          const child2 = this.multiplicative(tokenReader);
          if (child2) {
            node.addChild(child1);
            node.addChild(child2);
            child1 = node;
          } else {
            throw Error("无法解析加法表达式");
          }
        } else {
          break;
        }
      }
      return child1;
    } else {
      return null;
    }
  }

  multiplicative(tokenReader: TokenReader) {
    const token = tokenReader.peek();
    if (token && token.type === DfaState.IntLiteral) {
      const token = tokenReader.read();
      let child1 = new ASTNode(ASTNodeType.IntLiteral, token.value);
      while (true) {
        const nextToken = tokenReader.peek();
        if (nextToken && nextToken.type === DfaState.Star) {
          // 消耗掉*
          tokenReader.read();
          // 产生节点
          const node = new ASTNode(ASTNodeType.MultiplicativeExpression, "*");
          const token = tokenReader.peek();
          if (token && token.type === DfaState.IntLiteral) {
            const token = tokenReader.read();
            const child2 = new ASTNode(ASTNodeType.IntLiteral, token.value);
            node.addChild(child1);
            node.addChild(child2);
            child1 = node;
          } else {
            throw Error("无法解析乘法表达式");
          }
        } else {
          break;
        }
      }
      return child1;
    } else {
      return null;
    }
  }

  calcAST(node: ASTNode) {
    switch (node.getType()) {
      case ASTNodeType.AdditiveExpression: {
        const children = node.getChildren();
        const result: number = children.reduce((total, node) => {
          return total + this.calcAST(node);
        }, 0);
        return result;
      }
      case ASTNodeType.MultiplicativeExpression: {
        const children = node.getChildren();
        const result: number = children.reduce((total, node) => {
          return total * this.calcAST(node);
        }, 1);
        return result;
      }
      case ASTNodeType.IntLiteral: {
        return Number(node.getText());
      }
    }
  }
}

new App();
