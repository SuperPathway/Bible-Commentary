import { Material } from '@/entities/Material';

const initialMaterials = [
  {
    title: '15 Supernatural Energies',
    category: 'supernatural' as const,
    module_number: 3,
    keywords: ['power', 'glory', 'faith', 'boldness', 'joy', 'identity', 'dominion'],
    content: `A concise catalog of supernatural energies flowing from the glorified Christ:
1. Joy — strengthens the will to obey under pressure.
2. Faith — perceives and partners with Heaven's decree.
3. Boldness — speaks the King's words without fear.
4. Identity — secures sons and daughters in belovedness.
5. Dominion — enforces boundaries under the King's law.
6. Comfort — heals the interior world.
7. Perseverance — finishes assignments through delay.
8. Wisdom — applies revelation precisely.
9. Courage — advances against intimidation.
10. Peace — stills storms and sets order.
11. Hope — reframes suffering with future glory.
12. Love — **agape** self-giving that never fails.
13. Grace — **charis** enabling beyond human power.
14. Power — **dunamis** miracle-working capacity.
15. Presence — Emmanuel nearness that transforms.`,
  },
  {
    title: 'Praying the Supernatural',
    category: 'ministry' as const,
    module_number: 5,
    keywords: ['prayer', 'intercession', 'authority'],
    content: `Prayer posture for supernatural living:
- Exalt Christ: enthrone Jesus as King over this moment.
- Align: welcome the Father's will, surrender competing agendas.
- Ask: petition with Scripture; pray promises as law.
- Agree: declare Heaven's verdict; bind what Heaven forbids; loose what Heaven permits.
- Act: step out with obedience; expect **dunamis** to follow the decree.`,
  },
  {
    title: 'Human Dilemma and Heart Issues',
    category: 'general' as const,
    module_number: 8,
    keywords: ['dilemma', 'heart', 'sanctification'],
    content: `Human Dilemma: fear, shame, accusation, delay, disappointment, bitterness, unbelief.
Heart's Response: repentance, trust, adoration, humility, teachability, gratitude, endurance.`,
  },
  {
    title: 'Connectors to Glory',
    category: 'prophetic' as const,
    module_number: 4,
    keywords: ['glory', 'presence', 'worship'],
    content: `Connectors:
- Worship: yields the throne to the King.
- Word: receives the King's decree.
- Fellowship: Body alignment multiplies grace.
- Mission: obedience routes power into need.
- Generosity: breaks mammon's claim and opens windows of Heaven.`,
  },
  {
    title: 'Theocratical Government of God',
    category: 'authority' as const,
    module_number: 7,
    keywords: ['kingdom', 'law', 'authority'],
    content: `Heaven's Embassy operates by:
- Jurisdiction: know your assigned fields.
- Legality: move within covenant promises.
- Decree: speak only what the King says.
- Order: authority flows under authority.
- Accountability: fruit validates appointment.`,
  },
  {
    title: 'Supernatural Glory Bible Stories',
    category: 'commentary' as const,
    module_number: 1,
    keywords: ['illustration', 'stories', 'acts'],
    content: `Illustrations:
- Acts 2: Outpouring of **dunamis** for witness.
- Mark 5: Woman healed by contact-faith.
- Acts 16: Midnight praise opens prison doors.
- John 21: Restoration and recommissioning of Peter.`,
  },
];

export async function seedInitialMaterials(): Promise<void> {
  try {
    const existing = await Material.list();
    if (existing && existing.length > 0) return;
    for (const m of initialMaterials) {
      await Material.create(m as any);
    }
    // eslint-disable-next-line no-console
    console.info('[seed] Inserted initial ministry materials');
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[seed] Failed to seed materials', e);
  }
}