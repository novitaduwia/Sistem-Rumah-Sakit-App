import React from 'react';
import { AgentType } from '../types';
import { ShieldAlert, Calendar, User, CreditCard, Bot } from 'lucide-react';

interface AgentAvatarProps {
  type: AgentType;
  size?: 'sm' | 'md' | 'lg';
}

const AgentAvatar: React.FC<AgentAvatarProps> = ({ type, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 p-1.5',
    md: 'w-10 h-10 p-2',
    lg: 'w-16 h-16 p-4',
  };

  const getStyle = () => {
    switch (type) {
      case AgentType.MEDICAL_RECORDS:
        return { bg: 'bg-medical-red', icon: <ShieldAlert className="text-white w-full h-full" /> };
      case AgentType.APPOINTMENTS:
        return { bg: 'bg-schedule-amber', icon: <Calendar className="text-white w-full h-full" /> };
      case AgentType.PATIENT_MANAGEMENT:
        return { bg: 'bg-admin-blue', icon: <User className="text-white w-full h-full" /> };
      case AgentType.BILLING:
        return { bg: 'bg-billing-green', icon: <CreditCard className="text-white w-full h-full" /> };
      case AgentType.COORDINATOR:
      default:
        return { bg: 'bg-hospital-600', icon: <Bot className="text-white w-full h-full" /> };
    }
  };

  const style = getStyle();

  return (
    <div className={`${sizeClasses[size]} ${style.bg} rounded-lg shadow-lg flex items-center justify-center shrink-0`}>
      {style.icon}
    </div>
  );
};

export default AgentAvatar;