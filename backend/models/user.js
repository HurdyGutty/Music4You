import db from "../db/db.js"

const TABLE_NAME = 'users';
const dbInstance = db(TABLE_NAME);

export default {
    all: async () => dbInstance.clone().select('*'),
    findById: async (id) => dbInstance.clone().where({ id }).first(),
    findByEmail: async (email) => dbInstance.clone().where({ email }).first(),
    create: async (userData) => {
        const existing = await dbInstance.clone().where({ email: userData.email }).first();
        if (existing) throw new Error('Email already exists');
        const [newUser] = await dbInstance.clone().insert(userData).returning('*');
        return newUser;
    },
}