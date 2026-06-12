import React, { useState } from 'react';
import { 
  X, Info, Database, Globe, Layers, Activity, ChevronDown, 
  Plus, Trash2, PlayCircle, CheckCircle2,
  TrendingUp, AlertCircle, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, type NodeConfig, type CompareType, type DetectionTarget, type TimeRangeConfig } from '@/src/types';

interface NodeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  config: NodeConfig;
  setConfig: React.Dispatch<React.SetStateAction<NodeConfig>>;
  onTest: () => void;
}

const Section = ({ title, status, children }: { title: string, status?: string, children: React.ReactNode }) => {
  return (
    <div className="border border-slate-100 rounded-xl overflow-hidden hover:border-slate-200 transition-colors bg-white shadow-sm">
      <div className="px-5 py-4 bg-[#F8FAFC] border-b border-slate-50 flex items-center justify-between">
        <h4 className="font-bold text-slate-800 text-sm tracking-tight flex items-center gap-2">
          <div className="w-1.5 h-3.5 bg-blue-600 rounded-full" />
          {title}
        </h4>
        {status === 'completed' && (
          <span className="text-[10px] font-bold bg-[#F0FDF4] text-[#16A34A] px-2 py-0.5 rounded-full border border-[#D1FAE5]">
            已配置
          </span>
        )}
      </div>
      <div className="p-5 space-y-4">
        {children}
      </div>
    </div>
  );
};

