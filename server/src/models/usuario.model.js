const { getSupabaseSingleton } = require("../config/supabase.singleton");
const { HttpAppError } = require("../middlewares/error.middleware");
const { hashPasswordBcrypt } = require("../middlewares/hash.middleware");
const { BaseTableRepository } = require("./base.repository");

const SINGLETON_TOKEN = Symbol("UsuarioRepository");
const USUARIO_COLUMNS = [
  "id_usuario",
  "id_rol",
  "usu_nombre",
  "usu_email",
  "usu_clave_hash",
  "usu_estado"
];

function resolveAppRole(idRol, rolNombre) {
  const rolId = String(idRol || "").trim().toUpperCase();
  const rolName = String(rolNombre || "").trim().toUpperCase();
  if (rolId === "ROL0000001" || rolName === "ADMIN") {
    return "admin";
  }
  return "user";
}

class UsuarioModel {
  constructor(props = {}) {
    this.id_cliente = String(props.id_cliente || "").trim();
    this.id_usuario = String(props.id_usuario || "").trim();
    this.id = this.id_usuario || this.id_cliente || "";
    this.id_rol = String(props.id_rol || "ROL0000003").trim();
    this.role = props.role
      ? (String(props.role).trim().toLowerCase() === "admin" ? "admin" : "user")
      : resolveAppRole(this.id_rol, props.rol_nombre);
    this.nombre = String(props.nombre || props.username || "").trim();
    this.username = String(props.username || this.nombre || "").trim();
    this.cedulaRuc = String(props.cedulaRuc || "").trim();
    this.correo = String(props.correo || props.email || "").trim().toLowerCase();
    this.email = this.correo;
    this.telefono = String(props.telefono || "0990000000").trim();
    this.direccion = String(props.direccion || "Quito, Ecuador").trim();
    this.ciudad = String(props.ciudad || "Quito").trim();
    this.provincia = String(props.provincia || "Pichincha").trim();
    this.codigoPostal = String(props.codigoPostal || "170101").trim();
  }

  toDTO() {
    return {
      id: this.id,
      id_usuario: this.id_usuario,
      id_cliente: this.id_cliente,
      id_rol: this.id_rol,
      role: this.role,
      username: this.username,
      nombre: this.nombre,
      email: this.email,
      correo: this.correo,
      cedulaRuc: this.cedulaRuc,
      telefono: this.telefono,
      direccion: this.direccion,
      ciudad: this.ciudad,
      provincia: this.provincia,
      codigoPostal: this.codigoPostal
    };
  }
}

class UsuarioFactory {
  static createFromDbRow(row = {}) {
    const nombres = String(row.cli_nombres || "").trim();
    const apellidos = String(row.cli_apellidos || "").trim();
    const fullName = `${nombres} ${apellidos}`.trim() || String(row.usu_nombre || "").trim();
    const idRol = String(row.id_rol || "ROL0000003").trim();
    const rolNombre = String(row.rol_nombre || row.Roles?.rol_nombre || "").trim();

    return new UsuarioModel({
      id_cliente: row.id_cliente,
      id_usuario: row.id_usuario,
      id_rol: idRol,
      rol_nombre: rolNombre,
      role: resolveAppRole(idRol, rolNombre),
      nombre: fullName,
      username: String(row.usu_nombre || fullName).trim(),
      cedulaRuc: row.cli_ci_ruc,
      correo: row.usu_email,
      telefono: row.cli_telefono,
      direccion: row.cli_direccion,
      ciudad: row.ciu_nombre || "Quito",
      provincia: "Pichincha",
      codigoPostal: "170101"
    });
  }

  static splitFullName(fullName) {
    const parts = String(fullName || "Cliente Dermakor").trim().split(/\s+/);
    const cli_nombres = parts[0] || "Cliente";
    const cli_apellidos = parts.slice(1).join(" ") || "Dermakor";
    return { cli_nombres, cli_apellidos };
  }
}

/**
 * Patron Singleton + Repository con Prisma ORM para autenticacion,
 * registro y CRUD de usuarios (sin SQL crudo).
 */
class UsuarioRepository {
  static #instance = null;
  #db;
  #tableRepo;

