export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  // 1. Verificação da Chave
  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ 
      error: 'GROQ_API_KEY não configurada no Vercel.',
      suggestion: 'Vá em Project Settings > Environment Variables e adicione a GROQ_API_KEY.'
    });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    const data = await response.json();

    // 2. Se o Groq retornar erro (ex: 401 ou 404), repassar o erro real
    if (!response.ok) {
      console.error("Groq API Error:", data);
      return res.status(response.status).json({ 
        error: 'Erro na API do Groq', 
        details: data.error?.message || 'Erro desconhecido' 
      });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ error: 'Falha na conexão com o servidor', details: error.message });
  }
}
