import React, { useState, useEffect } from 'react';
import StepIndicator from './components/StepIndicator';
import Dashboard from './components/Dashboard';
import HistoryModal from './components/HistoryModal';
import { AppState, BlueprintResult, HistoryRecord } from './types';
import { generateBlueprintWithAI } from './services/geminiService';

const initialAppState: AppState = {
    step: 1,
    profile: { name: "", gender: "Male", location: "Shanghai", school: "", grade: "G10", system: "Public" },
    target: { phase: "HighToUni", school: "", major: "Engineering" },
    caps: { 
        rank: 90, subjects: "", hobbies: "", skills: [], topics: [], 
        customInputs: { otherCoding: "", otherElec: "", otherMech: "", otherAI: "", otherTopic: "", otherCompetition: "" } 
    }
};

const MAJORS = [
    { id: 'Natural Sciences', label: '自然科学 (Natural Sciences)' },
    { id: 'Engineering & Technology', label: '工程与技术 (Engineering & Technology)' },
    { id: 'Life Sciences & Medicine', label: '生命科学与医学 (Life Sciences & Medicine)' },
    { id: 'Social Sciences & Management', label: '社会科学 (Social Sciences & Management)' },
    { id: 'Arts & Humanities', label: '人文与艺术 (Arts & Humanities)' },
];

const SKILL_CATEGORIES = [
    {
        id: 'coding', title: '3-1 编程类',
        options: [
            { id: 'VisualCoding', label: '图形化编程' },
            { id: 'Python', label: 'Python' },
            { id: 'CPP', label: 'C++/C' },
            { id: 'C', label: 'C' },
        ],
        otherKey: 'otherCoding'
    },
    {
        id: 'elec', title: '3-2 电子电路类',
        options: [
            { id: 'Arduino', label: 'Arduino' },
            { id: 'Microbit', label: 'Micro:bit' },
            { id: 'ESP32', label: 'ESP32' },
            { id: 'RPi', label: '树莓派 (Raspberry Pi)' },
        ],
        otherKey: 'otherElec'
    },
    {
        id: 'mech', title: '3-3 机械与建模类',
        options: [
            { id: '3DModeling', label: '3D建模与打印' },
            { id: 'laser', label: '激光切割' },
            { id: 'MechDesign', label: '机械结构设计' },
            { id: 'Handcraft', label: '手工制作与装配' },
        ],
        otherKey: 'otherMech'
    },
    {
        id: 'ai', title: '3-4 人工智能类',
        options: [
            { id: 'CV', label: '计算机视觉' },
            { id: 'Voice', label: '语音交互' },
            { id: 'LLM', label: 'AI大模型' },
            { id: 'ModelTrain', label: '模型训练与部署' },
        ],
        otherKey: 'otherAI'
    },
    {
        id: 'aux', title: '3-5 辅助技能',
        options: [
            { id: 'LitSearch', label: '文献检索' },
            { id: 'Writing', label: '论文写作' },
            { id: 'PPT', label: 'PPT制作' },
            { id: 'DataAnalysis', label: '数据记录与分析' },
            { id: 'Com', label: '团队合作' },
            { id: 'Speech', label: '公开演讲' },
        ]
    },
    {
        id: 'comp', title: '3-6 参赛经历',
        options: [], 
        otherKey: 'otherCompetition',
        placeholder: '请输入过往参赛经历 (如：2023年上海市青少年科技创新大赛二等奖...)'
    }
];

const TOPICS = [
    { id: 'WeakGroup', label: '弱势群体关怀' },
    { id: 'Environment', label: '环境与可持续发展' },
    { id: 'SmartCampus', label: '智慧校园与生活' },
    { id: 'Health', label: '医疗健康' },
    { id: 'Culture', label: '传统文化' },
    { id: 'Art', label: '艺术与创作' },
];

