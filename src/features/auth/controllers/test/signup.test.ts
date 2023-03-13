/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response } from 'express';
import * as cloudinaryUploads from '@global/helpers/cloudinary-upload';
import { SignUp } from '@auth/controllers/signup';
import { CustomError } from '@global/helpers/error-handler';
import { authMock, authMockRequest, authMockResponse } from '@root/mocks/auth.mock';
import { authService } from '@service/db/auth.service';
import { UserCache } from '@service/redis/user.cache';

jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/user.cache');
jest.mock('@service/queues/user.queue');
jest.mock('@service/queues/auth.queue');
jest.mock('@global/helpers/cloudinary-upload');

describe('SignUp', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should throw an error if username is not available', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: '',
        email: 'manny@test.com',
        password: 'qwerty',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
      }
    ) as Request;
    const res: Response = authMockResponse();

    SignUp.prototype.signup(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeError().message).toEqual('Username is a required field');
    });
  });
});

it('should throw an error if username length is less than minimum length', () => {
  const req: Request = authMockRequest(
    {},
    {
      username: 'ma',
      email: 'manny@test.com',
      password: 'qwerty',
      avatarColor: 'red',
      avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
    }
  ) as Request;
  const res: Response = authMockResponse();
  SignUp.prototype.signup(req, res).catch((error: CustomError) => {
    expect(error.statusCode).toEqual(400);
    expect(error.serializeError().message).toEqual('Invalid username');
  });
});

it('should throw an error if username length is greater than maximum length', () => {
  const req: Request = authMockRequest(
    {},
    {
      username: 'mathematicsmathematicsmathematicstestmathematics',
      email: 'manny@test.com',
      password: 'qwerty',
      avatarColor: 'red',
      avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
    }
  ) as Request;
  const res: Response = authMockResponse();
  SignUp.prototype.signup(req, res).catch((error: CustomError) => {
    expect(error.statusCode).toEqual(400);
    expect(error.serializeError().message).toEqual('Invalid username');
  });
});

it('should throw an error if email is not valid', () => {
  const req: Request = authMockRequest(
    {},
    {
      username: 'Manny',
      email: 'not valid',
      password: 'qwerty',
      avatarColor: 'red',
      avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
    }
  ) as Request;
  const res: Response = authMockResponse();

  SignUp.prototype.signup(req, res).catch((error: CustomError) => {
    expect(error.statusCode).toEqual(400);
    expect(error.serializeError().message).toEqual('Email must be valid');
  });
});

it('should throw an error if email is not available', () => {
  const req: Request = authMockRequest(
    {},
    { username: 'Manny', email: '', password: 'qwerty', avatarColor: 'red', avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==' }
  ) as Request;
  const res: Response = authMockResponse();
  SignUp.prototype.signup(req, res).catch((error: CustomError) => {
    expect(error.statusCode).toEqual(400);
    expect(error.serializeError().message).toEqual('Email is a required field');
  });
});

it('should throw an error if password is not available', () => {
  const req: Request = authMockRequest(
    {},
    {
      username: 'Manny',
      email: 'manny@test.com',
      password: '',
      avatarColor: 'red',
      avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
    }
  ) as Request;
  const res: Response = authMockResponse();
  SignUp.prototype.signup(req, res).catch((error: CustomError) => {
    expect(error.statusCode).toEqual(400);
    expect(error.serializeError().message).toEqual('Password is a required field');
  });
});

it('should throw an error if password length is less than minimum length', () => {
  const req: Request = authMockRequest(
    {},
    {
      username: 'Manny',
      email: 'manny@test.com',
      password: 'ma',
      avatarColor: 'red',
      avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
    }
  ) as Request;
  const res: Response = authMockResponse();
  SignUp.prototype.signup(req, res).catch((error: CustomError) => {
    expect(error.statusCode).toEqual(400);
    expect(error.serializeError().message).toEqual('Invalid password');
  });
});

it('should throw an error if password length is greater than maximum length', () => {
  const req: Request = authMockRequest(
    {},
    {
      username: 'Manny',
      email: 'manny@test.com',
      password: 'mathematics1mathematics2mathematics3mathematics4',
      avatarColor: 'red',
      avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
    }
  ) as Request;
  const res: Response = authMockResponse();
  SignUp.prototype.signup(req, res).catch((error: CustomError) => {
    expect(error.statusCode).toEqual(400);
    expect(error.serializeError().message).toEqual('Invalid password');
  });
});

it('should throw unauthorize error is user already exist', () => {
  const req: Request = authMockRequest(
    {},
    {
      username: 'Manny',
      email: 'manny@test.com',
      password: 'qwerty',
      avatarColor: 'red',
      avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
    }
  ) as Request;
  const res: Response = authMockResponse();

  jest.spyOn(authService, 'getUserByUsernameOrEmail').mockResolvedValue(authMock);
  SignUp.prototype.signup(req, res).catch((error: CustomError) => {
    expect(error.statusCode).toEqual(400);
    expect(error.serializeError().message).toEqual('User name or email is already taken.');
  });
});

it('should set session data for valid credentials and send correct json response', async () => {
  const req: Request = authMockRequest(
    {},
    {
      username: 'Manny',
      email: 'manny@test.com',
      password: 'qwerty',
      avatarColor: 'red',
      avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
    }
  ) as Request;
  const res: Response = authMockResponse();

  jest.spyOn(authService, 'getUserByUsernameOrEmail').mockResolvedValue(null as any);
  const userSpy = jest.spyOn(UserCache.prototype, 'saveUserToCache');
  jest.spyOn(cloudinaryUploads, 'upload').mockImplementation((): any => Promise.resolve({ version: '1234737373', public_id: '123456' }));

  await SignUp.prototype.signup(req, res);
  expect(req.session?.jwt).toBeDefined();
  expect(res.json).toHaveBeenCalledWith({
    message: 'User created successfully',
    user: userSpy.mock.calls[0][2],
    token: req.session?.jwt
  });
});
