export interface Source {
  id: string;
  title: string;
  source: string;
  favicon: string;
}

export interface Data {
  category: string;
  cited_sources: Source[];
  non_cited_sources: Source[];
  content: string;
}

export type DataResponse = Data[];