export async function POST(req) {
    try {
        const data = await req.json();
        const agentNumber = "8109088463843";
        
        // Format the message for the agent
        const agentMessage = `
🚨 New Lead Alert!

👤 Contact Info: ${data.contact}

🚗 Vehicle Preferences:
${Object.entries(data.answers)
    .filter(([key]) => key !== 'contact')
    .map(([q, a]) => `• ${q}: ${a}`)
    .join('\n')}

📱 Lead from Website Chat
Time: ${new Date().toLocaleString()}
        `.trim();

        // Create a friendly greeting message for the user
        const userMessage = `
Hello! 👋 Thank you for your interest in our vehicles!

I can see you're looking for:
${Object.entries(data.answers)
    .filter(([key]) => key !== 'contact')
    .map(([q, a]) => `• ${a}`)
    .join('\n')}

I'm here to help you find the perfect vehicle matching your preferences. How can I assist you further? 🚗
        `.trim();

        // URLs for both agent and user
        const agentURL = `https://wa.me/${agentNumber}?text=${encodeURIComponent(agentMessage)}`;
        const userURL = `https://wa.me/${agentNumber}?text=${encodeURIComponent(userMessage)}`;

        return Response.json({ 
            success: true, 
            agentURL,
            userURL,
            message: agentMessage,
            userMessage
        });
    } catch (error) {
        console.error('Error processing lead:', error);
        return Response.json({ 
            success: false, 
            error: 'Failed to process lead' 
        });
    }
} 