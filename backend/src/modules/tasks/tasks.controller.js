const prisma = require('../../config/db');
const { sendSuccess, sendError } = require('../../utils/response');

const buildPagination = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});

const getTasks = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { status, page = 1, limit = 10 } = req.query;

    const where = { userId };
    if (status) where.status = status;

    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.task.count({ where }),
    ]);

    return sendSuccess(res, 200, 'Tasks retrieved successfully.', {
      tasks,
      pagination: buildPagination(page, limit, total),
    });
  } catch (error) {
    next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    const task = await prisma.task.findUnique({ where: { id } });

    if (!task) {
      return sendError(res, 404, 'Task not found.');
    }

    if (task.userId !== userId) {
      return sendError(res, 403, 'You can only view your own tasks.');
    }

    return sendSuccess(res, 200, 'Task retrieved successfully.', { task });
  } catch (error) {
    next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { title, description, status } = req.body;

    const task = await prisma.task.create({
      data: { title, description, status, userId },
    });

    return sendSuccess(res, 201, 'Task created successfully.', { task });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    const { title, description, status } = req.body;

    const task = await prisma.task.findUnique({ where: { id } });

    if (!task) {
      return sendError(res, 404, 'Task not found.');
    }

    if (task.userId !== userId) {
      return sendError(res, 403, 'You can only update your own tasks.');
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
    });

    return sendSuccess(res, 200, 'Task updated successfully.', { task: updatedTask });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const { userId, role } = req.user;
    const { id } = req.params;

    const task = await prisma.task.findUnique({ where: { id } });

    if (!task) {
      return sendError(res, 404, 'Task not found.');
    }

    if (task.userId !== userId && role !== 'ADMIN') {
      return sendError(res, 403, 'You can only delete your own tasks.');
    }

    await prisma.task.delete({ where: { id } });

    return sendSuccess(res, 200, 'Task deleted successfully.');
  } catch (error) {
    next(error);
  }
};

const getAllTasks = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const where = {};
    if (status) where.status = status;

    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, email: true, role: true },
          },
        },
      }),
      prisma.task.count({ where }),
    ]);

    return sendSuccess(res, 200, 'All tasks retrieved successfully.', {
      tasks,
      pagination: buildPagination(page, limit, total),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getAllTasks,
};
