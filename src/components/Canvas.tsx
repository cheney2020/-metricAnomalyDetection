import React from "react";
import { 
  Database, 
  ArrowRight, 
  Activity, 
  Bell, 
  CircleCheck, 
  Play,
  Settings2,
  AlertTriangle
} from "lucide-react";
import { cn, NodeConfig } from "@/src/types";
import { motion } from "motion/react";

interface NodeProps {
  id: string;
  type?: string;
  label: string;
  icon: React.ReactNode;
  status?: "pending" | "configured" | "tested" | "error";
  isActive?: boolean;
  onClick?: () => void;
  details?: {
    [key: string]: string;
  };
}

const FlowNode = ({ id, label, icon, status, isActive, onClick, details }: NodeProps) => {
  return (
    <div className="relative flex flex-col items-center">
      <motion.div 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={cn(
          "relative flex flex-col items-start p-4 w-60 rounded-xl border-2 transition-all cursor-pointer shadow-sm group bg-white",
          isActive 
            ? "border-blue-500 ring-4 ring-blue-500/10" 
            : "border-slate-200 hover:border-slate-300",
          status === "configured" && "border-emerald-500 shadow-emerald-500/10",
          status === "tested" && "border-emerald-600",
          status === "error" && "border-red-500"
        )}
      >
        <div className="flex items-center gap-3 w-full border-b border-slate-50 pb-3 mb-3">
          <div className={cn(
            "p-2 rounded-xl transition-colors shadow-sm",
            isActive ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-500 group-hover:text-blue-500"
          )}>
            {icon}
          </div>
          <span className="text-sm font-bold text-slate-800 flex-1">{label}</span>
        </div>
        
        {details && (
          <div className="w-full space-y-2 text-[10px] text-slate-600">
            {Object.entries(details).map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-slate-400 w-12">{k}:</span>
                <span className="font-medium text-slate-700 truncate text-right flex-1 bg-slate-50 border border-slate-100 rounded px-1">{v}</span>
              </div>
            ))}
          </div>
        )}

        {status && !details && (
          <div className="absolute -top-2 -right-2">
            {status === "configured" && <CircleCheck className="w-5 h-5 text-emerald-500 fill-white drop-shadow-sm" />}
            {status === "tested" && <div className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold shadow-sm border border-emerald-500">TESTED</div>}
            {status === "error" && <AlertTriangle className="w-5 h-5 text-red-500 fill-white drop-shadow-sm" />}
          </div>
        )}
      </motion.div>
    </div>
  );
};

interface ConnectionProps {
  className?: string;
}

const Connection = ({ className }: ConnectionProps) => (
  <div className={cn("flex items-center justify-center w-8 text-slate-300", className)}>
    <ArrowRight strokeWidth={1.5} />
  </div>
);

export const Canvas = ({ activeNodeId, config, onNodeClick }: { 
  activeNodeId: string; 
  config: NodeConfig;
  onNodeClick: (id: string) => void 
}) => {
  const getTargetLabel = (t: string) => {
    const map: Record<string, string> = {
      'target_point': '目标点判断',
      'scan_points': '异常点扫描',
      'trend': '趋势异常',
      'volatility': '波动异常',
      'target_object': '对象异常判断',
      'scan_objects': '对象异常扫描',
      'distribution': '整体分布判断'
    };
    return map[t] || t;
  };

  return (
    <div className="flex-1 bg-[#F8FAFC] relative overflow-hidden flex items-center justify-center p-12">
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(#000 1.5px, transparent 1.5px)", backgroundSize: "24px 24px" }} />
      
      <div className="absolute top-6 left-6 z-20 flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center">
          <Settings2 className="text-blue-600" size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">自动化策略画布</h2>
          <p className="text-[11px] text-slate-500 font-medium tracking-wide">可视化编排监控与异常检测流程</p>
        </div>
      </div>

      <div className="relative z-10 flex flex-nowrap items-center max-w-full overflow-x-auto gap-3 py-20 px-8 custom-scrollbar">
        <FlowNode 
          id="data-prep" 
          label="数据准备节点" 
          icon={<Database size={18} />} 
          status="configured"
          onClick={() => {}} 
        />
        <Connection />
        <FlowNode 
          id="loop" 
          label="批量循环节点" 
          icon={<Play size={18} />} 
          status="configured"
          onClick={() => {}} 
        />
        <Connection />
        
        <div className="pr-12 pl-2">
          <FlowNode 
            id="anomaly-detection" 
            label={config.name || "指标异常检测"}
            icon={<Activity size={18} />} 
            status={config.status as any}
            isActive={activeNodeId === "anomaly-detection"}
            onClick={() => onNodeClick("anomaly-detection")}
            details={{
              '指标': config.metricConfig?.code || '销售额',
              '粒度': config.targetConfig?.timeRangeConfig?.granularity === 'hour' ? '小时' : config.targetConfig?.timeRangeConfig?.granularity === 'day' ? '日' : config.targetConfig?.timeRangeConfig?.granularity === 'month' ? '月' : '周',
              '方式': config.compareType === 'time_compare' ? '时间对比' : '同类对比'
            }}
          />
        </div>

        <Connection />
        
        <FlowNode 
          id="notify" 
          label="下游处理节点" 
          icon={<Bell size={18} />} 
          onClick={() => {}} 
        />
      </div>
    </div>
  );
};
