import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY});

export async function POST(req){

const data = await req.json()

const prompt = `Create a modern, responsive portfolio website using HTML, Tailwind CSS, and JavaScript for a ${data.role} named ${data.name}.
Include these sections: About (${data.about}), Skills (${data.skills}), Projects (${data.projects.join(', ')}), and Contact information.
Use a professional design with animations. Include error handling and responsive design.`;


try {

    const response = await groqClient.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are a professional web developer who creates clean, modern portfolio websites. Return only the complete HTML code with embedded Tailwind CSS and JavaScript. Include comments for major sections.' },
          { role: 'user', content: prompt }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.1,
        max_tokens: 10,
      });

      return NextResponse.json({code:response.choices[0].message.content})
    
} catch (error) {
    
    return NextResponse.json({error:error.message},{status:500})

}

}