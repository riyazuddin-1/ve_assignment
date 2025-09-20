import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: {type: String, required: true, trim: true},
    email: {type: String, required: true, trim: true},
    password: {type: String, required: true, trim: true},
    contact: {
        country_code: {
            type: String,
            required: true,
            trim: true,
            match: /^\+\d{1,4}$/,
        },
        number: {
            type: String,
            required: true,
            trim: true,
            match: /^\d{6,15}$/,
        }
    },
    tenants: [{
        tenant_id: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Tenant'},
        tenant_name: { type: String },
        invited_by: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
        role: {type: String, enum: ['ADMIN', 'EDITOR', 'VIEWER'], required: true},
        joined_at: { type: Date },
    }],
    verified: {type: Boolean, required: true},
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

export default mongoose.model('User', UserSchema);