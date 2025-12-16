import React, { useRef, useState, useEffect } from 'react';
import { BlueprintResult, StudentProfile, Target, Capabilities } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import VisualBlueprint from './VisualBlueprint';
// @ts-ignore
import html2canvas from 'html2canvas';
// @ts-ignore
import { jsPDF } from 'jspdf';

interface Props {
    profile: StudentProfile;
    target: Target;
    result: BlueprintResult;
    caps: Capabilities;
}

const Dashboard: React.FC<Props> = ({ profile, target, result, caps }) => {
    const dashboardRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    
    // Editable state
    const [editableResult, setEditableResult] = useState<BlueprintResult>(result);

    useEffect(() => {
        setEditableResult(result);
    }, [result]);

    const updateGapAnalysis = (field: string, value: string) => {
        setEditableResult(prev => ({
            ...prev,
            gapAnalysis: { ...prev.gapAnalysis, [field]: value }
        }));
    };

    const updateBenchmarkDesc = (value: string) => {
        setEditableResult(prev => ({
            ...prev,
            gapAnalysis: {
                ...prev.gapAnalysis,
                benchmark: { ...prev.gapAnalysis.benchmark, description: value }
            }
        }));
    };
    
    const updateTargetAnalysis = (field: string, value: string | string[]) => {
         if (!editableResult.targetSchoolAnalysis) return;
         setEditableResult(prev => ({
             ...prev,
             targetSchoolAnalysis: { ...prev.targetSchoolAnalysis!, [field]: value }
         }));
    };

    const updateProject = (idx: number, field: 'title' | 'desc', value: string) => {
        const newProjects = [...editableResult.projects];
        newProjects[idx] = { ...newProjects[idx], [field]: value };
        setEditableResult(prev => ({ ...prev, projects: newProjects }));
    };

    const updateRoadmap = (newRoadmap: BlueprintResult['roadmap']) => {
        setEditableResult(prev => ({ ...prev, roadmap: newRoadmap }));
    };

    const handleDownloadPDF = async () => {
        if (!dashboardRef.current) return;
        setIsDownloading(true);
        setIsPrinting(true); // Switch to print mode (divs instead of textareas)

        try {
            // Wait for React to render the div changes
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const canvas = await html2canvas(dashboardRef.current, { 
                scale: 2, 
                useCORS: true, 
                logging: false, 
                backgroundColor: '#ffffff'
            });
            const imgData = canvas.toDataURL('image/png');
            const pdfWidth = 297; 
            const imgProps = { width: canvas.width, height: canvas.height };
            const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
            // eslint-disable-next-line new-cap
            const pdf = new jsPDF('l', 'mm', 'a4');
            let heightLeft = imgHeight;
            let position = 0;
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= 210;
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                heightLeft -= 210;
            }
            pdf.save(`${profile.name}_SciTech_Blueprint.pdf`);
        } catch (error) {
            console.error("PDF failed", error);
            alert("PDF生成失败，请尝试使用浏览器打印(Ctrl+P)");
        } finally {
            setIsPrinting(false); // Switch back to edit mode
            setIsDownloading(false);
        }
    };

    const getSkillLabel = (skillId: string) => {
        const map: Record<string, string> = {
            'VisualCoding': '图形化编程', 'Python': 'Python', 'CPP': 'C++/C', 'C': 'C',
            'Arduino': 'Arduino', 'Microbit': 'Micro:bit', 'ESP32': 'ESP32', 'RPi': '树莓派',
            '3DModeling': '3D建模', 'laser': '激光切割', 'MechDesign': '机械设计', 'Handcraft': '手工装配',
            'CV': '计算机视觉', 'Voice': '语音交互', 'LLM': '大模型', 'ModelTrain': '模型训练',
            'LitSearch': '文献检索', 'Writing': '论文写作', 'PPT': 'PPT制作', 'DataAnalysis': '数据分析',
            'Com': '团队合作', 'Speech': '公开演讲'
        };
        return map[skillId] || skillId;
    };

    return (
        <div className="animate-fadeIn">
            <div ref={dashboardRef} className="bg-white p-4 md:p-8 max-w-[1200px] mx-auto min-h-screen">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8 border-l-8 border-primary relative overflow-hidden">
                    <div className="absolute right-0 top-0 opacity-5 text-9xl font-bold select-none text-primary pointer-events-none">PLAN</div>
                    <div className="flex flex-col md:flex-row justify-between items-start relative z-10">
                        <div>
                            <div className="flex items-center mb-2">
                                <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded mr-2">{profile.grade}</span>
                                <span className="text-gray-500 text-sm font-semibold tracking-wide uppercase">STRATEGIC REPORT</span>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-1">
                                <span className="text-primary">{profile.name}</span>的科创升学蓝图
                            </h1>
                            <p className="text-gray-600 text-sm">
                                目标：<span className="font-bold text-gray-800">{target.school}</span> | 方向：<span className="font-bold text-gray-800">{target.major}</span>
                            </p>
                        </div>
                        <div className="mt-4 md:mt-0 text-left md:text-right">
                            <div className="text-xs text-gray-500 uppercase">推荐核心赛道</div>
                            <div className={`text-xl font-bold ${result.track.color}`}>
                                {result.track.name}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Student Profile Summary */}
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 mb-8">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 border-b border-gray-200 pb-2">
                        学生档案概览 (Student Profile)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-y-4 gap-x-6 text-sm">
                        <div className="col-span-1">
                            <span className="block text-gray-400 text-xs uppercase mb-1">基本信息</span>
                            <span className="font-medium text-gray-700 block">{profile.gender === 'Male' ? '男' : '女'} | {profile.location}</span>
                            <span className="text-gray-600 text-xs mt-1 block">{profile.school}</span>
                        </div>
                        <div className="col-span-1">
                            <span className="block text-gray-400 text-xs uppercase mb-1">升学目标</span>
                            <span className="font-medium text-primary font-bold block">{target.school || '未指定'}</span>
                            <span className="text-gray-600 text-xs mt-1 block">
                                {target.phase === 'PrimaryToMiddle' ? '小升初' : target.phase === 'MiddleToHigh' ? '初升高' : '高升本'}
                            </span>
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <span className="block text-gray-400 text-xs uppercase mb-1">核心能力标签 (Skills)</span>
                            <div className="flex flex-wrap gap-2">
                                {caps && caps.skills && caps.skills.length > 0 ? (
                                    caps.skills.map((skill: string) => (
                                        <span key={skill} className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-600 shadow-sm">
                                            {getSkillLabel(skill)}
                                        </span>
                                    ))
                                ) : <span className="text-gray-400 italic text-xs">未填写</span>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Target School Analysis (Editable) */}
                {editableResult.targetSchoolAnalysis && (
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-indigo-100 group">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <span className="bg-indigo-100 text-indigo-700 p-1 rounded mr-2 text-sm">🏛️</span>
                            目标院校招生策略分析
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-indigo-50 rounded-lg p-4 hover:shadow-md transition">
                                <h4 className="text-indigo-800 font-bold text-sm mb-2 border-b border-indigo-100 pb-1">招生政策解读</h4>
                                {isPrinting ? (
                                    <div className="w-full min-h-[6rem] bg-transparent text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                                        {editableResult.targetSchoolAnalysis.policy}
                                    </div>
                                ) : (
                                    <textarea
                                        className="w-full h-24 bg-transparent text-xs text-gray-700 leading-relaxed outline-none resize-none border border-transparent focus:border-indigo-300 rounded p-1"
                                        value={editableResult.targetSchoolAnalysis.policy}
                                        onChange={(e) => updateTargetAnalysis('policy', e.target.value)}
                                    />
                                )}
                            </div>
                            <div className="bg-indigo-50 rounded-lg p-4 hover:shadow-md transition">
                                <h4 className="text-indigo-800 font-bold text-sm mb-2 border-b border-indigo-100 pb-1">核心录取要求</h4>
                                {isPrinting ? (
                                    <div className="w-full min-h-[6rem] bg-transparent text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                                        {editableResult.targetSchoolAnalysis.admissionRequirements.join('\n')}
                                    </div>
                                ) : (
                                    <textarea
                                        className="w-full h-24 bg-transparent text-xs text-gray-700 leading-relaxed outline-none resize-none border border-transparent focus:border-indigo-300 rounded p-1"
                                        value={editableResult.targetSchoolAnalysis.admissionRequirements.join('\n')}
                                        onChange={(e) => updateTargetAnalysis('admissionRequirements', e.target.value.split('\n'))}
                                        placeholder="每行一个要求"
                                    />
                                )}
                            </div>
                            <div className="bg-indigo-50 rounded-lg p-4 hover:shadow-md transition">
                                <h4 className="text-indigo-800 font-bold text-sm mb-2 border-b border-indigo-100 pb-1">专家建议</h4>
                                {isPrinting ? (
                                    <div className="w-full min-h-[6rem] bg-transparent text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                                        {editableResult.targetSchoolAnalysis.strategicAdvice}
                                    </div>
                                ) : (
                                    <textarea
                                        className="w-full h-24 bg-transparent text-xs text-gray-700 leading-relaxed outline-none resize-none border border-transparent focus:border-indigo-300 rounded p-1"
                                        value={editableResult.targetSchoolAnalysis.strategicAdvice}
                                        onChange={(e) => updateTargetAnalysis('strategicAdvice', e.target.value)}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left: Chart & Benchmark */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm p-5 h-full flex flex-col">
                            <div className="mb-4 border-b pb-2">
                                <h3 className="text-lg font-bold text-gray-800">个人科创画像报告</h3>
                            </div>
                            
                            {/* Editable Benchmark Info */}
                            <div className="bg-gray-50 p-3 rounded mb-4 border border-gray-100">
                                <div className="text-xs text-gray-400 uppercase font-bold mb-1">对比标杆 (Benchmark)</div>
                                {isPrinting ? (
                                    <div className="w-full min-h-[6rem] bg-transparent text-xs text-gray-700 leading-snug whitespace-pre-wrap">
                                        {editableResult.gapAnalysis.benchmark.description}
                                    </div>
                                ) : (
                                    <textarea
                                        className="w-full h-24 bg-transparent text-xs text-gray-700 leading-snug outline-none resize-none border border-transparent focus:border-gray-300 rounded p-1"
                                        value={editableResult.gapAnalysis.benchmark.description}
                                        onChange={(e) => updateBenchmarkDesc(e.target.value)}
                                    />
                                )}
                            </div>

                            <div style={{ width: '100%', height: 350 }}>
                                <ResponsiveContainer width="100%" height="100%" debounce={300}>
                                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={result.gapAnalysis.radarData}>
                                        <PolarGrid />
                                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#6B7280' }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                        <Radar name="你 (You)" dataKey="A" stroke="#0F766E" fill="#0F766E" fillOpacity={0.6} />
                                        <Radar name="标杆 (Benchmark)" dataKey="B" stroke="#D97706" fill="#D97706" fillOpacity={0.2} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex justify-center gap-4 text-xs mb-3">
                                <div className="flex items-center"><span className="w-3 h-3 bg-primary opacity-60 mr-1 rounded-sm"></span> 你 (You)</div>
                                <div className="flex items-center"><span className="w-3 h-3 bg-secondary opacity-20 mr-1 rounded-sm"></span> 标杆 (Target)</div>
                            </div>

                            {/* Editable Comment */}
                            <div className="mt-auto bg-yellow-50 p-3 rounded border border-yellow-100 italic">
                                <strong className="text-xs text-gray-600">AI 综合评价：</strong>
                                {isPrinting ? (
                                    <div className="w-full min-h-[5rem] mt-1 bg-transparent text-xs text-gray-600 whitespace-pre-wrap">
                                        {editableResult.gapAnalysis.comment}
                                    </div>
                                ) : (
                                    <textarea
                                        className="w-full h-20 mt-1 bg-transparent text-xs text-gray-600 outline-none resize-none border border-transparent focus:border-yellow-300 rounded p-1"
                                        value={editableResult.gapAnalysis.comment}
                                        onChange={(e) => updateGapAnalysis('comment', e.target.value)}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Visual Blueprint & Projects */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        {/* Roadmap Visual */}
                        <VisualBlueprint 
                            roadmap={editableResult.roadmap} 
                            grade={profile.grade} 
                            location={profile.location}
                            onUpdate={updateRoadmap}
                            isPrinting={isPrinting}
                        />

                        {/* Projects */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <span className="mr-2">💡</span> 推荐科创课题 (Projects)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {editableResult.projects.map((project, idx) => (
                                    <div key={idx} className="bg-green-50 rounded-lg p-4 border border-green-100 hover:shadow-md transition group">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="bg-green-200 text-green-800 text-xs px-2 py-0.5 rounded font-bold">
                                                Project {idx + 1}
                                            </span>
                                        </div>
                                        {isPrinting ? (
                                            <>
                                                <div className="font-bold text-green-900 mb-1 text-sm">{project.title}</div>
                                                <div className="text-xs text-gray-600 leading-relaxed">{project.desc}</div>
                                            </>
                                        ) : (
                                            <>
                                                <input
                                                    className="w-full font-bold text-green-900 mb-1 text-sm bg-transparent outline-none border-b border-transparent focus:border-green-300"
                                                    value={project.title}
                                                    onChange={(e) => updateProject(idx, 'title', e.target.value)}
                                                />
                                                <textarea
                                                    className="w-full text-xs text-gray-600 leading-relaxed bg-transparent outline-none resize-none h-20 border-transparent focus:border-green-300 border rounded"
                                                    value={project.desc}
                                                    onChange={(e) => updateProject(idx, 'desc', e.target.value)}
                                                />
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-8 flex justify-center space-x-4 print:hidden">
                    <button 
                        onClick={handleDownloadPDF} 
                        disabled={isDownloading}
                        className="bg-primary text-white px-6 py-3 rounded-lg shadow hover:bg-teal-700 transition flex items-center font-bold"
                    >
                        {isDownloading ? '生成中...' : '📥 下载完整蓝图 (PDF)'}
                    </button>
                    <button 
                        onClick={() => window.print()} 
                        className="bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-lg shadow-sm hover:bg-gray-50 transition flex items-center font-medium"
                    >
                        🖨️ 打印
                    </button>
                </div>

                <div className="text-center text-gray-400 text-xs mt-8 pb-4">
                    Generated by Sci-Tech Blueprint AI • {new Date().toLocaleDateString()}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;