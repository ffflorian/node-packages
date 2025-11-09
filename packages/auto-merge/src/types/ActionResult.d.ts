export interface ActionResult {
  error?: string;
  pullNumber: number;
  status: 'bad' | 'good';
}
