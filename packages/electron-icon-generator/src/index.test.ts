import path from 'node:path';
import {describe, expect, test, vi} from 'vitest';

const mkdirMock = vi.hoisted(() => vi.fn());
const renameMock = vi.hoisted(() => vi.fn());
const iconGenMock = vi.hoisted(() => vi.fn());
const jimpReadMock = vi.hoisted(() => vi.fn());

vi.mock('node:fs/promises', () => ({
  default: {
    mkdir: mkdirMock,
    rename: renameMock,
  },
}));

vi.mock('icon-gen', () => ({
  default: iconGenMock,
}));

vi.mock('jimp', () => ({
  Jimp: {
    read: jimpReadMock,
  },
}));

const modulePromise = import('./index.js');

describe('IconGenerator', () => {
  test('resolves constructor input and output paths', async () => {
    const {IconGenerator} = await modulePromise;
    const generator = new IconGenerator({input: './in.png', output: './out', silent: true});

    expect((generator as any).options.input).toBe(path.resolve('./in.png'));
    expect((generator as any).options.output).toBe(path.resolve('./out'));
  });

  test('logConsole is silent when silent option is true', async () => {
    const {IconGenerator} = await modulePromise;
    const generator = new IconGenerator({input: './in.png', output: './out', silent: true});
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

    (generator as any).logConsole('test message');

    expect(infoSpy).not.toHaveBeenCalled();
  });

  test('createPNG creates output folders and writes resized file', async () => {
    mkdirMock.mockResolvedValue(undefined);
    renameMock.mockResolvedValue(undefined);
    const writeMock = vi.fn().mockResolvedValue(undefined);
    const resizeMock = vi.fn();
    jimpReadMock.mockResolvedValue({resize: resizeMock, write: writeMock});
    const {IconGenerator} = await modulePromise;
    const generator = new IconGenerator({input: './in.png', output: './out', silent: true});

    const message = await (generator as any).createPNG(128);

    expect(mkdirMock).toHaveBeenCalled();
    expect(resizeMock).toHaveBeenCalledWith({h: 128, w: 128});
    expect(writeMock).toHaveBeenCalledWith(expect.stringMatching(/128\.png$/));
    expect(message).toContain('Created');
  });

  test('renamePNGs renames file and logs completion on last item', async () => {
    renameMock.mockResolvedValue(undefined);
    const {IconGenerator} = await modulePromise;
    const generator = new IconGenerator({input: './in.png', output: './out', silent: true});

    await (generator as any).renamePNGs(8);

    expect(renameMock).toHaveBeenCalledTimes(1);
    expect(renameMock.mock.calls[0][0]).toMatch(/1024\.png$/);
    expect(renameMock.mock.calls[0][1]).toMatch(/1024x1024\.png$/);
  });

  test('start runs generation and icon conversion', async () => {
    mkdirMock.mockResolvedValue(undefined);
    renameMock.mockResolvedValue(undefined);
    iconGenMock.mockResolvedValue(undefined);
    const writeMock = vi.fn().mockResolvedValue(undefined);
    const resizeMock = vi.fn();
    jimpReadMock.mockResolvedValue({resize: resizeMock, write: writeMock});
    const {IconGenerator} = await modulePromise;
    const generator = new IconGenerator({input: './in.png', output: './out', silent: true});

    await generator.start();

    expect(iconGenMock).toHaveBeenCalledTimes(2);
    expect(renameMock).toHaveBeenCalledTimes(9);
  });
});
