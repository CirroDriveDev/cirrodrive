import { Router, type Request, type Response } from "express";
import { UserInputSchema, type UserOutput } from "@cirrodrive/types";
import { z } from "zod";
import { container } from "@/loaders/inversify.ts";
import { UserService } from "@/services/userService.ts";

/**
 * 사용자 라우터입니다.
 */
export const UserRouter = (): Router => {
  const router = Router();
  const userService = container.get<UserService>(UserService);

  // createUser
  router.post("/", async (req: Request, res: Response) => {
    // Input
    const userInput = UserInputSchema.parse(req.body);

    // Process
    const user: UserOutput = await userService.createUser(userInput);

    // Output
    res.status(201).json(user);
  });

  // getUsers
  router.get("/", async (req: Request, res: Response) => {
    // Input
    const limit = req.query.limit ? z.number().parse(req.query.limit) : 10;
    const offset = req.query.offset ? z.number().parse(req.query.offset) : 0;

    // Process
    const users: UserOutput[] = await userService.getUsers(limit, offset);

    // Output
    res.json(users);
  });

  // getUser
  router.get("/:username", async (req: Request, res: Response) => {
    // Input
    const username = z.string().parse(req.params.userId);

    // Process
    const user: UserOutput | null = await userService.getUser(username);

    // Output
    if (!user) {
      res.status(404).send();
      return;
    }

    res.json(user);
  });

  // updateUser
  router.put("/:username", async (req: Request, res: Response) => {
    // Input
    const username = z.string().parse(req.params.userId);
    const userInput = UserInputSchema.parse(req.body);

    // Process
    const user = await userService.updateUser(username, userInput);

    // Output
    res.json(user);
  });

  // deleteUser
  router.delete("/:username", async (req: Request, res: Response) => {
    // Input
    const username = z.string().parse(req.params.userId);

    // Process
    const user: UserOutput | null = await userService.deleteUser(username);

    // Output
    if (!user) {
      res.status(404).send();
      return;
    }

    res.status(204).send();
  });

  return router;
};
