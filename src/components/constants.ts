import type { SankeyLinkData, SankeyNodeData } from '../types';

export const palette = ['#6bbcff', '#5fe6dd', '#d7bc6d', '#95a9ff', '#7fb58a', '#ee8a8a'];

export const flowGraph: {
  nodes: SankeyNodeData[];
  links: SankeyLinkData[];
} = {
  nodes: [
    { id: 'supplier-x', name: 'Supplier X', valueLabel: 'Si +0.12%' },
    { id: 'bf3-superheat', name: 'BF-3 Superheat', valueLabel: '22\u00B0C (target 34)' },
    { id: 'ccm3-solidification', name: 'CCM-3 Solidification', valueLabel: 'Rate deviation' },
    { id: 'grade-risk', name: 'Grade Risk', valueLabel: 'Automotive 74%' }
  ],
  links: [
    { source: 'supplier-x', target: 'bf3-superheat', value: 92 },
    { source: 'bf3-superheat', target: 'ccm3-solidification', value: 87 },
    { source: 'ccm3-solidification', target: 'grade-risk', value: 74 }
  ]
};
