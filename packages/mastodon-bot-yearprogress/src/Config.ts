import * as fs from 'node:fs';
import * as path from 'node:path';

export class Config<T extends string> {
  private readonly config: Record<T, any>;
  private readonly configFile: string;

  constructor(configFile: string) {
    this.configFile = path.resolve(configFile);
    this.config = JSON.parse(this.loadFile());
  }

  get(key: T): any {
    return this.config[key];
  }

  set(key: T, value: any): void {
    this.config[key] = value;
    this.saveFile();
  }

  private loadFile(): string {
    if (!fs.existsSync(this.configFile)) {
      fs.writeFileSync(this.configFile, '{}', 'utf-8');
      return '{}';
    }
    const content = fs.readFileSync(this.configFile, 'utf-8');
    return content || '{}';
  }

  private saveFile(): void {
    fs.writeFileSync(this.configFile, JSON.stringify(this.config, null, 2), 'utf-8');
  }
}
