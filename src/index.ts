import { DfaState } from "./Enums/DfaState";
import { isNumber, isAlpha, isOperator } from "./Utils/TypeHelper";
import { Token } from "./Entities/Token";
import { TokenReader } from "./Entities/TokenReader";
import { ASTNode } from "./Entities/ASTNode";
import "./index.scss";
import { ASTNodeType } from "./Entities/ASTNodeType";

export class App {
  private state = DfaState.Initial;
  private variables: any;

  constructor() {
    const scriptDom = document.getElementById("script") as HTMLTextAreaElement;
    // 初始化脚本区
    scriptDom.innerHTML = `
      int cat =10;
      int dog;
      dog = cat * 2;
      cat + dog;
    `;

    // 初始化变量
    this.variables = {};

    const parseDom = document.getElementById("parseScript");
    if (parseDom) {
      parseDom.addEventListener("click", this.handleClick);
    }

    // console.log("rootAST", rootAST);
    // console.log(this.variables);
  }

  handleClick = (e: any) => {
    // 清空变量
    this.variables = {};
    // 清空信息栏
    const infoDom = document.getElementById("info") as HTMLDivElement;
    infoDom.innerHTML = "";
    const scriptDom = document.getElementById("script") as HTMLTextAreaElement;
    if (scriptDom) {
      const script = scriptDom.value;
      const dictionary = this.getToken(script + " ");
      const reader = new TokenReader(dictionary);
      const rootAST = new ASTNode(ASTNodeType.Root, "root");
      while (reader.peek()) {
        let AST =
          this.intDeclaration(reader) ||
          this.assignment(reader) ||
          this.expression(reader);
        if (AST) {
          rootAST.addChild(AST);
        } else {
          this.appendInfo("error", "无法解析！");
        }
      }
      this.execAST(rootAST);
    }
  };

  /** 获取变量值 */
  getVariableValue(key: string) {
    if (this.variables[key]) {
      return this.variables[key];
    } else {
      this.appendInfo("error", `找不到变量${key}！`);
    }
  }

  /** 设置变量 */
  setVariable(key: string, value: number | "undefined") {
    if (this.variables[key]) {
      this.variables[key] = value;
    } else {
      this.appendInfo("error", `找不到变量${key}！`);
    }
  }

  /** 初始化变量 */
  initVariable(key: string, value: number | "undefined") {
    this.variables[key] = value;
  }

