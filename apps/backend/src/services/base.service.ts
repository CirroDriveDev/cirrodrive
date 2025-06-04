import { injectable, inject } from "inversify";
import type { Logger } from "pino";
import { Symbols } from "#types/symbols";

/**
 * Base service class that provides logger functionality to all services
 */
@injectable()
export abstract class BaseService {
  protected log: Logger;

  constructor(@inject(Symbols.Logger) logger: Logger) {
    this.log = logger.child({ component: new.target.name });
  }

  /**
   * Create a child logger with additional context
   */
  protected createChildLogger(metadata: Record<string, unknown>): Logger {
    return this.log.child(metadata);
  }
}
