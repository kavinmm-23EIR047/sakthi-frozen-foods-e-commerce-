import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const { dataUrl } = await req.json();
    if (!dataUrl || !dataUrl.startsWith('data:image/png;base64,')) {
      return NextResponse.json({ error: 'Invalid data URL' }, { status: 400 });
    }

    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const filePath = path.join(process.cwd(), 'public', 'assets', 'sakthi-patties-nobg.png');
    
    fs.writeFileSync(filePath, buffer);
    console.log('[API] Successfully saved transparent patty PNG to:', filePath);

    return NextResponse.json({ success: true, path: '/assets/sakthi-patties-nobg.png' });
  } catch (err: any) {
    console.error('[API] Error saving transparent patty:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
