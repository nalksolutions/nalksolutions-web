import { z } from 'zod';

const kind = z.enum(['fade', 'up', 'left', 'right', 'pop']);
export const entranceSchema = z.strictObject({
  kind,
  delay: z.number().int().min(0).max(2000),
  duration: z.union([z.literal(750), z.literal(2000)]).optional(),
  mobile: kind.optional(),
  tablet: kind.optional(),
});
export type Entrance = z.infer<typeof entranceSchema>;
