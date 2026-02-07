import { google } from "googleapis";

export type DriveFile = {
  id: string;
  name: string;
  url: string;
};

export async function getDriveFolders(parentId: string) {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!),
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });

  const drive = google.drive({ version: "v3", auth });

  const res = await drive.files.list({
    q: `'${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder'`,
    fields: "files(id, name)",
    orderBy: "name desc",
  });

  return res.data.files || [];
}

export async function getDriveFiles(folderId: string): Promise<DriveFile[]> {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!),
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });

  const drive = google.drive({ version: "v3", auth });

  const res = await drive.files.list({
    q: `'${folderId}' in parents`,
    fields: "files(id, name, webViewLink)",
    orderBy: "name",
  });

  return (
    res.data.files
      ?.filter((f): f is { id: string; name: string; webViewLink: string } =>
        Boolean(f.id && f.name && f.webViewLink),
      )
      .map((f) => ({
        id: f.id,
        name: f.name,
        url: f.webViewLink, // ✅ renommage ici
      })) || []
  );
}
