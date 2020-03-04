export enum ASTNodeType {
  /** 整数 */
  IntLiteral,
  /** 加法表达式 */
  AdditiveExpression,
  /** 乘法表达式 */
  MultiplicativeExpression,
  /** 变量 */
  Variable,
  /** 赋值 */
  Assignment,
  /** 根节点 */
  Root
}
