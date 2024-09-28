// src/types.ts
export interface Message {
    id: string;
    content: string;
    role: 'user' | 'assistant'; // Adjust based on your roles
}
