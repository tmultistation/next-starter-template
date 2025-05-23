import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { hubContentData } from '../../../data/hub-content-module';

// Use the imported data as the primary source, with in-memory updates
let currentData: any = JSON.parse(JSON.stringify(hubContentData));

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'hub-content.json');

export async function GET() {
  try {
    console.log('Using imported hub content data');
    return NextResponse.json(currentData);
  } catch (error) {
    console.error('Hub content API error:', error);
    return NextResponse.json({ 
      error: 'Failed to read data', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Update the in-memory data
    currentData = body;
    console.log('Updated in-memory hub content data');
    
    // Also try to write to file system if possible (for development)
    try {
      const dir = path.dirname(dataFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(dataFilePath, JSON.stringify(body, null, 2));
      console.log('Successfully wrote to file system');
    } catch (fsError) {
      console.warn('Could not write to file system, but in-memory data updated:', fsError);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Hub content POST error:', error);
    return NextResponse.json({ 
      error: 'Failed to save data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 