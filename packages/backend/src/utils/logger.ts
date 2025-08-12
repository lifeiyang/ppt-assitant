import fs from 'fs';
import path from 'path';
import config from '../config';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  meta?: any;
  requestId?: string;
}

class Logger {
  private logLevel: LogLevel;
  private logDir: string;

  constructor() {
    this.logLevel = this.getLogLevel(config.logging.level);
    this.logDir = path.join(process.cwd(), 'logs');
    this.ensureLogDirectory();
  }

  private getLogLevel(level: string): LogLevel {
    switch (level.toLowerCase()) {
      case 'error': return LogLevel.ERROR;
      case 'warn': return LogLevel.WARN;
      case 'info': return LogLevel.INFO;
      case 'debug': return LogLevel.DEBUG;
      default: return LogLevel.INFO;
    }
  }

  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private formatMessage(level: string, message: string, meta?: any, requestId?: string): string {
    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...(meta && { meta }),
      ...(requestId && { requestId }),
    };

    return JSON.stringify(logEntry);
  }

  private writeToFile(_level: string, formattedMessage: string): void {
    const date = new Date().toISOString().split('T')[0];
    const filename = `${date}.log`;
    const filepath = path.join(this.logDir, filename);
    
    fs.appendFileSync(filepath, formattedMessage + '\n');
  }

  private log(level: LogLevel, levelName: string, message: string, meta?: any, requestId?: string): void {
    if (level <= this.logLevel) {
      const formattedMessage = this.formatMessage(levelName, message, meta, requestId);
      
      // Console output with colors
      const colors = {
        ERROR: '\x1b[31m', // Red
        WARN: '\x1b[33m',  // Yellow
        INFO: '\x1b[36m',  // Cyan
        DEBUG: '\x1b[90m', // Gray
      };
      
      const color = colors[levelName as keyof typeof colors] || '';
      const reset = '\x1b[0m';
      
      console.log(`${color}${formattedMessage}${reset}`);
      
      // File output
      this.writeToFile(levelName, formattedMessage);
    }
  }

  error(message: string, meta?: any, requestId?: string): void {
    this.log(LogLevel.ERROR, 'ERROR', message, meta, requestId);
  }

  warn(message: string, meta?: any, requestId?: string): void {
    this.log(LogLevel.WARN, 'WARN', message, meta, requestId);
  }

  info(message: string, meta?: any, requestId?: string): void {
    this.log(LogLevel.INFO, 'INFO', message, meta, requestId);
  }

  debug(message: string, meta?: any, requestId?: string): void {
    this.log(LogLevel.DEBUG, 'DEBUG', message, meta, requestId);
  }
}

export const logger = new Logger();
export default logger;