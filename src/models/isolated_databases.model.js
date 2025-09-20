import mongoose from "mongoose";

const IsolatedDatabaseSchema = new mongoose.Schema({
    tenant_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Tenant' },
    db_name: { type: String, required: true, trim: true },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fields: [{
        field_id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
        type: { 
            type: String, 
            required: true, 
            enum: ['text', 'number', 'date', 'boolean', 'select', 'multi-select', 'relation']
        },
        title: { type: String, required: true, trim: true },
        label: { type: String, required: true, trim: true },
        placeholder: { type: String, trim: true },
        options: [{
            label: { type: String, required: true, trim: true },
            value: { type: String, required: true, trim: true }
        }], // for 'select' and 'multi-select'
        refId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'IsolatedDatabase'
        }, // for 'relation' to another database
    }],
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

export default mongoose.model('IsolatedDatabase', IsolatedDatabaseSchema);