import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { autonomousAgentLearnedMemory } from "@/db/schema";

export interface LearnedMemoryRuleDto {
  id: string;
  projectId: string;
  category: "like" | "dislike" | "binding_rule";
  ruleText: string;
  learnedByAgent: string;
  sourceExcerpt?: string | null;
  createdAt: string;
}

export class AutonomousMemoryRepository {
  /**
   * Retrieves all learned memory rules for a project.
   */
  static async listMemoryRules(projectId: string): Promise<LearnedMemoryRuleDto[]> {
    const rows = await db
      .select()
      .from(autonomousAgentLearnedMemory)
      .where(eq(autonomousAgentLearnedMemory.projectId, projectId))
      .orderBy(desc(autonomousAgentLearnedMemory.createdAt));

    return rows.map((r) => ({
      id: r.id,
      projectId: r.projectId,
      category: (r.category === "dislike" || r.category === "binding_rule" ? r.category : "like") as "like" | "dislike" | "binding_rule",
      ruleText: r.ruleText,
      learnedByAgent: r.learnedByAgent,
      sourceExcerpt: r.sourceExcerpt,
      createdAt: r.createdAt,
    }));
  }

  /**
   * Inserts a newly learned rule.
   */
  static async insertMemoryRule(
    rule: Omit<LearnedMemoryRuleDto, "id" | "createdAt"> & { id?: string; createdAt?: string },
  ): Promise<LearnedMemoryRuleDto> {
    const newRule: LearnedMemoryRuleDto = {
      id: rule.id || `rule_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      projectId: rule.projectId,
      category: rule.category,
      ruleText: rule.ruleText,
      learnedByAgent: rule.learnedByAgent || "الوكلاء الـ 9",
      sourceExcerpt: rule.sourceExcerpt || null,
      createdAt: rule.createdAt || new Date().toISOString(),
    };

    await db
      .insert(autonomousAgentLearnedMemory)
      .values(newRule)
      .onConflictDoNothing();

    return newRule;
  }

  /**
   * Clears learned memory rules for a project.
   */
  static async deleteMemoryRules(projectId: string): Promise<void> {
    await db
      .delete(autonomousAgentLearnedMemory)
      .where(eq(autonomousAgentLearnedMemory.projectId, projectId));
  }
}
