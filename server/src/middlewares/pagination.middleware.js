const ENV = require("../config/env.config");
const { BaseChainHandler } = require("./error.middleware");

class PaginationChainHandler extends BaseChainHandler {
  process(req, res, next) {
    const maxLimit = ENV.PAGINATION_LIMIT || 100;
    const rawPage = req.query?.page;
    const rawLimit = req.query?.limit;
    const forceRaw = String(req.query?.raw || "").toLowerCase() === "true";

    const page = Math.max(1, Number.parseInt(rawPage || "1", 10) || 1);
    const limit = Math.min(
      maxLimit,
      Math.max(1, Number.parseInt(rawLimit || String(maxLimit), 10) || maxLimit)
    );
    const offset = (page - 1) * limit;

    req.pagination = {
      page,
      limit,
      offset,
      forceRaw
    };

    return this.forward(req, res, next);
  }
}

function paginateCollection(items, pagination, forceRaw = false) {
  if (forceRaw || pagination?.forceRaw) {
    return items;
  }

  const maxLimit = ENV.PAGINATION_LIMIT || 100;
  const page = pagination?.page || 1;
  const limit = pagination?.limit || maxLimit;
  const offset = pagination?.offset ?? (page - 1) * limit;
  const total = items.length;
  const sliced = items.slice(offset, offset + limit);

  return {
    ok: true,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    data: sliced
  };
}

const paginationHandler = new PaginationChainHandler();

module.exports = {
  PaginationChainHandler,
  paginationMiddleware: paginationHandler.toMiddleware(),
  paginateCollection
};
