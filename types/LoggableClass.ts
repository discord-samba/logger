import { Logger } from '#root/Logger';

/**
 * Represents a class that has a `logger` property containing a reference to
 * the Logger module
 */
export interface LoggableClass
{
	logger: typeof Logger;
}
