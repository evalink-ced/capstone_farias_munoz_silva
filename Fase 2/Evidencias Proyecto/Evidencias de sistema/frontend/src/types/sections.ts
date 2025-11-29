export type SectionButton = {
  label: string;
  href: string;
  permiso: string;
};

export type Section = {
  title: string;
  buttons: SectionButton[];
  icon?: string;
  fullWidth?: boolean;
};
