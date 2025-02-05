import React, { useState } from 'react';
import { Direction, INode } from './types';
import { Mindmap, MindmapConfig } from './components/Mindmap';
import {
  getSimpleSampleData,
  getComplexSampleData,
  initializePayload,
} from './utils/sampleData';
import { Transformer } from 'mdmindmap-lib';

interface PlaygroundOptions {
  controls?: boolean;
}

const transformer = new Transformer([
  {
    name: 'custom',
    transform: () => {
      return {
        styles: [
          {
            type: 'style',
            data: `
          .markmap-foreign { display: inline-flex; padding: 4px 8px; border-radius: 6px; transition: all 0.2s ease; }
       
        `,
          },
        ],
        scripts: [],
      };
    },
  },
]);

const markdown = `
- Root
  - Child 1
  - Child 2
    - Subchild 1
    - Subchild 2
  - Child 3
    - Subchild 3
    - Subchild 4
    - Subchild 5

  - Child 4
    - Subchild 6
    - Subchild 7
    - Subchild 8
    - Subchild 9
  - Child 5
    - Subchild 10
    - Subchild 11
    - Subchild 12
    - Subchild 13
    - Subchild 14
    - Subchild 15
`;

const MindmapPlayground: React.FC<PlaygroundOptions> = ({ controls }) => {
  const [currentData, setCurrentData] = useState<INode>(() => {
    const data = transformer.transform(markdown);
    initializePayload(data);
    return data;
  });

  const handleDataTypeChange = (type: string) => {
    const rawData =
      type === 'complex' ? getComplexSampleData() : getSimpleSampleData();
    const clonedData = JSON.parse(JSON.stringify(rawData));
    initializePayload(clonedData);
    setCurrentData(clonedData);
  };

  const config: MindmapConfig = {
    initialDirection: Direction.LR,
    controls: {
      show: controls,
      showDataControl: false, // We'll handle data changes in the playground
    },
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Mindmap data={currentData} config={config} />
      {controls && (
        <div
          style={{
            position: 'fixed',
            top: '80px',
            right: '20px',
            background: 'white',
            padding: '10px',
            borderRadius: '5px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          }}
        >
          <label>
            Data Type:
            <select
              onChange={(e) => handleDataTypeChange(e.target.value)}
              style={{ marginLeft: '10px' }}
            >
              <option value="simple">Simple Tree</option>
              <option value="complex">Complex Tree</option>
            </select>
          </label>
        </div>
      )}
    </div>
  );
};

export default MindmapPlayground;
