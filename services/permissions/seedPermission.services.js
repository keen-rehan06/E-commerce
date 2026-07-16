import { permissionModel } from "../../models/permissions.model.js";
import { roleModel } from "../../models/roles.model.js";
import {
  ADMIN,
  CUSTOMER,
  DELIVERY_PARTNER,
  PERMISSIONS,
  VENDOR,
  SUPPORT,
} from "../permissions.services.js";

export const seedPermission = async (req, res) => {
  try {
    await permissionModel.deleteMany({});
    await roleModel.deleteMany({});

    const createdPermission = await permissionModel.insertMany(
      PERMISSIONS.map((permission) => ({ name: permission })),
    );
    const getPermissionId = (permissionName) => {
      return createdPermission
        .filter((permission) => permissionName.include(permission.name))
        .map((permission) => permission._id);
    };
    await roleModel.insertMany([
      {
        name: "SUPER_ADMIN",
        permissions: getPermissionId(PERMISSIONS),
      },
      {
        name: "ADMIN",
        permissions: getPermissionId(ADMIN),
      },
      {
        name: "CUSTOMER",
        permissions: getPermissionId(CUSTOMER),
      },
      {
        name: "VENDOR",
        permissions: getPermissionId(VENDOR),
      },
      {
        name: "DELIVERY_PARTNER",
        permissions: getPermissionId(DELIVERY_PARTNER),
      },
      {
        name: "SUPPORT",
        permissions: getPermissionId(SUPPORT),
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
