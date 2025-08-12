export interface SlideContent {
  title: string;
  subtitle?: string;
  bulletPoints: string[];
  speakerNotes?: string;
  slideType: 'title' | 'content' | 'section' | 'conclusion';
}

export interface GenerationHistory {
  id: string;
  user_id: string;
  original_outline: string;
  generated_content: SlideContent[];
  selected_theme: string;
  file_url?: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: Date;
  completed_at?: Date;
  error_message?: string;
}

export interface CreateGenerationHistoryData {
  user_id: string;
  original_outline: string;
  selected_theme: string;
  status?: 'pending' | 'completed' | 'failed';
}

export interface UpdateGenerationHistoryData {
  generated_content?: SlideContent[];
  file_url?: string;
  status?: 'pending' | 'completed' | 'failed';
  completed_at?: Date;
  error_message?: string;
}