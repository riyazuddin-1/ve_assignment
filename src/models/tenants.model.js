import mongoose from 'mongoose';

const TenantSchema = new mongoose.Schema({
    tenant_name: { type: String, required: true, trim: true },
    created_by: { type: String, required: true, trim: true },
    users: [{
        user_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
        name: { type: String },
        role: {type: String, enum: ['ADMIN', 'EDITOR', 'VIEWER'], required: true},
        status: {type: String, enum: ['ACTIVE', 'INACTIVE'], required: true},
        joined_at: { type: Date },
        updated_at: { type: Date }
    }]
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

export default mongoose.model('Tenant', TenantSchema);