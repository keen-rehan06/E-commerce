import { roleModel } from "../models/roles.model.js";
import { permissionModel } from "../models/permissions.model.js";
import { ROLE_HIERARCHY } from "../services/permissions/permissions.services.js";
import { userModel } from "../models/user.model.js";

export const assignRole = async (req, res) => {
  try {
    const userId = req.params;
    const role = req.body;
    const admin = req.user;
    const allowedRoles = ROLE_HIERARCHY[admin.role];
    const user = await userModel.findById(userId);
    if (!user)
      return res
        .status(404)
        .send({ message: "User Not Found!", success: false });
    if (
      (admin.role === "ADMIN" && user.role === "ADMIN") ||
      user.role === "SUPER_ADMIN"
    ) {
      return res.status(403).send({
        success: false,
        message: "You cannot modify this user.",
      });
    }
    if(admin.role === "CUSTOMER" || admin.role === "VENDOR" || admin.role === "DELIVERY_PARTNER" || admin.role === "SUPPORT") return res.status(400).send({message:"You can not assign role",success:false});
    if(admin.id === user._id) return res.status({message:"You can't change your own role", success: true});

    if(!allowedRoles.include(role)) return res.status(401).send({message:"You are not allowed to assign this role.",success:false});
    user.role = role;
    await user.save();
    return res.status(201).send({message:"Role Applied SuccessFullly!",success:true});
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({message:"Role Applied Failed!",success:false});
  }
};
