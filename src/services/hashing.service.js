import bcrypt from 'bcryptjs';

const Hash = {
    async create(data) {
        return await bcrypt.hash(data, 10);
    },
    async compare(data, hash) {
        return await bcrypt.compare(data, hash);
    }
}

export default Hash;