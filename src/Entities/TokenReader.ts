import { Token } from "./Token";

export class TokenReader {
  private tokens: Token[];
  private idx = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  peek() {
    return this.tokens[this.idx];
  }

  read() {
    const token = this.tokens[this.idx];
    this.idx = this.idx + 1;
    return token;
  }

  getIdx() {
    return this.idx;
  }

  setIdx(idx: number) {
    this.idx = idx;
  }
}
