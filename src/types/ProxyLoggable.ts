import { LoggerProxy } from '#type/LoggerProxy';

/**
 * Represents a class that has a `logger` property containing a LoggerProxy
 */
export interface ProxyLoggable
{
	logger: LoggerProxy;
}
