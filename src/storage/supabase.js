import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// Use URL from Supabase dashboard → Settings → API → Project URL
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;

// Prefer new-style publishable key if provided, otherwise fall back to legacy anon public key
// NEVER use service_role / secret keys in the frontend.
const supabaseAnonKey =
  process.env.REACT_APP_SUPABASE_PUBLISHABLE_KEY ||
  process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase credentials not found. Please add REACT_APP_SUPABASE_URL and either REACT_APP_SUPABASE_PUBLISHABLE_KEY or REACT_APP_SUPABASE_ANON_KEY to your .env file'
  );
}

// Create Supabase client (safe to use with publishable or anon public key)
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

/**
 * Sanitize filename to remove invalid characters for Supabase Storage
 * @param {string} filename - Original filename
 * @returns {string} - Sanitized filename
 */
const sanitizeFilename = (filename) => {
  // Remove or replace invalid characters: [ ] { } ( ) < > | \ / : * ? " '
  return filename
    .replace(/[[\]{}()<>|\\/:*?"']/g, '_') // Replace invalid chars with underscore
    .replace(/\s+/g, '_') // Replace spaces with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_+|_+$/g, ''); // Remove leading/trailing underscores
};

/**
 * Upload a file to Supabase Storage
 * @param {File} file - The file to upload
 * @param {string} userId - User email or ID
 * @param {Function} onProgress - Progress callback (progress: number) => void
 * @param {string} bucket - Bucket name (default: 'documents')
 * @param {string} customPath - Custom file path (optional)
 * @returns {Promise<{url: string, path: string}>}
 */
export const upload = async (file, userId, onProgress, bucket = 'documents', customPath = null) => {
  try {
    // Sanitize the filename to remove invalid characters
    const sanitizedFileName = sanitizeFilename(file.name);
    const sanitizedUserId = sanitizeFilename(userId); // Also sanitize user ID (email might have special chars)
    const filePath = customPath || `uploads/${sanitizedUserId}/${Date.now()}_${sanitizedFileName}`;
    
    if (onProgress) {
      onProgress(10);
    }

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    if (onProgress) {
      onProgress(90);
    }

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    if (onProgress) {
      onProgress(100);
    }

    return {
      url: urlData.publicUrl,
      path: filePath
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Download a file from Supabase Storage
 * @param {string} filePath - Path to the file in storage
 * @param {string} bucket - Bucket name (default: 'documents')
 * @returns {Promise<Blob>}
 */
export const download = async (filePath, bucket = 'documents') => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(filePath);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
};

/**
 * List all files for a user or in a folder
 * @param {string} userId - User email or ID
 * @param {string} bucket - Bucket name (default: 'documents')
 * @param {string} folderPath - Folder path to list (optional)
 * @param {number} limit - Maximum number of files to return
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array<{id: string, name: string, url: string, created_at: string, updated_at: string}>>}
 */
export const list = async (userId, bucket = 'documents', folderPath = null, limit = 100, offset = 0) => {
  try {
    // Sanitize userId for path consistency
    const sanitizedUserId = sanitizeFilename(userId);
    const path = folderPath || `uploads/${sanitizedUserId}`;
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path, {
        limit,
        offset,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      if (error.message?.includes('not found') || error.statusCode === '404') {
        return [];
      }
      throw error;
    }

    const filesWithUrls = await Promise.all(
      (data || []).map(async (file) => {
        const fullPath = `${path}/${file.name}`;
        const url = await getPublicUrl(fullPath, bucket);
        // Extract original filename (remove timestamp prefix)
        // Format: timestamp_originalfilename.docx
        const originalName = file.name.includes('_') 
          ? file.name.split('_').slice(1).join('_') 
          : file.name;
        return {
          id: fullPath, // Store full path as ID for deletion
          name: originalName,
          url: url,
          created_at: file.created_at,
          updated_at: file.updated_at,
          size: file.metadata?.size || 0
        };
      })
    );

    return filesWithUrls;
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
};

/**
 * Update/replace an existing file
 * @param {File} file - The new file to replace the old one
 * @param {string} filePath - Path to the existing file
 * @param {string} bucket - Bucket name (default: 'documents')
 * @param {Function} onProgress - Progress callback (optional)
 * @returns {Promise<{url: string, path: string}>}
 */
export const update = async (file, filePath, bucket = 'documents', onProgress = null) => {
  try {
    if (onProgress) {
      onProgress(10);
    }

    const { error } = await supabase.storage
      .from(bucket)
      .update(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;

    if (onProgress) {
      onProgress(90);
    }

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    if (onProgress) {
      onProgress(100);
    }

    return {
      url: urlData.publicUrl,
      path: filePath
    };
  } catch (error) {
    console.error('Error updating file:', error);
    throw error;
  }
};

/**
 * Move a file from one path to another
 * @param {string} oldPath - Current file path
 * @param {string} newPath - New file path
 * @param {string} bucket - Bucket name (default: 'documents')
 * @returns {Promise<{url: string, path: string}>}
 */
export const move = async (oldPath, newPath, bucket = 'documents') => {
  try {
    // Download the file
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(bucket)
      .download(oldPath);

    if (downloadError) throw downloadError;

    // Upload to new path
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(newPath, fileData, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Delete old file
    await remove([oldPath], bucket);

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(newPath);

    return {
      url: urlData.publicUrl,
      path: newPath
    };
  } catch (error) {
    console.error('Error moving file:', error);
    throw error;
  }
};

/**
 * Copy a file to a new path
 * @param {string} sourcePath - Source file path
 * @param {string} destinationPath - Destination file path
 * @param {string} bucket - Bucket name (default: 'documents')
 * @returns {Promise<{url: string, path: string}>}
 */
export const copy = async (sourcePath, destinationPath, bucket = 'documents') => {
  try {
    // Download the file
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(bucket)
      .download(sourcePath);

    if (downloadError) throw downloadError;

    // Upload to new path
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(destinationPath, fileData, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(destinationPath);

    return {
      url: urlData.publicUrl,
      path: destinationPath
    };
  } catch (error) {
    console.error('Error copying file:', error);
    throw error;
  }
};

/**
 * Remove/delete files from Supabase Storage
 * @param {string|Array<string>} filePaths - Single path or array of paths to delete
 * @param {string} bucket - Bucket name (default: 'documents')
 * @returns {Promise<void>}
 */
export const remove = async (filePaths, bucket = 'documents') => {
  try {
    const paths = Array.isArray(filePaths) ? filePaths : [filePaths];
    const { error } = await supabase.storage
      .from(bucket)
      .remove(paths);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * Create a signed URL for private file access (expires after specified time)
 * @param {string} filePath - Path to the file
 * @param {number} expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
 * @param {string} bucket - Bucket name (default: 'documents')
 * @returns {Promise<string>}
 */
export const createSignedUrl = async (filePath, expiresIn = 3600, bucket = 'documents') => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn);

    if (error) throw error;
    return data.signedUrl;
  } catch (error) {
    console.error('Error creating signed URL:', error);
    throw error;
  }
};

/**
 * Create multiple signed URLs for private files
 * @param {Array<string>} filePaths - Array of file paths
 * @param {number} expiresIn - Expiration time in seconds (default: 3600)
 * @param {string} bucket - Bucket name (default: 'documents')
 * @returns {Promise<Array<{path: string, signedUrl: string}>>}
 */
export const createSignedUrls = async (filePaths, expiresIn = 3600, bucket = 'documents') => {
  try {
    const signedUrls = await Promise.all(
      filePaths.map(async (path) => {
        const signedUrl = await createSignedUrl(path, expiresIn, bucket);
        return {
          path,
          signedUrl
        };
      })
    );

    return signedUrls;
  } catch (error) {
    console.error('Error creating signed URLs:', error);
    throw error;
  }
};

/**
 * Get public URL for a file in a public bucket
 * @param {string} filePath - Path to the file
 * @param {string} bucket - Bucket name (default: 'documents')
 * @returns {Promise<string>}
 */
export const getPublicUrl = async (filePath, bucket = 'documents') => {
  try {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  } catch (error) {
    console.error('Error getting public URL:', error);
    throw error;
  }
};

// Legacy function names for backward compatibility
export const uploadFile = upload;
export const getFileUrl = getPublicUrl;
export const listUserFiles = (userId, bucket = 'documents') => list(userId, bucket);
export const deleteFile = (filePath, bucket = 'documents') => remove(filePath, bucket);
