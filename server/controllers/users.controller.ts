import { Response, Request } from "express";
import User, { IUser } from "@server/models/user.model";
import { ErrorResponse } from "@server/utils/errorResponse.util";
import { Nullable } from "@server/types/common.types";
import UserConstants from "@server/constants/user.constant";
import Role from "@server/models/role.model";

export const getUsers = async (req: Request, res: Response, next: any) => {
  try {
    // check if requesting user has permission (admin role needed)
    const user: Nullable<IUser> = await User.findOne(
      {
        _id: req.params.userId,
      },
      { roles: 1 }
    )
      .populate({
        path: "roles",
        model: Role,
        match: { name: { $eq: "admin" } },
        select: "name description -_id",
      })
      .exec();

    // user is no admin -> request denied
    if (!user || !(user.roles.length > 0)) {
      return next(
        new ErrorResponse(
          "Requesting user is not authorized to this information - admin role missing",
          401
        )
      );
    }

    // get all users and send them
    const users: IUser[] = await User.find(
      {},
      UserConstants.USER_RETURN_FIELDS
    ).populate("roles", "name -_id");
    const flatUsers = users.map((u) => {
      return { ...u.toObject(), id: u._id };
    });

    res.status(200).json({
      success: true,
      users: flatUsers,
    });
  } catch (error: any) {
    next(new ErrorResponse(`Internal Server Error ${error.message}`, 500));
  }
};

export const updateById = async (req: Request, res: Response, next: any) => {
  const { username, avatarseed, avatarstyle } = req.body;

  try {
    const filter = { _id: req.params.userId };
    const update = {
      username: username,
      avatarseed: avatarseed,
      avatarstyle: avatarstyle,
    };

    const user: Nullable<IUser> = await User.findByIdAndUpdate(filter, update, {
      fields: UserConstants.USER_RETURN_FIELDS,
      new: true,
    })
      .populate({ path: "roles", model: Role, select: "name description -_id" })
      .exec();

    if (!user) {
      return next(
        new ErrorResponse("User account not found or invalid token", 400)
      );
    }

    res.status(200).json({
      success: true,
      user: { ...user.toObject(), id: user._id },
    });
  } catch (error: any) {
    if (error.code === 11000) {
      next(
        new ErrorResponse("Username already taken, please choose another.", 409)
      );
    }
    next(new ErrorResponse(`Internal Server Error ${error.message}`, 500));
  }
};

export const deleteById = async (req: Request, res: Response, next: any) => {
  try {
    const filter = { _id: req.params.userId };

    const user: Nullable<IUser> = await User.findOne(filter);

    if (!user) {
      return next(new ErrorResponse("User account could not be found!", 404));
    }

    await user.deleteOne(filter);

    res.status(200).json({
      success: true,
    });
  } catch (error: any) {
    next(new ErrorResponse(`Internal Server Error ${error.message}`, 500));
  }
};
