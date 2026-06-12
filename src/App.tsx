import { useState } from 'react';
import { Canvas } from './components/Canvas';
import { NodeDrawer, TestResultPanel } from './components/NodeDrawer';
import { NodeConfig } from './types';
import { AnimatePresence } from 'motion/react';

export default function App() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isTestOpen, setIsTestOpen] = useState(false);
  const [activeNodeId, setActiveNodeId] = useState('');
  
  const [config, setConfig] = useState<NodeConfig>({
    name: '指标异常检测',
    description: '对指标数据进行异常判断',
    dataSource: 'metric_api',
    metricConfig: {
      name: '销售额',
      code: 'sales_amount',
      aggregation: 'sum'
    },
    queryConditions: [
      { id: '1', relation: 'WHERE', field: 'store_id', operator: '==', valueSource: 'variable', value: 'current.store_id' },
      { id: '2', relation: 'AND', field: 'period', operator: '==', valueSource: 'variable', value: 'current.period' }
    ],
    compareType: 'time_compare',
    detectionTarget: 'scan_points',
    targetConfig: {
      timeRangeConfig: {
        timeField: 'ds',
        granularity: 'day',
        mode: 'preset',
        preset: 'last_30_days'
      }
    },
    detectionMethodType: 'algorithm',
    algorithmSelectionMode: 'system_recommended',
    algorithm: 'gesd',
    algorithmParams: {
      direction: 'both',
      alpha: 0.05,
      maxAnomalyRatio: 0.1
    },
    manualRuleConfig: {
      ruleGroups: [
        {
          id: 'g1',
          name: '规则组 1',
          logicOperator: 'AND',
          anomalyDirection: 'low',
          anomalyLevel: 'high',
          rules: [
            { id: 'r1', relation: 'WHERE', field: 'current.sales_amount', operator: '<', valueSource: 'constant', value: '50000' },
            { id: 'r2', relation: 'AND', field: 'current.order_count', operator: '<=', valueSource: 'upstream_variable', value: 'sample.p10' }
          ]
        }
      ]
    },
    outputFields: {
      hasAnomaly: true,
      anomalyCount: true,
      normalCount: false,
      totalCount: true,
      anomalyItems: true
    },
    manualRules: [
      { id: 'r1', condition: 'detect_value < sample.p10', action: 'mark_anomaly' }
    ],
    triggerCondition: 'any',
    status: 'pending'
  });

  const handleNodeClick = (id: string) => {
    setActiveNodeId(id);
    setIsDrawerOpen(true);
  };

  return (
    <div className="flex w-full h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Main Canvas Area */}
      <Canvas 
        activeNodeId={activeNodeId} 
        config={config}
        onNodeClick={handleNodeClick} 
      />

      {/* Configuration Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <NodeDrawer 
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            config={config}
            setConfig={setConfig}
            onTest={() => setIsTestOpen(true)}
          />
        )}
      </AnimatePresence>

      {/* Test Result Overlay */}
      <AnimatePresence>
        {isTestOpen && (
          <TestResultPanel 
            config={config}
            onClose={() => {
              setIsTestOpen(false);
              setConfig({...config, status: 'tested'});
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
