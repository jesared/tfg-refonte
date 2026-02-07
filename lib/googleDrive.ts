import { google } from "googleapis";

/**
 * =========================
 * TYPES PROPRES
 * =========================
 */

export type DriveFolder = {
  id: string;
  name: string;
};

export type DriveFile = {
  id: string;
  name: string;
  url: string;
};

export type DriveItem = {
  id: string;
  name: string;
  isFolder: boolean;
  url?: string;
};
/**
 * =========================
 * AUTH GOOGLE (factorisé)
 * =========================
 */

function getAuth() {
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

  if (!key) {
    console.warn("⚠️ GOOGLE_SERVICE_ACCOUNT_KEY manquant");
    return null;
  }

  return new google.auth.GoogleAuth({
    credentials: JSON.parse(key),
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });
}

/**
 * =========================
 * DOSSIERS UNIQUEMENT
 * (existant, sécurisé)
 * =========================
 */

export async function getDriveFolders(parentId: string): Promise<DriveFolder[]> {
  const auth = getAuth();
  if (!auth) return [];

  const drive = google.drive({ version: "v3", auth });

  const res = await drive.files.list({
    q: `'${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder'`,
    fields: "files(id, name)",
    orderBy: "name desc",
  });

  return (
    res.data.files
      ?.filter(
        (f): f is { id: string; name: string } =>
          typeof f.id === "string" && typeof f.name === "string",
      )
      .map((f) => ({
        id: f.id,
        name: f.name,
      })) || []
  );
}

/**
 * =========================
 * FICHIERS UNIQUEMENT (PDF)
 * (existant, sécurisé)
 * =========================
 */

export async function getDriveFiles(folderId: string): Promise<DriveFile[]> {
  const auth = getAuth();
  if (!auth) return [];

  const drive = google.drive({ version: "v3", auth });

  const res = await drive.files.list({
    q: `'${folderId}' in parents`,
    fields: "files(id, name, webViewLink)",
    orderBy: "name",
  });

  return (
    res.data.files
      ?.filter(
        (f): f is { id: string; name: string; webViewLink: string } =>
          typeof f.id === "string" &&
          typeof f.name === "string" &&
          typeof f.webViewLink === "string",
      )
      .map((f) => ({
        id: f.id,
        name: f.name,
        url: f.webViewLink,
      })) || []
  );
}

/**
 * =========================
 * NOUVEAU : DOSSIERS + FICHIERS
 * (Saison → Tour → Tableaux)
 * =========================
 */

export async function getDriveChildren(parentId: string): Promise<DriveItem[]> {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!),
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });

  const drive = google.drive({ version: "v3", auth });

  const res = await drive.files.list({
    q: `'${parentId}' in parents and trashed = false`,
    fields: "files(id, name, mimeType, webViewLink)",
    orderBy: "name",
  });

  return (
    res.data.files?.map((file) => ({
      id: file.id!,
      name: file.name!,
      isFolder: file.mimeType === "application/vnd.google-apps.folder",
      url: file.webViewLink ?? undefined,
    })) ?? []
  );
}