const TimeRangeEditor = ({ label, config, onChange }: { label: string, config?: TimeRangeConfig, onChange: (c: TimeRangeConfig) => void }) => {
  const c = config || { granularity: 'day', mode: 'preset', preset: 'last_30_days' };
  
  const presets: Record<string, {value: string, label: string}[]> = {
    hour: [
      { value: 'last_24_hours', label: '过去24小时' },
      { value: 'last_48_hours', label: '过去48小时' },
      { value: 'last_72_hours', label: '过去72小时' }
    ],
    day: [
      { value: 'yesterday', label: '昨日' },
      { value: 'last_7_days', label: '过去7天' },
      { value: 'last_30_days', label: '过去30天' },
      { value: 'last_90_days', label: '过去90天' }
    ],
    week: [
      { value: 'last_week', label: '上周' },
      { value: 'last_4_weeks', label: '过去4周' },
      { value: 'last_12_weeks', label: '过去12周' }
    ],
    month: [
      { value: 'last_month', label: '上月' },
      { value: 'last_3_months', label: '过去3个月' },
      { value: 'last_6_months', label: '过去6个月' },
      { value: 'last_12_months', label: '过去12个月' }
    ]
  };

  const activePresets = presets[c.granularity || 'day'] || presets['day'];

  return (
    <div className="space-y-3 bg-slate-50 border border-slate-100 rounded-lg p-3">
      <div className="flex items-center gap-3">
        <label className="font-bold text-slate-700 text-xs w-24 shrink-0 px-1">{label}</label>
        <select 
          className="w-32 border border-slate-200 rounded p-1.5 outline-none bg-white text-xs text-slate-600"
          value={c.mode || 'preset'}
          onChange={(e) => onChange({...c, mode: e.target.value as any})}
        >
          <option value="preset">快捷区间</option>
          <option value="function">函数表达式</option>
          <option value="variable">变量选择</option>
        </select>
      </div>
      
      <div className="pl-1 pl-[108px]">
        {c.mode === 'preset' && (
          <select 
            className="w-full border border-slate-200 rounded p-1.5 outline-none bg-white text-xs text-slate-600"
            value={c.preset || activePresets[0].value}
            onChange={(e) => onChange({...c, preset: e.target.value})}
          >
            {activePresets.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        )}
        
        {c.mode === 'function' && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <input type="text" className="w-full border border-slate-200 rounded p-1.5 outline-none bg-white text-xs font-mono text-slate-600" placeholder="开始时间函数" value={c.startExpression || ''} onChange={(e) => onChange({...c, startExpression: e.target.value})} />
            </div>
            <div>
              <input type="text" className="w-full border border-slate-200 rounded p-1.5 outline-none bg-white text-xs font-mono text-slate-600" placeholder="结束时间函数" value={c.endExpression || ''} onChange={(e) => onChange({...c, endExpression: e.target.value})} />
            </div>
          </div>
        )}
        
        {c.mode === 'variable' && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <input type="text" className="w-full border border-slate-200 rounded p-1.5 outline-none bg-white text-xs font-mono text-slate-600 focus:border-blue-400" placeholder="开始时间变量 (如 current.start)" value={c.startVariable || ''} onChange={(e) => onChange({...c, startVariable: e.target.value})} />
            </div>
            <div>
              <input type="text" className="w-full border border-slate-200 rounded p-1.5 outline-none bg-white text-xs font-mono text-slate-600 focus:border-blue-400" placeholder="结束时间变量 (如 current.end)" value={c.endVariable || ''} onChange={(e) => onChange({...c, endVariable: e.target.value})} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const NodeDrawer = ({ isOpen, onClose, config, setConfig, onTest }: NodeDrawerProps) => {
  const handleCompareTypeChange = (ct: CompareType) => {
    // Reset target when compare type changes to avoid invalid state
    let newTarget: DetectionTarget = 'target_point';
    if (ct === 'homogeneous_compare') newTarget = 'target_object';
    
    setConfig({...config, compareType: ct, detectionTarget: newTarget, targetConfig: {}, algorithmSelectionMode: 'system_recommended', detectionMethodType: 'algorithm'});
  };

  const getTargetOptions = (ct: CompareType) => {
    if (ct === 'time_compare') {
      return [
        { id: 'target_point', label: '判断指定时间点是否异常', desc: '判断某个指定日期或时间点的指标值是否异常。', tag: '判断结果' },
        { id: 'scan_points', label: '扫描一段时间内的异常点', desc: '识别一段历史时间内哪些时间点异常。', tag: '异常列表' },
        { id: 'trend', label: '判断趋势是否异常', desc: '判断指标是否存在持续上升、下降或反转。', tag: '判断结果' },
        { id: 'volatility', label: '判断波动是否异常', desc: '判断指标是否存在突增、突降或波动过大。', tag: '判断结果' }
      ];
    } else {
      return [
        { id: 'target_object', label: '判断指定对象是否异常', desc: '判断某个目标对象相较同类对象是否异常。', tag: '判断结果' },
        { id: 'scan_objects', label: '扫描同类对象中的异常对象', desc: '识别同类范围内哪些对象异常。', tag: '异常列表' },
        { id: 'distribution', label: '判断同类整体分布是否异常', desc: '判断同类对象整体是否异常分散、极值过多或异常占比过高。', tag: '判断结果' }
      ];
    }
  };

  const getInputHint = (ct: CompareType, target: DetectionTarget) => {
    const isTime = ct === 'time_compare';
    
    if (isTime && target === 'target_point') return {
      lines: ['检测对象：门店A', '检测指标：销售额', '检测时间：昨天', '历史对比范围：过去30天', '时间粒度：按天'],
      desc: '系统将判断“门店A昨天销售额”相较“门店A过去30天销售额水平”是否异常。'
    };
    if (isTime && target === 'scan_points') return {
      lines: ['检测对象：门店A', '检测指标：销售额', '检测范围：过去30天', '时间粒度：按天'],
      desc: '系统将找出门店A过去30天中销售额异常的日期。'
    };
    if (isTime && target === 'trend') return {
      lines: ['检测对象：门店A', '检测指标：销售额', '趋势观察范围：最近14天', '判断方向：自动判断上升 / 下降 / 反转'],
      desc: '系统将判断门店A销售额是否存在显著趋势异常。'
    };
    if (isTime && target === 'volatility') return {
      lines: ['检测对象：门店A', '检测指标：订单量', '波动观察范围：最近7天', '检测内容：突增、突降、震荡加剧'],
      desc: '系统将判断门店A订单量是否存在异常波动。'
    };

    if (!isTime && target === 'target_object') return {
      lines: ['检测对象：上海门店A', '检测指标：销售额', '同类范围：上海其他门店', '对比时间：昨天', '是否排除自身：是'],
      desc: '系统将判断“上海门店A昨天销售额”相较“上海其他门店昨天销售额水平”是否异常。'
    };
    if (!isTime && target === 'scan_objects') return {
      lines: ['检测范围：上海所有门店', '检测指标：销售额', '对比时间：昨天'],
      desc: '系统将找出上海所有门店中销售额异常的门店。'
    };
    if (!isTime && target === 'distribution') return {
      lines: ['检测范围：上海所有门店', '检测指标：销售额', '对比时间：昨天', '判断内容：离散程度、极值比例、异常占比'],
      desc: '系统将判断上海门店销售额是否整体分布异常。'
    };

    return { lines: [], desc: '' };
  };

  const getRecommendedAlgorithm = (ct: CompareType, target: DetectionTarget) => {
    if (target === 'trend') return 'Mann-Kendall';
    if (target === 'volatility') return '波动异常检测';
    if (target === 'target_point' || target === 'scan_points' || target === 'target_object' || target === 'scan_objects') return 'GESD / IQR';
    return '分布指标检测';
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed right-0 top-0 h-screen w-[540px] bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col font-sans"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80 backdrop-blur-sm z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white shadow-sm shadow-blue-200">
            <Activity size={18} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 tracking-tight">指标异常检测节点配置</h3>
            <p className="text-[10px] text-slate-500 font-medium">参数配置与算法调优</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
          <X size={18} className="text-slate-400" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-32 custom-scrollbar bg-slate-50/30">
        
        {/* Section 1: Basic Info */}
        <Section title="一、基础信息">
          <div className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">节点名称 <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={config.name}
                onChange={(e) => setConfig({...config, name: e.target.value})}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs shadow-sm bg-white outline-none transition-shadow"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">节点说明</label>
              <textarea 
                value={config.description}
                onChange={(e) => setConfig({...config, description: e.target.value})}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs shadow-sm bg-white min-h-[60px] outline-none transition-shadow leading-relaxed"
              />
            </div>
          </div>
        </Section>

        {/* Section 2: Metric Config */}
        <Section title="二、检测指标">
          <div className="space-y-4 pt-1">
             <div className="grid grid-cols-3 gap-3 font-sans">
               <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">指标名称 <span className="text-red-500">*</span></label>
                  <select 
                    value={config.metricConfig?.name || ''}
                    onChange={(e) => {
                      const name = e.target.value;
                      let code = 'sales_amount';
                      if(name === '订单量') { code = 'order_count'; }
                      if(name === '转化率') { code = 'conversion_rate'; }
                      if(name === '库存数量') { code = 'inventory_count'; }
                      if(name === '客诉率') { code = 'complaint_ratio'; }
                      setConfig({...config, metricConfig: {...config.metricConfig, name, code, aggregation: config.metricConfig?.aggregation || 'sum'}});
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white outline-none focus:border-blue-500"
                  >
                    <option value="销售额">销售额</option>
                    <option value="订单量">订单量</option>
                    <option value="转化率">转化率</option>
                    <option value="库存数量">库存数量</option>
                    <option value="客诉率">客诉率</option>
                  </select>
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">聚合方式 <span className="text-red-500">*</span></label>
                  <select 
                    value={config.metricConfig?.aggregation || 'sum'}
                    onChange={(e) => {
                      const agg = e.target.value as 'sum' | 'avg';
                      setConfig({...config, metricConfig: {...config.metricConfig, aggregation: agg}});
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white outline-none focus:border-blue-500"
                  >
                    <option value="sum">求和 sum</option>
                    <option value="avg">均值 avg</option>
                  </select>
               </div>
               <div>
                 <label className="block text-xs font-bold text-slate-700 mb-1.5">指标编码</label>
                 <input type="text" readOnly className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 outline-none text-slate-500 font-mono" value={config.metricConfig?.code || ''} />
               </div>
             </div>
          </div>
        </Section>

        {/* Section 3: Query Condition */}
        <Section title="三、查询条件配置">
          <div className="space-y-4 pt-1">
             <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100/50 flex flex-col gap-2">
                <div className="flex items-start gap-2 text-xs text-blue-800">
                  <Info size={14} className="mt-0.5 shrink-0" />
                  <span className="leading-relaxed">
                    通过逻辑条件来限定指标查询的过滤范围，构建 AND / OR 等复合表达式。
                  </span>
                </div>
             </div>
             
             <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm space-y-2">
                {config.queryConditions?.map((cond, idx) => (
                  <div key={cond.id} className="flex items-center gap-2">
                    {idx > 0 ? (
                      <select 
                        className="w-16 text-[10px] outline-none bg-slate-50 border border-slate-200 rounded p-1.5 font-bold text-blue-700 uppercase"
                        value={cond.relation}
                        onChange={(e) => {
                          const newConds = [...config.queryConditions];
                          newConds[idx].relation = e.target.value as any;
                          setConfig({...config, queryConditions: newConds});
                        }}
                      >
                        <option value="AND">AND</option>
                        <option value="OR">OR</option>
                      </select>
                    ) : (
                      <div className="w-16 text-[10px] text-slate-400 font-bold bg-slate-50 border border-slate-100 rounded px-2 py-1.5 text-center">WHERE</div>
                    )}
                    
                    <button 
                      onClick={() => {
                        const newConds = [...config.queryConditions];
                        newConds[idx].isNot = !newConds[idx].isNot;
                        setConfig({...config, queryConditions: newConds});
                      }}
                      className={cn("px-2 py-1.5 rounded text-[10px] font-bold border transition-colors", cond.isNot ? "bg-red-50 text-red-600 border-red-200" : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50")}
                      title={cond.isNot ? "当前节点取反" : "点击取反"}
                    >
                      NOT
                    </button>
                    
                    <select 
                      className="w-24 text-xs outline-none bg-white border border-slate-200 rounded p-1.5 font-mono text-slate-700 focus:border-blue-400"
                      value={cond.field}
                      onChange={(e) => {
                        const newConds = [...config.queryConditions];
                        newConds[idx].field = e.target.value;
                        setConfig({...config, queryConditions: newConds});
                      }}
                    >
                      <option value="store_id">store_id</option>
                      <option value="city_id">city_id</option>
                      <option value="region_id">region_id</option>
                      <option value="category_id">category_id</option>
                      <option value="period">period</option>
                      <option value="channel">channel</option>
                    </select>
                    
                    <select 
                      className="w-20 text-xs outline-none bg-white border border-slate-200 rounded p-1.5 text-slate-600 font-mono"
                      value={cond.operator}
                      onChange={(e) => {
                        const newConds = [...config.queryConditions];
                        newConds[idx].operator = e.target.value;
                        setConfig({...config, queryConditions: newConds});
                      }}
                    >
                      <option value="==">等于</option>
                      <option value="!=">不等于</option>
                      <option value="contains">包含</option>
                      <option value="not_contains">不包含</option>
                      <option value=">">大于</option>
                      <option value="<">小于</option>
                      <option value="is_null">为空</option>
                      <option value="not_null">不为空</option>
                    </select>

                    <select 
                      className="w-24 text-xs outline-none bg-white border border-slate-200 rounded p-1.5 text-slate-600 font-medium"
                      value={cond.valueSource === 'constant' ? 'constant' : 'variable'}
                      onChange={(e) => {
                        const val = e.target.value as 'variable' | 'constant';
                        const newConds = [...config.queryConditions];
                        newConds[idx].valueSource = val;
                        setConfig({...config, queryConditions: newConds});
                      }}
                    >
                      <option value="variable">变量</option>
                      <option value="constant">固定值</option>
                    </select>
                    
                    <input 
                      placeholder="取值内容"
                      className="flex-1 w-24 text-xs outline-none bg-white border border-slate-200 rounded p-1.5 font-mono text-slate-700 focus:border-blue-400"
                      value={cond.value}
                      onChange={(e) => {
                        const newConds = [...config.queryConditions];
                        newConds[idx].value = e.target.value;
                        setConfig({...config, queryConditions: newConds});
                      }}
                    />
                    
                    <button 
                      onClick={() => {
                        const newConds = config.queryConditions.filter(c => c.id !== cond.id);
                        if (newConds.length > 0) newConds[0].relation = 'WHERE';
                        setConfig({...config, queryConditions: newConds});
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                
                <div className="pt-2">
                  <button 
                    onClick={() => {
                      setConfig({
                        ...config, 
                        queryConditions: [
                          ...(config.queryConditions || []), 
                          { id: Date.now().toString(), relation: !config.queryConditions?.length ? 'WHERE' : 'AND', field: 'store_id', operator: '==', valueSource: 'variable', value: '' }
                        ]
                      });
                    }}
                    className="py-1.5 w-full text-xs text-blue-600 hover:bg-blue-50 border border-dashed border-blue-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 font-semibold"
                  >
                    <Plus size={14} /> 添加条件
                  </button>
                </div>
             </div>

             <div className="px-3 py-2 bg-slate-100/50 rounded-lg border border-slate-200 text-xs flex flex-col gap-1.5 font-mono relative">
               <span className="text-slate-500 font-sans font-medium text-[10px]">表达式预览：</span>
               <span className="text-slate-800 break-all leading-relaxed max-w-full">
                 {config.queryConditions?.map((c, i) => (
                   <span key={c.id}>
                     {i > 0 && <span className="text-blue-600 font-bold mx-1.5">{c.relation}</span>}
                     {i === 0 && <span className="text-emerald-600 font-bold mr-1.5">WHERE</span>}
                     {c.isNot && <span className="text-red-500 font-bold mr-1">NOT</span>}
                     {c.field || 'field'} 
                     <span className="text-slate-400 mx-1">{c.operator === '==' ? '=' : c.operator}</span> 
                     {c.operator === 'is_null' || c.operator === 'not_null' ? '' : (c.valueSource === 'constant' ? `'${c.value}'` : (c.value || 'value'))}
                   </span>
                 ))}
                 {(!config.queryConditions || config.queryConditions.length === 0) && (
                   <span className="text-slate-400 italic">尚未配置查询条件</span>
                 )}
               </span>
             </div>
          </div>
        </Section>

        {/* Section 3: Detection Task (The Core PRD update) */}
        <Section title="三、检测任务" status="completed">
          <div className="space-y-6 pt-1">
            <div className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">你希望怎么判断异常？</div>
            
            {/* Step 1: Compare Type */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px]">1</span> 
                选择对比方式
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'time_compare', name: '时间对比检测', sub: '和自己的历史表现比', desc: '将目标对象当前或指定时间段的表现，与其历史表现进行对比。', ex: '如：门店A昨天销售额是否低于过去30天正常水平。' },
                  { id: 'homogeneous_compare', name: '同类对比检测', sub: '和相似对象的表现比', desc: '将目标对象的表现，与同一范围内的相似对象进行对比。', ex: '如：上海门店A和上海其他门店相比，销售额是否异常。' }
                ].map(ct => (
                  <button 
                    key={ct.id}
                    onClick={() => handleCompareTypeChange(ct.id as CompareType)}
                    className={cn(
                      "flex flex-col text-left p-3 rounded-xl border-2 transition-all relative focus:outline-none",
                      config.compareType === ct.id ? "border-blue-500 bg-blue-50/50 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={cn("w-3 h-3 rounded-full border-2", config.compareType === ct.id ? "border-blue-500 flex items-center justify-center" : "border-slate-300")}>
                        {config.compareType === ct.id && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />}
                      </div>
                      <span className={cn("text-sm font-bold tracking-tight", config.compareType === ct.id ? "text-blue-900" : "text-slate-700")}>{ct.name}</span>
                    </div>
                    <div className={cn("text-[10px] font-semibold mb-1.5 pl-5", config.compareType === ct.id ? "text-blue-700" : "text-slate-500")}>{ct.sub}</div>
                    <div className="text-[10px] text-slate-500 leading-relaxed pl-5 line-clamp-2">{ct.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Detection Target */}
            <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                 <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px]">2</span> 
                 选择检测目标
              </label>
              <div className="grid grid-cols-1 gap-2">
                {getTargetOptions(config.compareType).map(t => (
                  <label 
                    key={t.id}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all bg-white hover:shadow-sm",
                      config.detectionTarget === t.id ? "border-blue-500 shadow-sm ring-1 ring-blue-500/10" : "border-slate-200"
                    )}
                  >
                    <input 
                      type="radio" 
                      name="detectionTarget" 
                      className="mt-0.5 accent-blue-600 w-3.5 h-3.5" 
                      checked={config.detectionTarget === t.id}
                      onChange={() => {
                        const newTargetConfig: any = {};
                        if (config.compareType === 'homogeneous_compare') {
                          newTargetConfig.peerDimensionField = config.targetConfig?.peerDimensionField;
                          newTargetConfig.benchmarkDimensionCondition = config.targetConfig?.benchmarkDimensionCondition;
                          newTargetConfig.timeDimensionField = config.targetConfig?.timeDimensionField;
                          newTargetConfig.comparisonTimeRange = config.targetConfig?.comparisonTimeRange;
                        } else {
                          newTargetConfig.timeField = config.targetConfig?.timeField;
                        }
                        setConfig({...config, detectionTarget: t.id as DetectionTarget, targetConfig: newTargetConfig, algorithmSelectionMode: 'system_recommended', detectionMethodType: 'algorithm'});
                      }}
                    />
                    <div className="flex-1 flex flex-col pt-0.5">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn("text-sm font-bold tracking-tight", config.detectionTarget === t.id ? "text-blue-900" : "text-slate-800")}>{t.label}</span>
                        <span className={cn(
                          "text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider",
                          t.tag === '判断结果' ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                        )}>{t.tag}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 leading-relaxed">{t.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Step 3: Target Config Form */}
            <div className="space-y-2 animate-in fade-in duration-300 mt-6">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                 <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px]">3</span> 
                 目标参数配置
              </label>
              <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-4 shadow-inner text-xs space-y-4">
                {config.compareType === 'time_compare' && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-700 text-xs">时间字段</label>
                        <select 
                          className="w-full border border-slate-200 rounded-lg p-2 outline-none font-mono text-slate-600 bg-white text-xs"
                          value={config.targetConfig?.timeField || 'ds'}
                          onChange={(e) => setConfig({...config, targetConfig: {...config.targetConfig, timeField: e.target.value}})}
                        >
                          <option value="ds">ds (时间维度)</option>
                          <option value="biz_date">biz_date (业务日期)</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-700 text-xs">时间粒度</label>
                        <select 
                          className="w-full border border-slate-200 rounded-lg p-2 outline-none bg-white text-xs"
                          value={config.targetConfig?.timeRangeConfig?.granularity || 'day'}
                          onChange={(e) => {
                             const gr = e.target.value as any;
                             setConfig({...config, targetConfig: {...config.targetConfig, timeRangeConfig: {...config.targetConfig?.timeRangeConfig, granularity: gr}}})
                          }}
                        >
                          <option value="hour">按小时</option>
                          <option value="day">按天</option>
                          <option value="week">按周</option>
                          <option value="month">按月</option>
                        </select>
                      </div>
                    </div>
                    
                    {config.detectionTarget === 'target_point' ? (
                       <div className="space-y-4 bg-white border border-slate-200 p-3.5 rounded-xl">
                         <div className="space-y-3">
                           <div className="flex items-center justify-between">
                             <label className="font-bold text-slate-700 text-xs">目标时间点配置 <span className="text-red-500">*</span></label>
                             <select
                               className="text-[10px] font-semibold border border-slate-200 rounded p-1 outline-none bg-white text-slate-600"
                               value={config.targetConfig?.targetDateConfig?.mode || 'date'}
                               onChange={(e) => {
                                 const m = e.target.value as any;
                                 const currentVal = config.targetConfig?.targetDateConfig?.value || config.targetConfig?.targetDate || '';
                                 setConfig({
                                   ...config,
                                   targetConfig: {
                                      ...config.targetConfig,
                                      targetDate: currentVal,
                                      targetDateConfig: { mode: m, value: currentVal }
                                   }
                                 });
                               }}
                             >
                               <option value="date">选择日期</option>
                               <option value="function">函数表达式</option>
                               <option value="variable">变量选择</option>
                             </select>
                           </div>

                           <div>
                             {(() => {
                               const mode = config.targetConfig?.targetDateConfig?.mode || 'date';
                               const value = config.targetConfig?.targetDateConfig?.value ?? config.targetConfig?.targetDate ?? '';
                               if (mode === 'date') {
                                 return (
                                   <input 
                                     type="date" 
                                     className="w-full border border-slate-200 rounded p-1.5 outline-none font-mono text-slate-600 bg-white text-xs" 
                                     value={value}
                                     onChange={(e) => {
                                       setConfig({
                                         ...config,
                                         targetConfig: {
                                           ...config.targetConfig,
                                           targetDate: e.target.value,
                                           targetDateConfig: { mode: 'date', value: e.target.value }
                                         }
                                       });
                                     }}
                                   />
                                 );
                               } else if (mode === 'function') {
                                 return (
                                   <input 
                                     type="text" 
                                     placeholder="如: date_sub(today(), 1)"
                                     className="w-full border border-slate-200 rounded p-1.5 outline-none font-mono text-slate-600 bg-white text-xs" 
                                     value={value}
                                     onChange={(e) => {
                                       setConfig({
                                         ...config,
                                         targetConfig: {
                                           ...config.targetConfig,
                                           targetDate: e.target.value,
                                           targetDateConfig: { mode: 'function', value: e.target.value }
                                         }
                                       });
                                     }}
                                   />
                                 );
                               } else {
                                 return (
                                   <input 
                                     type="text" 
                                     placeholder="如: current.biz_date"
                                     className="w-full border border-slate-200 rounded p-1.5 outline-none font-mono text-slate-600 bg-white text-xs" 
                                     value={value}
                                     onChange={(e) => {
                                       setConfig({
                                         ...config,
                                         targetConfig: {
                                           ...config.targetConfig,
                                           targetDate: e.target.value,
                                           targetDateConfig: { mode: 'variable', value: e.target.value }
                                         }
                                       });
                                     }}
                                   />
                                 );
                               }
                             })()}
                           </div>
                         </div>

                         {/* “移除目标时间点” 勾选框 */}
                         <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                           <label className="flex items-center gap-2 cursor-pointer select-none">
                             <input 
                               type="checkbox" 
                               checked={config.targetConfig?.excludeTargetPoint !== false}
                               className="accent-blue-600 rounded w-3.5 h-3.5"
                               onChange={(e) => {
                                 setConfig({
                                   ...config,
                                   targetConfig: {
                                     ...config.targetConfig,
                                     excludeTargetPoint: e.target.checked
                                   }
                                 });
                               }}
                             />
                             <span className="text-[11px] text-slate-600 font-bold">移除目标时间点</span>
                           </label>
                           <span className="text-[9px] text-slate-400 font-medium">在历史区间内排除</span>
                         </div>

                         <div className="space-y-1.5 pt-2 border-t border-slate-100">
                           <TimeRangeEditor 
                             label="历史对比区间"
                             config={config.targetConfig?.timeRangeConfig} 
                             onChange={(c) => setConfig({...config, targetConfig: {...config.targetConfig, timeRangeConfig: c}})} 
                           />
                         </div>
                       </div>
                    ) : (
                       <TimeRangeEditor 
                         label="检测时间区间"
                         config={config.targetConfig?.timeRangeConfig} 
                         onChange={(c) => setConfig({...config, targetConfig: {...config.targetConfig, timeRangeConfig: c}})} 
                       />
                    )}
                  </>
                )}

                {config.compareType === 'homogeneous_compare' && (
                  <div className="space-y-4">
                    {/* 1. 同类范围维度字段 */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">同类范围维度字段 <span className="text-red-500">*</span></label>
                      <select 
                        className="w-full border border-slate-200 rounded-lg p-2 outline-none font-medium text-slate-600 bg-white text-xs shadow-sm focus:border-blue-400"
                        value={config.targetConfig?.peerDimensionField || 'city_id'}
                        onChange={(e) => {
                          const val = e.target.value;
                          setConfig({
                            ...config, 
                            targetConfig: {
                              ...config.targetConfig, 
                              peerDimensionField: val,
                              targetDimensionValue: config.targetConfig?.targetDimensionValue || `current.${val}`,
                              benchmarkVariable: config.targetConfig?.benchmarkVariable || `context.peer_${val}s`
                            }
                          });
                        }}
                      >
                        <option value="city_id">城市ID city_id</option>
                        <option value="city_name">城市名称 city_name</option>
                        <option value="region_id">区域ID region_id</option>
                        <option value="category_id">品类ID category_id</option>
                        <option value="category_name">品类名称 category_name</option>
                        <option value="store_type">门店类型 store_type</option>
                      </select>
                    </div>

                    {/* 2. 待检测对象取值 (Only for target_object) */}
                    {config.detectionTarget === 'target_object' && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 block">待检测对象维度取值</label>
                        <input 
                          type="text" 
                          className="w-full border border-slate-200 rounded-lg p-2 outline-none font-mono text-slate-600 bg-white text-xs shadow-sm focus:border-blue-400"
                          placeholder="如: current.city_id"
                          value={config.targetConfig?.targetDimensionValue || `current.${config.targetConfig?.peerDimensionField || 'city_id'}`}
                          onChange={(e) => setConfig({...config, targetConfig: {...config.targetConfig, targetDimensionValue: e.target.value}})}
                        />
                      </div>
                    )}

                    {/* 3. 范围对象取值范围 */}
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-700 block mb-1">范围对象取值范围</label>
                       <div className="text-[10px] text-slate-500 mb-2">用于定义参与同类对比的对象集合，可输入固定列表、变量数组或表达式。</div>
                       <select
                         className="w-full border border-slate-200 rounded-lg p-2 outline-none text-xs text-slate-600 bg-white shadow-sm focus:border-blue-400 mb-2"
                         value={config.targetConfig?.benchmarkValueMode || 'variable'}
                         onChange={(e) => setConfig({...config, targetConfig: {...config.targetConfig, benchmarkValueMode: e.target.value as any}})}
                       >
                         <option value="fixed_list">固定值列表</option>
                         <option value="variable">变量</option>
                         <option value="expression">自定义表达式</option>
                       </select>

                       {/* Contextual Input depending on mode */}
                       {(() => {
                         const mode = config.targetConfig?.benchmarkValueMode || 'variable';
                         if (mode === 'fixed_list') {
                           return (
                             <input 
                               type="text" 
                               className="w-full border border-slate-200 rounded-lg p-2 outline-none font-mono text-slate-600 bg-white text-xs shadow-sm focus:border-blue-400"
                               placeholder="英文逗号隔开，如: beijing, shanghai, guangzhou"
                               value={(config.targetConfig?.benchmarkFixedValues || []).join(', ')}
                               onChange={(e) => {
                                 const vals = e.target.value.split(',').map(v => v.trim()).filter(v => v);
                                 setConfig({...config, targetConfig: {...config.targetConfig, benchmarkFixedValues: vals}});
                               }}
                             />
                           );
                         } else if (mode === 'variable') {
                           return (
                             <input 
                               type="text" 
                               className="w-full border border-slate-200 rounded-lg p-2 outline-none font-mono text-slate-600 bg-white text-xs shadow-sm focus:border-blue-400"
                               placeholder="如: current.peer_city_ids"
                               value={config.targetConfig?.benchmarkVariable || ''}
                               onChange={(e) => setConfig({...config, targetConfig: {...config.targetConfig, benchmarkVariable: e.target.value}})}
                             />
                           );
                         } else {
                           return (
                             <input 
                               type="text" 
                               className="w-full border border-slate-200 rounded-lg p-2 outline-none font-mono text-slate-600 bg-white text-xs shadow-sm focus:border-blue-400"
                               placeholder="如: region_id = current.region_id AND city_level IN ('一线')"
                               value={config.targetConfig?.benchmarkExpression || ''}
                               onChange={(e) => setConfig({...config, targetConfig: {...config.targetConfig, benchmarkExpression: e.target.value}})}
                             />
                           );
                         }
                       })()}

                       {/* Expression Preview */}
                       <div className="bg-slate-50 border border-slate-200 p-2 rounded text-[10px] font-mono text-slate-500 mt-2">
                         预览: {(() => {
                           const field = config.targetConfig?.peerDimensionField || 'city_id';
                           const mode = config.targetConfig?.benchmarkValueMode || 'variable';
                           if (mode === 'fixed_list') {
                             const vals = config.targetConfig?.benchmarkFixedValues || [];
                             if (vals.length === 0) return '尚未配置固定值';
                             return `${field} IN (${vals.map(v => `'${v}'`).join(', ')})`;
                           } else if (mode === 'variable') {
                             const vari = config.targetConfig?.benchmarkVariable;
                             if (!vari) return '尚未配置变量';
                             return `${field} IN {${vari}}`;
                           } else {
                             return config.targetConfig?.benchmarkExpression || '尚未配置表达式';
                           }
                         })()}
                       </div>
                    </div>
                    
                    {/* 4. 范围对象是否包含待检测对象 (Only for target_object) */}
                    {config.detectionTarget === 'target_object' && (
                       <div className="pt-2 border-t border-slate-100 flex items-center justify-between mt-2">
                         <label className="flex items-center gap-2 cursor-pointer select-none">
                           <input 
                             type="checkbox" 
                             className="accent-blue-600 rounded w-3.5 h-3.5"
                             checked={config.targetConfig?.includeTargetInBenchmark !== true}
                             onChange={(e) => setConfig({...config, targetConfig: {...config.targetConfig, includeTargetInBenchmark: !e.target.checked}})}
                           />
                           <span className="text-[11px] text-slate-600 font-bold">移除待检测对象</span>
                         </label>
                         <span className="text-[9px] text-slate-400 font-medium">在对标集合内排除</span>
                       </div>
                    )}
                    
                    {/* 5. 分布判断指标 (多选) */}
                    {config.detectionTarget === 'distribution' && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-100">
                        <label className="text-xs font-bold text-slate-700 block mb-1.5">分布判断指标 (多选)</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'dispersion', label: '离散程度' },
                            { id: 'extremes', label: '极值比例' },
                            { id: 'anomaly_ratio', label: '异常占比' }
                          ].map(item => {
                            const currentMetrics = config.targetConfig?.distributionMetrics || ['dispersion', 'extremes', 'anomaly_ratio'];
                            const isChecked = currentMetrics.includes(item.id);
                            return (
                              <label key={item.id} className="flex items-center gap-2 cursor-pointer bg-white border border-slate-200 p-2 rounded-lg text-xs hover:bg-slate-50 shadow-sm">
                                <input 
                                  type="checkbox" 
                                  checked={isChecked}
                                  className="accent-blue-600 rounded"
                                  onChange={(e) => {
                                    const newMetrics = e.target.checked 
                                      ? [...currentMetrics, item.id]
                                      : currentMetrics.filter(m => m !== item.id);
                                    setConfig({
                                      ...config,
                                      targetConfig: {
                                        ...config.targetConfig,
                                        distributionMetrics: newMetrics
                                      }
                                    });
                                  }}
                                />
                                <span className="text-slate-600 font-medium">{item.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          
          {/* Section 4 Advanced Config inside Task */}
          <div className="pt-6 border-t border-slate-100">
              <details className="group">
                <summary className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between cursor-pointer list-none w-full">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px]">4</span> 
                    高级配置：检测方法
                  </div>
                  <ChevronDown size={14} className="text-slate-400 group-open:rotate-180 transition-transform" />
                </summary>
                
                <div className="mt-4 space-y-4">
                  <div className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">请选择本节点使用的异常判断方式：</div>
                  
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button 
                      onClick={() => setConfig({...config, detectionMethodType: 'algorithm'})}
                      className={cn(
                        "flex flex-col text-left p-3.5 rounded-xl border-2 transition-all relative overflow-hidden focus:outline-none",
                        config.detectionMethodType === 'algorithm' ? "border-blue-500 bg-blue-50 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className={cn("w-3 h-3 rounded-full border-2", config.detectionMethodType === 'algorithm' ? "border-blue-500 flex items-center justify-center shadow-sm" : "border-slate-300")}>
                          {config.detectionMethodType === 'algorithm' && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />}
                        </div>
                        <span className={cn("text-sm font-bold tracking-tight", config.detectionMethodType === 'algorithm' ? "text-blue-900" : "text-slate-700")}>算法检测</span>
                      </div>
                      <div className="text-[10px] text-slate-500 leading-relaxed pl-5 mt-1">基于统计、趋势或波动算法自动识别异常。</div>
                    </button>
                    <button 
                      onClick={() => setConfig({...config, detectionMethodType: 'manual_rule'})}
                      className={cn(
                        "flex flex-col text-left p-3.5 rounded-xl border-2 transition-all relative overflow-hidden focus:outline-none",
                        config.detectionMethodType === 'manual_rule' ? "border-blue-500 bg-blue-50 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className={cn("w-3 h-3 rounded-full border-2", config.detectionMethodType === 'manual_rule' ? "border-blue-500 flex items-center justify-center shadow-sm" : "border-slate-300")}>
                          {config.detectionMethodType === 'manual_rule' && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />}
                        </div>
                        <span className={cn("text-sm font-bold tracking-tight", config.detectionMethodType === 'manual_rule' ? "text-blue-900" : "text-slate-700")}>人工规则检测</span>
                      </div>
                      <div className="text-[10px] text-slate-500 leading-relaxed pl-5 mt-1">基于业务条件表达式判断，适合明确阈值。</div>
                    </button>
                  </div>

                  {config.detectionMethodType === 'algorithm' && (
                    <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-4 shadow-inner space-y-4 animate-in fade-in slide-in-from-top-2">
                      <div className="space-y-3">
                        <label className="block text-[11px] font-bold text-slate-700">算法选择：</label>
                        <select 
                          className="w-full text-xs p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:border-blue-500 bg-white"
                          value={config.algorithm}
                          onChange={(e) => setConfig({...config, algorithm: e.target.value as any})}
                        >
                          {config.compareType === 'time_compare' ? (
                            <>
                              <option value="gesd">GESD 离群点检测 {getRecommendedAlgorithm(config.compareType, config.detectionTarget).includes('GESD') ? '(系统推荐)' : ''}</option>
                              <option value="zscore">Z-Score 偏离检测</option>
                              <option value="quantile">分位数检测</option>
                              <option value="mann_kendall">Mann-Kendall 趋势异常判断 {config.detectionTarget === 'trend' ? '(系统推荐)' : ''}</option>
                              <option value="volatility">波动异常检测 {config.detectionTarget === 'volatility' ? '(系统推荐)' : ''}</option>
                            </>
                          ) : (
                            <>
                              <option value="gesd">GESD 离群点检测 {getRecommendedAlgorithm(config.compareType, config.detectionTarget).includes('GESD') ? '(系统推荐)' : ''}</option>
                              <option value="zscore">Z-Score 偏离检测</option>
                              <option value="iqr">IQR 四分位距检测</option>
                              <option value="quantile">分位数检测</option>
                              <option value="dispersion">离散度分布检测 {config.detectionTarget === 'distribution' ? '(系统推荐)' : ''}</option>
                              <option value="extreme_ratio">极值比例检测</option>
                            </>
                          )}
                        </select>
                      </div>
                      
                      {/* Simulated algorithm params block */}
                      <div className="pt-3 border-t border-slate-200">
                        <div className="text-[11px] font-bold text-slate-700 mb-3 block">算法参数：</div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="space-y-1">
                              <label className="text-slate-500 text-[10px] font-bold">检测方向</label>
                              <select 
                                className="w-full bg-white border border-slate-200 rounded p-1.5 outline-none font-medium"
                                value={config.algorithmParams?.direction || 'both'}
                                onChange={(e) => setConfig({...config, algorithmParams: {...config.algorithmParams, direction: e.target.value as any}})}
                              >
                                <option value="both">双向异常</option>
                                <option value="high">仅偏高</option>
                                <option value="low">仅偏低</option>
                              </select>
                          </div>

                          {config.algorithm === 'gesd' && (
                            <>
                              <div className="space-y-1">
                                <label className="text-slate-500 text-[10px] font-bold">alpha (显著性水平)</label>
                                <input type="number" step="0.01" className="w-full bg-white border border-slate-200 rounded p-1.5 outline-none font-mono"
                                  value={config.algorithmParams?.alpha || 0.05}
                                  onChange={(e) => setConfig({...config, algorithmParams: {...config.algorithmParams, alpha: parseFloat(e.target.value)}})}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-slate-500 text-[10px] font-bold">最大异常比例</label>
                                <input type="number" step="0.01" className="w-full bg-white border border-slate-200 rounded p-1.5 outline-none font-mono"
                                  value={config.algorithmParams?.maxAnomalyRatio || 0.1}
                                  onChange={(e) => setConfig({...config, algorithmParams: {...config.algorithmParams, maxAnomalyRatio: parseFloat(e.target.value)}})}
                                />
                              </div>
                            </>
                          )}
                          {config.algorithm === 'zscore' && (
                            <div className="space-y-1">
                              <label className="text-slate-500 text-[10px] font-bold">Z-Score 阈值</label>
                              <input type="number" step="0.1" className="w-full bg-white border border-slate-200 rounded p-1.5 outline-none font-mono"
                                value={config.algorithmParams?.zscoreThreshold || 3.0}
                                onChange={(e) => setConfig({...config, algorithmParams: {...config.algorithmParams, zscoreThreshold: parseFloat(e.target.value)}})}
                              />
                            </div>
                          )}
                          {config.algorithm === 'iqr' && (
                            <div className="space-y-1">
                              <label className="text-slate-500 text-[10px] font-bold">IQR 倍数</label>
                              <input type="number" step="0.1" className="w-full bg-white border border-slate-200 rounded p-1.5 outline-none font-mono"
                                value={config.algorithmParams?.iqrMultiplier || 1.5}
                                onChange={(e) => setConfig({...config, algorithmParams: {...config.algorithmParams, iqrMultiplier: parseFloat(e.target.value)}})}
                              />
                            </div>
                          )}
                          {config.algorithm === 'quantile' && (
                            <>
                              <div className="space-y-1">
                                <label className="text-slate-500 text-[10px] font-bold">下分位数</label>
                                <input type="number" step="0.01" className="w-full bg-white border border-slate-200 rounded p-1.5 outline-none font-mono"
                                  value={config.algorithmParams?.lowerQuantile || 0.05}
                                  onChange={(e) => setConfig({...config, algorithmParams: {...config.algorithmParams, lowerQuantile: parseFloat(e.target.value)}})}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-slate-500 text-[10px] font-bold">上分位数</label>
                                <input type="number" step="0.01" className="w-full bg-white border border-slate-200 rounded p-1.5 outline-none font-mono"
                                  value={config.algorithmParams?.upperQuantile || 0.95}
                                  onChange={(e) => setConfig({...config, algorithmParams: {...config.algorithmParams, upperQuantile: parseFloat(e.target.value)}})}
                                />
                              </div>
                            </>
                          )}
                          {config.algorithm === 'mann_kendall' && (
                            <>
                              <div className="space-y-1">
                                <label className="text-slate-500 text-[10px] font-bold">显著性水平</label>
                                <input type="number" step="0.01" className="w-full bg-white border border-slate-200 rounded p-1.5 outline-none font-mono"
                                  value={config.algorithmParams?.mkAlpha || 0.05}
                                  onChange={(e) => setConfig({...config, algorithmParams: {...config.algorithmParams, mkAlpha: parseFloat(e.target.value)}})}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-slate-500 text-[10px] font-bold">趋势窗口</label>
                                <input type="text" className="w-full bg-white border border-slate-200 rounded p-1.5 outline-none font-mono"
                                  value={config.algorithmParams?.mkWindow || '14d'}
                                  onChange={(e) => setConfig({...config, algorithmParams: {...config.algorithmParams, mkWindow: e.target.value}})}
                                />
                              </div>
                            </>
                          )}
                          {config.algorithm === 'volatility' && (
                            <>
                              <div className="space-y-1">
                                <label className="text-slate-500 text-[10px] font-bold">窗口大小</label>
                                <input type="text" className="w-full bg-white border border-slate-200 rounded p-1.5 outline-none font-mono"
                                  value={config.algorithmParams?.volatilityWindow || '7d'}
                                  onChange={(e) => setConfig({...config, algorithmParams: {...config.algorithmParams, volatilityWindow: e.target.value}})}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-slate-500 text-[10px] font-bold">变化率阈值</label>
                                <input type="number" step="0.1" className="w-full bg-white border border-slate-200 rounded p-1.5 outline-none font-mono"
                                  value={config.algorithmParams?.changeRate || 0.5}
                                  onChange={(e) => setConfig({...config, algorithmParams: {...config.algorithmParams, changeRate: parseFloat(e.target.value)}})}
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

            {config.detectionMethodType === 'manual_rule' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex justify-between items-center pb-1">
                  <span className="text-xs font-bold text-slate-700">规则组列表</span>
                  <button 
                    onClick={() => {
                      const currentGroups = config.manualRuleConfig?.ruleGroups || [];
                      const nextId = Date.now().toString();
                      const newGroup = {
                        id: nextId,
                        name: `规则组 ${currentGroups.length + 1}`,
                        logicOperator: 'AND' as const,
                        anomalyDirection: 'low' as const,
                        anomalyLevel: 'high' as const,
                        anomalyActions: ['mark_anomaly'],
                        rules: [
                          { id: nextId + 'r1', relation: 'WHERE' as const, field: 'current.sales_amount', operator: '<', valueSource: 'constant' as const, value: '50000' }
                        ]
                      };
                      setConfig({
                        ...config,
                        manualRuleConfig: {
                          ruleGroups: [...currentGroups, newGroup]
                        }
                      });
                    }}
                    className="text-[11px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 bg-blue-50 border border-blue-200 px-2.5 py-1.5 rounded-lg hover:bg-blue-100 transition-colors shadow-xs"
                  >
                    <Plus size={12} /> 添加规则组
                  </button>
                </div>

                <div className="space-y-4">
                  {(config.manualRuleConfig?.ruleGroups || [
                    {
                      id: 'g1',
                      name: '规则组 1',
                      logicOperator: 'AND',
                      anomalyDirection: 'low',
                      anomalyLevel: 'high',
                      anomalyActions: ['mark_anomaly'],
                      rules: [
                        { id: 'r1', relation: 'WHERE', field: 'current.sales_amount', operator: '<', valueSource: 'constant', value: '50000' }
                      ]
                    }
                  ]).map((group, groupIdx) => {
                    const previewStr = group.rules.map(r => {
                      const displayField = r.field || 'field';
                      const displayVal = r.operator === 'is_null' || r.operator === 'not_null' ? '' : (r.valueSource === 'constant' ? `'${r.value}'` : r.value);
                      const displayOp = r.operator === '==' ? '=' : r.operator;
                      return `${r.relation !== 'WHERE' ? `${r.relation} ` : ''}${displayField} ${displayOp} ${displayVal}`;
                    }).join(` `);

                    return (
                      <div key={group.id} className="bg-slate-50/50 border border-slate-200 rounded-xl p-4 space-y-4 hover:border-slate-300 transition-all">
                        {/* Group Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                          <div className="flex items-center gap-2 flex-1 max-w-[65%]">
                            <span className="text-xs font-bold text-slate-700 shrink-0">规则组名称:</span>
                            <input 
                              type="text" 
                              value={group.name}
                              onChange={(e) => {
                                const newGroups = [...(config.manualRuleConfig?.ruleGroups || [])];
                                newGroups[groupIdx].name = e.target.value;
                                setConfig({...config, manualRuleConfig: { ruleGroups: newGroups }});
                              }}
                              className="text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded px-2 py-1 outline-none focus:border-blue-400 w-full"
                              placeholder="如: 低销高异常"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] font-medium text-slate-500">逻辑关系:</span>
                              <select 
                                value={group.logicOperator}
                                onChange={(e) => {
                                  const newGroups = [...(config.manualRuleConfig?.ruleGroups || [])];
                                  newGroups[groupIdx].logicOperator = e.target.value as any;
                                  setConfig({...config, manualRuleConfig: { ruleGroups: newGroups }});
                                }}
                                className="text-[10px] font-bold text-blue-700 bg-white border border-blue-200 rounded px-1.5 py-0.5 outline-none"
                              >
                                <option value="AND">AND</option>
                                <option value="OR">OR</option>
                              </select>
                            </div>

                            <button 
                              disabled={!(config.manualRuleConfig?.ruleGroups && config.manualRuleConfig.ruleGroups.length > 1)}
                              onClick={() => {
                                const currentGroups = config.manualRuleConfig?.ruleGroups || [];
                                const newGroups = currentGroups.filter(g => g.id !== group.id);
                                setConfig({...config, manualRuleConfig: { ruleGroups: newGroups }});
                              }}
                              className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                              title="删除此规则组"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Rules List of the group */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">条件列表</label>
                          <div className="space-y-2">
                            {group.rules.map((rule, ruleIdx) => (
                              <div key={rule.id} className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-2 relative shadow-xs">
                                {/* Rule Relation Selector */}
                                {ruleIdx === 0 ? (
                                  <div className="w-14 text-[10px] text-slate-400 font-bold bg-slate-50 border border-slate-200 rounded py-1 text-center select-none">WHERE</div>
                                ) : (
                                  <select 
                                    value={rule.relation}
                                    onChange={(e) => {
                                      const newGroups = [...(config.manualRuleConfig?.ruleGroups || [])];
                                      newGroups[groupIdx].rules[ruleIdx].relation = e.target.value as any;
                                      setConfig({...config, manualRuleConfig: { ruleGroups: newGroups }});
                                    }}
                                    className="w-14 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded py-0.5 outline-none uppercase"
                                  >
                                    <option value="AND">AND</option>
                                    <option value="OR">OR</option>
                                  </select>
                                )}

                                {/* Field Selector */}
                                <select 
                                  value={rule.field}
                                  onChange={(e) => {
                                    const newGroups = [...(config.manualRuleConfig?.ruleGroups || [])];
                                    newGroups[groupIdx].rules[ruleIdx].field = e.target.value;
                                    setConfig({...config, manualRuleConfig: { ruleGroups: newGroups }});
                                  }}
                                  className="w-28 text-[10px] font-mono border border-slate-150 rounded bg-slate-50 p-1 text-slate-700 outline-none"
                                >
                                  <option value="current.sales_amount">sales_amount 销售额</option>
                                  <option value="current.order_count">order_count 订单量</option>
                                  <option value="current.conversion_rate">conversion_rate 转化率</option>
                                  <option value="current.complaint_ratio">complaint_ratio 客诉率</option>
                                  <option value="current.inventory_count">inventory_count 库存</option>
                                </select>

                                {/* Operator Selector */}
                                <select 
                                  value={rule.operator}
                                  onChange={(e) => {
                                    const newGroups = [...(config.manualRuleConfig?.ruleGroups || [])];
                                    newGroups[groupIdx].rules[ruleIdx].operator = e.target.value;
                                    setConfig({...config, manualRuleConfig: { ruleGroups: newGroups }});
                                  }}
                                  className="w-12 text-[10px] border border-slate-150 rounded bg-slate-50 p-1 text-slate-700 outline-none font-mono"
                                >
                                  <option value="<">&lt;</option>
                                  <option value="<=">&lt;=</option>
                                  <option value=">">&gt;</option>
                                  <option value=">=">&gt;=</option>
                                  <option value="==">=</option>
                                  <option value="!=">!=</option>
                                  <option value="contains">包含</option>
                                  <option value="is_null">为空</option>
                                  <option value="not_null">非空</option>
                                </select>

                                {/* Value Source Selector */}
                                <select 
                                  value={rule.valueSource}
                                  onChange={(e) => {
                                    const newGroups = [...(config.manualRuleConfig?.ruleGroups || [])];
                                    newGroups[groupIdx].rules[ruleIdx].valueSource = e.target.value as any;
                                    setConfig({...config, manualRuleConfig: { ruleGroups: newGroups }});
                                  }}
                                  className="w-20 text-[9px] border border-slate-150 rounded bg-slate-50 p-1 text-slate-600 outline-none"
                                >
                                  <option value="constant">固定值</option>
                                  <option value="upstream_variable">上游变量</option>
                                  <option value="system_variable">系统变量</option>
                                  <option value="metric_result">指标结果</option>
                                </select>

                                {/* Value Input */}
                                <input 
                                  type="text"
                                  value={rule.value}
                                  onChange={(e) => {
                                    const newGroups = [...(config.manualRuleConfig?.ruleGroups || [])];
                                    newGroups[groupIdx].rules[ruleIdx].value = e.target.value;
                                    setConfig({...config, manualRuleConfig: { ruleGroups: newGroups }});
                                  }}
                                  placeholder="变量名或固定值"
                                  className="flex-1 min-w-[40px] text-[10px] font-mono border border-slate-200 rounded px-1.5 py-1 text-slate-700 focus:border-blue-400 outline-none"
                                />

                                {/* Delete Rule Action */}
                                <button 
                                  disabled={group.rules.length <= 1}
                                  onClick={() => {
                                    const newGroups = [...(config.manualRuleConfig?.ruleGroups || [])];
                                    const filtered = group.rules.filter(r => r.id !== rule.id);
                                    if (filtered.length > 0) filtered[0].relation = 'WHERE';
                                    newGroups[groupIdx].rules = filtered;
                                    setConfig({...config, manualRuleConfig: { ruleGroups: newGroups }});
                                  }}
                                  className="p-1 text-slate-400 hover:text-red-500 rounded disabled:opacity-35 transition-colors"
                                  title="删除此条件"
                                >
                                  <X size={11} />
                                </button>
                              </div>
                            ))}
                          </div>

                          <div className="pt-1">
                            <button 
                              onClick={() => {
                                const newGroups = [...(config.manualRuleConfig?.ruleGroups || [])];
                                const randId = Date.now().toString() + Math.random().toString(36).substr(2, 4);
                                newGroups[groupIdx].rules.push({
                                  id: randId,
                                  relation: 'AND',
                                  field: 'current.sales_amount',
                                  operator: '<',
                                  valueSource: 'constant',
                                  value: ''
                                });
                                setConfig({...config, manualRuleConfig: { ruleGroups: newGroups }});
                              }}
                              className="text-[10px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1"
                            >
                              <Plus size={11} /> 添加条件行
                            </button>
                          </div>
                        </div>

                        {/* Group parameters (Direction, Level) */}
                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200/60 text-xs">
                          <div className="space-y-1">
                            <label className="text-slate-500 font-bold text-[10px]">异常方向 <span className="text-red-500">*</span></label>
                            <select 
                              value={group.anomalyDirection}
                              onChange={(e) => {
                                const newGroups = [...(config.manualRuleConfig?.ruleGroups || [])];
                                newGroups[groupIdx].anomalyDirection = e.target.value as any;
                                setConfig({...config, manualRuleConfig: { ruleGroups: newGroups }});
                              }}
                              className="w-full bg-white border border-slate-200 rounded p-1.5 outline-none text-xs text-slate-700 font-semibold"
                            >
                              <option value="low">偏低 low</option>
                              <option value="high">偏高 high</option>
                              <option value="both">双向 both</option>
                              <option value="custom">自定义 custom</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-slate-500 font-bold text-[10px]">异常级别 <span className="text-red-500">*</span></label>
                            <select 
                              value={group.anomalyLevel}
                              onChange={(e) => {
                                const newGroups = [...(config.manualRuleConfig?.ruleGroups || [])];
                                newGroups[groupIdx].anomalyLevel = e.target.value as any;
                                setConfig({...config, manualRuleConfig: { ruleGroups: newGroups }});
                              }}
                              className="w-full bg-white border border-slate-200 rounded p-1.5 outline-none text-xs text-slate-700 font-semibold"
                            >
                              <option value="low">低 low</option>
                              <option value="medium">中 medium</option>
                              <option value="high">高 high</option>
                              <option value="critical">极高 critical</option>
                            </select>
                          </div>
                        </div>

                        {/* Expression Preview */}
                        <div className="bg-slate-100/60 border border-slate-200/60 rounded-lg p-2 text-[10px] font-mono text-slate-500">
                          <span className="font-semibold text-[9px] text-slate-400 block mb-0.5">表达式预览 EXPRESSION:</span>
                          <span className="text-slate-600 break-all">{previewStr ? `(${previewStr.trim()})` : '未配置任何条件'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
                </div>
              </details>
            </div>
          </div>
        </Section>

        {/* Section 4: Output */}
        <Section title="四、输出字段">
          <div className="space-y-4 pt-1">
             <div>
               <label className="text-xs font-bold text-slate-700 block mb-2">节点固定输出 structure (只读)：</label>
               
               <div className="bg-[#F8FAFC] border border-slate-200 rounded-lg p-3 text-xs font-mono text-slate-600 space-y-4">
                 
                 <div>
                   <div className="font-bold text-slate-800 mb-1.5 flex items-center gap-1.5"><Layers size={14} className="text-blue-500" /> summary</div>
                   <div className="space-y-1.5 pl-3 border-l-2 border-slate-200 ml-1.5">
                     <div className="flex justify-between items-center bg-white p-1.5 rounded border border-slate-100 shadow-sm">
                       <span className="font-bold text-slate-800">has_anomaly</span>
                       <span className="text-slate-400 text-[10px]">boolean | 是否有异常</span>
                     </div>
                     <div className="flex justify-between items-center bg-white p-1.5 rounded border border-slate-100 shadow-sm">
                       <span className="font-bold text-slate-800">anomaly_count</span>
                       <span className="text-slate-400 text-[10px]">number | 异常点数量</span>
                     </div>
                     <div className="flex justify-between items-center bg-white p-1.5 rounded border border-slate-100 shadow-sm">
                       <span className="font-bold text-slate-800">normal_count</span>
                       <span className="text-slate-400 text-[10px]">number | 正常点数量</span>
                     </div>
                     <div className="flex justify-between items-center bg-white p-1.5 rounded border border-slate-100 shadow-sm">
                       <span className="font-bold text-slate-800">total_count</span>
                       <span className="text-slate-400 text-[10px]">number | 全部点数量</span>
                     </div>
                   </div>
                 </div>

                 <div>
                   <div className="font-bold text-slate-800 mb-1.5 flex items-center gap-1.5"><Database size={14} className="text-emerald-500" /> details</div>
                   <div className="space-y-1.5 pl-3 border-l-2 border-slate-200 ml-1.5">
                     <div className="flex justify-between items-center bg-white p-1.5 rounded border border-slate-100 shadow-sm">
                       <span className="font-bold text-slate-800">anomaly_items</span>
                       <span className="text-slate-400 text-[10px]">array | 异常点详情数组</span>
                     </div>
                     <div className="flex justify-between items-center bg-white p-1.5 rounded border border-slate-100 shadow-sm">
                       <span className="font-bold text-slate-800">all_items</span>
                       <span className="text-slate-400 text-[10px]">array | 全部点详情数组</span>
                     </div>
                   </div>
                 </div>

               </div>
               
               <div className="mt-3 flex items-start gap-2 bg-blue-50/50 p-2.5 rounded border border-blue-100 text-blue-700 text-[10px] leading-relaxed">
                 <Info size={14} className="shrink-0 mt-0.5" />
                 <div>
                   此节点现在作为纯粹的检测计算节点提供单输出。如果需要根据是否异常执行不同操作，请在画布上连接“逻辑判断”节点。
                 </div>
               </div>
             </div>
          </div>
        </Section>
      </div>
    </motion.div>
  );
};

export const TestResultPanel = ({ onClose, config }: { onClose: () => void, config: NodeConfig }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] font-sans border border-slate-200">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 text-white p-2 rounded-xl shadow-sm">
              <PlayCircle size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg tracking-tight">本次测试结果</h3>
              <p className="text-[10px] text-slate-500 font-mono tracking-wider">TEST RUN SIMULATION</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 custom-scrollbar">
          
          {config.compareType === 'homogeneous_compare' && (
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl space-y-2 text-xs font-mono text-slate-600">
              <div className="text-slate-800 font-bold mb-1 sans">测试查询条件 (同类对比):</div>
              <div className="flex gap-2"><span className="text-slate-500 w-32">同类范围维度字段:</span> <span className="font-bold text-blue-700 bg-white px-1.5 py-0.5 rounded border border-blue-200 shadow-sm">{config.targetConfig?.peerDimensionField || 'city_id'}</span></div>
              <div className="flex gap-2">
                <span className="text-slate-500 w-32">
                  {config.detectionTarget === 'target_object' ? '待测对象维度取值:' : '对象维度取值:'}
                </span> 
                <span className="font-bold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-sm">{config.targetConfig?.targetDimensionValue || '-'}</span>
              </div>
              <div className="flex gap-2"><span className="text-slate-500 w-32">范围对象取值模式:</span> <span className="font-bold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-sm">{config.targetConfig?.benchmarkValueMode || 'variable'}</span></div>
            </div>
          )}

          <div className="space-y-3">
             <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
               <Layers size={16} className="text-blue-500" />
               <h4 className="text-sm font-bold text-slate-800">summary (检测概要)</h4>
             </div>
             <div className="grid grid-cols-4 gap-3">
               <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                 <div className="text-xs text-slate-500 font-bold mb-1">has_anomaly</div>
                 <div className="text-lg font-bold font-mono text-red-600">true</div>
               </div>
               <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                 <div className="text-xs text-slate-500 font-bold mb-1">anomaly_count</div>
                 <div className="text-lg font-black text-slate-700">2</div>
               </div>
               <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                 <div className="text-xs text-slate-500 font-bold mb-1">normal_count</div>
                 <div className="text-lg font-black font-mono text-slate-700">28</div>
               </div>
               <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                 <div className="text-xs text-slate-500 font-bold mb-1">total_count</div>
                 <div className="text-lg font-black font-mono text-slate-700">30</div>
               </div>
            </div>
          </div>

          <div className="space-y-3">
             <div className="flex items-center justify-between border-b border-slate-200 pb-2">
               <div className="flex items-center gap-2">
                 <Database size={16} className="text-emerald-500" />
                 <h4 className="text-sm font-bold text-slate-800">details.anomaly_items (选看单条异常模型)</h4>
               </div>
             </div>
             
             <div className="bg-[#1E293B] rounded-xl p-4 overflow-x-auto shadow-inner text-[11px] font-mono leading-relaxed text-slate-300">
             <pre>{JSON.stringify([
               {
                 "point_id": "2026-06-11",
                 "metric_value": 42000,
                 "baseline_value": 68000,
                 "deviation": -0.382,
                 "detection_direction": config.algorithmParams?.direction || "both",
                 "anomaly_direction": "low",
                 "is_anomaly": true,
                 "method_type": config.detectionMethodType,
                 "method_name": config.algorithm || "gesd",
                 "algorithm_params": config.detectionMethodType === 'algorithm' ? {
                    "alpha": config.algorithmParams?.alpha || 0.05,
                    "maxAnomalyRatio": config.algorithmParams?.maxAnomalyRatio || 0.1
                 } : null,
                 "rule_params": config.detectionMethodType === 'manual_rule' ? config.manualRuleConfig : null,
                 "dimension_values": {
                    [config.targetConfig?.peerDimensionField || 'city_id']: "上海市"
                 },
                 "variables": {
                    "total_sales": 42000,
                    "avg_sales": 68000
                 },
                 "evidence": "检测值 42000 低于正常下界 52000, 偏离度 -38.2%"
               }
             ], null, 2)}</pre>
             </div>
          </div>
          
          <div className="space-y-3">
             <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
               <Database size={16} className="text-slate-500" />
               <h4 className="text-sm font-bold text-slate-800">details.all_items (完整数组)</h4>
             </div>
             <div className="bg-slate-100 rounded-xl p-4 text-[11px] font-mono text-slate-500 border border-slate-200 border-dashed">
               <div className="italic">// Array({30}) - 包含上述 2 条异常点和 28 条正常点的完整上下文，结构同上。</div>
               <div>[ ... ]</div>
             </div>
          </div>

        </div>

        <div className="p-4 border-t border-slate-100 bg-[#F8FAFC] flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border-2 border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors">
            再次测试
          </button>
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-[#0F172A] hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-slate-900/20"
          >
            确定
          </button>
        </div>
      </div>
    </motion.div>
  );
};
