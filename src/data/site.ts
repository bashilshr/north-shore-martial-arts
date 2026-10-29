// All site content lives here. Copy comes from the v2 design / current club site.

export const CLUB_NAME = 'North Shore Mixed Martial Arts Club';
export const CLUB_SHORT = 'NSMMAC';
export const PHONE = '(02) 8969 6703';
export const PHONE_HREF = 'tel:0289696703';
export const ADDRESS = ['2/257 Military Rd', 'Cremorne NSW 2090'];
export const FACEBOOK = 'https://www.facebook.com/northshoremartialartsclub';

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** [dayIndex, time, note] */
export type RawSession = [number, string, string];

export interface Session {
  day: string;
  dayLong: string;
  time: string;
  note: string;
  cls: string;
  when: string;
}

export interface Level {
  key?: string;
  kicker: string;
  name: string;
  ages: string;
  text: string;
  points: string[];
  footnote: string;
  sessions: RawSession[];
}

export const KIDS: Level[] = [
  { key: 'minicubs', kicker: 'Kids program', name: 'Mini Cubs', ages: '3–4 yrs', text: 'Introduces 3–4 year olds to the foundations of martial arts through play.', points: ['Fun martial arts activities', 'Games', 'Coordination circuits'], footnote: 'Children start on the white belt of the introductory grading system and advance into Cubs.', sessions: [[1, '9.45–10.15am', ''], [2, '10.30–11.00am', '']] },
  { key: 'cubs', kicker: 'Kids program', name: 'Cubs', ages: '4–6 yrs', text: 'Foundation skills and the fun of martial arts, in 40-minute classes once or twice a week.', points: ['Kicks, hops, stretches and punches for coordination', 'Games that build teamwork and listening', 'An introduction to martial arts patterns'], footnote: 'A junior grading system of colourful belts encourages a positive attitude and steady progress.', sessions: [[4, '11.00–11.40am', ''], [5, '11.00–11.40am', '']] },
  { key: 'junior', kicker: 'Kids program', name: 'Junior Tigers', ages: '6–9 yrs', text: 'Builds confidence, resilience, friendships and team spirit through kicks, punches, jumps and more complex patterns.', points: ['Confidence and resilience', 'Friendships and team spirit', 'Coloured-belt grading to set goals'], footnote: '40 minutes, once or twice a week. Beginner and advanced streams.', sessions: [[0, '3.40–4.20pm', 'Beginners'], [0, '4.30–5.10pm', ''], [0, '5.15–5.55pm', 'Advanced'], [1, '3.40–4.20pm', 'Beginners'], [1, '4.30–5.10pm', 'Advanced'], [2, '3.40–4.20pm', 'Advanced'], [2, '4.30–5.10pm', 'Beginners'], [2, '5.15–5.55pm', 'Advanced'], [3, '3.40–4.20pm', ''], [4, '3.40–4.20pm', ''], [4, '4.30–5.10pm', ''], [5, '11.45am–12.25pm', ''], [6, '9.00–9.40am', '']] },
  { key: 'senior', kicker: 'Kids program', name: 'Senior Tigers', ages: '9–13 yrs', text: 'Structured classes that develop real technique and, with it, self-esteem and resilience.', points: ['Kicking techniques', 'Focus-pad drills', 'Martial arts patterns'], footnote: 'Continues the coloured-belt grading from Junior Tigers. 40 minutes, once or twice a week.', sessions: [[3, '4.30–5.10pm', 'Beginners']] },
];

export const TEENS = { name: 'Teens Boxing / Kickboxing', sessions: [[3, '6.00–6.40pm', 'Kickboxing'], [6, '10.00–10.40am', 'Advanced MMA'], [6, '10.50–11.30am', 'Beginners MMA']] as RawSession[] };

export interface Program {
  id: string;
  slug: string;
  num: string;
  name: string;
  title: string;
  ages: string;
  blurb: string;
  intro: string;
  img: string;
  imgLabel: string;
  hero: string;
  heroLabel: string;
  g1: string;
  g2: string;
  description: string;
  levels?: Level[];
  level?: Level;
}

