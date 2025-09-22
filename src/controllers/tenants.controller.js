import TenantService from '../services/tenants.service.js';
import { logError } from '../utils/logger.js';

class TenantController {
    // CREATE
    async createTenant(req, res) {
        if (!req.user) {
            return res.status(401).send("Unauthorized: User info not found.");
        }

        try {
            const { tenant_name } = req.body;
            const { user_id } = req.user;

            if (!tenant_name) {
                return res.status(400).send("Invalid request: 'tenant_name' is required.");
            }

            const tenant = await TenantService.create({
                tenantName: tenant_name,
                userId: user_id
            });

            return res.status(201).json({
                message: 'Tenant created successfully.',
                data: tenant
            });

        } catch (err) {
            logError(err, 'Transaction error while creating tenant');
            return res.status(500).send("Failed to create tenant.");
        }
    }

    // READ
    async getTenantInfo(req, res) {
        try {
            if (!req.user?.tenant_id) {
                return res.status(404).send("Tenant ID not found.");
            }

            const page = req.query?.page || 1;
            const limit = req.query?.limit || 10;

            const tenant = await TenantService.getInfo({
                user: req.user,
                tenantId: req.user.tenant_id,
                limit,
                page
            });

            res.status(200).json({
                message: "Fetched tenant information successfully.",
                data: tenant.data,
                token: tenant.token
            });
        } catch (err) {
            logError(err, 'Fetching tenant info');
            res.status(500).send("Server error: Failed to fetch tenant information.");
        }
    }

    // UPDATE
    async updateTenant(req, res) {
        try {
            if (!req.user?.tenant_id) {
                return res.status(404).send("Tenant ID not found.");
            }

            const { tenant_name } = req.body;
            if (!tenant_name) {
                return res.status(400).send("Missing field: tenant_name.");
            }

            const tenant = await TenantService.update({ 
                tenantId: req.user.tenant_id,
                tenantName: tenant_name 
            });

            res.status(200).json({
                message: "Tenant information updated!",
                data: tenant
            });
        } catch (err) {
            logError(err, "Tenant update");
            res.status(500).send("Server error: Failed to update tenant information.");
        }
    }

    // DELETE
    async removeTenant(req, res) {
        try {
            if (!req.user?.tenant_id) {
                return res.status(404).send("Tenant ID not found.");
            }

            await TenantService.remove({ tenantId: req.user.tenant_id });

            res.status(200).json({
                message: "Deleted the tenant and all related items successfully."
            });
        } catch (err) {
            logError(err, "Tenant deletion");
            res.status(500).send("Server error: Failed to delete the tenant.");
        }
    }

    async inviteContributor(req, res) {
        try {
            const { tenant_id, tenant_name, invitor_name, invitee_email } = req.body;

            if (!tenant_id || !tenant_name || !invitor_name || !invitee_email) {
                return res.status(400).send("Missing important fields. Make sure you have 'tenant_id', 'tenant_name', 'invitor_name', and 'invitee_email'.");
            }

            const invited = await TenantService.inviteContributor({
                tenantId: tenant_id,
                tenantName: tenant_name,
                invitorName: invitor_name,
                inviteeEmail: invitee_email
            });

            if (invited) {
                res.status(200).json({ message: "Invitation sent successfully." });
            } else {
                throw new Error("Failed to process invitation.");
            }
        } catch (err) {
            logError(err, "Contributor Invitation");
            res.status(500).send("Server error: Failed to invite contributor.");
        }
    }

    // ACCEPT INVITATION
    async acceptInvitation(req, res) {
        try {
            const { tenantId } = req.params;

            if (!tenantId || !req.user?.user_id) {
                return res.status(400).send("Missing tenant or user information.");
            }

            const joined = await TenantService.acceptInvitation({
                tenantId,
                userId: req.user.user_id
            });

            if (joined) {
                res.status(200).json({ message: "Joined the tenant successfully." });
            } else {
                throw new Error("Join operation failed.");
            }
        } catch (err) {
            logError(err, "Joining tenant");
            res.status(500).send("Server error: Failed to join tenant.");
        }
    }

    // UPDATE CONTRIBUTOR
    async updateContributor(req, res) {
        try {
            const { tenant_id, contributor_id, role, status } = req.body;

            if (!tenant_id || !contributor_id) {
                return res.status(400).send("Missing important fields.");
            }

            const updated = await TenantService.updateContributor({
                tenantId: tenant_id,
                contributorId: contributor_id,
                role,
                status
            });

            if (updated) {
                res.status(200).json({
                    message: "Updated contributor in tenant successfully."
                });
            } else {
                throw new Error("No modification detected.");
            }
        } catch (err) {
            logError(err, "Tenant contributor update");
            res.status(500).send("Server error: Failed to update contributor properties.");
        }
    }

    // REMOVE CONTRIBUTOR
    async removeContributor(req, res) {
        try {
            const { tenant_id, contributor_id } = req.body;

            if (!tenant_id || !contributor_id) {
                return res.status(400).send("Missing important fields.");
            }

            const removed = await TenantService.removeContributor({
                tenantId: tenant_id,
                contributorId: contributor_id
            });

            if (removed) {
                res.status(200).json({
                    message: "Removed contributor from tenant successfully."
                });
            } else {
                throw new Error("No modification detected.");
            }
        } catch (err) {
            logError(err, "Removing contributor");
            res.status(500).send("Server error: Failed to remove the contributor.");
        }
    }
}

export default new TenantController();