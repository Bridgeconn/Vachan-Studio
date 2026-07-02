// src/utils/srtParser.ts

export interface WordTimestamp {
  word: string;
  start: number; // seconds
  end: number;   // seconds
}

/**
 * Parse custom SRT format with NOTE line containing word-level timestamps
 * 
 * Format:
 * 1
 * 00:00:00,660 --> 00:00:03,799
 * in the beginning god created the heaven and the earth
 * NOTE [00:00:00,660] in [00:00:00,760] the [00:00:00,900] beginning ...
 */
export function parseSRT(srtText: string): WordTimestamp[] {
  const timestamps: WordTimestamp[] = [];
  
  // Split by double newlines (SRT blocks)
  const blocks = srtText.trim().split(/\n\n+/);
  
  for (const block of blocks) {
    const lines = block.split('\n');
    if (lines.length < 4) continue; // Need at least 4 lines (index, time, text, NOTE)
    
    // Find the NOTE line
    const noteLine = lines.find(line => line.startsWith('NOTE'));
    if (!noteLine) continue;
    
    // Parse NOTE line: "NOTE [00:00:00,660] in [00:00:00,760] the ..."
    // Remove "NOTE " prefix
    const content = noteLine.substring(5);
    
    // Split by timestamps: [HH:MM:SS,mmm]
    const timestampRegex = /\[(\d{2}):(\d{2}):(\d{2}),(\d{3})\]/g;
    
    const parts: string[] = [];
    const times: number[] = [];
    
    let lastIndex = 0;
    let match;
    
    while ((match = timestampRegex.exec(content)) !== null) {
      // Get text between last timestamp and this one
      const textBefore = content.substring(lastIndex, match.index).trim();
      if (textBefore) {
        parts.push(textBefore);
      }
      
      // Parse timestamp
      const hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      const seconds = parseInt(match[3]);
      const milliseconds = parseInt(match[4]);
      
      const timeInSeconds = hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
      times.push(timeInSeconds);
      
      lastIndex = match.index + match[0].length;
    }
    
    // Get remaining text after last timestamp
    const remainingText = content.substring(lastIndex).trim();
    if (remainingText) {
      parts.push(remainingText);
    }
    
    // Create word timestamps
    // Format is: [time1] word1 [time2] word2 [time3] word3
    // So times[i] is the start of parts[i]
    for (let i = 0; i < parts.length; i++) {
      const word = parts[i];
      const start = times[i];
      const end = times[i + 1] || start + 0.5; // Use next timestamp or add 0.5s
      
      timestamps.push({
        word,
        start,
        end,
      });
    }
  }
  
  console.log('Parsed word timestamps:', timestamps.length, 'words');
  
  return timestamps;
}