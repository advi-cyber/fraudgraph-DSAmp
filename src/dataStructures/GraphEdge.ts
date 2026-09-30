export class GraphEdge {
  public id: string;
  public source: string;
  public target: string;
  public weight: number;
  public metadata: Record<string, any>;

  constructor(
    source: string,
    target: string,
    weight: number,
    metadata: Record<string, any> = {},
    id?: string
  ) {
    this.source = source;
    this.target = target;
    this.weight = weight;
    this.metadata = { ...metadata };
    this.id = id || metadata.transactionId || `edge_${source}_${target}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  }

  get transactionId(): string {
    return this.metadata.transactionId || this.id;
  }

  get timestamp(): string {
    return this.metadata.timestamp || new Date().toISOString();
  }

  clone(): GraphEdge {
    return new GraphEdge(
      this.source,
      this.target,
      this.weight,
      JSON.parse(JSON.stringify(this.metadata)),
      this.id
    );
  }
}
