export interface Entry {
  fullPath: string;
  name: string;
  type: 'directory' | 'file' | 'link';
}

export interface FileEntry extends Entry {
  size: number;
  type: 'file';
}

export interface LinkEntry extends Entry {
  type: 'link';
}

export interface DirEntry extends Entry {
  directories: Record<string, DirEntry>;
  files: Record<string, FileEntry>;
  links: Record<string, LinkEntry>;
  type: 'directory';
}
