/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    await knex.schema.createTable('users', (table) => {
        table.increments('id').primary();
        table.string('full_name', 255).notNullable();
        table.string('email', 255).notNullable().unique();
        table.string('password', 255).notNullable();
        table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    });

    await knex.schema.createTable('songs', (table) => {
        table.increments('id').primary();
        table.string('title', 255).notNullable();
        table.string('artist', 255).notNullable();
        table.integer('duration_seconds').notNullable();
        table.string('genre', 100);
        table.text('audio_url').notNullable();
        table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    });


    await knex.schema.createTable('playlists', (table) => {
        table.increments('id').primary();
        table
            .integer('user_id')
            .unsigned()
            .notNullable()
            .references('id')
            .inTable('users')
            .onDelete('CASCADE')
            .onUpdate('CASCADE');
        table.string('name', 255).notNullable();
        table.text('description');
        table.boolean('is_public').notNullable().defaultTo(false);
        table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
        table.index(['user_id']);
        table.index(['is_public']);
    });

    await knex.schema.createTable('playlist_songs', (table) => {
        table
            .integer('playlist_id')
            .unsigned()
            .notNullable()
            .references('id')
            .inTable('playlists')
            .onDelete('CASCADE')
            .onUpdate('CASCADE');

        table
            .integer('song_id')
            .unsigned()
            .notNullable()
            .references('id')
            .inTable('songs')
            .onDelete('CASCADE')
            .onUpdate('CASCADE');

        table.integer('sort_order').notNullable();
        table.timestamp('added_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
        table.primary(['playlist_id', 'song_id']);
        table.index(['song_id']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    await knex.schema.dropTableIfExists('playlist_songs');
    await knex.schema.dropTableIfExists('playlists');
    await knex.schema.dropTableIfExists('songs');
    await knex.schema.dropTableIfExists('users');
};
