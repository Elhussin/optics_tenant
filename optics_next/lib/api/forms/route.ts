import { promises as fs } from 'fs';
import path from 'path';

const configPath = path.join(process.cwd(), 'constants', 'formConfig.json');

export async function GET() {
  const data = await fs.readFile(configPath, 'utf-8');
  return new Response(data, { status: 200, headers: { 'Content-Type': 'application/json' } });
}

export async function POST(req: Request) {
  try {
    const { key, settings } = await req.json();

    if (!key || !settings) {
      return new Response(JSON.stringify({ error: 'Missing key or settings' }), { status: 400 });
    }

    const fileData = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(fileData);

    config[key] = settings;

    await fs.writeFile(configPath, JSON.stringify(config, null, 2));

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to save form config' }), { status: 500 });
  }
}