export const PROGRAMS: Program[] = [
  { id: 'kids', slug: 'kids-martial-arts', num: '001', name: 'Kids Martial Arts', title: 'Kids Martial Arts', ages: 'Ages 3–13', blurb: 'Four age-graded programs teaching courage, respect, integrity and loyalty.', intro: 'Structured yet fun. Four programs tailored from 3 to 13 years, each with its own belt grading so every child has a next goal in reach.', img: 'childrens-martialarts-1.jpg', imgLabel: 'Kids class at North Shore Mixed Martial Arts Club', hero: 'kids-martial-arts-lined-up-016.jpg', heroLabel: 'Kids lined up in uniform', g1: 'girls-kicking-high-029.jpg', g2: 'kids-group-204.jpg', description: 'Kids martial arts in Cremorne for ages 3–13: Mini Cubs, Cubs, Junior Tigers and Senior Tigers, with coloured-belt grading.', levels: KIDS },
  { id: 'kickboxing', slug: 'kickboxing', num: '002', name: 'Kickboxing', title: 'Adults Kickboxing', ages: 'Adults & teens 13+', blurb: 'Boxing drills and martial arts kicking in one high-intensity workout.', intro: 'Kick your way to fitness. Focus-pad punching for speed, Muay Thai pad kicking for power, combat drills for stamina. For every shape, size and fitness level.', img: 'kickboxing273-500.jpg', imgLabel: 'Kickboxing pad work', hero: 'kickboxing271-500.jpg', heroLabel: 'Kickboxing session', g1: 'kickboxing270-500.jpg', g2: 'kickboxing260-500.jpg', description: 'Adults and teens kickboxing in Cremorne. Focus pads, Muay Thai kicking and conditioning for every fitness level.', level: { kicker: 'What to expect', ages: '40 min', name: 'Pads, kicks, conditioning', text: 'A single high-intensity session combining kickboxing drills with martial arts kicking technique.', points: ['Focus-pad punching for speed and coordination', 'Kicking on Muay Thai pads for strength and power', 'Fitness combat drills for stamina and endurance'], footnote: 'No experience needed. Sessions by appointment; teens train Thursday evenings.', sessions: [[3, '6.00–6.40pm', 'Teens kickboxing']] } },
  { id: 'boxing', slug: 'boxing', num: '003', name: 'Boxing', title: 'Adults Boxing', ages: 'Adults & teens 13+', blurb: 'Fast-paced fundamentals for strength, stamina and coordination.', intro: "You don't need to be a fighter to learn boxing. Gloves on, focus pads up. Fundamentals, conditioning and technique that will come in handy in everyday life.", img: 'boxing-4-1.jpg', imgLabel: 'Boxing bag work', hero: 'boxing-3-1.jpg', heroLabel: 'Boxing session', g1: 'boxing-2-1.jpg', g2: 'boxing-1-1.jpg', description: 'Beginner-friendly adults boxing in Cremorne: fundamentals, conditioning and technique.', level: { kicker: 'What to expect', ages: 'All levels', name: 'Time to pack a punch', text: 'Jump rope, stretching, defence and evasion, circuit work and high-intensity intervals, all built on boxing technique.', points: ['Strength', 'Stamina', 'Coordination'], footnote: "Beginner-friendly. Sparring is optional and only with the coach's sign-off.", sessions: [] } },
  { id: 'selfdefence', slug: 'self-defence', num: '004', name: 'Self Defence', title: 'Self Defence', ages: 'Adults & teens', blurb: 'Urban defensive tactics drawn from Taekwondo, Hapkido, MMA and Krav Maga.', intro: 'Practical, effective and easy to learn. Techniques to get out of dangerous situations, and the awareness to avoid them in the first place.', img: 'self-defence-3-1.jpg', imgLabel: 'Self defence drill', hero: 'self-defence-2-1.jpg', heroLabel: 'Self defence drill', g1: 'self-defence-1-1.jpg', g2: 'self-defence-5.jpg', description: 'Practical self defence classes in Cremorne for men and women, drawn from Taekwondo, Hapkido, MMA and Krav Maga.', level: { kicker: 'What to expect', ages: 'Men & women', name: 'Urban defensive tactics', text: 'Instructors combine martial arts experience with a knowledge of law enforcement to give you the upper hand before a situation escalates.', points: ['Awareness and personal-security habits', 'Escapes from grabs and holds', 'Surprise-and-get-away techniques'], footnote: 'Safe, controlled, user-friendly environment. By appointment.', sessions: [] } },
  { id: 'pt', slug: 'personal-training', num: '005', name: 'Personal Training', title: 'Personal Training', ages: 'Adults · 1-on-1', blurb: 'Private sessions with Master Tran, built around your goals.', intro: 'Strength, conditioning and martial arts technique in private sessions, the fastest way to improve.', img: 'kickboxing260-500.jpg', imgLabel: 'One-on-one training', hero: 'boxing-1-1.jpg', heroLabel: 'Personal training', g1: 'kickboxing271-500.jpg', g2: 'master-tran-being-awarded-hall-of-fame-4.jpg', description: 'One-on-one personal training with Master Steven Tran in Cremorne: strength, conditioning and martial arts technique.', level: { kicker: 'What to expect', ages: 'By appointment', name: 'Built around you', text: 'A first session to assess goals and fitness, then a program that mixes disciplines to strengthen and condition.', points: ['Goal-based programming', 'Mixed-discipline conditioning', 'Technique correction'], footnote: 'Times arranged around your week.', sessions: [] } },
];

