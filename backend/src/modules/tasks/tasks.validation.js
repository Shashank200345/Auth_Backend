const { z } = require('zod');

const createTaskSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .min(1, 'Title cannot be empty')
    .max(255, 'Title must be under 255 characters')
    .trim(),
  description: z
    .string()
    .max(1000, 'Description must be under 1000 characters')
    .trim()
    .optional()
    .nullable(),
  status: z
    .enum(['TODO', 'IN_PROGRESS', 'DONE'], {
      invalid_type_error: 'Status must be TODO, IN_PROGRESS, or DONE',
    })
    .optional(),
});

const updateTaskSchema = z
  .object({
    title: z
      .string()
      .min(1, 'Title cannot be empty')
      .max(255, 'Title must be under 255 characters')
      .trim()
      .optional(),
    description: z
      .string()
      .max(1000, 'Description must be under 1000 characters')
      .trim()
      .optional()
      .nullable(),
    status: z
      .enum(['TODO', 'IN_PROGRESS', 'DONE'], {
        invalid_type_error: 'Status must be TODO, IN_PROGRESS, or DONE',
      })
      .optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided for update.' }
  );

const taskQuerySchema = z.object({
  status: z
    .enum(['TODO', 'IN_PROGRESS', 'DONE'])
    .optional(),
  page: z
    .string()
    .regex(/^\d+$/, 'Page must be a positive number')
    .transform(Number)
    .optional()
    .default('1'),
  limit: z
    .string()
    .regex(/^\d+$/, 'Limit must be a positive number')
    .transform(Number)
    .optional()
    .default('10'),
});

module.exports = { createTaskSchema, updateTaskSchema, taskQuerySchema };
