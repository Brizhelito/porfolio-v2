import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const expedienteSchema = z.object({
  title: z.string(),
  expedientNumber: z.string(),
  classification: z.string(),
  status: z.enum(['active', 'archived', 'featured']),
  refinementCount: z.number(),
  description: z.string(),
  stack: z.array(z.string()),
  metrics: z.object({
    layers: z.number().optional(),
    packages: z.number().optional(),
    plugins: z.number().optional(),
    tests: z.number().optional(),
  }).optional(),
  links: z.object({
    repository: z.string().url().optional(),
    demo: z.string().url().optional(),
    website: z.string().url().optional(),
  }).optional(),
  publishDate: z.date(),
  updatedDate: z.date().optional(),
});

const expedientes = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/content/expedientes' }),
  schema: expedienteSchema,
});

const expedientes_en = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/content/expedientes/en' }),
  schema: expedienteSchema,
});

export const collections = { expedientes, expedientes_en };