  constructor(token) {
    if (token !== SINGLETON_TOKEN) {
      throw new Error("Use UsuarioRepository.getInstance().");
    }
    this.#db = getSupabaseSingleton();
    this.#tableRepo = new BaseTableRepository({
      tableName: "Usuarios",
      pkColumns: ["id_usuario"],
      prefix: "USU",
      statusColumn: "usu_estado",
      hiddenFields: ["usu_clave_hash"],
      columns: USUARIO_COLUMNS,
      defaultOrder: "id_usuario"
    });
  }

  static getInstance() {
    if (!UsuarioRepository.#instance) {
      UsuarioRepository.#instance = new UsuarioRepository(SINGLETON_TOKEN);
    }
    return UsuarioRepository.#instance;
  }

  findAll(filters = {}) {
    return this.#tableRepo.findAll(filters);
  }

  findById(id) {
    return this.#tableRepo.findById(id);
  }

  create(payload = {}) {
    return this.#tableRepo.create({
      id_rol: "ROL0000003",
      usu_estado: "ACTIVO",
      ...payload
    });
  }

  update(id, patch = {}) {
    return this.#tableRepo.update(id, patch);
  }

  remove(id, opts = {}) {
    return this.#tableRepo.remove(id, opts);
  }

  async findByEmail(correo) {
    const prisma = this.#db.getPrisma();
    const users = await prisma.usuarios.findMany({
      include: {
        Roles: true,
        Clientes: {
          include: {
            Ciudades: true
          }
        }
      }
    });

    const targetEmail = String(correo || "").trim().toLowerCase();
    const u = (Array.isArray(users) ? users : []).find(
      (item) =>
        String(item.usu_email || "").trim().toLowerCase() === targetEmail &&
        String(item.usu_estado || "").trim() === "ACTIVO"
    );

    if (!u) {
      return null;
    }

    const cli = Array.isArray(u.Clientes) ? u.Clientes[0] : u.Clientes;
    const flatRow = {
      id_usuario: u.id_usuario,
      id_rol: String(u.id_rol || "ROL0000003").trim(),
      rol_nombre: String(u.Roles?.rol_nombre || "").trim(),
      usu_nombre: u.usu_nombre,
      usu_email: u.usu_email,
      usu_clave_hash: u.usu_clave_hash,
      id_cliente: cli?.id_cliente || "",
      cli_ci_ruc: cli?.cli_ci_ruc || "",
      cli_nombres: cli?.cli_nombres || "",
      cli_apellidos: cli?.cli_apellidos || "",
      cli_telefono: cli?.cli_telefono || "",
      cli_direccion: cli?.cli_direccion || "",
      ciu_nombre: cli?.Ciudades?.ciu_nombre || "Quito"
    };

    return {
      model: UsuarioFactory.createFromDbRow(flatRow),
      claveHash: String(u.usu_clave_hash || "").trim()
    };
  }

  async authenticate(correo, clave, verifyPasswordFn) {
    const found = await this.findByEmail(correo);
    if (!found) {
      throw new HttpAppError(401, "Credenciales incorrectas: usuario no encontrado.", "AUTH_USER_NOT_FOUND");
    }
    if (!verifyPasswordFn(clave, found.claveHash)) {
      throw new HttpAppError(401, "Contrasena incorrecta.", "AUTH_INVALID_PASSWORD");
    }
    return found.model.toDTO();
  }

  async registerOrUpsert(payload = {}, claveHash = "") {
    const effectiveNombre = String(payload.nombre || payload.username || "Cliente Dermakor").trim();
    const { cli_nombres, cli_apellidos } = UsuarioFactory.splitFullName(effectiveNombre);
    const telefono = String(payload.telefono || "0990000000").slice(0, 15);
    const direccion = String(payload.direccion || "Quito, Ecuador").slice(0, 120);
    const cedulaRuc = String(payload.cedulaRuc || "1718293849").slice(0, 13);
    const targetEmail = String(payload.correo || payload.email || "").trim().toLowerCase().slice(0, 100);
    const effectiveRoleId = payload._allowAdminSeed === true && payload.id_rol === "ROL0000001"
      ? "ROL0000001"
      : "ROL0000003";

    return this.#db.withTransaction(async (tx) => {
      const existingUsers = await tx.usuarios.findMany({
        include: { Clientes: true, Roles: true }
      });
      const matched = (Array.isArray(existingUsers) ? existingUsers : []).find(
        (u) => String(u.usu_email || "").trim().toLowerCase() === targetEmail
      );
      const matchedCli = matched
        ? (Array.isArray(matched.Clientes) ? matched.Clientes[0] : matched.Clientes)
        : null;

      let idUsuario;
      let idCliente;
      let resolvedRoleId = matched ? String(matched.id_rol || "ROL0000003").trim() : effectiveRoleId;
      let resolvedRoleName = matched?.Roles?.rol_nombre || (resolvedRoleId === "ROL0000001" ? "ADMIN" : "CLIENTE");

      if (matched && matchedCli) {
        idUsuario = String(matched.id_usuario).trim();
        idCliente = String(matchedCli.id_cliente).trim();
        await tx.clientes.update({
          where: { id_cliente: idCliente },
          data: {
            cli_ci_ruc: cedulaRuc,
            cli_nombres: cli_nombres.slice(0, 60),
            cli_apellidos: cli_apellidos.slice(0, 60),
            cli_telefono: telefono,
            cli_direccion: direccion
          }
        });
      } else {
        idUsuario = matched?.id_usuario
          ? String(matched.id_usuario).trim()
          : await this.#db.nextId(tx, "Usuarios", "id_usuario", "USU");

        if (!matched) {
          const rawSecret = payload.clave || payload.password || "Dermakor2026!";
          const safeHash = String(claveHash || hashPasswordBcrypt(rawSecret)).slice(0, 60);
          await tx.usuarios.create({
            data: {
              id_usuario: idUsuario,
              id_rol: resolvedRoleId,
              usu_nombre: effectiveNombre.slice(0, 50),
              usu_email: targetEmail,
              usu_clave_hash: safeHash,
              usu_estado: "ACTIVO"
            }
          });
        }

        idCliente = await this.#db.nextId(tx, "Clientes", "id_cliente", "CLI");
        await tx.clientes.create({
          data: {
            id_cliente: idCliente,
            id_usuario: idUsuario,
            id_ciudad: "CIU0000001",
            cli_ci_ruc: cedulaRuc,
            cli_nombres: cli_nombres.slice(0, 60),
            cli_apellidos: cli_apellidos.slice(0, 60),
            cli_telefono: telefono,
            cli_direccion: direccion
          }
        });
      }

      return new UsuarioModel({
        id_cliente: idCliente,
        id_usuario: idUsuario,
        id_rol: resolvedRoleId,
        rol_nombre: resolvedRoleName,
        nombre: effectiveNombre,
        username: effectiveNombre,
        cedulaRuc,
        correo: targetEmail,
        telefono,
        direccion,
        ciudad: payload.ciudad || "Quito",
        provincia: payload.provincia || "Pichincha",
        codigoPostal: payload.codigoPostal || "170101"
      }).toDTO();
    });
  }
}

module.exports = {
  UsuarioModel,
  UsuarioFactory,
  UsuarioRepository,
  resolveAppRole,
  getUsuarioRepository: () => UsuarioRepository.getInstance()
};
