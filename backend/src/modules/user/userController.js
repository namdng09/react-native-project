import { Types } from 'mongoose';
import crypto from 'crypto';
import createHttpError from 'http-errors';
import UserModel from './userModel.js';
import { apiResponse } from '../../types/apiResponse.js';
import { comparePassword } from '../../utils/bcrypt.js';

/**
 * userController.js
 *
 * @description :: Server-side logic for managing users.
 */
export const userController = {
  // GET /users?role=<admin|customer|shop>
  list: async (req, res, next) => {
    try {
      const { role } = req.query;
      const validRoles = ['admin', 'customer', 'shop'];

      if (role && !validRoles.includes(role)) {
        throw createHttpError(400, 'Invalid role value');
      }

      const filter = role ? { role } : {};
      const users = await UserModel.find(filter).select('-password');

      return res
        .status(200)
        .json(apiResponse.success('Users listed successfully', users));
    } catch (error) {
      next(error);
    }
  },

  // GET /users/:id
  show: async (req, res, next) => {
    try {
      const { id } = req.params;

      if (!Types.ObjectId.isValid(id)) {
        throw createHttpError(400, 'Invalid user id');
      }

      const user = await UserModel.findById(id)
        .select('-password')
        .populate('addresses');

      if (!user) {
        throw createHttpError(404, 'User not found');
      }

      return res
        .status(200)
        .json(apiResponse.success('User fetched successfully', user));
    } catch (error) {
      next(error);
    }
  },

  // POST /users
  create: async (req, res, next) => {
    try {
      const { fullName, username, email, phoneNumber, role } = req.body;

      if (!fullName || !username || !email || !phoneNumber || !role) {
        throw createHttpError(400, 'Missing required fields');
      }

      if (!['admin', 'customer', 'shop'].includes(role)) {
        throw createHttpError(400, 'Invalid role value');
      }

      if (await UserModel.findOne({ username })) {
        throw createHttpError(409, 'Username already exists');
      }
      if (await UserModel.findOne({ email })) {
        throw createHttpError(409, 'Email already exists');
      }
      if (await UserModel.findOne({ phoneNumber })) {
        throw createHttpError(409, 'Phone number already exists');
      }

      const password = crypto.randomBytes(4).toString('hex');

      const newUser = await UserModel.create({
        fullName,
        username,
        email,
        phoneNumber,
        password,
        role
      });

      if (!newUser) {
        throw createHttpError(400, 'User creation failed');
      }

      // await sendMail(...) // Optional email sending

      const { password: _pw, ...resUser } = newUser.toObject();

      return res
        .status(201)
        .json(apiResponse.success('User created successfully', resUser));
    } catch (error) {
      next(error);
    }
  },

  // PUT /users/:id/profile
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { fullName, username, email, phoneNumber, role } = req.body;

      if (!Types.ObjectId.isValid(id)) {
        throw createHttpError(400, 'Invalid user id');
      }

      const user = await UserModel.findById(id);
      if (!user) throw createHttpError(404, 'User not found');

      if (!fullName || !username || !email || !phoneNumber || !role) {
        throw createHttpError(400, 'Missing required fields');
      }

      if (!['admin', 'customer', 'shop'].includes(role)) {
        throw createHttpError(400, 'Invalid role value');
      }

      if (username && username !== user.username) {
        const dup = await UserModel.findOne({ username, _id: { $ne: id } });
        if (dup) throw createHttpError(409, 'Username already exists');
        user.username = username;
      }

      if (email && email !== user.email) {
        const dup = await UserModel.findOne({ email, _id: { $ne: id } });
        if (dup) throw createHttpError(409, 'Email already exists');
        user.email = email;
      }

      if (phoneNumber && phoneNumber !== user.phoneNumber) {
        const dup = await UserModel.findOne({ phoneNumber, _id: { $ne: id } });
        if (dup) throw createHttpError(409, 'Phone number already exists');
        user.phoneNumber = phoneNumber;
      }

      if (fullName !== undefined) user.fullName = fullName;
      if (username !== undefined) user.username = username;
      if (email !== undefined) user.email = email;
      if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
      if (role !== undefined) user.role = role;

      const updatedUser = await user.save();
      if (!updatedUser) throw createHttpError(400, 'User update failed');

      const { password: _pw, ...resUser } = updatedUser.toObject();
      return res
        .status(200)
        .json(apiResponse.success('Profile updated successfully', resUser));
    } catch (error) {
      next(error);
    }
  },

  // PATCH /users/:id/avatar
  updateAvatarUrl: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { avatarUrl } = req.body;

      if (!avatarUrl?.trim()) {
        throw createHttpError(400, 'avatarUrl field is required');
      }
      if (!Types.ObjectId.isValid(id)) {
        throw createHttpError(400, 'Invalid user id');
      }

      const existingUser = await UserModel.findByIdAndUpdate(
        id,
        { avatarUrl },
        { new: true }
      );
      if (!existingUser) throw createHttpError(404, 'User not found');

      const { password: _pw, ...resUser } = existingUser.toObject();
      return res
        .status(200)
        .json(apiResponse.success('Avatar updated successfully', resUser));
    } catch (error) {
      next(error);
    }
  },

  // PATCH /users/:id/cover
  updateCoverUrl: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { coverUrl } = req.body;

      if (!coverUrl?.trim()) {
        throw createHttpError(400, 'coverUrl field is required');
      }
      if (!Types.ObjectId.isValid(id)) {
        throw createHttpError(400, 'Invalid user id');
      }

      const existingUser = await UserModel.findByIdAndUpdate(
        id,
        { coverUrl },
        { new: true }
      );
      if (!existingUser) throw createHttpError(404, 'User not found');

      const { password: _pw, ...resUser } = existingUser.toObject();
      return res
        .status(200)
        .json(apiResponse.success('Cover photo updated successfully', resUser));
    } catch (error) {
      next(error);
    }
  },

  // DELETE /users/:id
  remove: async (req, res, next) => {
    try {
      const { id } = req.params;

      if (!Types.ObjectId.isValid(id)) {
        throw createHttpError(400, 'Invalid user id');
      }

      const deleted = await UserModel.findByIdAndDelete(id);
      if (!deleted) throw createHttpError(404, 'User not found');

      return res
        .status(200)
        .json(apiResponse.success('User removed successfully'));
    } catch (error) {
      next(error);
    }
  },

  // PATCH /users/:id
  updatePassword: async (req, res, next) => {
    try {
      const { email } = req.params;
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        throw createHttpError(
          400,
          'Old Password and New Password are required'
        );
      }
      if (newPassword.length < 6) {
        throw createHttpError(
          400,
          'New Password must be at least 6 characters'
        );
      }

      const user = await UserModel.findOne({ email });
      if (!user) throw createHttpError(404, 'User not found');

      const isMatch = await comparePassword(oldPassword, user.password);
      if (!isMatch) throw createHttpError(401, 'Incorrect old password');

      user.password = newPassword;
      await user.save();

      return res
        .status(200)
        .json(apiResponse.success('Password updated successfully'));
    } catch (error) {
      next(error);
    }
  }
};
