import { Logger } from '../Logger';
import { logger } from '../LoggerDecorator';

const taggedLogger: typeof Logger = Logger.tag('foo');
Logger.setShard(5);

Logger.debug('VeryLongTagName', 'foo bar baz');
Logger.log('Short', 'foo bar baz');

taggedLogger.error('Foo Bar Baz');

class TestClass
{
	@logger
	private _logger!: typeof Logger;

	public constructor()
	{
		this._logger.log('I\'m being constructed');
	}
}

const test: TestClass = new TestClass();
taggedLogger.log('bar', test as any);
