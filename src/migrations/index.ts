import { GraphV1, latestVersion, SerialisedGraphV1, v0ToV1 } from "./v1";

const versionMappings: Record<number, (graph: SerialisedObject) => SerialisedObject> = {
  0: v0ToV1,
  1: (g: SerialisedObject) => g
}
export interface SerialisedObject {
  version: Version;
}
const CurrentVersion = latestVersion;

export function serialiseGraph(graph: GraphV1): string {
  const annotatedGraph: SerialisedGraphV1 = { ...graph, version: CurrentVersion };
  return JSON.stringify(annotatedGraph);
}

export function migrateSavedGraph(savedGraph: SerialisedObject): SerialisedGraphV1 {
  if (savedGraph.version.major === CurrentVersion.major) return savedGraph as SerialisedGraphV1;
  return migrateSavedGraph(versionMappings[savedGraph.version.major](savedGraph));
}
