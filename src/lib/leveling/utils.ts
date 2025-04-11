export function getRequiredXP(level: number): number {
	if (level <= 1) return 0; // No XP needed for level 0
	return Math.floor(100 * level - 1 + 75);
}
