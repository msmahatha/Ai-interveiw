import { Request, Response, NextFunction } from 'express';

export const logger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  const { method, url, ip } = req;
  const userAgent = req.get('User-Agent') || '';

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    
    // Color codes for different status codes
    let statusColor = '\x1b[32m'; // Green for 2xx
    if (statusCode >= 400 && statusCode < 500) {
      statusColor = '\x1b[33m'; // Yellow for 4xx
    } else if (statusCode >= 500) {
      statusColor = '\x1b[31m'; // Red for 5xx
    }

    console.log(
      `${new Date().toISOString()} - ${method} ${url} ${statusColor}${statusCode}\x1b[0m ${duration}ms - ${ip}`
    );
  });

  next();
};