// src/utils/zipExtractor.ts

import JSZip from 'jszip';

/**
 * Extract SRT file from assets ZIP
 * @param zipBlob - The ZIP file blob from assets API
 * @returns SRT file content as string, or null if not found
 */
export async function extractSRTFromZip(zipBlob: Blob): Promise<string | null> {
  try {
    const zip = new JSZip();
    const contents = await zip.loadAsync(zipBlob);
    
    // Find .srt file
    const srtFile = Object.keys(contents.files).find(name => 
      name.toLowerCase().endsWith('.srt')
    );
    
    if (!srtFile) {
      console.warn('No SRT file found in ZIP');
      return null;
    }
    
    console.log('Found SRT file:', srtFile);
    
    // Extract and read SRT content
    const srtContent = await contents.files[srtFile].async('text');
    
    return srtContent;
  } catch (error) {
    console.error('Failed to extract SRT from ZIP:', error);
    return null;
  }
}