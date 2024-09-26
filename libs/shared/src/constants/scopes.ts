export const Scopes = {
  ROLE: {
    READ: 'read:role',
    CREATE: 'create:role',
    WRITE: 'write:role',
    DELETE: 'delete:role',
  },
  TRANSLATION_KEY: {
    READ: 'read:translation_key',
    CREATE: 'create:translation_key',
    WRITE: 'write:translation_key',
    DELETE: 'delete:translation_key',
  },
  TRANSLATIONS: {
    READ: 'read:translation',
    CREATE: 'create:translation',
    WRITE: 'write:translation',
    DELETE: 'delete:translation',
  },
  TICKET: {
    READ: 'read:ticket',
    CREATE: 'create:ticket',
    WRITE: 'write:ticket',
  },
  COMPLAINT: {
    READ: 'read:complaint',
    CREATE: 'create:complaint',
  },
  TOOL: {
    READ: 'read:tool',
    CREATE: 'create:tool',
    WRITE: 'write:tool',
  },
  GIVE_TOOL: {
    CREATE: 'create:give_tool',
  },
  TAKE_TOOL: {
    CREATE: 'create:take_tool',
  },
  PROFILE: {
    WRITE: 'write:profile',
  },
  SERVICE_TYPE: {
    READ: 'read:service_type',
    CREATE: 'create:service_type',
    WRITE: 'write:service_type',
    DELETE: 'delete:service_type',
  },
  BRANCH: {
    READ: 'read:branch',
    CREATE: 'create:branch',
    WRITE: 'write:branch',
    DELETE: 'delete:branch',
  },
  VEHICLE: {
    READ: 'read:vehicle',
    CREATE: 'create:vehicle',
    WRITE: 'write:vehicle',
    DELETE: 'delete:vehicle',
  },
  CONTRACT: {
    READ: 'read:contract',
    CREATE: 'create:contract',
    WRITE: 'write:contract',
    DELETE: 'delete:contract',
  },
  LABORER: {
    READ: 'read:laborer',
    CREATE: 'create:laborer',
    WRITE: 'write:laborer',
    DELETE: 'delete:laborer',
  },
  ACTIVITY: {
    READ: 'read:activitY',
  },
  EMPLOYEE: {
    READ: 'read:employee',
    CREATE: 'create:employee',
    WRITE: 'write:employee',
    DELETE: 'delete:employee',
  },
  CLIENT: {
    READ: 'read:client',
  },
  KANBAN: {
    READ: 'read:kanban',
  },
  CALENDAR: {
    READ: 'read:calendar',
  },
  BUDGET_DASHBOARD: {
    READ: 'read:budget_dashboard',
  },
  BUDGET_DETAIL: {
    READ: 'read:budget_detail',
  },
  TICKET_COUNT_STATISTIC: {
    READ: 'read:ticket_count_statistic',
  },
  WAREHOUSE_COUNT_STATISTIC: {
    READ: 'read:warehouse_count_statistic',
  },
  WAREHOUSE_DASHBOARD: {
    READ: 'read:budget_dashboard',
  },
  DEPOSIT: {
    READ: 'read:deposit',
    CREATE: 'create:deposit',
    WRITE: 'write:deposit',
    DELETE: 'delete:deposit',
  },
  ATTENDANCE: {
    READ: 'read:attendance',
  },
  NOTE: {
    READ: 'read:note',
    CREATE: 'create:note',
  },
  EXPENSE: {
    READ: 'read:expense',
    CREATE: 'create:expense',
  },
  VEHICLE_FUEL: {
    CREATE: 'create:vehicle_fuel',
  },
  TICKET_EMPLOYEE: {
    CREATE: 'create:ticket_employee',
    READ: 'read:ticket_employee',
    WRITE: 'write:ticket_employee',
    DELETE: 'delete:ticket_employee',
  },
  TICKET_SERVICE: {
    CREATE: 'create:ticket_service',
    READ: 'read:ticket_service',
    WRITE: 'write:ticket_service',
    DELETE: 'delete:ticket_service',
  },
  DEVICE: {
    READ: 'read:device',
    DELETE: 'delete:device',
  },
  SETTING: {
    READ: 'read:setting',
    WRITE: 'write:setting',
  },
} as const;
