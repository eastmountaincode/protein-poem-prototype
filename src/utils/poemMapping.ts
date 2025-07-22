// Mapping of protein chains to poem segments
// "This Is Just To Say" by William Carlos Williams

export const chainToPoemMapping: Record<string, string> = {
  A: "This is just to say I have eaten",
  B: "the plums that were in the icebox", 
  C: "and which you were probably saving",
  D: "for breakfast Forgive me",
  E: "they were delicious so sweet and so cold"
};

export const getChainPoem = (chainName: string): string => {
  return chainToPoemMapping[chainName] || `Chain ${chainName}`;
}; 