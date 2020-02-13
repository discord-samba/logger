import { LogLevel } from './LogLevel';
import { LoggerTransport } from '../LoggerTransport';

/**
 * Represents a tagged logger, ie. the logging methods will not expect a tag
 * parameter because it has already been provided within the proxy. All other
 * methods remain the same
 */
export interface LoggerProxy
{
	addTransport(key: string, transport: LoggerTransport): void;
	removeTransport(key: string): void;
	addDefaultTransport(level?: LogLevel): void;
	removeDefaultTransport(): void;
	setLogLevel(level: LogLevel): void;
	setShard(shard: number): void;
	tag(tag: string): LoggerProxy;
	info(data: any, ...rest: any[]): void;
	warn(data: any, ...rest: any[]): void;
	error(data: any, ...rest: any[]): void;
	debug(data: any, ...rest: any[]): void;
}
