export type TMetricsSummary = {
  actionsToday: number;
  actionsWeek: number;
  actionsMonth: number;
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
};

export type TTimelineEntry = {
  date: string;
  total: number;
};
