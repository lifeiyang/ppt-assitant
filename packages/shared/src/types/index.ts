// User types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  subscription: 'free' | 'premium';
  usageCount: number;
}

// Content generation types
export interface SlideContent {
  title: string;
  subtitle?: string;
  bulletPoints: string[];
  speakerNotes?: string;
  slideType: 'title' | 'content' | 'section' | 'conclusion';
}

// Generation history types
export interface GenerationHistory {
  id: string;
  userId: string;
  originalOutline: string;
  generatedContent: SlideContent[];
  selectedTheme: string;
  fileUrl?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
}

// PPT theme types
export interface PptTheme {
  id: string;
  name: string;
  description: string;
  previewImage: string;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fontFamily: string;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  requestId?: string;
}

// Generation options
export interface GenerationOptions {
  language: 'zh' | 'en';
  style: 'professional' | 'creative' | 'academic';
  slideCount?: number;
}