export * from './types/database';

import type { Database } from './types/database';

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// Domain Models
export type Task = Tables<'tasks'>;
export type List = Tables<'lists'>;
export type Status = Tables<'statuses'>;
export type PersonalAccessToken = Tables<'personal_access_tokens'>;
export type PushSubscription = Tables<'push_subscriptions'>;

export type StatusCategory = Enums<'status_category'>;
