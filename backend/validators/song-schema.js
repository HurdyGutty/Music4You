import z from "zod";

export const getSongsSchema = z.object({
    q: z.string().optional(),
    genre: z.string().optional(),
    artist: z.string().optional(),
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('6'),
})