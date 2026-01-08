import { z } from 'zod';
import { 
  insertApplicationSchema, 
  insertInterviewSchema, 
  insertRecruiterSchema, 
  insertReminderSchema,
  applications,
  interviews,
  recruiters,
  reminders
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  applications: {
    list: {
      method: 'GET' as const,
      path: '/api/applications',
      responses: {
        200: z.array(z.custom<typeof applications.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/applications/:id',
      responses: {
        200: z.custom<typeof applications.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/applications',
      input: insertApplicationSchema,
      responses: {
        201: z.custom<typeof applications.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/applications/:id',
      input: insertApplicationSchema.partial(),
      responses: {
        200: z.custom<typeof applications.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/applications/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  interviews: {
    list: {
      method: 'GET' as const,
      path: '/api/interviews', // Can filter by applicationId
      responses: {
        200: z.array(z.custom<typeof interviews.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/interviews',
      input: insertInterviewSchema,
      responses: {
        201: z.custom<typeof interviews.$inferSelect>(),
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/interviews/:id',
      input: insertInterviewSchema.partial(),
      responses: {
        200: z.custom<typeof interviews.$inferSelect>(),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/interviews/:id',
      responses: {
        204: z.void(),
      },
    },
  },
  recruiters: {
    list: {
      method: 'GET' as const,
      path: '/api/recruiters',
      responses: {
        200: z.array(z.custom<typeof recruiters.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/recruiters',
      input: insertRecruiterSchema,
      responses: {
        201: z.custom<typeof recruiters.$inferSelect>(),
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/recruiters/:id',
      input: insertRecruiterSchema.partial(),
      responses: {
        200: z.custom<typeof recruiters.$inferSelect>(),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/recruiters/:id',
      responses: {
        204: z.void(),
      },
    },
  },
  reminders: {
    list: {
      method: 'GET' as const,
      path: '/api/reminders',
      responses: {
        200: z.array(z.custom<typeof reminders.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/reminders',
      input: insertReminderSchema,
      responses: {
        201: z.custom<typeof reminders.$inferSelect>(),
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/reminders/:id',
      input: insertReminderSchema.partial(),
      responses: {
        200: z.custom<typeof reminders.$inferSelect>(),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/reminders/:id',
      responses: {
        204: z.void(),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