export const programHref = (p: Program) => `/${p.slug}/`;
export const img = (file: string) => `/images/${file}`;

export function sessions(name: string, raw: RawSession[]): Session[] {
  return raw.map(([d, time, note]) => ({
    day: SHORT[d],
    dayLong: DAYS[d],
    time,
    note,
    cls: name,
    when: `${DAYS[d]} ${time}${note ? ' · ' + note : ''}`,
  }));
}

export const NAV = [
  { label: 'Kids Classes', href: '/kids-martial-arts/' },
  { label: 'Kickboxing', href: '/kickboxing/' },
  { label: 'Boxing', href: '/boxing/' },
  { label: 'Self Defence', href: '/self-defence/' },
  { label: 'Timetable', href: '/timetable/' },
];

export const VALUES = [
  { num: '01', name: 'Courage', accent: false },
  { num: '02', name: 'Respect', accent: true },
  { num: '03', name: 'Integrity', accent: false },
  { num: '04', name: 'Loyalty', accent: true },
];

export const STATS = [
  { label: 'Hall of Fame inductions', detail: 'Australasian Martial Arts & World Karate Union, 2019, for lifetime achievement.', value: '2' },
  { label: 'Kids programs', detail: 'Mini Cubs, Cubs, Junior Tigers, Senior Tigers, ages 3 to 13.', value: '4' },
  { label: 'Classes a week', detail: 'Across seven days, mornings to evenings, beginner and advanced streams.', value: '20' },
  { label: 'Affiliations', detail: 'National and world bodies across Taekwondo, boxing, kickboxing and jujitsu.', value: '20' },
];

export const STEPS = [
  { num: '001', title: 'Try it free', text: 'Book any session on the timetable. No commitment. Just come in, train, and see how it feels.' },
  { num: '002', title: 'Find your level', text: 'Kids are placed by age and ability; adults by goal. Beginner and advanced streams keep everyone challenged.' },
  { num: '003', title: 'Grade up', text: 'Coloured belts give kids a next goal in reach. Adults progress through pads, drills and conditioning.' },
  { num: '004', title: 'Keep showing up', text: 'Once or twice a week, term after term. Loyalty is one of our four values for a reason.' },
];

export const QUOTES = [
  { name: 'Nicole', role: 'Parent', text: "The studio is big, bright and clean and Steven is outstanding with the kids. My kids have so much fun every week, they don't even realise they're taking on board lifelong skills." },
  { name: 'Anna', role: 'Parent', text: "Friendly, respectful and firm at the same time. They adore him. Her fitness and coordination have visibly improved. That's what you want." },
  { name: 'Rob', role: 'Adult student', text: 'A true master of mixed martial arts. He incorporates various disciplines to help you strengthen and condition, and never hesitates to push you beyond your comfort zone.' },
];

export const AFFILIATIONS = [
  { name: 'World Karate Union', file: 'world-karate-union-logo.jpg' },
  { name: 'AIS', file: 'ais-logo.jpg' },
  { name: 'Australian Taekwondo', file: 'Australian_Taekwondo.jpg' },
  { name: 'Play by the Rules', file: 'play-by-the-rules-opt.jpg' },
  { name: 'IMMAFA', file: 'immafa.png' },
  { name: 'Australasian Martial Arts Hall of Fame', file: 'ama-hof-logo.jpg' },
  { name: 'Boxing Australia', file: 'boxing-australia.png' },
  { name: 'Martial Arts Australia', file: 'ma-australia.png' },
  { name: 'Australian Sports Commission', file: 'austr-sport-commission.png' },
  { name: 'Master Toddy', file: 'master-toddy.jpg' },
  { name: 'Australian Jujitsu', file: 'australian-jujitsu-logo.png' },
  { name: 'World Taekwondo', file: 'mosman-affiliates-world-taekwondo.jpg' },
  { name: 'MTIA', file: 'mtia.jpg' },
  { name: 'NSW Combat Sports', file: 'nsw-combat-logo.png' },
  { name: 'Team Norton', file: 'team-norton.jpg' },
  { name: 'MAIA', file: 'maia-1.png' },
  { name: 'Active Kids', file: 'active-kids-logo.png' },
  { name: 'Daehanminguk Hapkido', file: 'mosman-affiliates-daehanminguk-hapkido.jpg' },
  { name: 'World Karate', file: 'world-karate.png' },
  { name: 'World Kickboxing', file: 'world-kickboxing.png' },
];
