import React from 'react';
import { Typography, Button } from 'antd';

const { Title, Paragraph } = Typography;

const Home: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center">
        <Title level={1}>AI PowerPoint Generator</Title>
        <Paragraph className="text-lg text-gray-600 mb-8">
          只需提供简单的大纲，AI 就能为您生成专业的 PowerPoint 演示文稿
        </Paragraph>
        <Button type="primary" size="large">
          开始生成
        </Button>
      </div>
    </div>
  );
};

export default Home;