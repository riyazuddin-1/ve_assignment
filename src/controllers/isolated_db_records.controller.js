import { logError } from "../utils/logger.js";
import IsolatedDBRecordService from "../services/isolated_db_records.service.js";

class IsolatedDBRecordController {
    // CREATE
    async createRecord(req, res) {
        try {
            const { isolated_db_id, values } = req.body;

            const created_by = req.user?.user_id;

            const parsed_values = JSON.parse(values);

            if (!isolated_db_id || !created_by || !Array.isArray(parsed_values)) {
                return res.status(400).send("Missing required fields: db_id, created_by, values.");
            }

            const record = await IsolatedDBRecordService.create({ isolated_db_id, created_by, values: parsed_values });

            res.status(201).json({
                message: "Record created successfully.",
                data: record
            });
        } catch (err) {
            logError(err, "Creating record");
            res.status(500).send("Server error: Failed to create record.");
        }
    }

    // READ
    async readRecord(req, res) {
        try {
            const { recordId } = req.params;

            const record = await IsolatedDBRecordService.read({
                recordId
            });

            if (record) {
                res.status(200).json({
                    message: "Fetched record data successfully.",
                    data: record
                });
            } else {
                res.status(400).send("Record not available.");
            }
        } catch (err) {
            logError(err, "Reading record");
            res.status(500).send("Server error: Failed to get record data.");
        }
    }

    // UPDATE
    async updateRecord(req, res) {
        try {
            const { record_id, values } = req.body;

            const parsed_values = JSON.parse(values);

            if (!record_id || !Array.isArray(parsed_values)) {
                return res.status(400).send("Missing required fields: record_id, values.");
            }

            const updated = await IsolatedDBRecordService.update({ recordId: record_id, values: parsed_values });

            if (updated) {
                res.status(200).json({
                    message: "Record updated successfully.",
                    data: updated
                });
            } else {
                res.status(404).send("Record not found.");
            }
        } catch (err) {
            logError(err, "Updating record");
            res.status(500).send("Server error: Failed to update record.");
        }
    }

    // DELETE
    async removeRecord(req, res) {
        try {
            const { record_id } = req.body;

            if (!record_id) {
                return res.status(400).send("Missing required field: record_id.");
            }

            const deleted = await IsolatedDBRecordService.remove({ recordId: record_id });

            if (deleted) {
                res.status(200).json({
                    message: "Record deleted successfully.",
                    data: deleted
                });
            } else {
                res.status(404).send("Record not found.");
            }
        } catch (err) {
            logError(err, "Deleting record");
            res.status(500).send("Server error: Failed to delete record.");
        }
    }
}

export default new IsolatedDBRecordController();
