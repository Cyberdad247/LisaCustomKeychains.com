import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import { z } from 'zod';

// 🕸️ SPIDER MODE: Zero-Trust Input Validation
const DesignRequestSchema = z.object({
  prompt: z.string()
    .min(1)
    .max(200, "Prompt too long")
    .regex(/^[a-zA-Z0-9\s\-_.,!?]+$/, "Invalid characters detected"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 🛡️ SENTINEL: Validate input before execution
    const validation = DesignRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten() }, 
        { status: 400 }
      );
    }

    const { prompt } = validation.data;
    const scriptPath = path.join(process.cwd(), 'src', 'lib', 'agents', 'vibe_mapper.py');
    const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';

    // 🕸️ SPIDER MODE: Switch to spawn (No Shell = No Injection)
    return new Promise((resolve) => {
      const child = spawn(pythonCommand, [scriptPath, prompt]);
      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code !== 0) {
          console.warn("⚠️ AI Agent Error (Stderr):", stderr);
          // Fallback simulation for robustness
          resolve(NextResponse.json({ 
            text: "VIBEMODE", 
            simulated: true,
            note: "Secure fallback active.",
            vibe: {
                icons: [
                    { name: "Sparkle", svg_path: "M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" },
                    { name: "Heart", svg_path: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" },
                    { name: "Bolt", svg_path: "M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C7.56 12.63 11.4 7.28 12.16 6c.16-.27.42-.44.73-.44h2.72c.31 0 .53.31.42.61L14 11h4l-1 7h-1l1 7zM12 2L2 22h20L12 2z" }
                ]
            }
          }));
          return;
        }

        try {
          const result = JSON.parse(stdout);
          const suggestedName = result.vibe_category ? result.vibe_category.toUpperCase().slice(0, 8) : "VIBE";
          resolve(NextResponse.json({ text: suggestedName, vibe: result }));
        } catch (e) {
          console.error("❌ JSON Parse Failed:", stdout);
          resolve(NextResponse.json({ error: "Agent output malformed" }, { status: 500 }));
        }
      });
    });

  } catch (error) {
    return NextResponse.json({ error: 'System Error' }, { status: 500 });
  }
}