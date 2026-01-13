// Force redeploy
import { z } from 'zod';
import {
  insertApplicationSchema,
  insertInterviewSchema,
  insertRecruiterSchema,
  insertReminderSchema,
  type Application,
  type Interview,
  type Recruiter,
  type Reminder
} from './schema.js';

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
        200: z.array(z.custom<Application>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/applications/:id',
      responses: {
        200: z.custom<Application>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/applications',
      input: insertApplicationSchema,
      responses: {
        201: z.custom<Application>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/applications/:id',
      input: insertApplicationSchema.partial(),
      responses: {
        200: z.custom<Application>(),
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
        200: z.array(z.custom<Interview>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/interviews',
      input: insertInterviewSchema,
      responses: {
        201: z.custom<Interview>(),
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/interviews/:id',
      input: insertInterviewSchema.partial(),
      responses: {
        200: z.custom<Interview>(),
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
        200: z.array(z.custom<Recruiter>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/recruiters',
      input: insertRecruiterSchema,
      responses: {
        201: z.custom<Recruiter>(),
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/recruiters/:id',
      input: insertRecruiterSchema.partial(),
      responses: {
        200: z.custom<Recruiter>(),
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
        200: z.array(z.custom<Reminder>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/reminders',
      input: insertReminderSchema,
      responses: {
        201: z.custom<Reminder>(),
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/reminders/:id',
      input: insertReminderSchema.partial(),
      responses: {
        200: z.custom<Reminder>(),
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