const SCHOOL_RECOMMENDATIONS: Record<string, Record<string, string[]>> = {
    'PrimaryToMiddle': {
        'Shanghai': ['上外附中', '华育中学', '兰生复旦', '市北初级', '建平西校', '包玉刚实验', '星河湾双语'],
        'Beijing': ['人大附中', '清华附中', '北大附中', '一零一中学', '十一学校', '三帆中学'],
        'Shenzhen': ['深圳中学初中部', '百合外国语', '深圳实验', '深圳高级', '南山外国语'],
        'HongKong': ['圣保罗男女中学', '拔萃男书院', '拔萃女书院', '皇仁书院', '汉基国际学校'],
    },
    'MiddleToHigh': {
        'Shanghai': ['上海中学', '复旦附中', '交大附中', '华师大二附中', '七宝中学', '建平中学', '平和双语', '世外中学'],
        'Beijing': ['人大附中', '北京四中', '清华附中', '北师大实验', '十一学校', '北大附中'],
        'Shenzhen': ['深圳中学', '深圳实验学校', '深圳外国语', '深圳高级中学', '红岭中学'],
        'HongKong': ['圣保罗男女中学', '拔萃男书院', '德望学校', '喇沙书院'],
    },
    'HighToUni': {
        'Shanghai': ['复旦大学', '上海交通大学', '清华大学', '北京大学', '同济大学', 'MIT', 'Stanford', 'Oxford'],
        'Beijing': ['清华大学', '北京大学', '人大', '北航', 'MIT', 'Harvard', 'Stanford', 'Cambridge'],
        'Shenzhen': ['南方科技大学', '深圳大学', '清华大学', '北京大学', 'HKU', 'MIT', 'Stanford'],
        'HongKong': ['香港大学 (HKU)', '香港科技大学 (HKUST)', '香港中文大学 (CUHK)', 'MIT', 'Stanford', 'Cambridge', 'Oxford'],
    }
};

