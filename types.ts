export enum AgentType {
  COORDINATOR = 'COORDINATOR',
  MEDICAL_RECORDS = 'MEDICAL_RECORDS',
  APPOINTMENTS = 'APPOINTMENTS',
  PATIENT_MANAGEMENT = 'PATIENT_MANAGEMENT',
  BILLING = 'BILLING',
}

export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  sender?: AgentType; // To visually distinguish who is speaking
  timestamp: Date;
  isDelegationNotice?: boolean; // If true, styling is different (system notification)
}

export interface SubAgentResponse {
  agentType: AgentType;
  response: string;
}

export interface ToolCallData {
  name: string;
  args: Record<string, any>;
}