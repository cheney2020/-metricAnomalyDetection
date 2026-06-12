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
    compare: string;
    target: string;
    branch: string;
    output: string;
    recommend: string;
  };
  hasBranches?: boolean;
}

const FlowNode = ({ id, label, icon, status, isActive, onClick, details, hasBranches }: NodeProps) => {
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
            <div className="flex justify-between"><span className="text-slate-400">对比：</span><span className="font-medium text-slate-700">{details.compare}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">目标：</span><span className="font-medium text-slate-700 truncate max-w-[120px] text-right">{details.target}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">分支：</span><span className="font-medium text-blue-600 bg-blue-50 px-1.5 rounded">{details.branch}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">输出：</span><span className="font-medium text-slate-700 truncate max-w-[120px] text-right font-mono" title={details.output}>{details.output}</span></div>
            <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between">
              <span className="text-slate-400">推荐下游：</span>
              <span className="font-medium text-slate-500">{details.recommend}</span>
            </div>
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

      {hasBranches && (
        <div className="absolute -right-16 top-1/2 -translate-y-1/2 flex flex-col gap-10 w-16 pointer-events-none">
          <div className="relative flex items-center justify-end">
            <div className="absolute left-0 w-full h-[1.5px] bg-emerald-400" />
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] px-2.5 py-0.5 rounded-full z-10 -mr-5 font-bold shadow-sm">是</div>
          </div>
          <div className="relative flex items-center justify-end">
            <div className="absolute left-0 w-full h-[1.5px] bg-slate-300" />
             <div className="bg-white border border-slate-200 text-slate-500 text-[10px] px-2.5 py-0.5 rounded-full z-10 -mr-5 font-bold shadow-sm">否</div>
          </div>
        </div>
      )}
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
              compare: config.compareType === 'time_compare' ? '时间对比' : '同类对比',
              target: getTargetLabel(config.detectionTarget),
              branch: '是 / 否',
              output: 'summary + items',
              recommend: '通知 / 工单 / 循环'
            }}
            hasBranches={true}
          />
        </div>

        <div className="flex flex-col gap-6 pl-4">
          <div className="flex items-center">
            <Connection className="text-emerald-400 w-6 drop-shadow-sm" />
            <FlowNode 
              id="notify" 
              label="异常通知节点" 
              icon={<Bell size={18} />} 
              onClick={() => {}} 
            />
          </div>
          <div className="flex items-center">
            <Connection className="w-6" />
            <FlowNode 
              id="branch" 
              label="正常结束节点" 
              icon={<CircleCheck size={18} />} 
              onClick={() => {}} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};
