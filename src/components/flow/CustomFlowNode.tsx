import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { 
  Sparkles, 
  Bot, 
  Database, 
  Slack, 
  Mail, 
  MessageSquare, 
  Globe, 
  Settings2, 
  Trash2, 
  Webhook, 
  CheckCircle2, 
  GitFork, 
  Clock, 
  Play, 
  Code, 
  Send, 
  CreditCard, 
  ShoppingBag, 
  Facebook, 
  Instagram, 
  Linkedin, 
  Twitter, 
  Video, 
  Youtube, 
  Search, 
  Zap, 
  Cpu, 
  ShieldCheck, 
  Folder, 
  Calendar, 
  Users, 
  Brain, 
  Lock, 
  Key, 
  HardDrive 
} from 'lucide-react';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Sparkles,
  Bot,
  Database,
  Slack,
  Mail,
  MessageSquare,
  Globe,
  Settings2,
  Trash2,
  Webhook,
  CheckCircle2,
  GitFork,
  Clock,
  Play,
  Code,
  Send,
  CreditCard,
  ShoppingBag,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Video,
  Youtube,
  Search,
  Zap,
  Cpu,
  ShieldCheck,
  Folder,
  Calendar,
  Users,
  Brain,
  Lock,
  Key,
  HardDrive
};

export interface CustomNodeData extends Record<string, unknown> {
  title: string;
  titleAr?: string;
  subtitle?: string;
  nodeType: 'trigger' | 'action' | 'condition' | 'ai';
  icon: string;
  brandColor?: string;
  gradient?: string;
  category?: string;
  requiredSecretKey?: string;
  secretConnected?: boolean;
  config?: Record<string, any>;
  language?: 'ar' | 'en';
  onDeleteNode?: (id: string) => void;
  onSelectNode?: (id: string) => void;
}

export const CustomFlowNode = memo(({ id, data, selected }: NodeProps<any>) => {
  const nodeData = data as CustomNodeData;
  const isRtl = nodeData.language === 'ar';

  const IconComponent = ICON_MAP[nodeData.icon] || Zap;

  const getTypeBadge = () => {
    switch (nodeData.nodeType) {
      case 'trigger':
        return (
          <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full text-[9px] font-black uppercase">
            {isRtl ? 'مُشغّل (Trigger)' : 'Trigger'}
          </span>
        );
      case 'ai':
        return (
          <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full text-[9px] font-black uppercase flex items-center space-x-1 space-x-reverse">
            <Sparkles className="w-2.5 h-2.5 text-purple-600" />
            <span>{isRtl ? 'ذكاء اصطناعي' : 'AI Node'}</span>
          </span>
        );
      case 'condition':
        return (
          <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full text-[9px] font-black uppercase">
            {isRtl ? 'شرط منطقي' : 'Condition'}
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-full text-[9px] font-black uppercase">
            {isRtl ? 'إجراء' : 'Action'}
          </span>
        );
    }
  };

  return (
    <div
      className={`min-w-[260px] max-w-[320px] bg-white rounded-3xl border-2 shadow-xl transition-all relative group font-sans ${
        selected
          ? 'border-indigo-600 ring-4 ring-indigo-500/20 scale-[1.02]'
          : 'border-slate-200 hover:border-indigo-300 hover:shadow-2xl'
      }`}
      style={{
        borderTopColor: nodeData.brandColor || '#6366F1'
      }}
    >
      {/* Target Handle (Input) */}
      {nodeData.nodeType !== 'trigger' && (
        <Handle
          type="target"
          position={Position.Top}
          className="w-4 h-4 bg-indigo-600 border-2 border-white rounded-full hover:scale-125 transition-transform !-top-2.5"
        />
      )}

      {/* Node Header */}
      <div className="p-4 pb-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 rounded-t-3xl">
        <div className="flex items-center space-x-2 space-x-reverse min-w-0">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-md shrink-0"
            style={{ backgroundColor: nodeData.brandColor || '#6366F1' }}
          >
            <IconComponent className="w-4 h-4" />
          </div>

          <div className="min-w-0">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">
              {nodeData.category || 'Integration'}
            </p>
            <h4 className="font-extrabold text-xs text-slate-900 truncate">
              {isRtl ? (nodeData.titleAr || nodeData.title) : nodeData.title}
            </h4>
          </div>
        </div>

        <div className="flex items-center space-x-1 space-x-reverse shrink-0">
          {nodeData.onDeleteNode && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                nodeData.onDeleteNode?.(id);
              }}
              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title={isRtl ? 'حذف العقدة' : 'Delete node'}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Node Content Body */}
      <div className="p-4 space-y-2">
        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-medium">
          {nodeData.subtitle || (nodeData.config?.prompt ? nodeData.config.prompt : 'انقر لتعديل الإعدادات ومفاتيح الربط')}
        </p>

        {/* Footer Badges */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
          {getTypeBadge()}

          {nodeData.requiredSecretKey && (
            <span
              className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md flex items-center space-x-1 space-x-reverse ${
                nodeData.secretConnected
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              <Key className="w-2.5 h-2.5" />
              <span>
                {nodeData.secretConnected
                  ? (isRtl ? 'Secret متصل' : 'Key Set')
                  : (isRtl ? 'Secret مطلوب' : 'Key Required')}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Source Handle (Output) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-4 h-4 bg-indigo-600 border-2 border-white rounded-full hover:scale-125 transition-transform !-bottom-2.5"
      />
    </div>
  );
});

CustomFlowNode.displayName = 'CustomFlowNode';
