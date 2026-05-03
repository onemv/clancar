export const routes = {
  home: "/",
  login: "/login",
  dashboard: "/dashboard",
  carsMy: "/cars/my",
  carsAdd: "/cars/add",
  buyout: "/buyout",
  uiKit: "/ui-kit"
} as const;

export const routeTitles: Record<(typeof routes)[keyof typeof routes], string> = {
  [routes.home]: "Dashboard",
  [routes.login]: "Вход",
  [routes.dashboard]: "Дашборд",
  [routes.carsMy]: "Мои автомобили",
  [routes.carsAdd]: "Добавть автомобиль",
  [routes.buyout]: "Выкуп",
  [routes.uiKit]: "UI Kit"
};
