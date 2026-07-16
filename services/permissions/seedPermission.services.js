import { permissionModel } from "../../models/permissions.model.js";
import { roleModel } from "../../models/roles.model.js";
import { ROLE_HIERARCHY } from "./permissions.services.js";

export const seedPermission = async (req, res) => {
  try {
    await permissionModel.deleteMany({});
    await roleModel.deleteMany({});

    const createdPermission = await permissionModel.insertMany(
      ROLE_HIERARCHY.PERMISSIONS.map((permission) => ({ name: permission })),
    );
    const getPermissionId = (permissionName) => {
      return createdPermission
        .filter((permission) => permissionName.include(permission.name))
        .map((permission) => permission._id);
    };
    await roleModel.insertMany([
      {
        name: "SUPER_ADMIN",
        permissions: getPermissionId(ROLE_HIERARCHY.PERMISSIONS),
      },
      {
        name: "ADMIN",
        permissions: getPermissionId(ROLE_HIERARCHY.ADMIN),
      },
      {
        name: "CUSTOMER",
        permissions: getPermissionId(ROLE_HIERARCHY.CUSTOMER),
      },
      {
        name: "VENDOR",
        permissions: getPermissionId(ROLE_HIERARCHY.VENDOR),
      },
      {
        name: "DELIVERY_PARTNER",
        permissions: getPermissionId(ROLE_HIERARCHY.DELIVERY_PARTNER),
      },
      {
        name: "SUPPORT",
        permissions: getPermissionId(ROLE_HIERARCHY.SUPPORT),
      },
    ]);
    res
      .status(201)
      .send({ message: "Roles Created Successfully", success: true });
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .send({ message: "Roles Creation Failed!", success: false, error });
  }
};
