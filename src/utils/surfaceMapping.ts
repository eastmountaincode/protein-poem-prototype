// Mapping of protein chains to surface representations for hover effects

export const chainToSurfaceMapping: Record<string, string> = {
  A: "rope",
  B: "rope", 
  C: "rope",
  D: "rope",
  E: "rope"
};

export const getChainSurface = (chainName: string): string => {
  return chainToSurfaceMapping[chainName] || "rope";
}; 