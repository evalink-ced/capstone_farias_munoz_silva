export interface TableComponentProps {
  columns: string[];
  data: any[];
  buttonText?: string;
  onButtonClick?: (userId: number) => void;
}
