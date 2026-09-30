export class GraphNode {
  public id: string;
  public label: string;
  public metadata: Record<string, any>;

  constructor(id: string, label?: string, metadata: Record<string, any> = {}) {
    this.id = id;
    this.label = label || id;
    this.metadata = { ...metadata };
  }

  get accountHolder(): string | undefined {
    return this.metadata.accountHolder;
  }

  get accountType(): string | undefined {
    return this.metadata.accountType;
  }

  get riskScore(): number {
    return this.metadata.riskScore ?? 0;
  }

  set riskScore(score: number) {
    this.metadata.riskScore = score;
  }

  clone(): GraphNode {
    return new GraphNode(this.id, this.label, JSON.parse(JSON.stringify(this.metadata)));
  }
}
