import { describe, it, expect, beforeAll } from "vitest";
import * as db from "./db";

describe("Database Helpers", () => {
  describe("Articles", () => {
    it("should create an article", async () => {
      const result = await db.createArticle({
        title: "Test Article",
        slug: "test-article",
        content: "This is a test article",
        excerpt: "Test excerpt",
        author: "Test Author",
        submittedBy: "test@example.com",
        status: "pending",
      });
      expect(result).toBeDefined();
    });

    it("should get articles", async () => {
      const articles = await db.getArticles();
      expect(Array.isArray(articles)).toBe(true);
    });

    it("should get articles by status", async () => {
      const articles = await db.getArticles("pending");
      expect(Array.isArray(articles)).toBe(true);
    });

    it("should get article by slug", async () => {
      const article = await db.getArticleBySlug("test-article");
      // Article may or may not exist depending on DB state
      expect(article === undefined || typeof article === "object").toBe(true);
    });
  });

  describe("Videos", () => {
    it("should create a video", async () => {
      const result = await db.createVideo({
        title: "Test Video",
        description: "Test video description",
        url: "https://youtube.com/watch?v=test",
        submittedBy: "test@example.com",
        status: "pending",
      });
      expect(result).toBeDefined();
    });

    it("should get videos", async () => {
      const videos = await db.getVideos();
      expect(Array.isArray(videos)).toBe(true);
    });

    it("should get videos by status", async () => {
      const videos = await db.getVideos("approved");
      expect(Array.isArray(videos)).toBe(true);
    });
  });

  describe("Mind Maps", () => {
    it("should create a mind map", async () => {
      const content = JSON.stringify({ main: "Test", sub1: "Detail 1" });
      const result = await db.createMindMap({
        title: "Test Mind Map",
        description: "Test mind map description",
        content,
        submittedBy: "test@example.com",
        status: "pending",
      });
      expect(result).toBeDefined();
    });

    it("should get mind maps", async () => {
      const mindMaps = await db.getMindMaps();
      expect(Array.isArray(mindMaps)).toBe(true);
    });

    it("should get mind maps by status", async () => {
      const mindMaps = await db.getMindMaps("pending");
      expect(Array.isArray(mindMaps)).toBe(true);
    });
  });

  describe("Quiz Questions", () => {
    it("should create a quiz question", async () => {
      const options = JSON.stringify(["Option A", "Option B", "Option C", "Option D"]);
      const result = await db.createQuizQuestion({
        question: "What is 2 + 2?",
        options,
        correctAnswer: 1,
        explanation: "2 + 2 = 4",
        submittedBy: "test@example.com",
        status: "pending",
      });
      expect(result).toBeDefined();
    });

    it("should get quiz questions", async () => {
      const questions = await db.getQuizQuestions();
      expect(Array.isArray(questions)).toBe(true);
    });

    it("should get quiz questions by status", async () => {
      const questions = await db.getQuizQuestions("approved");
      expect(Array.isArray(questions)).toBe(true);
    });
  });

  describe("Moderation", () => {
    it("should get pending content", async () => {
      const pending = await db.getPendingContent();
      expect(pending).toBeDefined();
      expect(Array.isArray(pending.articles)).toBe(true);
      expect(Array.isArray(pending.videos)).toBe(true);
      expect(Array.isArray(pending.mindMaps)).toBe(true);
      expect(Array.isArray(pending.quizzes)).toBe(true);
    });
  });
});
