import mongoose from 'mongoose';

const Record = new mongoose.Schema({
    db_id: { type: mongoose.Schema.Types.ObjectId, ref: 'IsolatedDatabase' },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    values: [{
        field_id: { type: mongoose.Schema.Types.ObjectId, required: true },
        type: {
            type: String,
            enum: ['text', 'number', 'date', 'boolean', 'select', 'multi-select', 'relation']
        },
        value: { type: mongoose.Schema.Types.Mixed, required: true }
    }],
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

export default mongoose.model('Record', Record);