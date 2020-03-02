import { DfaState } from "../Enums/DfaState";

export class Token {
  readonly type: DfaState;
  readonly value: string;

  constructor(type: DfaState, value: string) {
    this.type = type;
    this.value = value;
  }
}
