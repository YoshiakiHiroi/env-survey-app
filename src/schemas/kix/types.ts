export type KixBusinessSector =
  | "製造業"
  | "サービス業"
  | "小売・卸売業"
  | "その他";

export interface IKixEnvResponse {
  company_name: string;
  business_sector?: KixBusinessSector;
  electricity_usage?: number;
  gas_usage?: number;
}
