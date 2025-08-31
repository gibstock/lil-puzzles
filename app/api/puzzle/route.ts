import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// This function handles GET requests to /api/puzzle
export async function GET() {
  try {
    // Get today's date in YYYY-MM-DD format, adjusting for timezone differences
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
    
    // Construct the full file path to the puzzle file
    const filePath = path.join(process.cwd(), 'lib', 'puzzles', `${today}.json`);

    // Read the file from the server's filesystem
    const fileContents = await fs.readFile(filePath, 'utf8');
    const puzzle = JSON.parse(fileContents);
    
    // Send the puzzle data back as a JSON response
    return NextResponse.json(puzzle);

  } catch (error) {
    // If the file doesn't exist or there's an error, send a 404 response
    console.error("Failed to load today's puzzle:", error);
    return NextResponse.json({ error: "Sorry, a puzzle could not be found for today." }, { status: 404 });
  }
}