export interface Project {
  id: number;
  name: string;
  description: string;
  folder_name: string;
  path: string;
  url: string;
  is_static: number; 
  package_json_path: string;
  default_script: string;
  scripts: string;
  env: string;
  created_at: string;
}
