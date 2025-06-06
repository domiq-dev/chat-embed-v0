export interface Route {
  path: string;
  label: string;
  icon?: string; // We can add icons later if needed
  children?: Route[];
}

export const dashboardRoutes: Route[] = [
  {
    path: '/dashboard/activity',
    label: 'Activity',
  },
  {
    path: '/dashboard/tasks',
    label: 'Tasks',
  },
  {
    path: '/dashboard/calendar',
    label: 'Calendar',
  },
  {
    path: '/dashboard/contacts',
    label: 'Contacts',
  },
  {
    path: '/dashboard/knowledge',
    label: 'Knowledge',
    children: [
      {
        path: '/dashboard/knowledge/base',
        label: 'Knowledge Base',
      },
      {
        path: '/dashboard/knowledge/community',
        label: 'Community Info',
      },
      {
        path: '/dashboard/knowledge/media',
        label: 'Media',
      },
    ],
  },
  {
    path: '/dashboard/specials',
    label: 'Specials',
  },
  {
    path: '/embed/radial-test',
    label: 'Chat Interface',
  },
];
