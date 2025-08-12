import pool from '../config/database';
import { CreatePptThemeData } from '../models/PptTheme';

const defaultThemes: CreatePptThemeData[] = [
  {
    name: 'Professional Blue',
    description: '专业蓝色主题，适合商务演示',
    preview_image: '/themes/professional-blue-preview.jpg',
    color_scheme: {
      primary: '#1f4e79',
      secondary: '#4472c4',
      accent: '#70ad47',
      background: '#ffffff',
      text: '#333333'
    },
    font_family: 'Arial, sans-serif',
    layout_templates: [
      {
        id: 'title-slide',
        name: 'Title Slide',
        type: 'title',
        template_data: {
          titleFontSize: 44,
          subtitleFontSize: 24,
          titleColor: '#1f4e79',
          subtitleColor: '#4472c4'
        }
      },
      {
        id: 'content-slide',
        name: 'Content Slide',
        type: 'content',
        template_data: {
          titleFontSize: 32,
          contentFontSize: 18,
          bulletPointSize: 16,
          titleColor: '#1f4e79',
          contentColor: '#333333'
        }
      }
    ]
  },
  {
    name: 'Modern Green',
    description: '现代绿色主题，清新自然',
    preview_image: '/themes/modern-green-preview.jpg',
    color_scheme: {
      primary: '#70ad47',
      secondary: '#a5d6a7',
      accent: '#2e7d32',
      background: '#f8f9fa',
      text: '#2c3e50'
    },
    font_family: 'Helvetica, Arial, sans-serif',
    layout_templates: [
      {
        id: 'title-slide',
        name: 'Title Slide',
        type: 'title',
        template_data: {
          titleFontSize: 42,
          subtitleFontSize: 22,
          titleColor: '#2e7d32',
          subtitleColor: '#70ad47'
        }
      },
      {
        id: 'content-slide',
        name: 'Content Slide',
        type: 'content',
        template_data: {
          titleFontSize: 30,
          contentFontSize: 17,
          bulletPointSize: 15,
          titleColor: '#2e7d32',
          contentColor: '#2c3e50'
        }
      }
    ]
  },
  {
    name: 'Creative Orange',
    description: '创意橙色主题，活力四射',
    preview_image: '/themes/creative-orange-preview.jpg',
    color_scheme: {
      primary: '#ff6b35',
      secondary: '#ffab91',
      accent: '#e65100',
      background: '#ffffff',
      text: '#424242'
    },
    font_family: 'Georgia, serif',
    layout_templates: [
      {
        id: 'title-slide',
        name: 'Title Slide',
        type: 'title',
        template_data: {
          titleFontSize: 46,
          subtitleFontSize: 26,
          titleColor: '#e65100',
          subtitleColor: '#ff6b35'
        }
      },
      {
        id: 'content-slide',
        name: 'Content Slide',
        type: 'content',
        template_data: {
          titleFontSize: 34,
          contentFontSize: 19,
          bulletPointSize: 17,
          titleColor: '#e65100',
          contentColor: '#424242'
        }
      }
    ]
  },
  {
    name: 'Academic Purple',
    description: '学术紫色主题，适合教育和研究',
    preview_image: '/themes/academic-purple-preview.jpg',
    color_scheme: {
      primary: '#7b1fa2',
      secondary: '#ba68c8',
      accent: '#4a148c',
      background: '#fafafa',
      text: '#37474f'
    },
    font_family: 'Times New Roman, serif',
    layout_templates: [
      {
        id: 'title-slide',
        name: 'Title Slide',
        type: 'title',
        template_data: {
          titleFontSize: 40,
          subtitleFontSize: 20,
          titleColor: '#4a148c',
          subtitleColor: '#7b1fa2'
        }
      },
      {
        id: 'content-slide',
        name: 'Content Slide',
        type: 'content',
        template_data: {
          titleFontSize: 28,
          contentFontSize: 16,
          bulletPointSize: 14,
          titleColor: '#4a148c',
          contentColor: '#37474f'
        }
      }
    ]
  }
];

export const seedPptThemes = async (): Promise<void> => {
  console.log('Seeding PPT themes...');
  
  for (const theme of defaultThemes) {
    // Check if theme already exists
    const existingTheme = await pool.query(
      'SELECT id FROM ppt_themes WHERE name = $1',
      [theme.name]
    );
    
    if (existingTheme.rows.length === 0) {
      await pool.query(`
        INSERT INTO ppt_themes (
          name, description, preview_image, color_scheme, 
          font_family, layout_templates
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        theme.name,
        theme.description,
        theme.preview_image,
        JSON.stringify(theme.color_scheme),
        theme.font_family,
        JSON.stringify(theme.layout_templates)
      ]);
      
      console.log(`Created theme: ${theme.name}`);
    } else {
      console.log(`Theme already exists: ${theme.name}`);
    }
  }
  
  console.log('PPT themes seeding completed');
};