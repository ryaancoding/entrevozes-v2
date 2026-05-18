import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { createHmac } from "node:crypto";

const StatusEnum = z.enum(["pending", "approved", "rejected"]);

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

function signPayload(payload: string) {
  const secret = process.env.JWT_SECRET || "entrevozes-dev-secret";
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function createLocalSessionToken(openId: string) {
  const payload = Buffer.from(
    JSON.stringify({ openId, exp: Date.now() + ONE_YEAR_MS })
  ).toString("base64url");

  return `${payload}.${signPayload(payload)}`;
}

function isHttps(req: any) {
  return req.headers?.["x-forwarded-proto"] === "https" || req.protocol === "https";
}

function normalizeSubmittedBy(value?: string | null) {
  const clean = value?.trim();
  return clean && clean.length > 0 ? clean : "Visitante";
}

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
            message: "ADMIN_EMAIL ou ADMIN_PASSWORD não configurados no Railway.",
          });
        }

        const emailOk = input.email.trim().toLowerCase() === adminEmail.trim().toLowerCase();
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

        const token = createLocalSessionToken("local-admin");

        ctx.res.cookie(COOKIE_NAME, token, {
          httpOnly: true,
          secure: isHttps(ctx.req),
          sameSite: "lax",
          path: "/",
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
      ctx.res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        secure: isHttps(ctx.req),
        sameSite: "lax",
        path: "/",
      });

      return { success: true } as const;
    }),
  }),

  articles: router({
    list: publicProcedure
      .input(z.object({ status: StatusEnum.optional() }).optional())
      .query(async ({ input }) => db.getArticles(input?.status)),

    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => db.getArticleBySlug(input.slug)),

    create: publicProcedure
      .input(
        z.object({
          title: z.string().min(1, "Título é obrigatório"),
          slug: z.string().min(1, "Slug é obrigatório"),
          summary: z.string().min(1, "Resumo é obrigatório"),
          articleLink: z.string().url("Link deve ser uma URL válida").optional().or(z.literal("")),
          author: z.string().optional(),
          submittedBy: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return db.createArticle({
          title: input.title,
          slug: input.slug,
          summary: input.summary,
          articleLink: input.articleLink || undefined,
          author: input.author,
          submittedBy: normalizeSubmittedBy(input.submittedBy),
          status: "pending",
        });
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          slug: z.string().optional(),
          summary: z.string().optional(),
          articleLink: z.string().url().optional().or(z.literal("")),
          author: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateArticle(id, {
          ...data,
          articleLink: data.articleLink || undefined,
        });
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => db.deleteArticle(input.id)),

    approve: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => db.updateArticleStatus(input.id, "approved")),

    reject: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => db.updateArticleStatus(input.id, "rejected")),
  }),

  videos: router({
    list: publicProcedure
      .input(z.object({ status: StatusEnum.optional() }).optional())
      .query(async ({ input }) => db.getVideos(input?.status)),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => db.getVideoById(input.id)),

    create: publicProcedure
      .input(
        z.object({
          title: z.string().min(1, "Título é obrigatório"),
          description: z.string().optional(),
          url: z.string().url("URL deve ser válida"),
          thumbnail: z.string().optional(),
          duration: z.number().optional(),
          submittedBy: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return db.createVideo({
          title: input.title,
          description: input.description,
          url: input.url,
          thumbnail: input.thumbnail,
          duration: input.duration,
          submittedBy: normalizeSubmittedBy(input.submittedBy),
          status: "pending",
        });
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          description: z.string().optional(),
          url: z.string().url().optional(),
          thumbnail: z.string().optional(),
          duration: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateVideo(id, data);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => db.deleteVideo(input.id)),

    approve: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => db.updateVideoStatus(input.id, "approved")),

    reject: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => db.updateVideoStatus(input.id, "rejected")),
  }),

  mindMaps: router({
    list: publicProcedure
      .input(z.object({ status: StatusEnum.optional() }).optional())
      .query(async ({ input }) => db.getMindMaps(input?.status)),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => db.getMindMapById(input.id)),

    create: publicProcedure
      .input(
        z.object({
          title: z.string().min(1, "Título é obrigatório"),
          description: z.string().optional(),
          content: z.string().min(1, "Conteúdo é obrigatório"),
          submittedBy: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return db.createMindMap({
          title: input.title,
          description: input.description,
          content: input.content,
          submittedBy: normalizeSubmittedBy(input.submittedBy),
          status: "pending",
        });
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          description: z.string().optional(),
          content: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateMindMap(id, data);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => db.deleteMindMap(input.id)),

    approve: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => db.updateMindMapStatus(input.id, "approved")),

    reject: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => db.updateMindMapStatus(input.id, "rejected")),
  }),

  quizQuestions: router({
    list: publicProcedure
      .input(z.object({ status: StatusEnum.optional() }).optional())
      .query(async ({ input }) => db.getQuizQuestions(input?.status)),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => db.getQuizQuestionById(input.id)),

    create: publicProcedure
      .input(
        z.object({
          question: z.string().min(1, "Pergunta é obrigatória"),
          options: z.string().min(1, "Opções são obrigatórias"),
          correctAnswer: z.number().min(0, "Resposta correta deve ser um índice válido"),
          explanation: z.string().optional(),
          submittedBy: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return db.createQuizQuestion({
          question: input.question,
          options: input.options,
          correctAnswer: input.correctAnswer,
          explanation: input.explanation,
          submittedBy: normalizeSubmittedBy(input.submittedBy),
          status: "pending",
        });
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          question: z.string().optional(),
          options: z.string().optional(),
          correctAnswer: z.number().optional(),
          explanation: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateQuizQuestion(id, data);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => db.deleteQuizQuestion(input.id)),

    approve: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => db.updateQuizQuestionStatus(input.id, "approved")),

    reject: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => db.updateQuizQuestionStatus(input.id, "rejected")),
  }),

  moderation: router({
    getPending: adminProcedure.query(async () => db.getPendingContent()),
  }),
});

export type AppRouter = typeof appRouter;
