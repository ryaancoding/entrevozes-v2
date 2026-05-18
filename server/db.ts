import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, articles, videos, mindMaps, quizQuestions, InsertArticle, InsertVideo, InsertMindMap, InsertQuizQuestion } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

/**
 * Get or create database connection
 * Throws error if DATABASE_URL is not configured
 */
export async function getDb() {
  if (!_db) {
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
      const errorMsg = "[Database] FATAL: DATABASE_URL environment variable is not set. " +
        "Please configure DATABASE_URL in your .env file with a valid MySQL connection string. " +
        "Example: mysql://user:password@host:port/database";
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      _db = drizzle(dbUrl);
      console.log("[Database] Connected successfully");
    } catch (error) {
      const errorMsg = `[Database] Failed to connect to database: ${error instanceof Error ? error.message : String(error)}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();

  try {
    const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get user by openId:", error);
    throw error;
  }
}

export async function getUserById(id: number) {
  const db = await getDb();

  try {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get user by id:", error);
    throw error;
  }
}

// Articles queries
export async function getArticles(status?: string) {
  const db = await getDb();
  
  try {
    if (status) {
      return await db.select().from(articles).where(eq(articles.status, status as any));
    }
    return await db.select().from(articles);
  } catch (error) {
    console.error("[Database] Failed to get articles:", error);
    throw error;
  }
}

export async function getArticleBySlug(slug: string) {
  const db = await getDb();
  
  try {
    const result = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get article by slug:", error);
    throw error;
  }
}

export async function createArticle(data: InsertArticle) {
  const db = await getDb();
  
  if (!data.title || !data.slug || !data.summary) {
    throw new Error("Article title, slug, and summary are required");
  }

  try {
    const result = await db.insert(articles).values(data);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create article:", error);
    throw error;
  }
}

export async function updateArticleStatus(id: number, status: string) {
  const db = await getDb();
  
  if (!["pending", "approved", "rejected"].includes(status)) {
    throw new Error("Invalid status value");
  }

  try {
    return await db.update(articles).set({ status: status as any }).where(eq(articles.id, id));
  } catch (error) {
    console.error("[Database] Failed to update article status:", error);
    throw error;
  }
}

export async function updateArticle(id: number, data: Partial<InsertArticle>) {
  const db = await getDb();
  
  try {
    return await db.update(articles).set(data).where(eq(articles.id, id));
  } catch (error) {
    console.error("[Database] Failed to update article:", error);
    throw error;
  }
}

export async function deleteArticle(id: number) {
  const db = await getDb();
  
  try {
    return await db.delete(articles).where(eq(articles.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete article:", error);
    throw error;
  }
}

// Videos queries
export async function getVideos(status?: string) {
  const db = await getDb();
  
  try {
    if (status) {
      return await db.select().from(videos).where(eq(videos.status, status as any));
    }
    return await db.select().from(videos);
  } catch (error) {
    console.error("[Database] Failed to get videos:", error);
    throw error;
  }
}

export async function getVideoById(id: number) {
  const db = await getDb();
  
  try {
    const result = await db.select().from(videos).where(eq(videos.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get video by id:", error);
    throw error;
  }
}

export async function createVideo(data: InsertVideo) {
  const db = await getDb();
  
  if (!data.title || !data.url) {
    throw new Error("Video title and url are required");
  }

  try {
    return await db.insert(videos).values(data);
  } catch (error) {
    console.error("[Database] Failed to create video:", error);
    throw error;
  }
}

export async function updateVideoStatus(id: number, status: string) {
  const db = await getDb();
  
  if (!["pending", "approved", "rejected"].includes(status)) {
    throw new Error("Invalid status value");
  }

  try {
    return await db.update(videos).set({ status: status as any }).where(eq(videos.id, id));
  } catch (error) {
    console.error("[Database] Failed to update video status:", error);
    throw error;
  }
}

export async function updateVideo(id: number, data: Partial<InsertVideo>) {
  const db = await getDb();
  
  try {
    return await db.update(videos).set(data).where(eq(videos.id, id));
  } catch (error) {
    console.error("[Database] Failed to update video:", error);
    throw error;
  }
}

export async function deleteVideo(id: number) {
  const db = await getDb();
  
  try {
    return await db.delete(videos).where(eq(videos.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete video:", error);
    throw error;
  }
}

// Mind Maps queries
export async function getMindMaps(status?: string) {
  const db = await getDb();
  
  try {
    if (status) {
      return await db.select().from(mindMaps).where(eq(mindMaps.status, status as any));
    }
    return await db.select().from(mindMaps);
  } catch (error) {
    console.error("[Database] Failed to get mind maps:", error);
    throw error;
  }
}

export async function getMindMapById(id: number) {
  const db = await getDb();
  
  try {
    const result = await db.select().from(mindMaps).where(eq(mindMaps.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get mind map by id:", error);
    throw error;
  }
}

export async function createMindMap(data: InsertMindMap) {
  const db = await getDb();
  
  if (!data.title || !data.content) {
    throw new Error("Mind map title and content are required");
  }

  try {
    return await db.insert(mindMaps).values(data);
  } catch (error) {
    console.error("[Database] Failed to create mind map:", error);
    throw error;
  }
}

export async function updateMindMapStatus(id: number, status: string) {
  const db = await getDb();
  
  if (!["pending", "approved", "rejected"].includes(status)) {
    throw new Error("Invalid status value");
  }

  try {
    return await db.update(mindMaps).set({ status: status as any }).where(eq(mindMaps.id, id));
  } catch (error) {
    console.error("[Database] Failed to update mind map status:", error);
    throw error;
  }
}

export async function updateMindMap(id: number, data: Partial<InsertMindMap>) {
  const db = await getDb();
  
  try {
    return await db.update(mindMaps).set(data).where(eq(mindMaps.id, id));
  } catch (error) {
    console.error("[Database] Failed to update mind map:", error);
    throw error;
  }
}

export async function deleteMindMap(id: number) {
  const db = await getDb();
  
  try {
    return await db.delete(mindMaps).where(eq(mindMaps.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete mind map:", error);
    throw error;
  }
}

// Quiz Questions queries
export async function getQuizQuestions(status?: string) {
  const db = await getDb();
  
  try {
    if (status) {
      return await db.select().from(quizQuestions).where(eq(quizQuestions.status, status as any));
    }
    return await db.select().from(quizQuestions);
  } catch (error) {
    console.error("[Database] Failed to get quiz questions:", error);
    throw error;
  }
}

export async function getQuizQuestionById(id: number) {
  const db = await getDb();
  
  try {
    const result = await db.select().from(quizQuestions).where(eq(quizQuestions.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get quiz question by id:", error);
    throw error;
  }
}

export async function createQuizQuestion(data: InsertQuizQuestion) {
  const db = await getDb();
  
  if (!data.question || !data.options || data.correctAnswer === undefined) {
    throw new Error("Quiz question, options, and correctAnswer are required");
  }

  try {
    return await db.insert(quizQuestions).values(data);
  } catch (error) {
    console.error("[Database] Failed to create quiz question:", error);
    throw error;
  }
}

export async function updateQuizQuestionStatus(id: number, status: string) {
  const db = await getDb();
  
  if (!["pending", "approved", "rejected"].includes(status)) {
    throw new Error("Invalid status value");
  }

  try {
    return await db.update(quizQuestions).set({ status: status as any }).where(eq(quizQuestions.id, id));
  } catch (error) {
    console.error("[Database] Failed to update quiz question status:", error);
    throw error;
  }
}

export async function updateQuizQuestion(id: number, data: Partial<InsertQuizQuestion>) {
  const db = await getDb();
  
  try {
    return await db.update(quizQuestions).set(data).where(eq(quizQuestions.id, id));
  } catch (error) {
    console.error("[Database] Failed to update quiz question:", error);
    throw error;
  }
}

export async function deleteQuizQuestion(id: number) {
  const db = await getDb();
  
  try {
    return await db.delete(quizQuestions).where(eq(quizQuestions.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete quiz question:", error);
    throw error;
  }
}

// Moderation queries - get all pending items
export async function getPendingContent() {
  const db = await getDb();
  
  try {
    const pendingArticles = await db.select().from(articles).where(eq(articles.status, "pending"));
    const pendingVideos = await db.select().from(videos).where(eq(videos.status, "pending"));
    const pendingMindMaps = await db.select().from(mindMaps).where(eq(mindMaps.status, "pending"));
    const pendingQuizzes = await db.select().from(quizQuestions).where(eq(quizQuestions.status, "pending"));
    
    return {
      articles: pendingArticles,
      videos: pendingVideos,
      mindMaps: pendingMindMaps,
      quizzes: pendingQuizzes,
    };
  } catch (error) {
    console.error("[Database] Failed to get pending content:", error);
    throw error;
  }
}
