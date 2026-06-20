import z from "zod";

export const getPlaylistsSchema = z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
})

export const getPlaylistSongsSchema = z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
})

export const createPlaylistSchema = z.object({
    name: z.string().min(2, 'Name phải có ít nhất 2 ký tự').max(100, 'Name tối đa 100 ký tự'),
    description: z.string().max(200, 'Description tối đa 200 ký tự').optional(),
    is_public: z.boolean().optional(),
})

export const updatePlaylistSchema = z.object({
    name: z.string().min(2, 'Name phải có ít nhất 2 ký tự').max(100, 'Name tối đa 100 ký tự').optional(),
    description: z.string().max(200, 'Description tối đa 200 ký tự').optional(),
    is_public: z.boolean().optional(),
}).partial().refine(
    (obj) => Object.keys(obj).length > 0,
    { message: 'Body must have at least 1 field to update' }
);

export const addSongToPlaylistSchema = z.object({
    song_id: z.number({ invalid_type_error: 'song_id phải là số' }),
    sort_order: z.number({ invalid_type_error: 'sort_order phải là số' }).default(1),
});

export const removeSongFromPlaylistSchema = z.object({
    songId: z.coerce.number({ invalid_type_error: 'songId phải là số' }).int().positive(),
});