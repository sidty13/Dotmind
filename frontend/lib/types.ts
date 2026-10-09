export type RepoStatus = 'ACTIVE' | 'READY' | 'INDEXING';

export interface Repository {
  id: string;
  owner: string;
  name: string;
  url: string;
  branch: string;
  status: RepoStatus;
  progressPercent?: number;
  filesCount: number;
  chunksCount: number;
  lastIndexed: string;
  languages: { name: string; percent: number }[];
}

export interface Citation {
  id: number;
  filePath: string;
  startLine: number;
  endLine: number;
  similarity: number;
  preview: string;
  githubUrl: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: Citation[];
  isStreaming?: boolean;
}

export interface IngestStep {
  name: 'CLONE' | 'CHUNK' | 'EMBED' | 'INDEX' | 'READY';
  status: 'empty' | 'half' | 'filled';
  description: string;
}

export interface ActivityItem {
  id: string;
  time: string;
  text: string;
  type: 'ingest' | 'query' | 'switch';
}
