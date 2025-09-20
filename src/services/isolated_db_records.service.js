import Record from "../models/isolated_db_records.model.js";

class IsolatedDBRecordService {
    async read({ recordId }) {
        return await Record.findById(recordId);
    }

    async create({ isolated_db_id, created_by, values }) {
        const newRecord = new Record({
            db_id: isolated_db_id,
            created_by,
            values
        });

        return await newRecord.save();
    }

    async update({ recordId, values }) {
        return await Record.findByIdAndUpdate(
            recordId,
            { values, updated_at: new Date() },
            { new: true }
        );
    }

    async remove({ recordId, session = null }) {
        const options = {};
        if (session) {
            options.session = session;
        }
    
        return await Record.findByIdAndDelete(recordId, options);
    }    
}

export default new IsolatedDBRecordService();