export interface CalendarioEvento {
  id: string;
  title: string;
  start: string;
  end: string;
  full_range?: string;
  ciclo?: string;
  empresa?: string;
  cargo?: string;
  real_start?: string;
  real_end?: string;
  color?: string;
}
