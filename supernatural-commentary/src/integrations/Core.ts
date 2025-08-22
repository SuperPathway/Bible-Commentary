export async function InvokeLLM({ prompt, add_context_from_internet }: { prompt: string; add_context_from_internet?: boolean; }): Promise<string> {
  try {
    const key = (window as any)?.ENV?.OPENROUTER_API_KEY || (import.meta as any)?.env?.VITE_OPENROUTER_API_KEY;
    const model = (import.meta as any)?.env?.VITE_OPENROUTER_MODEL || 'openai/gpt-4o-mini';
    if (key) {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: 'You are a biblical scholar and supernatural interpreter. Use the requested tags and formatting.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
        }),
      });
      if (!res.ok) throw new Error(`LLM HTTP ${res.status}`);
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content || '';
      if (text) return text;
    }
  } catch (e) {
    // fall back to mock below
  }

  // Mocked fallback
  const base = `_HEADING_Historical and Literary Context\n- Author: Traditionally attributed to John. Audience: Broad Christian audience. Genre: Gospel narrative.\n\n_HEADING_Verse-by-Verse Biblical Exegesis\n- Example: For God so loved the world — highlights **agape** (unconditional love).\n\n_SUPERNATURAL_SUMMARY_This passage unveils God's **hesed** (steadfast mercy) and calls us into a life empowered by the Spirit.`;

  if (prompt.includes('_HEADING_Four Supernatural Keys')) {
    return `_SUPERNATURAL_SUMMARY_Heaven's love breaks into human frailty with resurrection power.\n\n_HEADING_Four Supernatural Keys from This Scripture\n_STATEMENT_1: God's love dismantles fear\n_STATEMENT_2: The Cross transfers authority\n_STATEMENT_3: The Spirit empowers witness\n_STATEMENT_4: Hope reframes suffering\n\n_HEADING_Supernatural Application Through Ministry Materials\n_STATEMENT_1: God's love dismantles fear\nHuman Struggle: Anxiety and accusation.\nHeart's Response: Yield to **agape** (self-giving love).\nThe Heavenly Shift: Dominion from the King's court.\nDivine Illustration: The woman with the issue of blood.\nSupernatural Support: Joy and Courage energies.\nThe Path to Power: Agreement with the King's decree.\nYour Call to Victory: I will not fear; I am loved.\n_QUOTE_: "Reason births boldness; Benefits follow obedience."\n\n_STATEMENT_2: The Cross transfers authority\nHuman Struggle: Shame and condemnation.\nHeart's Response: Receive **charis** (grace).\nThe Heavenly Shift: Thrones and scepters in Christ.\nDivine Illustration: Peter restored on the shore.\nSupernatural Support: Identity and Dominion energies.\nThe Path to Power: Bind and loose lawfully.\nYour Call to Victory: I rule under Jesus' rule.\n_QUOTE_: "Possible because He reigns; Reaction is worship."\n\n_STATEMENT_3: The Spirit empowers witness\nHuman Struggle: Weakness and timidity.\nHeart's Response: Ask for **dunamis** (power).\nThe Heavenly Shift: Kingdom surge in daily life.\nDivine Illustration: Acts 2 outpouring.\nSupernatural Support: Faith and Boldness energies.\nThe Path to Power: Pray, lay hands, proclaim.\nYour Call to Victory: I am a burning witness.\n_QUOTE_: "Benefits ripple to households and cities."\n\n_STATEMENT_4: Hope reframes suffering\nHuman Struggle: Delay and disappointment.\nHeart's Response: Trust **elpis** (hope).\nThe Heavenly Shift: Glory outweighs affliction.\nDivine Illustration: Paul and Silas singing.\nSupernatural Support: Perseverance and Comfort energies.\nThe Path to Power: Praise before breakthrough.\nYour Call to Victory: I sing in the midnight.\n_QUOTE_: "Reason anchors souls in storms."\n\n_HEADING_A Prophetic Prayer\n_PRAYER_: Father, by Your **agape** I receive fresh **dunamis**. Establish me under Your theocratic rule, align my steps with Heaven's GPS, and release joy, courage, and holy boldness. In Jesus' name, amen.\n\n_HEADING_Three Dynamic Paragraphs of Supernatural Revelation\n_PARAGRAPH_1: Love dismantles fear; fear bows to the King's decree.\n_PARAGRAPH_2: Authority flows from the Cross and roars through saints.\n_PARAGRAPH_3: Hope sings at midnight until chains fall like rain.`;
  }

  return base + `\n\n(Note: Mock mode${add_context_from_internet ? ' with extra context' : ''}.)`;
}

export async function GenerateImage({ prompt }: { prompt: string }): Promise<{ url: string }> {
  const url = `https://picsum.photos/seed/${encodeURIComponent(prompt).slice(0,64)}/600/600`;
  return { url };
}