import { LoggerProxy } from './LoggerProxy';

/**
 * Represents a class that has a `logger` property containing a LoggerProxy
 */
export interface ProxyLoggable
{
	logger: LoggerProxy;
}
