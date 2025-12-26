import React, { useState } from 'react';
import { BlueprintResult } from '../types';

interface Props {
    roadmap: BlueprintResult['roadmap'];
    grade: string;
    location: string;
    onUpdate?: (updatedRoadmap: BlueprintResult['roadmap']) => void;
    isPrinting?: boolean;
}

const VisualBlueprint: React.FC<Props> = ({ roadmap, grade, location, onUpdate, isPrinting = false }) => {
    const [continuousEffort, setContinuousEffort] = useState('软件著作权申请、专利申请、综评文书素材积累');

    const handleChange = (index: number, field: keyof typeof roadmap[0], value: string) => {
        if (!onUpdate) return;
        const newRoadmap = [...roadmap];
        if (!newRoadmap[index]) {
            newRoadmap[index] = { time: '', title: '', desc: '', type: 'neutral' };
        }
        newRoadmap[index] = { ...newRoadmap[index], [field]: value };
        onUpdate(newRoadmap);
    };

    const getPhaseItem = (idx: number) => {
        return roadmap[idx] || { time: `Phase ${idx+1}`, desc: '点击编辑...', title: '点击编辑...', type: 'neutral' };
    };

    const phases = [
        { 
            color: 'purple', headerBg: 'bg-purple-100', headerBorder: 'border-purple-200', headerText: 'text-purple-700', bodyBg: 'bg-purple-50',
            phaseName: '黄金执行期 / 探索期', itemIdx: 0
        },
        { 
            color: 'blue', headerBg: 'bg-blue-100', headerBorder: 'border-blue-200', headerText: 'text-blue-700', bodyBg: 'bg-blue-50',
            phaseName: '成果深化期 / 提升期', itemIdx: 1
        },
        { 
            color: 'green', headerBg: 'bg-green-100', headerBorder: 'border-green-200', headerText: 'text-green-700', bodyBg: 'bg-green-50',
            phaseName: '综评收尾期 / 冲刺期', itemIdx: roadmap.length > 2 ? roadmap.length - 1 : 2
        }
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="text-xl font-bold text-center mb-8 text-gray-800">
                {grade} 三年科创规划蓝图 ({location})
            </h3>

            <div className="relative">
                <div className="absolute top-[160px] left-0 w-full h-1 bg-gray-200 z-0"></div>
                <div className="absolute top-[156px] right-0 w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-gray-400 border-b-[6px] border-b-transparent"></div>

                <div className="grid grid-cols-3 gap-4 relative z-10">
                    {phases.map((phase, i) => {
                        const idx = phase.itemIdx;
                        const data = getPhaseItem(idx);
                        
                        return (
                            <div key={i} className="flex flex-col h-full group">
                                <div className={`${phase.headerBg} border ${phase.headerBorder} rounded-lg p-3 text-center mb-4 shadow-sm hover:shadow-md transition`}>
                                    {isPrinting ? (
                                        <div className={`font-bold text-lg ${phase.headerText} mb-1 text-center w-full bg-transparent border-b border-transparent`}>
                                            {data.time}
                                        </div>
                                    ) : (
                                        <input 
                                            className={`font-bold text-lg ${phase.headerText} mb-1 bg-transparent text-center w-full outline-none border-b border-transparent hover:border-current focus:border-current transition-colors`}
                                            value={data.time}
                                            onChange={(e) => handleChange(idx, 'time', e.target.value)}
                                            placeholder="时间段"
                                        />
                                    )}
                                    <div className="text-xs text-gray-500 font-medium">
                                        {phase.phaseName}
                                    </div>
                                </div>

                                {isPrinting ? (
                                    <div className={`flex-grow ${phase.bodyBg} border border-gray-100 rounded-lg p-3 mb-8 text-sm text-gray-700 min-h-[100px] w-full text-center leading-relaxed whitespace-pre-wrap`}>
                                        {data.desc}
                                    </div>
                                ) : (
                                    <textarea
                                        className={`flex-grow ${phase.bodyBg} border border-gray-100 rounded-lg p-3 mb-8 text-sm text-gray-700 min-h-[100px] w-full text-center leading-relaxed shadow-sm outline-none resize-none hover:border-gray-300 focus:border-primary transition`}
                                        value={data.desc}
                                        onChange={(e) => handleChange(idx, 'desc', e.target.value)}
                                        placeholder="输入阶段策略描述..."
                                    />
                                )}

                                <div className="flex justify-center mb-8">
                                    <div className="w-4 h-4 rounded-full bg-gray-400 border-2 border-white shadow"></div>
                                </div>

                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center shadow-sm min-h-[80px] flex flex-col justify-center hover:shadow-md transition">
                                    <span className="text-xs text-yellow-600 font-bold uppercase mb-1 select-none">关键里程碑</span>
                                    {isPrinting ? (
                                        <div className="font-bold text-gray-800 text-sm bg-transparent text-center w-full whitespace-pre-wrap">
                                            {data.title}
                                        </div>
                                    ) : (
                                        <input
                                            className="font-bold text-gray-800 text-sm bg-transparent text-center w-full outline-none border-b border-transparent hover:border-gray-400 focus:border-primary transition"
                                            value={data.title}
                                            onChange={(e) => handleChange(idx, 'title', e.target.value)}
                                            placeholder="输入里程碑..."
                                        />
                                    )}
                                </div>
                                
                                <div className="border-l-2 border-dashed border-gray-300 h-6 mx-auto mt-2"></div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-center text-sm text-blue-800 font-medium shadow-sm">
                    🚀 持续投入：
                    {isPrinting ? (
                        <span className="font-normal">{continuousEffort}</span>
                    ) : (
                        <textarea
                            className="w-full bg-blue-50 text-blue-800 text-center outline-none resize-none"
                            value={continuousEffort}
                            onChange={(e) => setContinuousEffort(e.target.value)}
                            rows={2}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default VisualBlueprint;