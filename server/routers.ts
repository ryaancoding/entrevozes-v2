import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { sdk } from "./_core/sdk";

// Define status enum
const StatusEnum = z.enum(["pending", "approved", "rejected"]);

// Helper to check if user is admin
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),

    login: publicProcedure
      .input(
        z.object({
          email: z.string().email("E-mail inválido"),
          password: z.string().min(1, "Senha obrigatória"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message:
              "ADMIN_EMAIL ou ADMIN_PASSWORD não configurados no Railway.",
          });
        }

        const emailOk =
          input.email.trim().toLowerCase() === adminEmail.trim().toLowerCase();
        const passwordOk = input.password === adminPassword;

        if (!emailOk || !passwordOk) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "E-mail ou senha inválidos.",
          });
        }

        await db.upsertUser({
          openId: "local-admin",
          name: "Administrador",
          email: adminEmail,
          loginMethod: "password",
          role: "admin",
          lastSignedIn: new Date(),
        });

        const sessionToken = await sdk.createSessionToken("local-admin", {
          name: "Administrador",
          expiresInMs: ONE_YEAR_MS,
        });

        const cookieOptions = getSessionCookieOptions(ctx.req);

        ctx.res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: ONE_YEAR_MS,
        });

        const user = await db.getUserByOpenId("local-admin");

        if (!user) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Não foi possível criar a sessão do administrador.",
          });
        }

        return user;
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Articles router
  articles: router({
    list: publicProcedure
      .input(z.object({ status: StatusEnum.optional() }).optional())
      .query(async ({ input }) => {
        return db.getArticles(input?.status);
      }),

    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return db.getArticleBySlug(input.slug);
      }),

    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1, "Título é obrigatório"),
        slug: z.string().min(1, "Slug é obrigatório"),
        summary: z.string().min(1, "Resumo é obrigatório"),
        articleLink: z.string().url("Link deve ser uma URL válida").optional(),
        author: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return db.createArticle({
          ...input,
          submittedBy: ctx.user.email || ctx.user.name,
          status: "pending",
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        slug: z.string().optional(),
        summary: z.string().optional(),
        articleLink: z.string().url().optional(),
        author: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        return db.updateArticle(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteArticle(input.id);
      }),

    approve: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.updateArticleStatus(input.id, "approved");
      }),

    reject: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.updateArticleStatus(input.id, "rejected");
      }),
  }),

  // Videos router
  videos: router({
    list: publicProcedure
      .input(z.object({ status: StatusEnum.optional() }).optional())
      .query(async ({ input }) => {
        return db.getVideos(input?.status);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getVideoById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1, "Título é obrigatório"),
        description: z.string().optional(),
        url: z.string().url("URL deve ser válida"),
        thumbnail: z.string().optional(),
        duration: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return db.createVideo({
          ...input,
          submittedBy: ctx.user.email || ctx.user.name,
          status: "pending",
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        url: z.string().url().optional(),
        thumbnail: z.string().optional(),
        duration: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateVideo(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteVideo(input.id);
      }),

    approve: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.updateVideoStatus(input.id, "approved");
      }),

    reject: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.updateVideoStatus(input.id, "rejected");
      }),
  }),

  // Mind Maps router
  mindMaps: router({
    list: publicProcedure
      .input(z.object({ status: StatusEnum.optional() }).optional())
      .query(async ({ input }) => {
        return db.getMindMaps(input?.status);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getMindMapById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1, "Título é obrigatório"),
        description: z.string().optional(),
        content: z.string().min(1, "Conteúdo é obrigatório"), // JSON string
      }))
      .mutation(async ({ input, ctx }) => {
        return db.createMindMap({
          ...input,
          submittedBy: ctx.user.email || ctx.user.name,
          status: "pending",
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        content: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateMindMap(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteMindMap(input.id);
      }),

    approve: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.updateMindMapStatus(input.id, "approved");
      }),

    reject: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.updateMindMapStatus(input.id, "rejected");
      }),
  }),

  // Quiz Questions router
  quizQuestions: router({
    list: publicProcedure
      .input(z.object({ status: StatusEnum.optional() }).optional())
      .query(async ({ input }) => {
        return db.getQuizQuestions(input?.status);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getQuizQuestionById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        question: z.string().min(1, "Pergunta é obrigatória"),
        options: z.string().min(1, "Opções são obrigatórias"), // JSON array string
        correctAnswer: z.number().min(0, "Resposta correta deve ser um índice válido"),
        explanation: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return db.createQuizQuestion({
          ...input,
          submittedBy: ctx.user.email || ctx.user.name,
          status: "pending",
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        question: z.string().optional(),
        options: z.string().optional(),
        correctAnswer: z.number().optional(),
        explanation: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateQuizQuestion(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteQuizQuestion(input.id);
      }),

    approve: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.updateQuizQuestionStatus(input.id, "approved");
      }),

    reject: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.updateQuizQuestionStatus(input.id, "rejected");
      }),
  }),

  // Moderation router
  moderation: router({
    getPending: adminProcedure.query(async () => {
      return db.getPendingContent();
    }),
  }),
});

export type AppRouter = typeof appRouter;
