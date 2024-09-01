/* eslint-disable @typescript-eslint/no-misused-promises -- These promises are actually not misused. */
import { Router, type Request, type Response } from "express";
import { dayjs } from "@/loaders/dayjs.ts";
import { container } from "@/loaders/inversify.ts";
import { type UserInput } from "@/types/dto.ts";
import { UserService } from "@/services/userService.ts";

/**
 * 사용자 라우터입니다.
 */
export const UserRouter = (): Router => {
  const router = Router();
  const userService = container.get<UserService>(UserService);

  // 모든 사용자 가져오기
  router.get("/", async (req: Request, res: Response) => {
    const limit =
      req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const offset =
      req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    const users = await userService.getUsers(limit, offset);

    const result = users.map((user) => ({
      id: user.id,
      profileImageFileId: user.profileImageFileId,
      nickname: user.nickname,
      createdAt: dayjs(user.createdAt).format(),
    }));

    res.json(result);
  });

  // 새로운 사용자 생성
  router.post("/", (req: Request, res: Response) => {
    const userDTO = req.body as UserInput;
    const result = userService.createUser(userDTO);

    res.status(201).json(result);
  });

  // ID로 사용자 가져오기
  router.get("/:userId", (req: Request, res: Response) => {
    if (!req.params.userId) {
      res.status(400).send();
      return;
    }

    const userId = parseInt(req.params.userId, 10);

    void userService.getUserById(userId).then((result) => {
      if (!result) {
        res.status(404).send();
        return;
      }

      res.json(result);
    });
  });

  // 사용자 업데이트
  router.put("/:userId", (req: Request, res: Response) => {
    if (!req.params.userId) {
      res.status(400).send();
      return;
    }

    const userId = parseInt(req.params.userId, 10);
    const userDTO = req.body as UserInput;

    const result = userService.updateUser(userId, userDTO);

    res.json(result);
  });

  // 사용자 삭제
  router.delete("/:userId", (req: Request, res: Response) => {
    if (!req.params.userId) {
      res.status(400).send();
      return;
    }

    const userId = parseInt(req.params.userId, 10);

    void userService.deleteUser(userId);

    res.status(204).send();
  });

  // 특정 사용자의 모든 게시글 가져오기
  router.get("/:userId/posts", (_req: Request, res: Response) => {
    // const userId = parseInt(req.params.userId, 10);

    // const result =

    res.json([]);
  });

  return router;
};
