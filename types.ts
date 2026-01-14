
export type View = 'Dashboard' | 'Trend Analyzer' | 'Post Generator' | 'Settings';

export interface LinkedInPost {
  id: number;
  author: string;
  headline: string;
  avatarUrl: string;
  content: string;
  likes: number;
  comments: number;
  viralityScore: number;
}
