import { z } from 'zod';

const IdSchema = z.string().trim().min(1).regex(/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/, 'Use letters, numbers, dot, dash or underscore.');

export const VisualKindSchema = z.enum([
  'process',
  'plan',
  'data-flow',
  'relationship',
  'system-flow',
  'checkpoint-flow',
  'roadmap',
  'timeline',
  'handoff',
  'dependency-map',
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
export const ViewFocusSchema = z.enum(['all', 'executive', 'flow', 'data', 'controls', 'exceptions']);
export const GroupKindSchema = z.literal('lane');

export const VisualGroupSchema = z.object({
  id: IdSchema,
  label: z.string().trim().min(1),
  kind: GroupKindSchema.default('lane'),
  description: z.string().trim().min(1).optional(),
  order: z.number().int().optional(),
});

export const VisualNodeSchema = z.object({
  id: IdSchema,
  label: z.string().trim().min(1),
  type: NodeTypeSchema.default('step'),
  subtitle: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  owner: z.string().trim().min(1).optional(),
  group: IdSchema.optional(),
  status: StatusSchema.default('neutral'),
  tags: z.array(z.string().trim().min(1)).default([]),
});

export const VisualEdgeSchema = z.object({
  from: IdSchema,
  to: IdSchema,
  label: z.string().trim().min(1).optional(),
  type: EdgeTypeSchema.default('flow'),
  status: StatusSchema.default('neutral'),
  note: z.string().trim().min(1).optional(),
});

export const VisualViewSchema = z.object({
  id: IdSchema,
  title: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  focus: ViewFocusSchema.default('all'),
  kind: VisualKindSchema.optional(),
  direction: DirectionSchema.optional(),
  theme: ThemeSchema.optional(),
  density: DensitySchema.optional(),
  includeNodeTypes: z.array(NodeTypeSchema).min(1).optional(),
  excludeNodeTypes: z.array(NodeTypeSchema).min(1).optional(),
  includeGroups: z.array(IdSchema).min(1).optional(),
  excludeGroups: z.array(IdSchema).min(1).optional(),
  includeTags: z.array(z.string().trim().min(1)).min(1).optional(),
  statuses: z.array(StatusSchema).min(1).optional(),
  includeEdgeTypes: z.array(EdgeTypeSchema).min(1).optional(),
  excludeEdgeTypes: z.array(EdgeTypeSchema).min(1).optional(),
});

export const VisualDocumentSchema = z.object({
  version: z.number().int().positive().default(1),
  title: z.string().trim().min(1),
  description: z.string().trim().min(1).optional(),
  kind: VisualKindSchema.default('process'),
  direction: DirectionSchema.default('right'),
  theme: ThemeSchema.default('paper'),
  density: DensitySchema.default('balanced'),
  groups: z.array(VisualGroupSchema).default([]),
  nodes: z.array(VisualNodeSchema).min(1),
  edges: z.array(VisualEdgeSchema).default([]),
  views: z.array(VisualViewSchema).default([]),
});

export const MarkdownEnvelopeSchema = z.object({ visual: VisualDocumentSchema });

export type VisualKind = z.infer<typeof VisualKindSchema>;
export type VisualGroup = z.infer<typeof VisualGroupSchema>;
export type VisualNode = z.infer<typeof VisualNodeSchema>;
export type VisualEdge = z.infer<typeof VisualEdgeSchema>;
export type VisualView = z.infer<typeof VisualViewSchema>;
export type VisualDocument = z.infer<typeof VisualDocumentSchema>;
export type NodeType = z.infer<typeof NodeTypeSchema>;
export type EdgeType = z.infer<typeof EdgeTypeSchema>;
export type Status = z.infer<typeof StatusSchema>;
export type ViewFocus = z.infer<typeof ViewFocusSchema>;
