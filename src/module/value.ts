type Id = number;

class Value {
  type: string;
  symbol?: string;
  list?: Id[];
  children: Partial<Record<string, Id>>;
  constructor(type: string) {
    this.type = type;
    this.children = {};
  }
}
