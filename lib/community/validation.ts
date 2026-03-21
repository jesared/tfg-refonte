import {
  CommunityPostScope,
  CommunityPostStatus,
  CommunityReactionType,
  CommunityReportReason,
  CommunityReportStatus,
  CommunityZone,
} from "@prisma/client";

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

function ensureObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object") {
    throw new ValidationError("Invalid JSON payload");
  }

  return value as Record<string, unknown>;
}

function parseRequiredString(value: unknown, field: string, maxLength: number) {
  const normalized = String(value ?? "").trim();

  if (!normalized) {
    throw new ValidationError(`Missing required field: ${field}`);
  }

  if (normalized.length > maxLength) {
    throw new ValidationError(`Field ${field} exceeds ${maxLength} characters`);
  }

  return normalized;
}

function parseOptionalString(value: unknown, maxLength: number) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const normalized = String(value).trim();
  if (!normalized) {
    return null;
  }

  if (normalized.length > maxLength) {
    throw new ValidationError(`Field exceeds ${maxLength} characters`);
  }

  return normalized;
}

function parseOptionalHttpUrl(value: unknown, maxLength: number) {
  const normalized = parseOptionalString(value, maxLength);

  if (!normalized) {
    return null;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(normalized);
  } catch {
    throw new ValidationError("Field imageUrl must be a valid URL");
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new ValidationError("Field imageUrl must use http or https");
  }

  return parsedUrl.toString();
}

function parseEnumValue<T extends string>(value: unknown, enumObject: Record<string, T>, field: string) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const normalized = String(value).trim() as T;
  const allowed = Object.values(enumObject);

  if (!allowed.includes(normalized)) {
    throw new ValidationError(`Invalid ${field}`);
  }

  return normalized;
}

export function parseCreatePostDto(payload: unknown) {
  const body = ensureObject(payload);

  return {
    title: parseOptionalString(body.title, 140),
    content: parseRequiredString(body.content, "content", 5000),
    imageUrl: parseOptionalHttpUrl(body.imageUrl, 1000),
    tournamentId: parseOptionalString(body.tournamentId, 64),
    scope: parseEnumValue(body.scope, CommunityPostScope, "scope") ?? CommunityPostScope.TOURNAMENT,
    status: parseEnumValue(body.status, CommunityPostStatus, "status") ?? CommunityPostStatus.PUBLISHED,
    zone: parseEnumValue(body.zone, CommunityZone, "zone"),
  };
}

export function parseCreateCommentDto(payload: unknown) {
  const body = ensureObject(payload);

  return {
    content: parseRequiredString(body.content, "content", 2000),
  };
}

export function parseCreateReactionDto(payload: unknown) {
  const body = ensureObject(payload);

  return {
    type: parseEnumValue(body.type, CommunityReactionType, "reaction type") ?? CommunityReactionType.LIKE,
  };
}

export function parseCreateReportDto(payload: unknown) {
  const body = ensureObject(payload);

  return {
    reason: parseEnumValue(body.reason, CommunityReportReason, "report reason") ?? CommunityReportReason.OTHER,
    details: parseOptionalString(body.details, 2000),
  };
}

export function parseUpdateReportStatusDto(payload: unknown) {
  const body = ensureObject(payload);

  return {
    status: parseEnumValue(body.status, CommunityReportStatus, "report status"),
  };
}

export function parsePostsQuery(searchParams: URLSearchParams) {
  const tournamentId = parseOptionalString(searchParams.get("tournamentId"), 64);
  const zone = parseEnumValue(searchParams.get("zone"), CommunityZone, "zone");
  const status = parseEnumValue(searchParams.get("status"), CommunityPostStatus, "status");

  const limitParam = searchParams.get("limit");
  const rawLimit = limitParam ? Number.parseInt(limitParam, 10) : 20;

  if (!Number.isInteger(rawLimit) || rawLimit <= 0 || rawLimit > 100) {
    throw new ValidationError("Invalid limit (must be between 1 and 100)");
  }

  return {
    tournamentId,
    zone,
    status,
    limit: rawLimit,
  };
}
