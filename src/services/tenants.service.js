import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';

import Tenant from '../models/tenants.model.js';
import User from '../models/users.model.js';
import IsolatedDatabase from '../models/isolated_databases.model.js';
import Record from '../models/isolated_db_records.model.js';

import Mail from './mail.service.js';
import { logError } from '../utils/logger.js';
import Token from './jwt.service.js';

class TenantService {
    async create({ tenantName, userId }) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const now = new Date();

            const tenant = new Tenant({
                tenant_name: tenantName,
                created_by: userId,
                users: [{
                    user_id: userId,
                    role: 'ADMIN',
                    status: 'ACTIVE',
                    joined_at: now,
                    updated_at: now
                }]
            });

            const savedTenant = await tenant.save({ session });

            await User.updateOne(
                {
                    _id: userId,
                    'tenants.tenant_id': { $ne: savedTenant._id }
                },
                {
                    $push: {
                        tenants: {
                            tenant_id: savedTenant._id,
                            invited_by: userId,
                            role: 'ADMIN',
                            joined_at: now
                        }
                    }
                },
                { session }
            );

            await session.commitTransaction();
            session.endSession();

            return savedTenant;
        } catch (err) {
            await session.abortTransaction();
            session.endSession();
            throw err;
        }
    }

    async getInfo({ user, tenantId, limit = 10, page = 1 }) {
        const tenant = await Tenant.findById(tenantId).lean();
        if (!tenant) throw new Error("Tenant not found.");

        const databases = await IsolatedDatabase.find({ tenant_id: tenantId }).limit(limit).skip((page - 1) * limit).lean();

        const token = Token.create({
            ...user,
            tenant_id: tenantId
        });

        return {
            token,
            data: {
                ...tenant,
                databases
            }
        };
    }

    async update({ tenantId, tenantName }) {
        const tenant = await Tenant.findById(tenantId);
        if (!tenant) throw new Error("No such tenant found.");

        tenant.tenant_name = tenantName;
        await tenant.save();

        return tenant;
    }

    async remove({ tenantId }) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const tenant = await Tenant.findById(tenantId).session(session);
            if (!tenant) throw new Error("Tenant not found.");

            // Fetch all isolated DBs under the tenant
            const databases = await IsolatedDatabase.find({ tenant_id: tenantId }).session(session);

            for (const db of databases) {
                // Delete all records related to this DB
                await Record.deleteMany({ db_id: db._id }, { session });
                // Delete the DB itself
                await IsolatedDatabase.deleteOne({ _id: db._id }, { session });
            }

            // Remove tenant reference from users
            await User.updateMany(
                { 'tenants.tenant_id': tenantId },
                { $pull: { tenants: { tenant_id: tenantId } } },
                { session }
            );

            // Finally delete the tenant
            await Tenant.deleteOne({ _id: tenantId }, { session });

            await session.commitTransaction();
            session.endSession();
        } catch (err) {
            await session.abortTransaction();
            session.endSession();
            throw err;
        }
    }

    async updateContributor({ tenantId, contributorId, role, status }) {
        const session = await mongoose.startSession();
        session.startTransaction();
    
        try {
            // Validate inputs
            const validRole = ['ADMIN', 'EDITOR', 'VIEWER'].includes(role);
            const validStatus = ['ACTIVE', 'INACTIVE'].includes(status);
    
            if (!validRole && !validStatus) {
                throw new Error("At least one of role or status must be valid.");
            }
    
            // Build update fields dynamically
            const tenantUpdate = { "users.$.updated_at": new Date() };
            const userUpdate = {};
    
            if (validRole) {
                tenantUpdate["users.$.role"] = role;
                userUpdate["tenants.$.role"] = role;
            }
    
            if (validStatus) {
                tenantUpdate["users.$.status"] = status;
            }
    
            // Tenant update
            const tenant = await Tenant.updateOne({
                _id: tenantId,
                "users.user_id": contributorId
            }, {
                $set: tenantUpdate
            }, { session });
    
            // User update (only if role is valid)
            let user = { modifiedCount: 1 }; // default if no user update needed
    
            if (validRole) {
                user = await User.updateOne({
                    _id: contributorId,
                    "tenants.tenant_id": tenantId
                }, {
                    $set: userUpdate
                }, { session });
            }
    
            await session.commitTransaction();
            session.endSession();
    
            return tenant.modifiedCount > 0 && user.modifiedCount > 0;
    
        } catch (err) {
            await session.abortTransaction();
            session.endSession();
            throw err;
        }
    }    

    async removeContributor({ tenantId, contributorId }) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const tenant = await Tenant.updateOne({
                _id: tenantId
            }, {
                $pull: {
                    users: { user_id: contributorId }
                }
            }, { session });

            const user = await User.updateOne({
                _id: contributorId
            }, {
                $pull: {
                    tenants: { tenant_id: tenantId }
                }
            }, { session });

            await session.commitTransaction();
            session.endSession();

            return tenant.modifiedCount > 0 && user.modifiedCount > 0;
        } catch (err) {
            await session.abortTransaction();
            session.endSession();
            throw err;
        }
    }

    async inviteContributor({ tenantId, tenantName, invitorName, inviteeEmail }) {
        try {
            const user = await User.findOne({ email: inviteeEmail });

            const now = new Date();

            // If user does not exist, skip invitation
            if (!user) throw new Error("User not registered.");

            const alreadyAdded = await Tenant.findOne({
                _id: tenantId,
                "users.user_id": user._id
            });

            if (alreadyAdded) {
                throw new Error("User already a member of this tenant.");
            }

            // Add user to tenant's users list as INACTIVE
            await Tenant.updateOne(
                { _id: tenantId },
                {
                    $push: {
                        users: {
                            user_id: user._id,
                            name: user.name,
                            role: 'EDITOR', // default
                            status: 'INACTIVE',
                            joined_at: now,
                            updated_at: now
                        }
                    }
                }
            );

            // Send email
            await Mail.send({
                email: inviteeEmail,
                subject: `Invitation to join ${tenantName}`,
                body: `${invitorName} has invited you to collaborate on ${tenantName}. Click the link below to accept the invitation:\n\n` +
                    `${process.env.APP_BASE_URL || 'http://localhost:3000'}/tenant/join/${tenantId}`
            });

            return true;
        } catch (err) {
            logError(err, "Contributor invitation");
            return false;
        }
    }

    async acceptInvitation({ tenantId, userId }) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const now = new Date();

            // 1. Activate the user in tenant
            const tenantUpdate = await Tenant.updateOne(
                {
                    _id: tenantId,
                    "users.user_id": userId
                },
                {
                    $set: {
                        "users.$.status": "ACTIVE",
                        "users.$.joined_at": now,
                        "users.$.updated_at": now
                    }
                },
                { session }
            );

            if (tenantUpdate.modifiedCount === 0) {
                throw new Error("User not invited to this tenant.");
            }

            // 2. Add tenant to user model
            const userUpdate = await User.updateOne(
                {
                    _id: userId,
                    "tenants.tenant_id": { $ne: tenantId }
                },
                {
                    $push: {
                        tenants: {
                            tenant_id: tenantId,
                            role: 'EDITOR',
                            invited_by: null,
                            joined_at: now
                        }
                    }
                },
                { session }
            );

            await session.commitTransaction();
            session.endSession();

            return userUpdate.modifiedCount > 0;
        } catch (err) {
            await session.abortTransaction();
            session.endSession();
            logError(err, "Joining by the invitation link");
            return false;
        }
    }
}

export default new TenantService();