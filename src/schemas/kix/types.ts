export type KixYesNo = "yes" | "no";

export type MatrixRowValue = Record<string, unknown>;

export interface IKixEnvResponse extends Record<string, unknown> {
  company_name?: string;
  department?: string;
  address?: string;
  contact_name?: string;
  phone_number?: string;
  email?: string;
  has_co2_target?: KixYesNo;
  use_electricity?: KixYesNo;
  use_gas?: KixYesNo;
  use_vehicle?: KixYesNo;
  use_non_vehicle_fuel?: KixYesNo;
  has_ev_hydrogen_station?: KixYesNo;
  use_water?: KixYesNo;
  generate_waste?: KixYesNo;
  vehicle_fuel_data?: MatrixRowValue[];
  non_vehicle_fuel_data?: MatrixRowValue[];
  ev_hydrogen_station_data?: MatrixRowValue[];
}
