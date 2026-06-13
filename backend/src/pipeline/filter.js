// Multilingual keywords — at least one must appear in the article title
const SHARK_KEYWORDS = [
  // English
  'shark', 'attack', 'bite', 'bitten', 'surfer', 'swimmer', 'diver', 'snorkeler',
  // Spanish
  'tiburón', 'tiburon', 'ataque', 'mordida', 'mordedura', 'surfista', 'nadador',
  // French
  'requin', 'attaque', 'morsure', 'surfeur', 'nageur',
  // Portuguese
  'tubarão', 'tubarao', 'mordida',
  // German
  'hai', 'angriff', 'biss', 'schwimmer',
  // Italian
  'squalo', 'attacco', 'morso', 'nuotatore',
  // Dutch
  'haai', 'aanval',
  // Indonesian / Malay
  'hiu', 'serangan', 'gigitan',
  // Japanese
  'サメ', '鮫',
  // Arabic
  'قرش',
];

// Domain fragments that signal non-news content
const EXCLUDED_DOMAIN_PATTERNS = [
  'finance.', 'stock.', 'market.', 'invest.', 'trading.',
  'sport.', 'sports.', 'football', 'soccer', 'baseball', 'basketball', 'nfl.', 'nba.',
  'entertainment.', 'celebrity', 'gossip', 'tmz',
  'gaming.', 'games.', 'esport',
];

function titlePassesKeywordFilter(title) {
  if (!title) return false;
  const lower = title.toLowerCase();
  return SHARK_KEYWORDS.some(kw => lower.includes(kw.toLowerCase()));
}

function domainPassesFilter(domain) {
  if (!domain) return true;
  const lower = domain.toLowerCase();
  return !EXCLUDED_DOMAIN_PATTERNS.some(p => lower.includes(p));
}

function applyStage1Filter(articles) {
  const passed = articles.filter(a => {
    if (!titlePassesKeywordFilter(a.title)) return false;
    if (!domainPassesFilter(a.domain)) return false;
    return true;
  });

  console.log(`[Stage 1] ${passed.length}/${articles.length} passed keyword + domain filter`);
  return passed;
}

module.exports = { applyStage1Filter };
