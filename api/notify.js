export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { summary, fullHistory } = req.body;

  try {
    // 1. Enviar E-mail (FormSubmit)
    await fetch('https://formsubmit.co/ajax/carvalhodlucas@hotmail.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        _subject: "Novo Projeto - Rastro Studio",
        message: fullHistory
      })
    });

    // 2. Enviar WhatsApp (CallMeBot)
    const encodedText = encodeURIComponent(`🚀 *Novo Lead - Rastro Studio*\n\n${summary}`);
    const whatsappUrl = `https://api.callmebot.com/whatsapp.php?phone=+34618097942&text=${encodedText}&apikey=${process.env.CALLMEBOT_API_KEY}`;
    
    // Na função serverless podemos usar fetch normal
    await fetch(whatsappUrl);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Notify Error:", error);
    res.status(500).json({ error: 'Failed to send notifications' });
  }
}
