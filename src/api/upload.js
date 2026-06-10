import client, { executeRequest, mockDb } from './client';

/**
 * Upload a document to a specific folder.
 * Backend endpoint: POST /api/upload
 * Request: multipart/form-data (fields: file, folder)
 */
export const uploadDocument = async (file, folder, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  // We check if the backend is running by running executeRequest.
  // To handle the mock progress callback, we must run it in the mock fallback block.
  return executeRequest(
    () =>
      client.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
      }),
    async () => {
      // Simulate Axios upload progress updates for UI response
      if (onUploadProgress) {
        const steps = [10, 30, 50, 75, 90, 100];
        for (const pct of steps) {
          onUploadProgress({
            loaded: pct,
            total: 100,
          });
          await new Promise((resolve) => setTimeout(resolve, 150));
        }
      }

      // Add to mock documents database
      const allDocs = mockDb.getDocuments();
      const newDocId = `doc-${Date.now()}`;
      const newDoc = {
        id: newDocId,
        title: file.name,
        folder: folder,
        similarityScore: 0.85,
        snippet: `...This is a simulated OCR text preview of the uploaded document "${file.name}". Content has been indexed into the "${folder}" search database and is queryable...`,
      };

      allDocs.unshift(newDoc); // Put at the top of results
      mockDb.setDocuments(allDocs);

      return {
        success: true,
        message: `Document "${file.name}" uploaded successfully to folder "${folder}".`,
        document: newDoc,
      };
    }
  );
};
