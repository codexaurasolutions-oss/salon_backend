import { Request, Response } from 'express';
import { prisma } from '../server';

export class PlatformProductsController {
  
  static async getProducts(req: Request, res: Response) {
    try {
      const { audience, category } = req.query;
      const where: any = { is_active: true };
      if (audience && audience !== 'all') {
        where.target_audience = { in: [audience as string, 'both'] };
      }
      if (category) {
        where.category = { equals: category as string };
      }
      const products = await prisma.platformProduct.findMany({
        where,
        orderBy: { created_at: 'desc' }
      });
      res.json(products);
    } catch (error: any) {
      console.error('Failed to fetch platform products:', error);
      res.status(500).json({ error: 'Failed to fetch platform products' });
    }
  }

  static async getProductById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await prisma.platformProduct.findUnique({ where: { id } });
      if (!product) return res.status(404).json({ error: 'Product not found' });
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch product' });
    }
  }

  static async createProduct(req: Request, res: Response) {
    try {
      const { name, description, features, sku, price, discount, stock_quantity, image_url, image_url_2, image_url_3, image_url_4, category, brand, target_audience, is_active } = req.body;
      const product = await prisma.platformProduct.create({
        data: {
          name,
          description,
          features,
          sku,
          price: parseFloat(price) || 0,
          discount: discount ? parseFloat(discount) : 0,
          stock_quantity: stock_quantity ? parseInt(stock_quantity) : 0,
          image_url,
          image_url_2,
          image_url_3,
          image_url_4,
          category,
          brand,
          target_audience,
          is_active: is_active !== undefined ? is_active : true
        }
      });
      res.status(201).json(product);
    } catch (error: any) {
      console.error('Failed to create product:', error);
      res.status(500).json({ error: 'Failed to create product', message: error.message });
    }
  }

  static async updateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, features, sku, price, discount, stock_quantity, image_url, image_url_2, image_url_3, image_url_4, category, brand, target_audience, is_active } = req.body;
      const product = await prisma.platformProduct.update({
        where: { id },
        data: {
          name,
          description,
          features,
          sku,
          price: price ? parseFloat(price) : undefined,
          discount: discount !== undefined ? parseFloat(discount) : undefined,
          stock_quantity: stock_quantity !== undefined ? parseInt(stock_quantity) : undefined,
          image_url,
          image_url_2,
          image_url_3,
          image_url_4,
          category,
          brand,
          target_audience,
          is_active
        }
      });
      res.json(product);
    } catch (error: any) {
      console.error('Failed to update product:', error);
      res.status(500).json({ error: 'Failed to update product', message: error.message });
    }
  }

  static async deleteProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.platformProduct.delete({ where: { id } });
      res.json({ message: 'Product deleted successfully' });
    } catch (error: any) {
      console.error('Failed to delete product:', error);
      res.status(500).json({ error: 'Failed to delete product', message: error.message });
    }
  }
}
