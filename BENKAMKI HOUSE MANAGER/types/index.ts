export interface User {
  id: string;
  email: string;
  role: 'owner' | 'frontdesk' | 'client';
  name: string;
  phone: string;
}

export interface Payment {
  id: string;
  amount: number;
  currency: 'KES' | 'USD';
  method: 'MPESA' | 'CARD' | 'BANK';
  status: 'pending' | 'confirmed' | 'failed';
  houseId: string;
  clientId: string;
  timestamp: Date;
  confirmationCode?: string;
}

export interface MaintenanceRequest {
  id: string;
  type: 'cleaning' | 'repair' | 'inspection';
  status: 'pending' | 'in-progress' | 'completed';
  description: string;
  houseId: string;
  clientId: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high';
}

export interface Message {
  id: string;
  from: User;
  to: 'owner' | 'frontdesk' | 'all';
  content: string;
  timestamp: Date;
  read: boolean;
  attachments?: string[];
} 