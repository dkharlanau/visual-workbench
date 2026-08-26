import { z } from 'zod';

export const VisualKindSchema = z.enum([
  'process',
  'plan',
  'data-flow',
  'relationship',
  'system-flow',
  'checkpoint-flow',
]);

export const DirectionSchema = z.enum(['right', 'down', 'left', 'up']);
export const ThemeSchema = z.enum(['paper', 'slate']);
export const DensitySchema = z.enum(['airy', 'balanced', 'compact']);

export const NodeTypeSchema = z.enum([
  'step',
  'system',
  'data',
  'role',
  'decision',
  'checkpoint',
  'milestone',
  'outcome',
  'risk',
  'note',
]);

export const EdgeTypeSchema = z.enum([
  'flow',
  'data',
  'dependency',
  'relation',
  'control',
  'exception',
]);

export const StatusSchema = z.enum(['neutral', 'success', 'warning', 'danger', 'muted']);

export const VisualNodeSchema = z.object({
  id: z.string().trim().min(1).regex(/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/, 'Use letters, numbers, dot, dash or underscore.'),
  label: z.string().trim().min(1),
  type: NodeTypeSchema.default('step'),
  subtitle: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  owner: z.string().trim().min(1).optional(),
  group: z.string().trim().min(1).optional(),
  status: StatusSchema.default('neutral'),
  tags: z.array(z.string().trim().min(1)).default([]),
});

export const VisualEdgeSchema = z.object({
  from: z.string().trim().min(1),
  to: z.string().trim().min(1),
  label: z.string().trim().min(1).optional(),
  type: EdgeTypeSchema.default('flow'),
  status: StatusSchema.default('neutral'),
  note: z.string().trim().min(1).optional(),
});

export const VisualDocumentSchema = z.object({
  version: z.number().int().positive().default(1),
  title: z.string().trim().min(1),
  description: z.string().trim().min(1).optional(),
  kind: VisualKindSchema.default('process'),
  direction: DirectionSchema.default('right'),
  theme: ThemeSchema.default('paper'),
  density: DensitySchema.default('balanced'),
  nodes: z.array(VisualNodeSchema).min(1),
  edges: z.array(VisualEdgeSchema).default([]),
});

export const MarkdownEnvelopeSchema = z.object({
  visual: VisualDocumentSchema,
});

export type VisualKind = z.infer<typeof VisualKindSchema>;
export type VisualNode = z.infer<typeof VisualNodeSchema>;
export type VisualEdge = z.infer<typeof VisualEdgeSchema>;
export type VisualDocument = z.infer<typeof VisualDocumentSchema>;
export type NodeType = z.infer<typeof NodeTypeSchema>;
export type EdgeType = z.infer<typeof EdgeTypeSchema>;
export type Status = z.infer<typeof StatusSchema>;
