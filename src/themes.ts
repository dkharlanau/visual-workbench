import type { NodeType, Status } from './schema.js';

export interface Theme {
  canvas: string;
  card: string;
  text: string;
  muted: string;
  faint: string;
  border: string;
  edge: string;
  edgeLabel: string;
  edgeLabelText: string;
  nodeAccents: Record<NodeType, string>;
  statuses: Record<Status, string>;
}

const paper: Theme = {
  canvas: '#F7F8FA', card: '#FFFFFF', text: '#18212F', muted: '#667085', faint: '#98A2B3', border: '#D9DEE7', edge: '#98A2B3', edgeLabel: '#FFFFFF', edgeLabelText: '#475467',
  nodeAccents: { step: '#475467', system: '#356AE6', data: '#7A5AF8', role: '#0E9384', decision: '#DC6803', checkpoint: '#0891B2', milestone: '#7F56D9', outcome: '#039855', risk: '#D92D20', note: '#667085' },
  statuses: { neutral: '#98A2B3', success: '#039855', warning: '#DC6803', danger: '#D92D20', muted: '#D0D5DD' },
};

const slate: Theme = {
  canvas: '#101828', card: '#1D2939', text: '#F9FAFB', muted: '#D0D5DD', faint: '#98A2B3', border: '#344054', edge: '#667085', edgeLabel: '#1D2939', edgeLabelText: '#EAECF0',
  nodeAccents: { step: '#D0D5DD', system: '#84ADFF', data: '#BDB4FE', role: '#5FE9D0', decision: '#FEC84B', checkpoint: '#67E3F9', milestone: '#D6BBFB', outcome: '#75E0A7', risk: '#FDA29B', note: '#98A2B3' },
  statuses: { neutral: '#98A2B3', success: '#75E0A7', warning: '#FEC84B', danger: '#FDA29B', muted: '#475467' },
};

export function getTheme(name: 'paper' | 'slate'): Theme {
  return name === 'slate' ? slate : paper;
}