export default function App() {
    const [appState, setAppState] = useState<AppState>(initialAppState);
    const [result, setResult] = useState<BlueprintResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [notification, setNotification] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setNotification({ msg, type });
    };

    const updateProfile = (field: keyof typeof appState.profile, value: string) => {
        setAppState(prev => ({ ...prev, profile: { ...prev.profile, [field]: value } }));
    };

    const updateTarget = (field: keyof typeof appState.target, value: string) => {
        setAppState(prev => ({ ...prev, target: { ...prev.target, [field]: value } }));
    };

    const updateCaps = (field: keyof typeof appState.caps, value: any) => {
        setAppState(prev => ({ ...prev, caps: { ...prev.caps, [field]: value } }));
    };

    const updateCustomInput = (key: string, value: string) => {
        setAppState(prev => ({
            ...prev,
            caps: {
                ...prev.caps,
                customInputs: { ...prev.caps.customInputs, [key]: value }
            }
        }));
    };

    const toggleSkill = (skill: string) => {
        const current = appState.caps.skills;
        const next = current.includes(skill) 
            ? current.filter(s => s !== skill) 
            : [...current, skill];
        updateCaps('skills', next);
    };

    const toggleTopic = (topic: string) => {
        const current = appState.caps.topics;
        const next = current.includes(topic) 
            ? current.filter(t => t !== topic) 
            : [...current, topic];
        updateCaps('topics', next);
    };

    const nextStep = () => {
        if (appState.step === 1 && !appState.profile.name.trim()) {
            showToast("请输入学生姓名", 'error');
            return;
        }
        setAppState(prev => ({ ...prev, step: prev.step + 1 }));
    };

    const prevStep = () => setAppState(prev => ({ ...prev, step: prev.step - 1 }));

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const res = await generateBlueprintWithAI(appState);
            setResult(res);
            setAppState(prev => ({ ...prev, step: 4 })); 
            
            const record: HistoryRecord = {
                id: Date.now().toString(),
                timestamp: Date.now(),
                profile: appState.profile,
                target: appState.target,
                resultTrack: res.track.name,
                data: appState
            };
            
            const saved = localStorage.getItem('my_blueprints');
            const list = saved ? JSON.parse(saved) : [];
            list.push(record);
            localStorage.setItem('my_blueprints', JSON.stringify(list));
            
            showToast("蓝图已生成并保存到本地", 'success');
        } catch (e: any) {
            console.error(e);
            showToast(e.message || "生成失败", 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadHistoryRecord = (record: HistoryRecord) => {
        setAppState(record.data);
        setHistoryOpen(false);
        setLoading(true);
        generateBlueprintWithAI(record.data).then(res => {
             setResult(res);
             setAppState(prev => ({ ...prev, step: 4 }));
             setLoading(false);
             showToast(`已加载 ${record.profile.name} 的档案`);
        }).catch(e => {
            setLoading(false);
            showToast(e.message || "加载失败", 'error');
        });
    };

    const reset = () => {
        setAppState(initialAppState);
        setResult(null);
    };

    const getRecommendations = () => {
        const phase = appState.target.phase;
        const location = appState.profile.location;
        const list = SCHOOL_RECOMMENDATIONS[phase]?.[location] || SCHOOL_RECOMMENDATIONS[phase]?.['Shanghai'] || [];
        return list;
    };

    return (
        <div className="min-h-screen bg-bg text-gray-800 font-sans flex flex-col">
            <nav className="bg-paper shadow-sm border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center cursor-pointer" onClick={reset}>
                            <span className="text-2xl mr-2">🧬</span>
                            <span className="font-bold text-xl tracking-tight text-primary">Sci-Tech Blueprint</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button 
                                onClick={() => setHistoryOpen(true)}
                                className="flex items-center space-x-1 text-sm bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 px-3 py-1.5 rounded-md transition shadow-sm"
                            >
                                <span>🔒 我的档案</span>
                            </button>
                            {appState.step > 1 && (
                                <button onClick={reset} className="text-sm text-muted hover:text-primary transition">
                                    重置
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-grow container mx-auto px-4 py-8 max-w-[95rem]">
                {notification && (
                    <div className={`fixed top-20 right-5 z-50 px-5 py-3 rounded shadow-lg text-white text-sm animate-bounce ${notification.type === 'error' ? 'bg-red-500' : 'bg-primary'}`}>
                        {notification.msg}
                    </div>
                )}

                <HistoryModal 
                    isOpen={historyOpen} 
                    onClose={() => setHistoryOpen(false)} 
                    onLoadRecord={loadHistoryRecord} 
                />

                {appState.step < 4 ? (
                    <div className="fade-in">
                        <div className="text-center mb-10">
                            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-3">
                                定制你的 <span className="text-primary">科创升学发展蓝图</span>
                            </h1>
                            <p className="text-sm text-muted">V2.3 • AI Powered Analysis</p>
                        </div>

                        <div className="bg-paper shadow-lg rounded-2xl p-6 md:p-8 border border-gray-100 max-w-4xl mx-auto">
                            <StepIndicator currentStep={appState.step} />
                            
                            {appState.step === 1 && (
                                <div className="animate-fadeIn">
                                    <h3 className="text-lg font-bold mb-5 flex items-center text-gray-800 border-b pb-2">
                                        <span className="mr-2">📍</span> 基本信息
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">学生姓名</label>
                                            <input 
                                                value={appState.profile.name}
                                                onChange={(e) => updateProfile('name', e.target.value)}
                                                className="w-full rounded-md border-gray-300 shadow-sm p-2.5 border focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white" 
                                                placeholder="请输入姓名"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">性别</label>
                                            <div className="flex space-x-4 mt-1">
                                                {['Male', 'Female'].map(g => (
                                                    <label key={g} className="flex items-center space-x-2 cursor-pointer">
                                                        <input 
                                                            type="radio" 
                                                            name="gender" 
                                                            checked={appState.profile.gender === g}
                                                            onChange={() => updateProfile('gender', g)}
                                                            className="text-primary focus:ring-primary" 
                                                        />
                                                        <span>{g === 'Male' ? '男' : '女'}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">所在地</label>
                                            <select 
                                                value={appState.profile.location}
                                                onChange={(e) => updateProfile('location', e.target.value)}
                                                className="w-full rounded-md border-gray-300 shadow-sm p-2.5 border focus:border-primary focus:ring-primary outline-none bg-white"
                                            >
                                                <option value="Shanghai">上海</option>
                                                <option value="Beijing">北京</option>
                                                <option value="Shenzhen">深圳</option>
                                                <option value="HongKong">香港</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">当前就读学校</label>
                                            <input 
                                                value={appState.profile.school}
                                                onChange={(e) => updateProfile('school', e.target.value)}
                                                className="w-full rounded-md border-gray-300 shadow-sm p-2.5 border focus:border-primary focus:ring-primary outline-none bg-white" 
                                                placeholder="学校名称"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">当前年级</label>
                                            <select 
                                                value={appState.profile.grade}
                                                onChange={(e) => updateProfile('grade', e.target.value)}
                                                className="w-full rounded-md border-gray-300 shadow-sm p-2.5 border focus:border-primary focus:ring-primary outline-none custom-scroll bg-white"
                                                style={{ maxHeight: '200px' }}
                                            >
                                                {['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9', 'G10', 'G11', 'G12'].map(g => (
                                                    <option key={g} value={g}>{g}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">升学方向</label>
                                            <select 
                                                value={appState.profile.system}
                                                onChange={(e) => updateProfile('system', e.target.value)}
                                                className="w-full rounded-md border-gray-300 shadow-sm p-2.5 border focus:border-primary focus:ring-primary outline-none bg-white"
                                            >
                                                <option value="Public">体制内</option>
                                                <option value="International">体制外</option>
                                                <option value="Bilingual">暂未确定</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <button onClick={nextStep} className="bg-primary text-white px-8 py-2.5 rounded-lg hover:bg-teal-700 transition font-medium shadow-md">下一步</button>
                                    </div>
                                </div>
                            )}

                            {appState.step === 2 && (
                                <div className="animate-fadeIn">
                                    <h3 className="text-lg font-bold mb-5 flex items-center text-gray-800 border-b pb-2">
                                        <span className="mr-2">🧩</span> 个人科创能力与经验
                                    </h3>
                                    
                                    <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
                                        <h4 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wider">学术画像</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-600 mb-1">年级/班级排名 (%)</label>
                                                <select 
                                                    value={appState.caps.rank}
                                                    onChange={(e) => updateCaps('rank', parseInt(e.target.value))}
                                                    className="w-full text-sm rounded border-gray-300 p-2 bg-white"
                                                >
                                                    <option value={99}>Top 1%</option>
                                                    <option value={90}>Top 10%</option>
                                                    <option value={75}>Top 25%</option>
                                                    <option value={50}>Top 50%</option>
                                                    <option value={50}>其他</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-600 mb-1">最喜欢/擅长的三门学科</label>
                                                <input 
                                                    value={appState.caps.subjects}
                                                    onChange={(e) => updateCaps('subjects', e.target.value)}
                                                    className="w-full text-sm rounded border-gray-300 p-2 bg-white"
                                                    placeholder="数学, 物理..."
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-semibold text-gray-600 mb-1">个人兴趣 (运动/艺术/科技...)</label>
                                                <input 
                                                    value={appState.caps.hobbies}
                                                    onChange={(e) => updateCaps('hobbies', e.target.value)}
                                                    className="w-full text-sm rounded border-gray-300 p-2 bg-white"
                                                    placeholder="钢琴, 篮球..."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-6 space-y-4">
                                        <h4 className="font-bold text-gray-700 mb-2 text-sm uppercase tracking-wider flex items-center flex-wrap">
                                            个人科创经验
                                            <span className="text-xs font-normal text-gray-500 ml-2 normal-case tracking-normal">(按照实际情况勾选，如无则不勾选)</span>
                                        </h4>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {SKILL_CATEGORIES.map(cat => (
                                                <div key={cat.id} className="border rounded-md p-3 bg-white flex flex-col">
                                                    <div className="text-xs font-bold text-primary mb-2 border-b pb-1">{cat.title}</div>
                                                    
                                                    {cat.options.length > 0 && (
                                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                                            {cat.options.map(opt => (
                                                                <label key={opt.id} className="flex items-center space-x-2 cursor-pointer">
                                                                    <input 
                                                                        type="checkbox" 
                                                                        checked={appState.caps.skills.includes(opt.id)}
                                                                        onChange={() => toggleSkill(opt.id)}
                                                                        className="rounded text-primary focus:ring-primary"
                                                                    />
                                                                    <span>{opt.label}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {cat.otherKey && (
                                                        <div className={`mt-2 ${cat.options.length === 0 ? 'flex-grow' : ''}`}>
                                                            {cat.options.length === 0 ? (
                                                                <textarea 
                                                                    placeholder={cat.placeholder || "其他 (请输入)"}
                                                                    className="w-full text-xs border border-gray-200 rounded p-2 focus:border-primary outline-none bg-white h-24 resize-none"
                                                                    value={appState.caps.customInputs[cat.otherKey as keyof typeof appState.caps.customInputs] || ''}
                                                                    onChange={(e) => updateCustomInput(cat.otherKey!, e.target.value)}
                                                                />
                                                            ) : (
                                                                <input 
                                                                    type="text"
                                                                    placeholder="其他 (请输入)"
                                                                    className="w-full text-xs border-b border-gray-200 focus:border-primary outline-none py-1 bg-white"
                                                                    value={appState.caps.customInputs[cat.otherKey as keyof typeof appState.caps.customInputs] || ''}
                                                                    onChange={(e) => updateCustomInput(cat.otherKey!, e.target.value)}
                                                                />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mb-8">
                                        <h4 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wider">感兴趣的社会议题</h4>
                                        <div className="flex flex-wrap gap-2 items-center">
                                            {TOPICS.map(topic => (
                                                <button 
                                                    key={topic.id}
                                                    onClick={() => toggleTopic(topic.id)}
                                                    className={`px-3 py-1.5 rounded-full text-sm border transition ${
                                                        appState.caps.topics.includes(topic.id) 
                                                        ? 'bg-teal-50 border-primary text-primary' 
                                                        : 'border-gray-300 hover:border-primary hover:text-primary text-gray-600'
                                                    }`}
                                                >
                                                    {topic.label}
                                                </button>
                                            ))}
                                            <input 
                                                type="text"
                                                placeholder="其他议题..."
                                                className="px-3 py-1.5 rounded-full text-sm border border-gray-300 focus:border-primary outline-none min-w-[120px] bg-white"
                                                value={appState.caps.customInputs.otherTopic || ''}
                                                onChange={(e) => updateCustomInput('otherTopic', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-between">
                                        <button onClick={prevStep} className="text-gray-500 hover:text-gray-700 font-medium px-4">上一步</button>
                                        <button onClick={nextStep} className="bg-primary text-white px-8 py-2.5 rounded-lg hover:bg-teal-700 transition font-medium shadow-md">下一步</button>
                                    </div>
                                </div>
                            )}

                            {appState.step === 3 && (
                                <div className="animate-fadeIn">
                                    <h3 className="text-lg font-bold mb-5 flex items-center text-gray-800 border-b pb-2">
                                        <span className="mr-2">🎯</span> 升学目标
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">升学阶段</label>
                                            <select 
                                                value={appState.target.phase}
                                                onChange={(e) => updateTarget('phase', e.target.value)}
                                                className="w-full rounded-md border-gray-300 shadow-sm p-2.5 border focus:border-primary focus:ring-primary outline-none bg-white"
                                            >
                                                <option value="PrimaryToMiddle">小升初</option>
                                                <option value="MiddleToHigh">初升高</option>
                                                <option value="HighToUni">高升本</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">目标院校</label>
                                            <input 
                                                value={appState.target.school}
                                                onChange={(e) => updateTarget('school', e.target.value)}
                                                className="w-full rounded-md border-gray-300 shadow-sm p-2.5 border focus:border-primary focus:ring-primary outline-none bg-white" 
                                                placeholder=""
                                            />
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {getRecommendations().map(school => (
                                                    <button
                                                        key={school}
                                                        onClick={() => updateTarget('school', school)}
                                                        className="text-xs bg-gray-100 hover:bg-teal-50 hover:text-primary hover:border-primary border border-transparent text-gray-600 px-2 py-1 rounded-full transition cursor-pointer"
                                                        title="点击填入"
                                                    >
                                                        + {school}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">意向专业方向</label>
                                            <select 
                                                value={appState.target.major}
                                                onChange={(e) => updateTarget('major', e.target.value)}
                                                className="w-full rounded-md border-gray-300 shadow-sm p-2.5 border focus:border-primary focus:ring-primary outline-none bg-white"
                                            >
                                                {MAJORS.map(m => (
                                                    <option key={m.id} value={m.id}>{m.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex justify-between mt-8">
                                        <button onClick={prevStep} className="text-gray-500 hover:text-gray-700 font-medium px-4">上一步</button>
                                        <button 
                                            onClick={handleGenerate} 
                                            disabled={loading}
                                            className="bg-primary text-white px-8 py-2.5 rounded-lg hover:bg-teal-700 transition font-medium shadow-md flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {loading ? 'AI 思考中...' : '生成蓝图 🚀'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    result && <Dashboard profile={appState.profile} target={appState.target} result={result} caps={appState.caps} />
                )}
            </main>
        </div>
    );
}