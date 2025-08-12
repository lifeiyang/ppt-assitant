export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface LayoutTemplate {
  id: string;
  name: string;
  type: 'title' | 'content' | 'section' | 'conclusion';
  template_data: Record<string, any>;
}

export interface PptTheme {
  id: string;
  name: string;
  description: string;
  preview_image: string;
  color_scheme: ColorScheme;
  font_family: string;
  layout_templates: LayoutTemplate[];
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePptThemeData {
  name: string;
  description: string;
  preview_image: string;
  color_scheme: ColorScheme;
  font_family: string;
  layout_templates: LayoutTemplate[];
}

export interface UpdatePptThemeData {
  name?: string;
  description?: string;
  preview_image?: string;
  color_scheme?: ColorScheme;
  font_family?: string;
  layout_templates?: LayoutTemplate[];
  is_active?: boolean;
}