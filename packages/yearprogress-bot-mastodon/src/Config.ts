import * as fs from 'fs';
import * as path from 'path';

export class Config<T extends string> {
  private readonly configFile: string;
  private readonly config: Record<T, any>;

  constructor(configFile: string) {
    this.configFile = path.resolve(configFile);
    this.config = JSON.parse(this.loadFile());
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

  get(key: T): any {
    return this.config[key];
  }

  set(key: T, value: any): void {
    this.config[key] = value;
    this.saveFile();
  }
}
