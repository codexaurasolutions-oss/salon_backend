import { Request, Response } from 'express';
import { prisma } from '../server';

export class KnowledgeBaseController {
  
  static async getArticles(req: Request, res: Response) {
    try {
      const articles = await prisma.knowledgeBaseArticle.findMany({
        where: { is_published: true },
        orderBy: { created_at: 'desc' }
      });
      res.json({ articles });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch articles' });
    }
  }

  static async getArticle(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const article = await prisma.knowledgeBaseArticle.findUnique({
        where: { slug }
      });
      if (!article) return res.status(404).json({ error: 'Article not found' });
      res.json({ article });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch article' });
    }
  }

  static async createArticle(req: Request, res: Response) {
    try {
      const { title, slug, content, category, is_published } = req.body;
      const article = await prisma.knowledgeBaseArticle.create({
        data: { title, slug, content, category, is_published }
      });
      res.status(201).json({ message: 'Article created', data: article });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to create article' });
    }
  }

  static async updateArticle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;
      const article = await prisma.knowledgeBaseArticle.update({
        where: { id },
        data
      });
      res.json({ message: 'Article updated', data: article });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update article' });
    }
  }
}
