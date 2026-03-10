export type RouteMode = 'chat' | 'image' | 'code' | 'research';

export const isValidMode = (m: string | undefined): m is RouteMode =>
  m === 'chat' || m === 'image' || m === 'code' || m === 'research';

export const modeDisplay = (m: RouteMode) => {
  switch (m) {
    case 'chat':
      return 'Chat';
    case 'image':
      return 'Image';
    case 'code':
      return 'Code';
    case 'research':
      return 'Research';
  }
};

