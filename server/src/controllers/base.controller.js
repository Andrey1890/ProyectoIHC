const { paginateCollection } = require("../middlewares/pagination.middleware");

/**
 * Generador uniforme de Controladores MVC para cualquier entidad respaldada
 * por su Repository Singleton (sin filtrar SQL ni detalles de BD al controlador).
 */
function createCrudController(getRepositoryFn, entityKey = "registro", { rawListForLegacy = false } = {}) {
  async function getAll(req, res, next) {
    try {
      const repo = getRepositoryFn();
      const items = await repo.findAll(req.query || {});
      const isLegacyPath =
        rawListForLegacy &&
        !String(req.originalUrl || "").startsWith("/api/v1") &&
        req.query?.page === undefined &&
        req.query?.limit === undefined;

      if (isLegacyPath) {
        return res.status(200).json(items);
      }
      return res.status(200).json(paginateCollection(items, req.pagination));
    } catch (error) {
      return next(error);
    }
  }

  async function getById(req, res, next) {
    try {
      const repo = getRepositoryFn();
      const item = await repo.findById(req.params.id);
      return res.status(200).json({ ok: true, [entityKey]: item });
    } catch (error) {
      return next(error);
    }
  }

  async function create(req, res, next) {
    try {
      const repo = getRepositoryFn();
      const created = await repo.create(req.body || {});
      return res.status(201).json({ ok: true, [entityKey]: created });
    } catch (error) {
      return next(error);
    }
  }

  async function update(req, res, next) {
    try {
      const repo = getRepositoryFn();
      const updated = await repo.update(req.params.id, req.body || {});
      return res.status(200).json({ ok: true, [entityKey]: updated });
    } catch (error) {
      return next(error);
    }
  }

  async function remove(req, res, next) {
    try {
      const repo = getRepositoryFn();
      const result = await repo.remove(req.params.id, {
        hard: String(req.query?.hard || "").toLowerCase() === "true"
      });
      return res.status(200).json({ ok: true, ...result });
    } catch (error) {
      return next(error);
    }
  }

  return {
    getAll,
    getById,
    create,
    update,
    remove,
    delete: remove,
    listar: getAll,
    obtenerPorId: getById,
    crear: create,
    actualizar: update,
    eliminar: remove
  };
}

module.exports = {
  createCrudController
};
