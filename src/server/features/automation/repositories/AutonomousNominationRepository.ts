import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { autonomousAgentNominationsV3 } from "@/db/schema";

export interface AgentNominationDto {
  id: string;
  status: string;
  reviewedAt?: string | null;
  payloadJson?: string | null;
  createdAt: string;
}

export class AutonomousNominationRepository {
  /**
   * Retrieves all nominations.
   */
  static async listNominations(): Promise<AgentNominationDto[]> {
    const rows = await db
      .select()
      .from(autonomousAgentNominationsV3)
      .orderBy(desc(autonomousAgentNominationsV3.createdAt));

    return rows;
  }

  /**
   * Upserts or updates an agent nomination.
   */
  static async upsertNomination(nom: {
    id: string;
    status: string;
    reviewedAt?: string | null;
    payloadJson?: string | null;
    createdAt?: string;
  }): Promise<void> {
    await db
      .insert(autonomousAgentNominationsV3)
      .values({
        id: nom.id,
        status: nom.status || "pending",
        reviewedAt: nom.reviewedAt || null,
        payloadJson: nom.payloadJson || null,
        createdAt: nom.createdAt || new Date().toISOString(),
      })
      .onConflictDoUpdate({
        target: autonomousAgentNominationsV3.id,
        set: {
          status: nom.status,
          reviewedAt: nom.reviewedAt || new Date().toISOString(),
          payloadJson: nom.payloadJson || null,
        },
      });
  }

  /**
   * Approves or rejects a nomination.
   */
  static async updateNominationStatus(
    id: string,
    status: "approved" | "rejected",
    reviewedAt = new Date().toISOString(),
  ): Promise<void> {
    await db
      .update(autonomousAgentNominationsV3)
      .set({
        status,
        reviewedAt,
      })
      .where(eq(autonomousAgentNominationsV3.id, id));
  }
}
