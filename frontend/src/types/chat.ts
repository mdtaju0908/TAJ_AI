import type { Message } from "./message";

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  pinned?: boolean;
  updatedAt?: string;
}
