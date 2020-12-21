/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable max-classes-per-file, @typescript-eslint/no-extraneous-class */
import { Constructable } from '#type/Constructable';
import { LoggableClass } from '#type/LoggableClass';
import { Logger } from '#root/Logger';
import { LoggerProxy } from '#type/LoggerProxy';
import { ProxyLoggable } from '#type/ProxyLoggable';

export function Loggable<T extends Constructable>(Base?: T): Constructable<LoggableClass> & T;
export function Loggable<T extends Constructable>(tag: string, Base?: T): Constructable<ProxyLoggable> & T;

/**
 * Classes that extend this mixin function will receive a public `logger` property
 * containing a reference to the Logger module, or to a tagged LoggerProxy depending
 * on whether or not a tag is provided.
 *
 * A base class can be provided which will be extended including the mixin.
 *
 * ```
 * class Foo extends Loggable() {}
 * class Bar extends Loggable(Baz) {}
 * class Boo extends Loggable('Boo', Far) {}
 * ```
 *
 * **NOTE:** This is a function that returns a class, not a class itself. You must
 * call it like a function when using it in a `class extends` context
 * @mixin
 */
export function Loggable<T extends Constructable>(
	...[tag, baseClass = class BaseLoggable {} as any]: [string?, T?]
): Constructable<LoggableClass | ProxyLoggable> & T
{
	const Base: T = typeof tag === 'string' || typeof tag === 'undefined'
		? baseClass
		: tag;

	return class extends Base
	{
		public readonly logger: typeof Logger | LoggerProxy = typeof tag === 'string'
			? Logger.tag(tag)
			: Logger;
	} as Constructable<LoggableClass | ProxyLoggable> & T;
}
