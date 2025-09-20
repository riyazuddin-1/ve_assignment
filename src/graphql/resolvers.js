import TenantManagement from '../services/tenants.service.js';
import IsolatedDatabaseManagement from '../services/isolated_databases.service.js';
import IsolatedDBRecordManagement from '../services/isolated_db_records.service.js';
import Token from '../services/jwt.service.js';

function decodeUser(token) {
    if (!token) throw new Error('Missing token');
    const unpacked = Token.check(token);
    if (!unpacked.valid) throw new Error('Invalid token: ' + unpacked.content.message);
    return unpacked.content;
}

export default {
    Query: {
        me: (_, context) => {
            const user = decodeUser(context.token);
            return `Logged in as ${user.email}`;
        },

        getTenantInfo: async ({ tenantId }, context) => {
            decodeUser(context.token);
            return await TenantManagement.getInfo({ tenantId });
        },

        getDatabaseInfo: async ({ dbId }, context) => {
            decodeUser(context.token);
            return await IsolatedDatabaseManagement.getInfo({ id: dbId });
        },

        getRecord: async ({ recordId }, context) => {
            decodeUser(context.token);
            return await IsolatedDBRecordManagement.read({ recordId });
        },
    },

    Mutation: {
        createTenant: async ({ tenant_name }, context) => {
            const user = decodeUser(context.token);
            return await TenantManagement.create({
                tenantName: tenant_name,
                userId: user.user_id
            });
        },

        inviteContributor: async (args, context) => {
            decodeUser(context.token);
            return await TenantManagement.inviteContributor(args);
        },

        acceptInvitation: async ({ tenant_id }, context) => {
            const user = decodeUser(context.token);
            return await TenantManagement.acceptInvitation({
                tenantId: tenant_id,
                userId: user.user_id
            });
        },

        removeTenant: async ({ tenant_id }, context) => {
            decodeUser(context.token);
            return await TenantManagement.remove({ tenantId: tenant_id });
        },

        createDatabase: async ({ tenant_id, db_name }, context) => {
            const user = decodeUser(context.token);
            return await IsolatedDatabaseManagement.create({
                tenantId: tenant_id,
                userId: user.user_id,
                dbName: db_name,
                fields: [] // Extend as needed
            });
        },

        createRecord: async ({ db_id, values }, context) => {
            const user = decodeUser(context.token);
            return await IsolatedDBRecordManagement.create({
                dbId: db_id,
                userId: user.user_id,
                values
            });
        }
    }
};
