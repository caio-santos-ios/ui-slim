export type TMetricsSummary = {
  actionsToday: number;
  actionsMonth: number;
  actions: number;
  uniqueUsersMonth: number;
};

export type TTopUser = {
  userId: string;
  userName: string;
  userEmail: string;
  total: number;
};

export type TTopFeature = {
  feature: string;
  action: string;
  total: number;
  function: string;
  screen: string;
};

export type TTimelineEntry = {
  date: string;
  total: number;
};
