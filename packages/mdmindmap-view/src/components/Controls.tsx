import React from 'react';
import { Direction } from '../types';

export interface ControlsProps {
  direction: Direction;
  onDirectionChange: (direction: Direction) => void;
  onDataTypeChange: (type: string) => void;
  style?: React.CSSProperties;
  showDirectionControl?: boolean;
  showDataControl?: boolean;
}

export const Controls = ({
  direction,
  onDirectionChange,
  onDataTypeChange,
  style,
  showDirectionControl = true,
  showDataControl = true,
}: ControlsProps) => {
  return (
    <div
      style={{
        background: 'white',
        padding: '10px',
        borderRadius: '5px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        ...style,
      }}
    >
      {showDirectionControl && (
        <label style={{ display: 'block', marginTop: '10px' }}>
          Layout:
          <select
            value={direction}
            onChange={(e) => onDirectionChange(e.target.value as Direction)}
            style={{ marginLeft: '10px' }}
          >
            <option value={Direction.LR}>Left to Right</option>
            <option value={Direction.RL}>Right to Left</option>
            <option value={Direction.TB}>Top to Bottom</option>
            <option value={Direction.BT}>Bottom to Top</option>
            <option value={Direction.CENTER}>Centered</option>
          </select>
        </label>
      )}

      {showDataControl && (
        <label style={{ display: 'block', marginTop: '10px' }}>
          Data:
          <select
            onChange={(e) => onDataTypeChange(e.target.value)}
            style={{ marginLeft: '10px' }}
          >
            <option value="simple">Simple Tree</option>
            <option value="complex">Complex Tree</option>
          </select>
        </label>
      )}
    </div>
  );
};
