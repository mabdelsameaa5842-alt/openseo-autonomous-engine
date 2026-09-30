import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { autonomousMarketAllocation } from "@/db/schema";

export interface MarketAllocationDto {
  projectId: string;
  countryCode: string;
  countryName: string;
  flag: string;
  citiesJson: string;
  sharePercent: number;
  impressionVelocity: string;
  active: boolean;
  controlledByAgent: string;
  lastUpdatedBy: string;
  updatedAt: string;
}

export class AutonomousMarketRepository {
  /**
   * Retrieves active country allocations for a project.
   */
  static async listMarketAllocations(projectId: string): Promise<MarketAllocationDto[]> {
    const rows = await db
      .select()
      .from(autonomousMarketAllocation)
      .where(eq(autonomousMarketAllocation.projectId, projectId))
      .orderBy(desc(autonomousMarketAllocation.sharePercent));

    return rows.map((r) => ({
      ...r,
      active: r.active === 1,
    }));
  }

  /**
   * Upserts a market allocation entry.
   */
  static async upsertMarketAllocation(entry: MarketAllocationDto): Promise<void> {
    await db
      .insert(autonomousMarketAllocation)
      .values({
        ...entry,
        active: entry.active ? 1 : 0,
      })
      .onConflictDoUpdate({
        target: [autonomousMarketAllocation.projectId, autonomousMarketAllocation.countryCode],
        set: {
          countryName: entry.countryName,
          flag: entry.flag,
          citiesJson: entry.citiesJson,
          sharePercent: entry.sharePercent,
          impressionVelocity: entry.impressionVelocity,
          active: entry.active ? 1 : 0,
          controlledByAgent: entry.controlledByAgent,
          lastUpdatedBy: entry.lastUpdatedBy,
          updatedAt: entry.updatedAt || new Date().toISOString(),
        },
      });
  }
}
