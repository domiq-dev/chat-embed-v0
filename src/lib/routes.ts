export interface Route {
  path: string;
  label: string;
  icon?: string; // We can add icons later if needed
  children?: Route[];
}

export const dashboardRoutes: Route[] = [
  {
    path: '/activity',
    label: 'Activity',
  },
  {
    path: '/tasks',
    label: 'Tasks',
  },
  {
    path: '/calendar',
    label: 'Calendar',
  },
  {
    path: '/contacts',
    label: 'Contacts',
  },
  {
    path: '/knowledge',
    label: 'Knowledge',
    children: [
      {
        path: '/knowledge/base',
        label: 'Knowledge Base',
      },
      {
        path: '/knowledge/community',
        label: 'Community Info',
      },
      {
        path: '/knowledge/media',
        label: 'Media',
      },
    ],
  },
  {
    path: '/specials',
    label: 'Specials',
  },
  {
    path: '/agent',
    label: 'Chat Interface',
  },
];
