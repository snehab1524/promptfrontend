
export enum LevelId {
  BEGINNER = 'beginner',
  DOMAIN_SPECIFIC = 'domain-specific',
  ADVANCED = 'advanced'
}

export enum DomainId {
  CONTENT_WRITING = 'content-writing',
  MARKETING = 'marketing',
  CODING = 'coding',
  DATA_ANALYSIS = 'data-analysis',
  EDUCATION = 'education',
  BUSINESS = 'business',
  FASHION = 'fashion',
  HEALTH = 'health'
}



export enum AdvancedId {
  CONTENT_WRITING = 'advanced-content-writing',
  MARKETING = 'advanced-marketing',
  CODING = 'advanced-coding',
  DATA_ANALYSIS = 'advanced-data-analysis',
  EDUCATION = 'advanced-education',
  BUSINESS = 'advanced-business',
  FASHION = 'advanced-fashion',
  HEALTH = 'advanced-health'
}
export type FlashCard = {
  id: string;
  title: string;
  content: string;
  example?: string;
};


export type Question = {
  id: string;
  text: string;
  options: string[]; // For MCQ, these are choices. For Fill-in-blanks, this can be empty or used for hints.
  correctIndex: number; // For MCQ, index of correct option. For others, can be -1.
  correctAnswer?: string; // For Fill-in-blanks or Prompt-writing (expected answer)
  keywords?: string | string[]; // Keywords for prompt-writing evaluation
  explanation: string;
  type: 'mcq' | 'scenario' | 'prompt-writing' | 'fill-in-the-blanks';
};
export type AudioLectureModule = {
  moduleId: number;
  lectures: {
    title: string;
    audioUrl: string;
  }[];
};

export interface LevelContent {
  id: string;
  name: string;
  description: string;
  videoUrl?: string;
  videoTitle?: string;
  flashcards: FlashCard[];
  practiceQuestions: Question[];
  finalTestQuestions: Question[];
  audioLectures: AudioLectureModule[];
}


export type UserProfile = {
  fullName: string;
  email: string;
  phone: string;
  citizen:string;
  paymentVerified: string;
  courseName?: string;
  selectedDomain?: string; // NEW: Track selected domain (e.g., 'data-analysis')
  amount?: number;
  duration?: number;
  courseexpairy:string;
};

export type UserProgress = {
  completedLevels: string[]; // IDs of completed levels/domains
  currentLevelId: string;
  certifications: Array<{
    id: string;
    levelName: string;
    date: string;
    learnerName: string;
  }>;
};

// ✅ Backend validation responses
export type LevelValidation = {
  valid: boolean;
  error?: string;
  canAccess: boolean;
  completedLevels: string[];
  message: string;
};

export type ProgressResponse = {
  success: boolean;
  progress?: UserProgress;
  error?: string;
  currentProgress?: UserProgress;
  message?: string;
};

export type AppState = 'registration' | 'dashboard' | 'learning' | 'aadhaar' | 'final-test' | 'certificate';
