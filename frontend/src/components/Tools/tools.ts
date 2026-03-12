import { FileText, Image as ImageIcon, Search } from 'lucide-react';

export interface Tool {
  id: string;
  icon: any;
  label: string;
  description: string;
}

export const TOOLS: Tool[] = [
  { id: 'image', icon: ImageIcon, label: 'Generate Image', description: 'Create an image from text' },
  { id: 'search', icon: Search, label: 'Web Search', description: 'Search the web for info' },
  { id: 'summarize', icon: FileText, label: 'Summarize', description: 'Summarize text or content' },
];
