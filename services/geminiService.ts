import { GoogleGenAI, Schema, Type } from "@google/genai";
import { AppState, BlueprintResult } from "../types";

// --- Client-Side Fallback Configuration ---

const COMPETITION_DB = [
    { name: "ISEF (国际科学与工程大奖赛)", tags: ["Global", "Sci/Eng", "Top Tier"], grade: "9-12" },
    { name: "丘成桐中学科学奖 (Yau Science Awards)", tags: ["Global", "Sci", "WhiteList"], grade: "9-12" },
    { name: "Conrad Challenge (康莱德创新挑战赛)", tags: ["Global", "Mix/Bus", "High Value"], grade: "9-12" },
    { name: "CTB (全球青年研究论坛)", tags: ["Global", "Soc/Mix", "Interdisciplinary"], grade: "9-12" },
    { name: "Genius Olympiad", tags: ["Global", "Env/Sci"], grade: "8-12" },
    { name: "WAICY (世界青少年人工智能竞赛)", tags: ["Global", "AI"], grade: "K-12" },
    { name: "IOAI (国际人工智能奥林匹克)", tags: ["Global", "AI", "High Value"], grade: "9-12" },
    { name: "Swift Student Challenge (Apple)", tags: ["Global", "Code"], grade: "13+" },
    { name: "Microsoft Imagine Cup Junior", tags: ["Global", "AI/Tech"], grade: "5-12" },
    { name: "信奥 NOIP/CSP", tags: ["National", "Code", "WhiteList"], grade: "Middle/High" },
    { name: "ICC (全球发明大会)", tags: ["National", "Maker", "WhiteList"], grade: "K-12" },
    { name: "宋庆龄少年儿童发明奖", tags: ["National", "Maker", "WhiteList"], grade: "K-12" },
    { name: "FLL / FTC (FIRST Robotics)", tags: ["Global", "Robot"], grade: "K-12" },
    { name: "WRC (世界机器人大会)", tags: ["National", "Robot", "WhiteList"], grade: "K-12" },
    { name: "上海市青少年科技创新大赛", tags: ["Shanghai", "Sci/Eng", "ZongPing"], grade: "K-12" },
    { name: "上海创客新星大赛", tags: ["Shanghai", "Maker", "ZongPing"], grade: "K-12" },
    { name: "明日科技之星", tags: ["Shanghai", "Sci/Eng", "ZongPing"], grade: "High" },
    { name: "雏鹰杯 (红领巾科创)", tags: ["Shanghai", "Junior", "ZongPing"], grade: "Primary/Middle" },
    { name: "上海市青少年科学思创挑战活动", tags: ["Shanghai", "Sci", "ZongPing"], grade: "Middle/High" }
];

const determineTrack = (major: string, skills: string[]): { name: string, type: 'Eng' | 'Sci' | 'Soc' | 'Mix' } => {
    const hasHardware = skills.some(s => ['Arduino', 'Microbit', 'ESP32', 'RPi', 'Jetson', '3DModeling', 'MechDesign'].includes(s));
    const hasPaper = skills.includes('Writing');

    if (['Philosophy', 'Economics', 'Law', 'Education', 'Literature', 'History', 'Management', 'Social Sciences & Management'].includes(major)) {
        return { name: '社会科学研究型 (Social Science)', type: 'Soc' };
    } 
    else if (['Arts', 'Interdisciplinary', 'Arts & Humanities'].includes(major)) {
        return { name: '跨学科设计型 (Interdisciplinary)', type: 'Mix' };
    }
    else if (major === 'Engineering' || major === 'Engineering & Technology') {
        return { name: '工程发明与AI型 (Engineering & AI)', type: 'Eng' };
    }
    else {
        if (hasHardware) return { name: '工程发明与AI型 (Engineering & AI)', type: 'Eng' };
        else if (hasPaper && !hasHardware) return { name: '基础科学研究型 (Basic Science)', type: 'Sci' };
        else return { name: '综合科创型 (General STEM)', type: 'Eng' };
    }
};

const getColorForTrack = (type: 'Eng' | 'Sci' | 'Soc' | 'Mix') => {
    switch(type) {
        case 'Soc': return 'text-purple-600';
        case 'Mix': return 'text-pink-600';
        case 'Sci': return 'text-green-600';
        default: return 'text-primary';
    }
};

const generateDefaultRoadmap = (grade: string, type: string) => {
    return [
        { time: "近期规划", title: "启动期：确定选题", desc: "利用2周时间确定研究问题与技术路线。", type: "neutral" as const },
        { time: "中期目标", title: "核心赛事选拔", desc: "根据AI推荐参加适合的白名单赛事。", type: "high" as const },
        { time: "冲刺阶段", title: "收官：文书与提交", desc: "将项目转化为文书素材。", type: "final" as const }
    ];
};

// --- Schema Definitions for Client Side ---

const projectSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "Project title" },
        desc: { type: Type.STRING, description: "Short description" },
    },
    required: ["title", "desc"]
};

const roadmapItemSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        time: { type: Type.STRING, description: "Timeframe" },
        title: { type: Type.STRING, description: "Milestone title" },
        desc: { type: Type.STRING, description: "Actionable advice" },
        type: { type: Type.STRING, enum: ["neutral", "high", "final"], description: "Importance level" }
    },
    required: ["time", "title", "desc", "type"]
};

const statsSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        gpa: { type: Type.NUMBER },
        skills: { type: Type.NUMBER },
        awards: { type: Type.NUMBER },
        leadership: { type: Type.NUMBER },
        project: { type: Type.NUMBER }
    },
    required: ["gpa", "skills", "awards", "leadership", "project"]
};

const benchmarkSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        description: { type: Type.STRING, description: "Profile of a REAL benchmark." },
        stats: statsSchema,
        userStats: statsSchema
    },
    required: ["description", "stats", "userStats"]
};

const targetSchoolAnalysisSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        policy: { type: Type.STRING, description: "Analysis of the target school's admission policy." },
        admissionRequirements: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of key requirements." },
        strategicAdvice: { type: Type.STRING, description: "Specific advice." }
    },
    required: ["policy", "admissionRequirements", "strategicAdvice"]
};

const analysisSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        gapComment: { type: Type.STRING },
        benchmark: benchmarkSchema,
        targetSchoolAnalysis: targetSchoolAnalysisSchema,
        projectIdeas: { type: Type.ARRAY, items: projectSchema },
        roadmap: { type: Type.ARRAY, items: roadmapItemSchema }
    },
    required: ["gapComment", "benchmark", "targetSchoolAnalysis", "projectIdeas", "roadmap"]
};


// --- Client Side Logic ---

const generateBlueprintClientSide = async (data: AppState): Promise<BlueprintResult> => {
    console.log("⚠️ Backend unreachable. Switching to Client-Side AI Generation...");
    
    if (!process.env.API_KEY) {
        throw new Error("Missing API Key. Please set process.env.API_KEY or ensure backend server is running.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const trackBase = determineTrack(data.target.major, data.caps.skills);
    const { otherCompetition, ...otherInputs } = data.caps.customInputs || {};
    const customSkills = Object.entries(otherInputs).map(([k, v]) => v ? `${k}:${v}` : null).filter(Boolean).join(', ');
    const compExperience = otherCompetition || "None/Not Provided";
    const compContext = JSON.stringify(COMPETITION_DB);

    const prompt = `
        Act as an elite education consultant. Analyze this student profile using **Gemini 3 Pro** logic.
        **CRITICAL: All generated text MUST be in Simplified Chinese (简体中文).**

        Profile:
        - Grade/System: ${data.profile.grade} (${data.profile.system})
        - Location: ${data.profile.location}
        - Current School: ${data.profile.school}
        - Goal: ${data.target.phase}, Target: ${data.target.school}
        - Major: ${data.target.major} (${trackBase.name})
        - Academics: Top ${100 - data.caps.rank}%, Fav Subjects: ${data.caps.subjects}
        - Skills: ${data.caps.skills.join(', ')} ${customSkills}
        - Competition History: ${compExperience}
        - Social Topics: ${data.caps.topics.join(', ')}

        Competition Database:
        ${compContext}

        Task:
        1. **Benchmark Analysis:** Find a REAL person or generate a data-backed composite profile of a successful applicant to ${data.target.school}. Score them vs the user.
        2. **Target School Analysis:** Analyze the admission policy of ${data.target.school} (e.g., Shanghai ZongPing). List key requirements and strategic advice.
        3. **Projects:** Suggest 4 innovative project titles/descriptions.
        4. **Roadmap:** Create 3-4 specific milestones.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: analysisSchema
        }
    });

    const json = JSON.parse(response.text || "{}");

    const userStats = json.benchmark?.userStats || { gpa: data.caps.rank, skills: 50, awards: 30, leadership: 50, project: 40 };
    const targetStats = json.benchmark?.stats || { gpa: 95, skills: 90, awards: 90, leadership: 90, project: 90 };

    const radarData = [
        { subject: '校内GPA', A: userStats.gpa, B: targetStats.gpa, fullMark: 100 },
        { subject: '技术/学术', A: userStats.skills, B: targetStats.skills, fullMark: 100 },
        { subject: '竞赛奖项', A: userStats.awards, B: targetStats.awards, fullMark: 100 },
        { subject: '领导力', A: userStats.leadership, B: targetStats.leadership, fullMark: 100 },
        { subject: '项目产出', A: userStats.project, B: targetStats.project, fullMark: 100 },
    ];

    return {
        track: { ...trackBase, color: getColorForTrack(trackBase.type) },
        gapAnalysis: {
            comment: json.gapComment || "需要更多数据。",
            benchmark: json.benchmark,
            radarData: radarData
        },
        targetSchoolAnalysis: json.targetSchoolAnalysis,
        projects: json.projectIdeas || [],
        roadmap: json.roadmap || generateDefaultRoadmap(data.profile.grade, trackBase.type)
    };
};

// --- Main Service Function ---

export const generateBlueprintWithAI = async (data: AppState): Promise<BlueprintResult> => {
    // Attempt to connect to local backend. 
    const API_URL = 'http://localhost:3000/api/blueprint';

    try {
        console.log(`Sending request to backend: ${API_URL}`);
        
        // Add a short timeout to fail fast if backend is down (e.g., 1.5 seconds)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500);

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Backend Error: ${response.status}`);
        }

        const result: BlueprintResult = await response.json();
        return result;

    } catch (error: any) {
        console.warn("Backend unavailable, falling back to client-side logic.", error);
        
        // Fallback to client-side generation
        try {
            return await generateBlueprintClientSide(data);
        } catch (clientError: any) {
             throw new Error(
                "生成失败。\n\n" +
                "原因1: 后端服务未运行 (localhost:3000)。\n" +
                "原因2: 客户端降级失败 (" + clientError.message + ")。"
            );
        }
    }
};