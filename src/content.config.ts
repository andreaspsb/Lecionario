import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const leituras = defineCollection({
  loader: glob({
    // base aponta para a raiz do projeto; IDs gerados: "ano-a/advento/01-domingo"
    pattern: '{ano-a,ano-b,ano-c}/**/*.md',
    base: '.',
  }),
  schema: z.object({
    titulo: z.string().optional(),
    nome: z.string().optional(),
    ano: z.string(),
    estacao: z.string(),
    tipo: z.string(),
    dia: z.string().optional(),
    semana: z.number().optional(),
    domingo: z.string().optional(),
  }),
});

export const collections = { leituras };
