import { Edge } from "edge.js";
import { __dirname } from "./paths.ts";
import navigation from "../constants/navigaion.ts";

let instance: Edge | null = null;

export const initEdge = () => {
  const edge = Edge.create();
  edge.mount(new URL("../views", import.meta.url));
  edge.global("config", {
    navigation: navigation,
  });

  return edge;
};

class EdgeEngine {
  private edge: Edge;

  constructor() {
    if (!instance) {
      instance = initEdge();
    }

    this.edge = instance;
  }

  public render(view: string, data: Record<string, any> = {}): Promise<string> {
    return this.edge.render(view, data);
  }

  public getInstance(): Edge {
    return this.edge;
  }
}

export default new EdgeEngine();
