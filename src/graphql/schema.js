// graphql/schema.js
export default `
    type TenantUser {
        user_id: ID!
        name: String
        role: String
        status: String
        joined_at: String
        updated_at: String
    }

    type Tenant {
        _id: ID!
        tenant_name: String!
        created_by: String!
        users: [TenantUser!]!
    }

    type IsolatedDatabase {
        _id: ID!
        tenant_id: ID!
        db_name: String!
        created_by: ID!
    }

    type RecordValue {
        field_id: ID!
        type: String!
        value: String
    }

    type Record {
        _id: ID!
        db_id: ID!
        created_by: ID!
        values: [RecordValue!]!
        created_at: String
        updated_at: String
    }

    type Query {
        me: String
        getTenantInfo(tenantId: ID!): Tenant
        getDatabaseInfo(dbId: ID!): IsolatedDatabase
        getRecord(recordId: ID!): Record
    }

    input RecordInput {
        field_id: ID!
        type: String!
        value: String
    }

    type Mutation {
        createTenant(tenant_name: String!): Tenant
        inviteContributor(tenant_id: ID!, tenant_name: String!, invitor_name: String!, invitee_email: String!): Boolean
        acceptInvitation(tenant_id: ID!): Boolean
        removeTenant(tenant_id: ID!): Boolean
        createDatabase(tenant_id: ID!, db_name: String!): IsolatedDatabase
        createRecord(db_id: ID!, values: [RecordInput!]!): Record
    }
`;
