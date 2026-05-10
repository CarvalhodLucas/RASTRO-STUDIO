async function extractLeadData(fullHistory) {
  if (!process.env.GROQ_API_KEY) return null;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "Você é um extrator de leads profissional. Analise o histórico da conversa e extraia: Nome, E-mail, WhatsApp e um resumo curto do Projeto. Formate a saída exatamente como no exemplo abaixo, usando negrito e emojis:\n\n👤 *Cliente:* [Nome]\n📧 *E-mail:* [Email]\n📱 *WhatsApp:* [WhatsApp]\n📝 *Projeto:* [Resumo]"
          },
          {
            role: "user",
            content: `Histórico da conversa:\n${fullHistory}`
          }
        ],
        temperature: 0.1
      })
    });

    const data = await response.json();
    return data.choices[0]?.message?.content;
  } catch (err) {
    console.error("Extraction error:", err);
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { summary, fullHistory } = req.body;

  try {
    // 1. Enviar E-mail (FormSubmit) - Mantém o histórico completo
    await fetch('https://formsubmit.co/ajax/carvalhodlucas@hotmail.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        _subject: "Novo Projeto - Rastro Studio",
        message: fullHistory
      })
    });

    // 2. Extrair dados estruturados para o WhatsApp
    const structuredSummary = await extractLeadData(fullHistory);
    const finalSummary = structuredSummary || summary; // Fallback para o resumo original se falhar

    // 3. Enviar WhatsApp (CallMeBot)
    const encodedText = encodeURIComponent(`🚀 *Novo Lead - Rastro Studio*\n\n${finalSummary}`);
    const whatsappUrl = `https://api.callmebot.com/whatsapp.php?phone=+34618097942&text=${encodedText}&apikey=${process.env.CALLMEBOT_API_KEY}`;
    
    await fetch(whatsappUrl);

    res.status(200).json({ success: true, extracted: !!structuredSummary });
  } catch (error) {
    console.error("Notify Error:", error);
    res.status(500).json({ error: 'Failed to send notifications' });
  }
}

