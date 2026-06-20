const teamColors = {
  // Host nations
  'United States': '#3C3B6E',
  'Mexico': '#006847',
  'Canada': '#FF0000',
  // Asia (AFC)
  'Japan': '#BC002D',
  'Iran': '#239F40',
  'South Korea': '#CD2E3A',
  'Australia': '#00008B',
  'Saudi Arabia': '#006C35',
  'Qatar': '#8D1B3D',
  'Uzbekistan': '#1EB53A',
  'Jordan': '#CE1126',
  'Iraq': '#CE1126',
  // South America (CONMEBOL)
  'Argentina': '#75AADB',
  'Brazil': '#FFDF00',
  'Uruguay': '#75AADB',
  'Colombia': '#FCD116',
  'Ecuador': '#FFD100',
  'Paraguay': '#D52B1E',
  // Oceania
  'New Zealand': '#000000',
  // Africa (CAF)
  'Morocco': '#C1272D',
  'Senegal': '#00853F',
  'Egypt': '#CE1126',
  'Algeria': '#006233',
  'Tunisia': '#E70013',
  'South Africa': '#007A4D',
  'Ivory Coast': '#FF8200',
  'Ghana': '#CE1126',
  'Cape Verde Islands': '#003893',
  'Congo DR': '#007FFF',
  // Europe (UEFA)
  'England': '#CE1124',
  'France': '#0055A4',
  'Spain': '#AA151B',
  'Germany': '#000000',
  'Portugal': '#006600',
  'Netherlands': '#AE1C28',
  'Belgium': '#FDDA24',
  'Croatia': '#FF0000',
  'Switzerland': '#FF0000',
  'Austria': '#ED2939',
  'Scotland': '#005EB8',
  'Norway': '#BA0C2F',
  'Bosnia-Herzegovina': '#002395',
  'Sweden': '#006AA7',
  'Turkey': '#E30A17',
  'Czechia': '#11457E',
  // CONCACAF
  'Panama': '#DA121A',
  'Curaçao': '#002B7F',
  'Haiti': '#00209F'
};

export function getTeamColor(teamName) {
  return teamColors[teamName] || '#888888';
}

export default teamColors;