import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  const data = await req.json();

  // Create a specialized prompt for home service businesses
  const prompt = `Create a modern, responsive website for a home service business using HTML, Tailwind CSS, and JavaScript.

Business Details:
- Name: ${data.businessName}
- Type: ${data.serviceType} service provider
- Years of Experience: ${data.experience}
- Service Area: ${data.coverage}
- Working Hours: ${data.workingHours}
- Emergency Services: ${data.emergency ? 'Available' : 'Not available'}

About the Business:
${data.about}

Services Offered:
${data.services.map(service => `- ${service}`).join('\n')}

Pricing Information:
${data.pricing.map(price => `- ${price}`).join('\n')}

Licenses & Certifications:
${data.licenses}

Service Guarantees:
${data.guarantees}

Testimonials:
${data.testimonials.map(testimonial => `- "${testimonial}"`).join('\n')}

Contact Information:
- Phone: ${data.contact.phone}
- Email: ${data.contact.email}
- Address: ${data.contact.address}

Color Scheme: ${data.colors}

Requirements:
1. Create a professional, trust-building design with smooth animations. Add some matching color to ${data.colors} in hero section as gradient.
2. Ensure mobile-responsive layout
3. Include a prominent call-to-action for service booking
4. Add emergency service badge if applicable
7. Include testimonials carousel
8. Add schema markup for local business
9. Implement contact form with validation
10. Add service scheduling functionality
11. Include trust indicators (licenses, guarantees, years of experience)
12. Optimize for local SEO
13. Add emergency contact floating button if applicable
14. Include service comparison tables
15.It should be long page with more content
16.All the above ones are for reference only and don't include them in site as it is`;


  try {
    const response = await groqClient.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an expert web developer specializing in creating websites for home service businesses like plumbers, electricians, and cleaning services. Generate complete, production-ready HTML code with embedded Tailwind CSS and JavaScript. Include comprehensive comments for each section and ensure the code follows best practices for performance and SEO. The website should be designed to convert visitors into customers. Other than the code, nothing should be shown.`
        },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,
      
      stream: false
    });

    // Extract and clean the generated code
    let generatedCode = response.choices[0].message.content;

    // Remove any markdown code block indicators that might be in the response
    generatedCode = generatedCode.replace(/```html\n?|```\n?/g, '');
    
    // Remove any HTML comments at the start of the file
    generatedCode = generatedCode.replace(/^<!--[\s\S]*?-->\s*/m, '');

    // Validate that we received HTML content
    if (!generatedCode || typeof generatedCode !== 'string') {
      throw new Error('Invalid response format from AI model');
    }

    // Clean up any potential whitespace issues
    generatedCode = generatedCode.trim();

    // Ensure the code starts with DOCTYPE and has proper meta tags
    if (!generatedCode.includes('<!DOCTYPE html>')) {
      generatedCode = `<!DOCTYPE html>
<html lang="en">
${generatedCode}`;
    }

    // Add viewport meta tag if missing
    if (!generatedCode.includes('viewport')) {
      generatedCode = generatedCode.replace('<head>', `<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">`);
    }

    return NextResponse.json({ code: generatedCode });
  } catch (error) {
    console.error('Website generation failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate website',
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}