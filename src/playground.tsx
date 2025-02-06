import React, { useState } from 'react';
import { Direction, INode } from './lib/view/types';
import { Mindmap, MindmapConfig } from './components/Mindmap';
import {
  getSimpleSampleData,
  getComplexSampleData,
  initializePayload,
} from './utils/sampleData';
import { Transformer } from './lib/core/transform';

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


const MindmapPlayground: React.FC<PlaygroundOptions> = ({ controls }) => {
  const [currentData, setCurrentData] = useState<INode>(() => {
    const data = getSimpleSampleData();
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
            top: '100px',
            right: '20px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          }}
          className='p-4 shadow-lg bg-white border-b border-zinc-400/5 flex justify-between rounded-xl'
        >
          <label className='text-sm text-zinc-600'>
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
