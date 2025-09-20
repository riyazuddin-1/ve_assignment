import mongoose from 'mongoose';
import IsolatedDatabase from '../models/isolated_databases.model.js';
import Record from '../models/isolated_db_records.model.js';

class IsolatedDatabaseService {
    async create({ tenantId, userId, dbName, fields }) {
        const database = new IsolatedDatabase({
            tenant_id: tenantId,
            created_by: userId,
            db_name: dbName.trim(),
            fields: fields.map(field => ({
                field_id: field.field_id || undefined,
                type: field.type,
                title: field.title?.trim(),
                label: field.label?.trim(),
                placeholder: field.placeholder?.trim() || '',
                options: field.options?.map(opt => ({
                    label: opt.label?.trim(),
                    value: opt.value?.trim()
                })) || [],
                refId: field.refId || undefined
            }))
        });

        return await database.save();
    }

    async getInfo({ id, limit = 10, page = 1 }) {
        try {
            const isolatedDB = await IsolatedDatabase.findById(id).lean();
            if (!isolatedDB) return null;

            const records = await Record.find({ db_id: id }).limit(limit).skip((page - 1) * limit).lean();

            return {
                ...isolatedDB,
                records
            };
        } catch (err) {
            throw new Error("Error fetching isolated database info: " + err.message);
        }
    }

    async update({ id, dbName, fields }) {
        const updatePayload = {};
    
        // Conditionally add fields to the update payload
        if (dbName) {
            updatePayload.db_name = dbName.trim();
        }
    
        if (Array.isArray(fields)) {
            updatePayload.fields = fields.map(field => ({
                field_id: field.field_id || new mongoose.Types.ObjectId(),
                type: field.type,
                title: field.title?.trim(),
                label: field.label?.trim(),
                placeholder: field.placeholder?.trim() || '',
                options: field.options?.map(opt => ({
                    label: opt.label?.trim(),
                    value: opt.value?.trim()
                })) || [],
                refId: field.refId || undefined
            }));
        }
    
        // Ensure at least one field is being updated
        if (Object.keys(updatePayload).length === 0) {
            throw new Error("No valid fields provided to update.");
        }
    
        const updated = await IsolatedDatabase.findByIdAndUpdate(
            id,
            { $set: updatePayload },
            { new: true }
        );
    
        return updated;
    }

    async remove({ id, session = null }) {
        let ownsSession = false;

        if (!session) {
            session = await mongoose.startSession();
            session.startTransaction();
            ownsSession = true;
        }

        try {
            const deletedDB = await IsolatedDatabase.findByIdAndDelete(id, { session });
            if (!deletedDB) throw new Error("Isolated database not found.");

            await Record.deleteMany({ db_id: id }, { session });

            if (ownsSession) {
                await session.commitTransaction();
                session.endSession();
            }

            return deletedDB;
        } catch (err) {
            if (ownsSession && session.inTransaction()) {
                await session.abortTransaction();
                session.endSession();
            }
            throw new Error("Failed to delete isolated database and its records: " + err.message);
        }
    }
}

export default new IsolatedDatabaseService();