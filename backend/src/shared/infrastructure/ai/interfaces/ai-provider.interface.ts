export interface EmbeddingsProvider {
  getName(): string;
  isAvailable(): Promise<boolean>;
  createEmbeddings(texts: string[], model?: string): Promise<number[][]>;
}

export interface FunctionCall {
  name: string;
  arguments: string;
}

export interface FunctionDefinition {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface ChatMessage {
  role: string;
  content: string | null;
  function_call?: FunctionCall;
  name?: string;
}

export interface ChatResponse {
  content: string | null;
  functionCall?: FunctionCall;
  toolCallId?: string;
}

export interface ChatProvider {
  chat(
    messages: Array<ChatMessage>,
    model?: string,
    functions?: FunctionDefinition[],
  ): Promise<ChatResponse>;
}
