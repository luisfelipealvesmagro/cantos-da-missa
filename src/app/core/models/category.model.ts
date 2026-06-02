export interface Category {
  id?: number;
  name: string;
  icon: string;     // nome do Material Symbol (ex.: 'door_open')
  order: number;
  system?: boolean; // categorias padrão da missa
}
