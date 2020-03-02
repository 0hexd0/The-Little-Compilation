export enum DfaState {
  /** 初始状态 */
  Initial,
  /** 标识符 */
  Id,
  /** 整数 */
  IntLiteral,
  /** 大于 */
  GT,
  /** 大于等于 */
  GE,
  /** int关键字，i状态 */
  Id_int1,
  /** int关键字，in状态 */
  Id_int2,
  /** int关键字，int状态 */
  Id_int3,
  /** 等号 */
  Assignment,
  /** 加 */
  Plus,
  /** 减 */
  Minus,
  /** 乘 */
  Star,
  /**除 */
  Slash
}
