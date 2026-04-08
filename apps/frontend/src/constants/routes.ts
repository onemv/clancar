export const routes = {
  home: "/",
  login: "/login",
  dashboard: "/dashboard",
  uiKit: "/ui-kit"
} as const;

export const routeTitles: Record<(typeof routes)[keyof typeof routes], string> = {
  [routes.home]: "Dashboard",
  [routes.login]: "Вход",
  [routes.dashboard]: "Дашборд",
  [routes.uiKit]: "UI Kit"
};
