import IsolatedDatabaseService from '../services/isolated_databases.service.js';
import { logError } from '../utils/logger.js';

class IsolatedDatabaseController {
    // CREATE
    async createIsolatedDB(req, res) {
        try {
            if (!req.user) {
                return res.status(401).send("Unauthorized: User info not found.");
            }

            const { db_name, fields } = req.body;

            if (!db_name || !fields) {
                return res.status(400).send("Invalid request: 'db_name' and 'fields' are required.");
            }

            const parsed_fields = JSON.parse(fields);

            if(!Array.isArray(parsed_fields)) {
                return res.status(400).send("Invalid request: 'fields' must be an array.");
            }

            const database = await IsolatedDatabaseService.create({
                tenantId: req.user.tenant_id,
                userId: req.user.user_id,
                dbName: db_name,
                fields: parsed_fields
            });

            return res.status(201).json({
                message: 'Isolated database created successfully.',
                database
            });

        } catch (err) {
            logError(err, 'Error while creating database');
            return res.status(500).send("Failed to create isolated database.");
        }
    }

    // READ
    async getIsolatedDBInfo(req, res) {
        try {
            const { dbId } = req.params;

            const page = req.query?.page || 1;
            const limit = req.query?.limit || 10;

            if (!dbId) {
                return res.status(400).send("Missing required field: Isolated database ID.");
            }

            const data = await IsolatedDatabaseService.getInfo({ id: dbId, limit, page });

            if (data) {
                return res.status(200).json({
                    message: "Fetched isolated database info successfully.",
                    data
                });
            } else {
                return res.status(404).send("No such isolated database found.");
            }
        } catch (err) {
            logError(err, "Error while fetching database info");
            res.status(500).send("Server error: Failed to fetch database info.");
        }
    }

    // UPDATE
    async updateIsolatedDB(req, res) {
        try {
            const { isolated_db_id, db_name, fields } = req.body;

            const parsed_fields = JSON.parse(fields);

            if (!isolated_db_id || !Array.isArray(parsed_fields)) {
                return res.status(400).send("Invalid request: 'isolated_db_id' and 'fields' are required.");
            }

            const updated = await IsolatedDatabaseService.update({
                id: isolated_db_id,
                dbName: db_name,
                fields: parsed_fields
            });

            if (!updated) {
                return res.status(404).send("Database not found or update failed.");
            }

            return res.status(200).json({
                message: "Isolated database updated successfully.",
                data: updated
            });

        } catch (err) {
            logError(err, "Error while updating database");
            return res.status(500).send("Failed to update isolated database.");
        }
    }

    // DELETE
    async removeIsolatedDB(req, res) {
        try {
            const { isolated_db_id } = req.body;

            if (!isolated_db_id) {
                return res.status(400).send("Missing required field: isolated_db_id");
            }

            const deleted = await IsolatedDatabaseService.remove({ id: isolated_db_id });

            return res.status(200).json({
                message: "Isolated database and related records deleted successfully.",
                data: deleted
            });
        } catch (err) {
            logError(err, "Error while deleting isolated database");
            return res.status(500).send("Failed to delete isolated database.");
        }
    }
}

export default new IsolatedDatabaseController();
