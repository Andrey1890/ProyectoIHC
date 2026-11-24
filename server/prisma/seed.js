const { getSupabaseSingleton } = require("../src/config/supabase.singleton");
const { hashPasswordBcrypt } = require("../src/middlewares/hash.middleware");

async function main() {
  const db = getSupabaseSingleton();
  const prisma = db.getPrisma();

  // 1. Asegurar Roles (admin y user/cliente)
  await prisma.roles.upsert({
    where: { id_rol: "ROL0000001" },
    update: { rol_nombre: "ADMIN", rol_estado: "ACTIVO" },
    create: {
      id_rol: "ROL0000001",
      rol_nombre: "ADMIN",
      rol_descripcion: "Administrador general Dermakor",
      rol_estado: "ACTIVO"
    }
  });

  await prisma.roles.upsert({
    where: { id_rol: "ROL0000003" },
    update: { rol_nombre: "CLIENTE", rol_estado: "ACTIVO" },
    create: {
      id_rol: "ROL0000003",
      rol_nombre: "CLIENTE",
      rol_descripcion: "Cliente registrado Dermakor",
      rol_estado: "ACTIVO"
    }
  });

  // 2. Asegurar Usuario Administrador (admin@dermakor.com / Admin123!)
  const adminHash = hashPasswordBcrypt("Admin123!");
  await prisma.usuarios.upsert({
    where: { id_usuario: "USU0000003" },
    update: {
      id_rol: "ROL0000001",
      usu_nombre: "Administrador Dermakor",
      usu_email: "admin@dermakor.com",
      usu_clave_hash: adminHash,
      usu_estado: "ACTIVO"
    },
    create: {
      id_usuario: "USU0000003",
      id_rol: "ROL0000001",
      usu_nombre: "Administrador Dermakor",
      usu_email: "admin@dermakor.com",
      usu_clave_hash: adminHash,
      usu_estado: "ACTIVO"
    }
  });

  await prisma.clientes.upsert({
    where: { id_cliente: "CLI0000003" },
    update: {
      id_usuario: "USU0000003",
      cli_nombres: "Administrador",
      cli_apellidos: "Dermakor"
    },
    create: {
      id_cliente: "CLI0000003",
      id_usuario: "USU0000003",
      id_ciudad: "CIU0000001",
      cli_ci_ruc: "1790000003001",
      cli_nombres: "Administrador",
      cli_apellidos: "Dermakor",
      cli_telefono: "0996096996",
      cli_direccion: "Av. Republica E1-136 y Atahualpa, Quito"
    }
  });

  // 3. Actualizar Usuario Cliente Demo (cliente@example.com / Cliente123!) con hash bcrypt real
  const clientHash = hashPasswordBcrypt("Cliente123!");
  await prisma.usuarios.upsert({
    where: { id_usuario: "USU0000001" },
    update: {
      id_rol: "ROL0000003",
      usu_clave_hash: clientHash,
      usu_estado: "ACTIVO"
    },
    create: {
      id_usuario: "USU0000001",
      id_rol: "ROL0000003",
      usu_nombre: "María Fernández",
      usu_email: "cliente@example.com",
      usu_clave_hash: clientHash,
      usu_estado: "ACTIVO"
    }
  });

  console.log("[Seed Prisma] Usuarios admin@dermakor.com (ROL0000001) y cliente@example.com (ROL0000003) listos con hash bcrypt.");
  await db.close();
}

main().catch((err) => {
  console.error("[Seed Prisma Error]", err);
  process.exit(1);
});
