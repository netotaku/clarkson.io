export type HitCounterData = {
  totalHits: number;
  legacyHits: number;
  capturedHits: number;
  monthly: { month: string; count: number | null }[];
  asOf: string;
};
