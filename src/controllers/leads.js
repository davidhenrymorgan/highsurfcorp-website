/**
 * Leads Management Controller
 */

import { jsonResponse } from "../middleware/static.js";
import { safeDbQuery, safeDbFirst } from "../utils/db.js";

/**
 * GET /api/admin/leads - List all leads
 */
export async function getLeads(c) {
  try {
    const leads = await safeDbQuery(
      c.env.DB,
      `SELECT * FROM leads ORDER BY created_at DESC`,
    );

    return jsonResponse(
      {
        success: true,
        data: leads.results,
        count: leads.results.length,
      },
      200,
      c.req.raw,
    );
  } catch (error) {
    console.error("Get leads error:", error);
    return jsonResponse(
      { success: false, error: "Failed to fetch leads" },
      500,
      c.req.raw,
    );
  }
}

/**
 * PATCH /api/admin/leads/:id - Update lead status
 */
export async function updateLeadStatus(c) {
  try {
    const id = c.req.param("id");
    const { status } = await c.req.json();

    if (!id || !status) {
      return jsonResponse(
        { success: false, error: "Missing ID or status" },
        400,
        c.req.raw,
      );
    }

    // Verify lead exists
    const lead = await safeDbFirst(c.env.DB, "SELECT id FROM leads WHERE id = ?", [id]);
    if (!lead) {
      return jsonResponse(
        { success: false, error: "Lead not found" },
        404,
        c.req.raw,
      );
    }

    await safeDbQuery(
      c.env.DB,
      "UPDATE leads SET status = ? WHERE id = ?",
      [status, id]
    );

    return jsonResponse(
      { success: true, message: "Lead status updated" },
      200,
      c.req.raw,
    );
  } catch (error) {
    console.error("Update lead error:", error);
    return jsonResponse(
      { success: false, error: "Failed to update lead" },
      500,
      c.req.raw,
    );
  }
}

/**
 * DELETE /api/admin/leads/:id - Delete a lead
 */
export async function deleteLead(c) {
  try {
    const id = c.req.param("id");

    if (!id) {
      return jsonResponse(
        { success: false, error: "Missing lead ID" },
        400,
        c.req.raw,
      );
    }

    await safeDbQuery(c.env.DB, "DELETE FROM leads WHERE id = ?", [id]);

    return jsonResponse(
      { success: true, message: "Lead deleted successfully" },
      200,
      c.req.raw,
    );
  } catch (error) {
    console.error("Delete lead error:", error);
    return jsonResponse(
      { success: false, error: "Failed to delete lead" },
      500,
      c.req.raw,
    );
  }
}
