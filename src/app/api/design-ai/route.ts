import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import util from 'util';

const execAsync = util.promisify(exec);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt = body.prompt;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Path to the python script
    // NOTE: In production (Vercel), this won't work easily without specific configuration.
    // This is designed for the "Antigravity Sandbox" local environment.
    const scriptPath = path.join(process.cwd(), 'src', 'lib', 'agents', 'vibe_mapper.py');
    
    // Attempt to execute the python script
    // We assume 'python' or 'python3' is in the PATH
    const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
    
    // Sanitize prompt slightly (simplistic) to prevent simple injection if strictly shell exec
    // But better to use spawn with args array if possible, but execAsync is easier for single output.
    // Given the prompt is "vibe", we'll just escape double quotes
    const safePrompt = prompt.replace(/"/g, '\\"');

    try {
      const { stdout, stderr } = await execAsync(`${pythonCommand} "${scriptPath}" "${safePrompt}"`);
      
      if (stderr) {
         console.warn("Python Stderr:", stderr);
      }

      try {
        const result = JSON.parse(stdout);
        // Translate the Python result to the format KeychainCustomizer expects
        // expected: { text: "...", color: { ... } } or similar?
        // Actually KeychainCustomizer expects: { text: string } currently (see handleAiSynthesis in KeychainCustomizer.tsx)
        // But the VibeResponse gives us icons and vibe_category.
        // Let's map it.

        if (result.error) {
           return NextResponse.json({ error: result.error }, { status: 500 });
        }

        // Logic to extract a short text from the vibe or reasoning, for now we assume the prompt was the concept
        // But the user wants an "Identifier" (name).
        // Let's pretend the agent returns a cool name or we just use the category.
        const suggestedName = result.vibe_category.toUpperCase().slice(0, 8); // Max 8 chars

        return NextResponse.json({ 
            text: suggestedName, 
            vibe: result 
        });

      } catch (e) {
        console.error("JSON Parse Error on Python Output:", stdout);
        return NextResponse.json({ error: "Failed to parse Python output" }, { status: 500 });
      }

    } catch (execError: any) {
        console.error("Python Exec Error:", execError);
        // Fallback for simulation if Python fails (e.g., no OPENAI_KEY or missing libs)
        return NextResponse.json({ 
            text: "VIBEMODE", 
            simulated: true,
            note: "Python agent failed, fallback active.",
            vibe: {
                icons: [
                    { name: "Sparkle", svg_path: "M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" },
                    { name: "Heart", svg_path: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" },
                    { name: "Bolt", svg_path: "M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C7.56 12.63 11.4 7.28 12.16 6c.16-.27.42-.44.73-.44h2.72c.31 0 .53.31.42.61L14 11h4l-1 7h-1l1 7zM12 2L2 22h20L12 2z" } // Simple bolt representation, actually let's use a standard path
                ]
            }
        });
    }

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
