/* eslint-disable max-classes-per-file */
import * as Path from 'path';
import { LogFileTransport } from '../transports/LogFileTransport';
import { LogLevel } from '../types/LogLevel';
import { Loggable } from '../Loggable';
import { Logger } from '../Logger';
import { LoggerProxy } from '../types/LoggerProxy';
import { logger } from '../LoggerDecorator';

Logger.addDefaultTransport();
Logger.addTransport('fileLogger', new LogFileTransport(Path.join(__dirname, '../..', 'logs'), 7, LogLevel.INFO));

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
taggedLogger.info('bar', test as any);

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
