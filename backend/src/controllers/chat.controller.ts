import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { Chat } from '../models/Chat.model';
import { Message } from '../models/Message.model';

// @desc    Get all chats for user
// @route   GET /api/chats
// @access  Private
export const getChats = asyncHandler(async (req: any, res: Response) => {
  const chats = await Chat.find({ user: req.user.id, isDeleted: false }).sort({ updatedAt: -1 });
  res.status(200).json(new ApiResponse(200, chats, 'Chats retrieved successfully'));
});

// @desc    Create new chat
// @route   POST /api/chats
// @access  Private
export const createChat = asyncHandler(async (req: any, res: Response) => {
  const chat = await Chat.create({ user: req.user.id });
  res.status(201).json(new ApiResponse(201, chat, 'Chat created successfully'));
});

// @desc    Get single chat
// @route   GET /api/chats/:id
// @access  Private
export const getChat = asyncHandler(async (req: any, res: Response) => {
  const chat = await Chat.findOne({ _id: req.params.id, user: req.user.id, isDeleted: false });

  if (!chat) {
    throw new ApiError(404, 'Chat not found');
  }

  const messages = await Message.find({ chat: req.params.id });

  res.status(200).json(new ApiResponse(200, { chat, messages }, 'Chat retrieved successfully'));
});

// @desc    Update chat (rename)
// @route   PUT /api/chats/:id
// @access  Private
export const updateChat = asyncHandler(async (req: any, res: Response) => {
  const chat = await Chat.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id, isDeleted: false },
    req.body,
    { new: true, runValidators: true }
  );

  if (!chat) {
    throw new ApiError(404, 'Chat not found');
  }

  res.status(200).json(new ApiResponse(200, chat, 'Chat updated successfully'));
});

// @desc    Delete chat (soft delete)
// @route   DELETE /api/chats/:id
// @access  Private
export const deleteChat = asyncHandler(async (req: any, res: Response) => {
  const chat = await Chat.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { isDeleted: true },
    { new: true }
  );

  if (!chat) {
    throw new ApiError(404, 'Chat not found');
  }

  res.status(200).json(new ApiResponse(200, {}, 'Chat deleted successfully'));
});

// @desc    Add message to chat
// @route   POST /api/chats/:id/messages
// @access  Private
export const addMessage = asyncHandler(async (req: any, res: Response) => {
  const { content, role, attachments } = req.body;

  const chat = await Chat.findOne({ _id: req.params.id, user: req.user.id, isDeleted: false });

  if (!chat) {
    throw new ApiError(404, 'Chat not found');
  }

  const message = await Message.create({
    chat: req.params.id,
    sender: role === 'user' ? 'user' : 'ai',
    content,
    attachments,
  });

  // Update chat updated time
  chat.updatedAt = new Date();
  await chat.save();

  res.status(201).json(new ApiResponse(201, message, 'Message added successfully'));
});
