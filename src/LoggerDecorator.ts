import { Logger } from './Logger';

export function logger(key: string): PropertyDecorator;
export function logger<T>(target: T, key: string): void;

/**
 * Property decorator that will assign a tagged Logger proxy to the decorated
 * property where the tag is the name of the parent class of the property
 *
 * Example:
 * ```
 * class FooClass {
 * 	&#64logger // Logging methods will be tagged with `FooClass`
 * 	private readonly logger: typeof Logger;
 * 	...
 * ```
 *
 * The decorator can be given a tag string to manually assign a different tag
 * instead
 *
 * Example:
 * ```
 * class FooClass {
 * 	&#64logger('Bar') // Logging methods will be tagged with `Bar`
 * 	private readonly logger: typeof Logger;
 * 	...
 * ```
 *
 * >**Note:** This is a Typescript feature. If using the logger is desired
 * in Javascript just call the static logging methods on Logger itself
 * `Logger.instance()`
 */
export function logger(...args: any[]): PropertyDecorator | void
{
	if (typeof args[0] === 'string')
		return (<T>(target: T, key: string) =>
		{
			Object.defineProperty(target, key, { value: Logger.tag(args[0]) });
		}) as PropertyDecorator;

	Object.defineProperty(args[0], args[1], { value: Logger.tag(args[0].constructor.name) });
}
