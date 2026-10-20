const glyphs = {
  arrow: '\ue903',
  down: '\ue900',
  search: '\ue90e',
  close: '\ue907',
  stars: '\ue916',
  star: '\ue914',
  asterisk: '\ue915',
  shape1: '\ue90f',
  shape2: '\ue910',
  shape3: '\ue911',
  shape4: '\ue912',
  shape5: '\ue913',
  solution1: '\ue908',
  solution2: '\ue909',
  solution3: '\ue90a',
  solution4: '\ue90b',
} as const;

export function Icon({ name }: { name: keyof typeof glyphs }) {
  return (
    <span className="site-icon" data-icon={name} aria-hidden="true">
      {glyphs[name]}
    </span>
  );
}
