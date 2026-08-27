export type VisibilityCandidate = {
  publicationStatus: "DRAFT" | "PUBLISHED" | "INACTIVE" | "ARCHIVED";
  publishedAt: Date | null;
  publicationEndsAt: Date | null;
  deletedAt: Date | null;
};

export function isPackagePublic(candidate: VisibilityCandidate, now = new Date()) {
  if (candidate.deletedAt) return false;
  if (candidate.publicationStatus !== "PUBLISHED") return false;
  if (candidate.publishedAt && candidate.publishedAt > now) return false;
  if (candidate.publicationEndsAt && candidate.publicationEndsAt < now) return false;
  return true;
}

export function publicPackageWhere(now = new Date()) {
  return {
    publicationStatus: "PUBLISHED" as const,
    deletedAt: null,
    AND: [
      { OR: [{ publishedAt: null }, { publishedAt: { lte: now } }] },
      { OR: [{ publicationEndsAt: null }, { publicationEndsAt: { gte: now } }] },
    ],
  };
}
