import mongoose from 'mongoose';

import Record from '../models/isolated_db_records.model.js';
import Tenant from '../models/tenants.model.js';
import IsolatedDatabase from '../models/isolated_databases.model.js';

import Token from "../services/jwt.service.js";
import { logError } from '../utils/logger.js';

const ownershipConfig = {
    'tenant': {
        model: Tenant,
        field: 'created_by',
        key: 'tenant_id'
    },
    'isolated_database': {
        model: IsolatedDatabase,
        field: 'created_by',
        key: 'isolated_db_id'
    },
    'record': {
        model: Record,
        field: 'created_by',
        key: 'record_id'
    }
};

export async function authorized(req, res, next) {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).send("Unauthorized: Token is missing.");
        }

        const unpacked = Token.check(token);
        if (!unpacked.valid) {
            return res.status(401).send("Unauthorized: " + unpacked.content.message);
        }
        
        req.user = {
            user_id: unpacked.content.user_id,
            email: unpacked.content.email
        };
        
        next();
    } catch(err) {
        logError(err, 'Authorization');
        res.status(500).send("Server error while authorizing the user.");
    }
};

export async function authorizeByMembership(req, res, next) {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).send("Unauthorized: Token is missing.");
        }
        const unpacked = Token.check(token);
        if (!unpacked.valid) {
            return res.status(401).send("Unauthorized: " + unpacked.content.message);
        }
        const userId = unpacked.content.user_id;
        const tenantId = req.params.tenantId || req.body.tenant_id || req.query.tenant_id || unpacked.content.tenant_id;

        if (!userId || !tenantId) {
            return res.status(400).send("Missing user ID or tenant ID. Try visiting workspace before accessing any of it's content.");
        }
        const isValidTenantId = mongoose.Types.ObjectId.isValid(tenantId);
        const isValidUserId = mongoose.Types.ObjectId.isValid(userId);
        if (!isValidTenantId || !isValidUserId) {
            return res.status(400).send("Invalid tenant or user ID.");
        }
        const tenant = await Tenant.findOne({
            _id: tenantId,
            users: { $elemMatch: { user_id: userId } }
        });
        
        if (!tenant) {
            return res.status(403).send("Unauthorized: You are not a member of this tenant.");
        }
        
        // Find the specific user entry in the users array
        const member = tenant.users.find(u => u.user_id.toString() === userId.toString());
        
        if (!member) {
            return res.status(403).send("Unauthorized: User not found in tenant.");
        }
        
        req.user = {
            ...unpacked.content,
            tenant_id: tenantId,
            role: member.role || null
        };
        
        next();
    } catch (err) {
        logError(err, 'Membership Authorization');
        return res.status(500).send("Server error while checking tenant membership.");
    }
};

export function authorizeByRole(requiredRole) {
    return (req, res, next) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                return res.status(401).send("Unauthorized: Token is missing.");
            }

            const unpacked = Token.check(token);
            if (!unpacked.valid) {
                return res.status(401).send("Unauthorized: " + unpacked.content.message);
            }

            const userRole = req.user.role;

            if (!userRole || userRole !== requiredRole) {
                return res.status(403).send("Unauthorized: Insufficient role permissions.");
            }

            next();

        } catch (err) {
            logError(err, 'Role Authorization');
            res.status(500).send("Server error while authorizing role.");
        }
    };
}

export function authorizeByOwnership(resource) {
    return async (req, res, next) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                return res.status(401).send("Unauthorized: Token is missing.");
            }

            const unpacked = Token.check(token);
            if (!unpacked.valid) {
                return res.status(401).send("Unauthorized: " + unpacked.content.message);
            }

            if (!ownershipConfig[resource]) {
                return res.status(400).send("Invalid resource type.");
            }

            const { model, field, key } = ownershipConfig[resource];

            const resourceId = req.body[key];
            if (!mongoose.Types.ObjectId.isValid(resourceId)) {
                return res.status(400).send(`Invalid resource ID: ${key}`);
            }

            const user = await model.findOne({
                _id: resourceId,
                [field]: unpacked.content.user_id,
            });

            if (!user) {
                return res.status(403).send("Unauthorized: Action not permissible.");
            }

            next();

        } catch (err) {
            logError(err, 'authorizeByOwnership error');
            res.status(500).send("Server error while checking ownership.");
        }
    };
}