/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
import { songs } from '../songs.js'
export async function seed(knex) {
  
  // Deletes ALL existing entries
  await knex('playlist_songs').del()
  await knex('songs').del()
  const songData = songs.map(song => ({
    ...song,
    created_at: knex.fn.now(),
  }));
  await knex('songs').insert(songData);
  await knex.raw(`SELECT setval(pg_get_serial_sequence('songs', 'id'),
      COALESCE(MAX(id), 1), MAX(id) IS NOT NULL) FROM songs`);

};