  hasVariable(key: string) {
    return (
      this.variables[key] !== null && typeof this.variables[key] !== "undefined"
    );
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
          } else if (firstChar === ";") {
            dictionary.push(new Token(DfaState.SemiColon, firstChar));
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
          } else if (firstChar === ";") {
            dictionary.push(new Token(DfaState.Id, tempId));
            dictionary.push(new Token(DfaState.SemiColon, firstChar));
            tempId = "";
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
          } else if (firstChar === ";") {
            dictionary.push(new Token(DfaState.Id, tempId));
            dictionary.push(new Token(DfaState.SemiColon, firstChar));
            tempId = "";
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
          } else if (firstChar === ";") {
            dictionary.push(new Token(DfaState.Id, tempId));
            dictionary.push(new Token(DfaState.SemiColon, firstChar));
            tempId = "";
            this.changeStateTo(DfaState.Initial);
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
          } else if (firstChar === ";") {
            dictionary.push(new Token(DfaState.Id, tempId));
            dictionary.push(new Token(DfaState.SemiColon, firstChar));
            tempId = "";
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
          } else if (firstChar === ";") {
            dictionary.push(new Token(DfaState.IntLiteral, tempNum));
            dictionary.push(new Token(DfaState.SemiColon, firstChar));
            tempNum = "";
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

  /** 基本表达式 */
  primary(tokenReader: TokenReader) {
    //Identifier| IntLiteral | '(' additiveExpression ')';
    const nextToken = tokenReader.peek();
    if (nextToken) {
      if (nextToken.type === DfaState.Id) {
        // 消耗掉token
        const token = tokenReader.read();
        // 产生节点
        const node = new ASTNode(ASTNodeType.Variable, token.value);
        return node;
      } else if (nextToken.type === DfaState.IntLiteral) {
        // 消耗掉token
        const token = tokenReader.read();
        // 产生节点
        const node = new ASTNode(ASTNodeType.IntLiteral, token.value);
        return node;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  /** 加法表达式 */
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

  /** 乘法表达式 */
  multiplicative(tokenReader: TokenReader) {
    const primary = this.primary(tokenReader);
    if (primary) {
      let child1 = primary;
      while (true) {
        const nextToken = tokenReader.peek();
        if (nextToken && nextToken.type === DfaState.Star) {
          // 消耗掉*
          tokenReader.read();
          // 产生节点
          const node = new ASTNode(ASTNodeType.MultiplicativeExpression, "*");
          const primary = this.primary(tokenReader);
          if (primary) {
            const child2 = primary;
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

  /** 变量声明语句，仅整数 */
  intDeclaration(tokenReader: TokenReader) {
    //intDeclaration : 'int' Identifier ( '=' additiveExpression)? ';'
    let nextToken = tokenReader.peek();
    if (nextToken && nextToken.type === DfaState.Id_int3) {
      // 消耗掉int
      let token = tokenReader.read();
      nextToken = tokenReader.peek();
      if (nextToken && nextToken.type === DfaState.Id) {
        // 消耗掉标识符
        token = tokenReader.read();
        // 产生变量节点
        const child1 = new ASTNode(ASTNodeType.Variable, token.value);
        nextToken = tokenReader.peek();
        if (nextToken && nextToken.type === DfaState.Assignment) {
          // 消耗掉等号
          token = tokenReader.read();
          const node = new ASTNode(ASTNodeType.Assignment, token.value);
          // 读取右侧加法表达式
          const child2 = this.additive(tokenReader);
          if (child2) {
            // 读取分号
            token = tokenReader.read();
            if (token && token.type === DfaState.SemiColon) {
              node.addChild(child1);
              node.addChild(child2);
              return node;
            } else {
              this.appendInfo("error", `缺少分号！`);
            }
          } else {
            this.appendInfo("error", `不合法的变量声明语句！`);
          }
        } else {
          // 纯声明不赋值
          // 读取分号
          token = tokenReader.read();
          if (token && token.type === DfaState.SemiColon) {
            return child1;
          } else {
            this.appendInfo("error", `缺少分号！`);
          }
        }
      } else {
        this.appendInfo("error", `不合法的变量声明语句！`);
      }
    } else {
      // 第一个token不是int说明不是声明语句，直接返回空
      return null;
    }
  }

  /** 赋值语句 ，仅整数*/
  assignment(tokenReader: TokenReader) {
    // assignmentStatement : Identifier '=' additiveExpression ';';
    const idx = tokenReader.getIdx();
    let nextToken = tokenReader.peek();
    if (nextToken && nextToken.type === DfaState.Id) {
      // 消耗变量token并创建节点
      let token = tokenReader.read();
      const child1 = new ASTNode(ASTNodeType.Variable, token.value);
      nextToken = tokenReader.peek();
      if (nextToken && nextToken.type === DfaState.Assignment) {
        // 消耗掉等号
        token = tokenReader.read();
        const node = new ASTNode(ASTNodeType.Assignment, "=");
        // 解析等号右侧的求值表达式
        const child2 = this.additive(tokenReader);
        if (child2) {
          // 最后匹配分号
          token = tokenReader.read();
          if (token && token.type === DfaState.SemiColon) {
            node.addChild(child1);
            node.addChild(child2);
            return node;
          } else {
            this.appendInfo("error", `缺少分号！`);
          }
        } else {
          // 等号后面不跟表达式
          this.appendInfo("error", `无法解析的赋值语句！`);
        }
      } else {
        // 只有一个标识符且后面不带等号，匹配失败
        tokenReader.setIdx(idx);
        return null;
      }
    } else {
      return null;
    }
  }

  /** 表达式语句 */
  expression(tokenReader: TokenReader) {
    const idx = tokenReader.getIdx();
    const addition = this.additive(tokenReader);
    if (addition) {
      // 检查分号
      let token = tokenReader.read();
      if (token && token.type === DfaState.SemiColon) {
        return addition;
      } else {
        this.appendInfo("error", "缺少分号！");
      }
    } else {
      // 失败回溯
      tokenReader.setIdx(idx);
      return null;
    }
  }

  execAST(node: ASTNode) {
    const nodeType = node.getType();
    if (nodeType === ASTNodeType.Root) {
      node.getChildren().forEach(node => this.execAST(node));
    } else if (nodeType === ASTNodeType.Assignment) {
      const variableName = node.getChildren()[0].getText();
      const value = this.calcAST(node.getChildren()[1]);
      this.initVariable(variableName, value);
    } else if (nodeType === ASTNodeType.Variable) {
      if (this.hasVariable(node.getText())) {
        // 直接打印
        const value = this.getVariableValue(node.getText());
        this.appendInfo("success", value);
      } else {
        // 纯声明，未赋值
        this.initVariable(node.getText(), "undefined");
      }
    } else {
      this.appendInfo("success", this.calcAST(node));
    }
  }

  appendInfo(type: string, info: string) {
    const infoDom = document.getElementById("info") as HTMLDivElement;
    const newLine = document.createElement("div");
    newLine.style.color = type === "success" ? "green" : "red";
    newLine.innerText = info;
    infoDom.appendChild(newLine);
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
      case ASTNodeType.Variable: {
        const variable = this.getVariableValue(node.getText());
        if (variable !== "undefined") {
          return variable;
        } else {
          this.appendInfo("error", "不允许使用未赋值的变量");
          return null;
        }
      }
      default: {
        return Number(node.getText());
      }
    }
  }
}

new App();
