/* eslint-disable max-classes-per-file */
import * as Path from 'path';
import { LogFileTransport } from '#transport/LogFileTransport';
import { LogLevel } from '#type/LogLevel';
import { Loggable } from '#root/Loggable';
import { Logger } from '#root/Logger';
import { LoggerProxy } from '#type/LoggerProxy';
import { logger } from '#root/LoggerDecorator';

Logger.addDefaultTransport();
Logger.addTransport('fileLogger', new LogFileTransport(Path.join(__dirname, '../../logs'), 7, LogLevel.DEBUG));

const taggedLogger: LoggerProxy = Logger.tag('taggedLogger');
Logger.setShard(1);

Logger.debug('VeryLongTagName', 'foo bar baz');
Logger.info('Short', 'foo bar baz');

taggedLogger.warn('Foo Bar Baz');
taggedLogger.error('Foo Bar Baz');

class TestClass
{
	@logger
	private _logger!: LoggerProxy;

	public constructor()
	{
		this._logger.info('I\'m being constructed');
	}
}

const test: TestClass = new TestClass();
taggedLogger.info('bar', test);

class Test
{
	public foo: string = 'bar';
}

class TestClass2 extends Loggable('TestClass2', Test)
{
	public constructor()
	{
		super();
		this.logger.info('I\'m also being constructed');
		this.logger.info(this.foo);
	}
}

const test2: TestClass2 = new TestClass2();
taggedLogger.info(test2);
