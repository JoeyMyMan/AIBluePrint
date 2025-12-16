export interface StudentProfile {
    name: string;
    gender: 'Male' | 'Female';
    location: string;
    school: string;
    grade: string;
    system: string;
}

export interface Target {
    phase: string;
    school: string;
    major: string;
}

export interface Capabilities {
    rank: number;
    subjects: string;
    hobbies: string;
    skills: string[];
    topics: string[];
    customInputs: {
        otherCoding?: string;
        otherElec?: string;
        otherMech?: string;
        otherAI?: string;
        otherTopic?: string;
        otherCompetition?: string;
    };
}

export interface AppState {
    step: number;
    profile: StudentProfile;
    target: Target;
    caps: Capabilities;
}

export interface TrackInfo {
    name: string;
    type: 'Eng' | 'Sci' | 'Soc' | 'Mix';
    color: string;
    description?: string;
}

export interface ProjectIdea {
    title: string;
    desc: string;
}

export interface BenchmarkStats {
    gpa: number;
    skills: number;
    awards: number;
    leadership: number;
    project: number;
}

export interface BenchmarkProfile {
    description: string;
    stats: BenchmarkStats;
    userStats: BenchmarkStats;
}

export interface TargetSchoolAnalysis {
    policy: string;
    admissionRequirements: string[];
    strategicAdvice: string;
}

export interface BlueprintResult {
    track: TrackInfo;
    gapAnalysis: {
        comment: string;
        benchmark: BenchmarkProfile;
        radarData: { subject: string; A: number; B: number; fullMark: number }[];
    };
    targetSchoolAnalysis?: TargetSchoolAnalysis;
    projects: ProjectIdea[];
    roadmap: { time: string; title: string; desc: string; type: 'neutral' | 'high' | 'final' }[];
}

export interface HistoryRecord {
    id: string;
    timestamp: number;
    profile: StudentProfile;
    target: Target;
    resultTrack: string;
    data: AppState;
}