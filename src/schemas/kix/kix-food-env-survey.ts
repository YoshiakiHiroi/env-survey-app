type SurveyChoice = {
  value: string;
  text: string;
};

type SurveyElement = Record<string, unknown>;
type MatrixColumn = Record<string, unknown>;
type MatrixRow = {
  value: string;
  text: string;
};

const yesNoChoices: SurveyChoice[] = [
  { value: "yes", text: "はい" },
  { value: "no", text: "いいえ" },
];

const targetRows: MatrixRow[] = [
  { value: "y2030", text: "2030年度の内容" },
  { value: "y2050", text: "2050年度の内容" },
  { value: "other", text: "上記以外の目標年度の内容" },
];

const targetDefaultValue = {
  y2030: { target_year: 2030, base_year: 2013 },
  y2050: { target_year: 2050, base_year: 2013 },
};

const months = [
  { name: "apr", title: "4月" },
  { name: "may", title: "5月" },
  { name: "jun", title: "6月" },
  { name: "jul", title: "7月" },
  { name: "aug", title: "8月" },
  { name: "sep", title: "9月" },
  { name: "oct", title: "10月" },
  { name: "nov", title: "11月" },
  { name: "dec", title: "12月" },
  { name: "jan", title: "1月" },
  { name: "feb", title: "2月" },
  { name: "mar", title: "3月" },
];

const monthExpression = months
  .map((month) => `{row.${month.name}}`)
  .join(" + ");

const numberValidator = [
  {
    type: "numeric",
    minValue: 0,
    text: "0以上の数値を入力してください。",
  },
];

const monthColumns: MatrixColumn[] = months.map((month) => ({
  name: month.name,
  title: month.title,
  cellType: "text",
  inputType: "number",
  minWidth: "72px",
  validators: numberValidator,
}));

function visible(visibleIf?: string): Record<string, string> {
  return visibleIf ? { visibleIf } : {};
}

function radio(
  name: string,
  title: string,
  choices: SurveyChoice[],
  visibleIf?: string,
): SurveyElement {
  return {
    type: "radiogroup",
    name,
    title,
    choices,
    isRequired: true,
    ...visible(visibleIf),
  };
}

function yesNo(name: string, title: string): SurveyElement {
  return radio(name, title, yesNoChoices);
}

function comment(
  name: string,
  title: string,
  visibleIf?: string,
): SurveyElement {
  return {
    type: "comment",
    name,
    title,
    rows: 4,
    autoGrow: true,
    ...visible(visibleIf),
  };
}

function note(name: string, html: string, visibleIf?: string): SurveyElement {
  return {
    type: "html",
    name,
    html: `<div class="survey-note">${html}</div>`,
    ...visible(visibleIf),
  };
}

function heading(
  name: string,
  text: string,
  tone?: string,
  visibleIf?: string,
): SurveyElement {
  const toneClass = tone ? ` survey-heading--${tone}` : "";

  return {
    type: "html",
    name,
    html: `<div class="survey-heading${toneClass}">${text}</div>`,
    ...visible(visibleIf),
  };
}

function totalColumn(title = "年度合計"): MatrixColumn {
  return {
    name: "total",
    title,
    cellType: "expression",
    expression: monthExpression,
    displayStyle: "currency",
    currencySymbol: "",
    minWidth: "100px",
  };
}

function fixedMonthlyMatrix(
  name: string,
  title: string,
  rows: MatrixRow[],
  visibleIf?: string,
  extraColumns: MatrixColumn[] = [],
): SurveyElement {
  return {
    type: "matrixdropdown",
    name,
    title,
    rows,
    columns: [...monthColumns, totalColumn(), ...extraColumns],
    alternateRows: true,
    columnLayout: "horizontal",
    ...visible(visibleIf),
  };
}

function targetMatrix(
  name: string,
  title: string,
  baseAmountTitle: string,
  visibleIf?: string,
  factorTitle?: string,
): SurveyElement {
  const columns: MatrixColumn[] = [
    {
      name: "target_year",
      title: "目標年度",
      cellType: "text",
      inputType: "number",
      minWidth: "78px",
    },
    {
      name: "base_year",
      title: "基準年度",
      cellType: "text",
      inputType: "number",
      minWidth: "78px",
    },
    {
      name: "reduction_value",
      title: "削減目標値",
      cellType: "text",
      inputType: "number",
      minWidth: "96px",
    },
    {
      name: "unit",
      title: "単位",
      cellType: "dropdown",
      choices: ["%", "t-CO2", "kWh", "m3", "L", "t/年", "その他"],
      minWidth: "84px",
    },
    {
      name: "base_amount",
      title: baseAmountTitle,
      cellType: "text",
      inputType: "number",
      minWidth: "120px",
    },
  ];

  if (factorTitle) {
    columns.push({
      name: "co2_factor",
      title: factorTitle,
      cellType: "text",
      inputType: "number",
      minWidth: "140px",
    });
  }

  return {
    type: "matrixdropdown",
    name,
    title,
    cssClass: "survey-target-matrix",
    rows: targetRows,
    columns,
    defaultValue: targetDefaultValue,
    alternateRows: true,
    columnLayout: "horizontal",
    ...visible(visibleIf),
  };
}

function targetDetailFields(
  name: string,
  title: string,
  baseAmountTitle: string,
  visibleIf?: string,
  factorTitle?: string,
  defaultValue?: Record<string, unknown>,
): SurveyElement {
  return {
    type: "panel",
    name,
    title,
    cssClass: "survey-target-detail",
    elements: [
      {
        type: "text",
        name: `${name}_target_year`,
        title: "1) 目標年度",
        inputType: "number",
        defaultValue: defaultValue?.target_year,
        width: "230px",
        minWidth: "190px",
        cssClass: "target-detail-field target-year-with-suffix",
      },
      {
        type: "text",
        name: `${name}_base_year`,
        title: "2) 基準年度",
        inputType: "number",
        defaultValue: defaultValue?.base_year,
        startWithNewLine: false,
        width: "230px",
        minWidth: "190px",
        cssClass: "target-detail-field target-base-year-with-suffix",
      },
      {
        type: "text",
        name: `${name}_reduction_value`,
        title: "3) 削減目標値",
        inputType: "number",
        startWithNewLine: false,
        width: "170px",
        minWidth: "150px",
        cssClass: "target-detail-field target-reduction-value",
      },
      {
        type: "dropdown",
        name: `${name}_unit`,
        title: "（単位）",
        choices: ["%", "t-CO2"],
        allowClear: false,
        startWithNewLine: false,
        width: "240px",
        minWidth: "210px",
        cssClass: "target-detail-field target-reduction-unit-with-suffix",
      },
      {
        type: "text",
        name: `${name}_base_amount`,
        title: baseAmountTitle,
        inputType: "number",
        width: "310px",
        minWidth: "260px",
        cssClass: "target-detail-field target-base-amount-with-suffix",
      },
      ...(factorTitle
        ? [
            {
              type: "text",
              name: `${name}_co2_factor`,
              title: factorTitle.replace(" (t-CO2/kWh)", ""),
              inputType: "number",
              startWithNewLine: false,
              width: "360px",
              minWidth: "300px",
              cssClass: "target-detail-field target-co2-factor-with-suffix",
            },
          ]
        : []),
    ],
    ...visible(visibleIf),
  };
}

function fuelColumns(itemTitle: string): MatrixColumn[] {
  return [
    {
      name: "item_name",
      title: itemTitle,
      cellType: "text",
      isRequired: true,
      minWidth: "170px",
    },
    {
      name: "count",
      title: "台数",
      cellType: "text",
      inputType: "number",
      minWidth: "80px",
      validators: numberValidator,
    },
    {
      name: "unit",
      title: "単位",
      cellType: "dropdown",
      choices: ["台", "基", "その他"],
      minWidth: "80px",
      defaultValue: "台",
    },
    {
      name: "fuel_type",
      title: "使用燃料",
      cellType: "dropdown",
      choices: [
        "軽油",
        "ガソリン",
        "LPG",
        "灯油",
        "重油",
        "都市ガス",
        "プロパンガス",
        "その他",
      ],
      minWidth: "130px",
    },
    ...monthColumns,
    totalColumn("年度計"),
    {
      name: "remarks",
      title: "備考",
      cellType: "text",
      minWidth: "160px",
    },
  ];
}

function updateMatrix(
  name: string,
  title: string,
  itemTitle: string,
  detailTitle: string,
  visibleIf: string,
): SurveyElement {
  return {
    type: "matrixdynamic",
    name,
    title,
    visibleIf,
    addRowText: "行を追加",
    removeRowText: "削除",
    rowCount: 1,
    columns: [
      {
        name: "item_name",
        title: itemTitle,
        cellType: "text",
        minWidth: "170px",
      },
      {
        name: "updated_at",
        title: "更新時期",
        cellType: "text",
        inputType: "date",
        minWidth: "130px",
      },
      {
        name: "detail",
        title: detailTitle,
        cellType: "comment",
        minWidth: "280px",
      },
    ],
  };
}

function renewableFacilityMatrix(
  name: string,
  title: string,
  capacityTitle: string,
  visibleIf?: string,
): SurveyElement {
  return {
    type: "matrixdynamic",
    name,
    title,
    rowCount: 1,
    addRowText: "設備を追加",
    removeRowText: "削除",
    columns: [
      {
        name: "energy_type",
        title: "再生可能エネルギー種別",
        cellType: "text",
        minWidth: "170px",
      },
      {
        name: "installed_at",
        title: "設置時期・目標年度",
        cellType: "text",
        minWidth: "130px",
      },
      {
        name: "location",
        title: "設置場所",
        cellType: "text",
        minWidth: "160px",
      },
      {
        name: "capacity_kw",
        title: capacityTitle,
        cellType: "text",
        inputType: "number",
        minWidth: "180px",
      },
      { name: "owner", title: "所有者", cellType: "text", minWidth: "130px" },
      {
        name: "usage",
        title: "電力利用先",
        cellType: "text",
        minWidth: "130px",
      },
      { name: "remarks", title: "備考", cellType: "text", minWidth: "150px" },
    ],
    ...visible(visibleIf),
  };
}

const co2TargetChoices: SurveyChoice[] = [
  {
    value: "1",
    text: "1. CO2排出量の削減目標を設定している。",
  },
  {
    value: "2",
    text: "2. 削減目標は設定していないが、脱炭素の取り組みは行っている。",
  },
  {
    value: "3",
    text: "3. 削減目標の設定や脱炭素の取り組みは特にしていない。",
  },
];

const reductionStatusChoices = (subject: string): SurveyChoice[] => [
  {
    value: "1",
    text: `1. ${subject}の削減目標を設定している。`,
  },
  {
    value: "2",
    text: `2. ${subject}の削減目標は設定していないが、削減の取り組みは行っている。`,
  },
  {
    value: "3",
    text: `3. ${subject}の削減目標の設定や削減の取り組みは特にしていない。`,
  },
];

const updateStatusChoices = (subject: string): SurveyChoice[] => [
  { value: "1", text: `1. 2024年度中に${subject}を更新している。` },
  { value: "2", text: `2. 2024年度中に${subject}を更新していない。` },
];

export const surveyJson = {
  title: "2025年度 仮想空港 環境関連データ 調査票 (飲食テナント)",
  showProgressBar: "top",
  firstPageIsStartPage: false,
  questionTitleLocation: "top",
  pages: [
    {
      name: "page_index",
      title: "ご担当者情報 および 設問の選択",
      elements: [
        {
          type: "panel",
          name: "contact_info",
          title: "(1) ご回答された方についてお教えください",
          elements: [
            {
              type: "text",
              name: "company_name",
              title: "貴社名",
              isRequired: true,
              defaultValue: "",
            },
            { type: "text", name: "department", title: "ご所属" },
            { type: "text", name: "address", title: "ご住所" },
            {
              type: "text",
              name: "contact_name",
              title: "お名前",
              isRequired: true,
            },
            { type: "text", name: "phone_number", title: "電話番号" },
            {
              type: "text",
              name: "email",
              title: "メールアドレス",
              inputType: "email",
            },
          ],
        },
        {
          type: "panel",
          name: "survey_targets",
          title:
            "(2) 下記の質問に「はい/いいえ」でお答えいただき、回答が必要なページをご確認ください。",
          elements: [
            heading("co2_target_heading", "CO2排出量の目標値について：", "co2"),
            yesNo(
              "has_co2_target",
              "空港内の事業所・店舗において将来のCO2排出量に関する目標を定められていますか。",
            ),
            heading(
              "energy_consumption_heading",
              "①　空港施設のエネルギー消費量について",
              "energy",
            ),
            yesNo(
              "use_electricity",
              "①-1) 電気：空港内の事業所・店舗で電気を使用していますか。",
            ),
            yesNo(
              "use_gas",
              "①-2) ガス：空港内の事業所・店舗でガスを使用していますか。",
            ),
            heading("fuel_heading", "②　燃料について", "fuel"),
            yesNo(
              "use_vehicle",
              "②-1) 車両用の燃料：空港内の事業所・店舗で車両を使用していますか。",
            ),
            yesNo(
              "use_non_vehicle_fuel",
              "②-2) 車両用以外の燃料：空港内の事業所・店舗で車両用以外に燃料を使用していますか。",
            ),
            yesNo(
              "has_ev_hydrogen_station",
              "②-3) EV充電器・水素ステーション：空港内にEV充電器もしくは水素ステーションを所有していますか。",
            ),
            heading("water_heading", "③　水について", "water"),
            yesNo("use_water", "空港内の事業所・店舗で水を使用していますか。"),
            heading("waste_heading", "④　廃棄物について", "waste"),
            yesNo(
              "generate_waste",
              "空港内の事業所・店舗で廃棄物（一般・産業）は発生しますか。",
            ),
          ],
        },
      ],
    },
    {
      name: "page_co2",
      title: "■ CO2排出量削減目標",
      visibleIf: "{has_co2_target} = 'yes'",
      elements: [
        radio(
          "co2_target_status",
          "(1) 仮想空港における店舗のCO2排出量についてご回答ください。",
          co2TargetChoices,
        ),
        {
          type: "panel",
          name: "co2_target_details",
          title: "(2) CO2削減目標の内容をご記入ください。",
          visibleIf: "{co2_target_status} = '1'",
          cssClass: "survey-target-group",
          elements: [
            heading("co2_target_2030_heading", "①2030年度の内容", "co2"),
            targetDetailFields(
              "co2_target_2030",
              "2030年度の目標内容",
              "基準年度のCO2排出量",
              undefined,
              "想定する電気のCO2排出係数 (t-CO2/kWh)",
              { target_year: 2030, base_year: 2013 },
            ),
            heading("co2_target_2050_heading", "②2050年度の内容", "co2"),
            targetDetailFields(
              "co2_target_2050",
              "2050年度の目標内容",
              "基準年度のCO2排出量",
              undefined,
              "想定する電気のCO2排出係数 (t-CO2/kWh)",
              { target_year: 2050, base_year: 2013 },
            ),
            heading(
              "co2_target_other_heading",
              "③上記以外の目標年度の内容",
              "co2",
            ),
            targetDetailFields(
              "co2_target_other",
              "上記以外の目標内容",
              "基準年度のCO2排出量",
              undefined,
              "想定する電気のCO2排出係数 (t-CO2/kWh)",
            ),
          ],
        },
        comment(
          "co2_initiatives_current",
          "(3)-1 すでに実施されている脱炭素の取り組みがございましたら教えてください。",
          "{co2_target_status} = '1' or {co2_target_status} = '2'",
        ),
        comment(
          "co2_initiatives_future",
          "(3)-2 今後実施を予定している脱炭素の取り組みがございましたら教えてください。",
          "{co2_target_status} = '1' or {co2_target_status} = '2'",
        ),
      ],
    },
    {
      name: "page_electricity",
      title: "■ 電気（2024年度 エネルギー使用量）",
      visibleIf: "{use_electricity} = 'yes'",
      elements: [
        radio(
          "elec_usage_status",
          "① 電気の使用状況について、該当する回答項目の番号をご回答ください。",
          [
            {
              value: "1",
              text: "1. 店舗で電気を使用しており、請求は仮想エアポート(株)から受けている。",
            },
            {
              value: "2",
              text: "2. 店舗で電気を使用しているが、請求は仮想エアポート(株)から受けていない。",
            },
            { value: "3", text: "3. 空港内店舗で電気は使用していない。" },
          ],
        ),
        fixedMonthlyMatrix(
          "electricity_usage_monthly",
          "② 毎月の電力使用量をご記入ください。",
          [
            { value: "normal", text: "通常電力量 (kWh)" },
            {
              value: "renewable_purchase",
              text: "再エネ由来電力の購入量 (kWh)",
            },
            {
              value: "self_consumption_1",
              text: "自家消費量 (再エネ種別毎) (kWh)",
            },
            {
              value: "self_consumption_2",
              text: "自家消費量 (再エネ種別毎) (kWh)",
            },
          ],
          "{elec_usage_status} = '2'",
          [
            {
              name: "renewable_type",
              title: "再エネ種別・備考",
              cellType: "text",
              minWidth: "180px",
            },
          ],
        ),
        {
          type: "text",
          name: "electricity_supplier",
          title: "請求を受けている電力会社名",
          visibleIf: "{elec_usage_status} = '2'",
        },
        {
          type: "multipletext",
          name: "renewable_power_plan",
          title:
            "再エネ由来の電力プランをご利用の場合は、プラン名とCO2排出係数をご記入ください。",
          visibleIf: "{elec_usage_status} = '2'",
          items: [
            { name: "plan_name", title: "再エネ由来電力プラン名称" },
            {
              name: "co2_factor",
              title: "利用プランのCO2排出係数 (t-CO2/kWh)",
              inputType: "number",
            },
          ],
        },
        radio(
          "renewable_plan_status",
          "③ 2024年度以降の再生可能エネルギー由来の電力プランの導入予定や検討状況をご回答ください。",
          [
            {
              value: "1",
              text: "1. 導入を予定している、または2024年度から導入している。",
            },
            { value: "2", text: "2. 導入を検討している。" },
            { value: "3", text: "3. 導入予定はなく、検討もしていない。" },
          ],
          "{elec_usage_status} = '1' or {elec_usage_status} = '2'",
        ),
        {
          type: "matrixdynamic",
          name: "renewable_plan_details",
          title: "④ 導入を予定している年度・プランの内容をご記入ください。",
          visibleIf:
            "{renewable_plan_status} = '1' or {renewable_plan_status} = '2'",
          rowCount: 1,
          addRowText: "プランを追加",
          removeRowText: "削除",
          columns: [
            {
              name: "start_year",
              title: "導入予定の年度",
              cellType: "text",
              minWidth: "130px",
            },
            {
              name: "renewable_ratio",
              title: "再エネ由来電力量の比率 (%)",
              cellType: "text",
              inputType: "number",
              minWidth: "160px",
            },
            {
              name: "supplier",
              title: "電力会社名",
              cellType: "text",
              minWidth: "140px",
            },
            {
              name: "plan_name",
              title: "プランの名称",
              cellType: "text",
              minWidth: "160px",
            },
            {
              name: "co2_factor",
              title: "CO2排出係数 (t-CO2/kWh)",
              cellType: "text",
              inputType: "number",
              minWidth: "180px",
            },
          ],
        },
        radio(
          "renewable_facility_status",
          "⑤ 空港敷地内における再生可能エネルギー発電設備の導入状況についてご回答ください。",
          [
            {
              value: "1",
              text: "1. 空港施設内に再生可能エネルギーの発電設備を設置している。",
            },
            {
              value: "2",
              text: "2. 空港施設内に再生可能エネルギーの発電設備を設置していない。",
            },
          ],
          "{elec_usage_status} = '1' or {elec_usage_status} = '2'",
        ),
        renewableFacilityMatrix(
          "renewable_facilities_current",
          "⑥ 設置されている再生可能エネルギー発電設備の設置状況をご記入ください。",
          "2024年3月31日時点の総設置容量 (kW)",
          "{renewable_facility_status} = '1'",
        ),
        renewableFacilityMatrix(
          "renewable_facilities_target_2030",
          "⑦-1 2030年度までの再生可能エネルギー発電設備の導入目標をご記入ください。",
          "2030年度時点の目標総設置容量 (kW)",
          "{renewable_facility_status} = '1' or {renewable_facility_status} = '2'",
        ),
        renewableFacilityMatrix(
          "renewable_facilities_target_2050",
          "⑦-2 2050年度までの再生可能エネルギー発電設備の導入目標をご記入ください。",
          "2050年度時点の目標総設置容量 (kW)",
          "{renewable_facility_status} = '1' or {renewable_facility_status} = '2'",
        ),
        comment(
          "renewable_facility_location_note",
          "⑧ 再生可能エネルギー設置場所・設置予定場所について、補足があればご記入ください。",
          "{renewable_facility_status} = '1' or {renewable_facility_status} = '2'",
        ),
        radio(
          "elec_saving_status",
          "⑨ 電気使用量の削減や節電に関する取り組みについてご回答ください。",
          reductionStatusChoices("電気使用量"),
          "{elec_usage_status} = '1' or {elec_usage_status} = '2'",
        ),
        targetMatrix(
          "elec_reduction_targets",
          "⑩ 電気使用量の削減目標をご記入ください。",
          "基準年度の電気使用量 (kWh)",
          "{elec_saving_status} = '1'",
          "想定する電気のCO2排出係数 (t-CO2/kWh)",
        ),
        comment(
          "elec_saving_current",
          "⑪-1 すでに実施されている節電の取り組みがございましたら教えてください。",
          "{elec_saving_status} = '1' or {elec_saving_status} = '2'",
        ),
        comment(
          "elec_saving_future",
          "⑪-2 今後実施を予定している節電の取り組みがございましたら教えてください。",
          "{elec_saving_status} = '1' or {elec_saving_status} = '2'",
        ),
        radio(
          "elec_equipment_update_status",
          "⑫ 電気を使用する機器の設備更新の有無についてご回答ください。",
          updateStatusChoices("設備機器"),
          "{elec_usage_status} = '1' or {elec_usage_status} = '2'",
        ),
        updateMatrix(
          "elec_equipment_updates",
          "⑬ 機器更新の時期と更新内容をご回答ください。",
          "更新設備",
          "更新内容の詳細（台数や機器仕様など）",
          "{elec_equipment_update_status} = '1'",
        ),
      ],
    },
    {
      name: "page_gas",
      title: "■ ガス（2024年度 エネルギー使用量）",
      visibleIf: "{use_gas} = 'yes'",
      elements: [
        radio(
          "gas_usage_status",
          "① ガスの使用状況について、該当する回答項目の番号をご回答ください。",
          [
            {
              value: "1",
              text: "1. 店舗でガスを使用しており、請求は仮想エアポート(株)から受けている。",
            },
            {
              value: "2",
              text: "2. 店舗でガスを使用しているが、請求は仮想エアポート(株)から受けていない。",
            },
          ],
        ),
        fixedMonthlyMatrix(
          "city_gas_low_pressure_monthly",
          "②-1 都市ガス（低圧）の毎月の使用量をご記入ください。",
          [{ value: "usage", text: "都市ガス使用量 (m3)" }],
          "{gas_usage_status} = '2'",
        ),
        {
          type: "text",
          name: "city_gas_low_pressure_supplier",
          title: "請求を受けているガス会社名（都市ガス・低圧）",
          visibleIf: "{gas_usage_status} = '2'",
        },
        fixedMonthlyMatrix(
          "city_gas_mid_pressure_monthly",
          "②-2 中圧の都市ガスを使用されている場合は、毎月の使用量をご記入ください。",
          [{ value: "usage", text: "中圧ガス使用量 (m3)" }],
          "{gas_usage_status} = '2'",
        ),
        {
          type: "text",
          name: "city_gas_mid_pressure_supplier",
          title: "請求を受けているガス会社名（都市ガス・中圧）",
          visibleIf: "{gas_usage_status} = '2'",
        },
        fixedMonthlyMatrix(
          "propane_gas_monthly",
          "②-3 プロパンガスの毎月の使用量をご記入ください。",
          [{ value: "usage", text: "プロパンガス使用量 (m3)" }],
          "{gas_usage_status} = '2'",
        ),
        {
          type: "text",
          name: "propane_gas_supplier",
          title: "請求を受けているガス会社名（プロパンガス）",
          visibleIf: "{gas_usage_status} = '2'",
        },
        radio(
          "gas_saving_status",
          "③ ガス使用量の削減や節ガスに関する取り組みについてご回答ください。",
          reductionStatusChoices("ガス使用量"),
        ),
        targetMatrix(
          "gas_reduction_targets",
          "④ ガス使用量の削減目標をご記入ください。",
          "基準年度のガス使用量",
          "{gas_saving_status} = '1'",
        ),
        comment(
          "gas_saving_current",
          "⑤-1 すでに実施されている節ガスの取り組みがございましたら教えてください。",
          "{gas_saving_status} = '1' or {gas_saving_status} = '2'",
        ),
        comment(
          "gas_saving_future",
          "⑤-2 今後実施を予定している節ガスの取り組みがございましたら教えてください。",
          "{gas_saving_status} = '1' or {gas_saving_status} = '2'",
        ),
        radio(
          "gas_equipment_update_status",
          "⑥ ガスを使用する機器の設備更新の有無についてご回答ください。",
          updateStatusChoices("設備機器"),
        ),
        updateMatrix(
          "gas_equipment_updates",
          "⑦ 機器更新の時期と更新内容をご回答ください。",
          "更新設備",
          "更新内容の詳細（台数や機器仕様など）",
          "{gas_equipment_update_status} = '1'",
        ),
      ],
    },
    {
      name: "page_vehicle_fuel",
      title: "■ 車両用燃料（フォークリフトなどの作業車も含む）",
      visibleIf: "{use_vehicle} = 'yes'",
      elements: [
        {
          type: "matrixdynamic",
          name: "vehicle_fuel_data",
          title: "(1) 使用している車両台数と燃料消費量をご記入ください。",
          addRowText: "車両を追加",
          removeRowText: "削除",
          columnLayout: "horizontal",
          rowCount: 1,
          columns: fuelColumns("車種"),
        },
        radio(
          "vehicle_fuel_saving_status",
          "(2) 車両燃料削減に関する取り組みについてご回答ください。",
          reductionStatusChoices("車両の燃料使用量"),
        ),
        targetMatrix(
          "vehicle_fuel_reduction_targets",
          "(3) 車両用燃料の使用量削減目標をご記入ください。",
          "基準年度の燃料使用量",
          "{vehicle_fuel_saving_status} = '1'",
          "EV導入時に想定するCO2排出係数 (t-CO2/kWh)",
        ),
        comment(
          "vehicle_fuel_saving_current",
          "(4)-1 すでに実施されている燃料削減の取り組みがございましたら教えてください。",
          "{vehicle_fuel_saving_status} = '1' or {vehicle_fuel_saving_status} = '2'",
        ),
        comment(
          "vehicle_fuel_saving_future",
          "(4)-2 今後実施を予定している燃料削減の取り組みがございましたら教えてください。",
          "{vehicle_fuel_saving_status} = '1' or {vehicle_fuel_saving_status} = '2'",
        ),
        radio(
          "vehicle_update_status",
          "(5) 車両更新の有無についてご回答ください。",
          updateStatusChoices("車両"),
        ),
        updateMatrix(
          "vehicle_updates",
          "(6) 車両更新の時期と更新内容をご記入ください。",
          "更新車両",
          "更新内容の詳細（台数や機器仕様など）",
          "{vehicle_update_status} = '1'",
        ),
      ],
    },
    {
      name: "page_non_vehicle_fuel",
      title: "■ 車両用以外の燃料",
      visibleIf: "{use_non_vehicle_fuel} = 'yes'",
      elements: [
        {
          type: "matrixdynamic",
          name: "non_vehicle_fuel_data",
          title:
            "(1) 燃料（車両用以外）を使用する設備の詳細と燃料消費量をご記入ください。",
          addRowText: "設備を追加",
          removeRowText: "削除",
          columnLayout: "horizontal",
          rowCount: 1,
          columns: fuelColumns("設備名"),
        },
        radio(
          "non_vehicle_fuel_saving_status",
          "(2) 設備の燃料削減に関する取り組みについてご回答ください。",
          reductionStatusChoices("設備の燃料使用量"),
        ),
        targetMatrix(
          "non_vehicle_fuel_reduction_targets",
          "(3) 設備の燃料使用量の削減目標をご記入ください。",
          "基準年度の燃料使用量",
          "{non_vehicle_fuel_saving_status} = '1'",
        ),
        comment(
          "non_vehicle_fuel_saving_current",
          "(4)-1 すでに実施されている燃料削減の取り組みがございましたら教えてください。",
          "{non_vehicle_fuel_saving_status} = '1' or {non_vehicle_fuel_saving_status} = '2'",
        ),
        comment(
          "non_vehicle_fuel_saving_future",
          "(4)-2 今後実施を予定している燃料削減の取り組みがございましたら教えてください。",
          "{non_vehicle_fuel_saving_status} = '1' or {non_vehicle_fuel_saving_status} = '2'",
        ),
        radio(
          "non_vehicle_equipment_update_status",
          "(5) 燃料（車両用以外）を使用する設備の更新の有無についてご回答ください。",
          updateStatusChoices("設備"),
        ),
        updateMatrix(
          "non_vehicle_equipment_updates",
          "(6) 設備更新の時期と更新内容をご回答ください。",
          "更新設備",
          "更新内容の詳細（台数や機器仕様など）",
          "{non_vehicle_equipment_update_status} = '1'",
        ),
      ],
    },
    {
      name: "page_ev_hydrogen_station",
      title: "■ EV充電器・水素ステーション",
      visibleIf: "{has_ev_hydrogen_station} = 'yes'",
      elements: [
        {
          type: "matrixdynamic",
          name: "ev_hydrogen_station_data",
          title:
            "(1) 設置されているEV充電器や水素ステーションの設置状況をご回答ください。",
          addRowText: "設備を追加",
          removeRowText: "削除",
          rowCount: 1,
          columns: [
            {
              name: "type",
              title: "種別",
              cellType: "dropdown",
              choices: [
                "EV充電器（業務車両用）",
                "EV充電器（一般駐車場用）",
                "水素ステーション",
                "その他",
              ],
              minWidth: "180px",
            },
            {
              name: "installed_at",
              title: "設置時期",
              cellType: "text",
              inputType: "date",
              minWidth: "130px",
            },
            {
              name: "location",
              title: "設置場所",
              cellType: "text",
              minWidth: "150px",
            },
            {
              name: "owner",
              title: "所有者",
              cellType: "text",
              minWidth: "140px",
            },
            {
              name: "spec",
              title: "仕様",
              cellType: "text",
              minWidth: "150px",
            },
            {
              name: "ports",
              title: "充電口数（同時充電可能台数）",
              cellType: "text",
              minWidth: "180px",
            },
            {
              name: "use_case",
              title: "用途",
              cellType: "text",
              minWidth: "150px",
            },
            {
              name: "remarks",
              title: "備考",
              cellType: "text",
              minWidth: "150px",
            },
          ],
        },
        comment(
          "ev_hydrogen_station_location_note",
          "(2) 設置されているEV充電器や水素ステーションの設置場所について、補足があればご記入ください。",
        ),
      ],
    },
    {
      name: "page_water",
      title: "■ 水使用量の削減目標と節水の取り組み",
      visibleIf: "{use_water} = 'yes'",
      elements: [
        radio(
          "water_saving_status",
          "(1) 節水等に関する取り組みについてご回答ください。",
          reductionStatusChoices("水使用量"),
        ),
        targetMatrix(
          "water_reduction_targets",
          "(2) 水使用量の削減目標の内容をご記入ください。",
          "基準年度の水使用量",
          "{water_saving_status} = '1'",
        ),
        comment(
          "water_saving_initiatives",
          "(3) 節水に関する取り組みについて、新たに始めた取り組みや今後予定している取り組みがあれば教えてください。",
          "{water_saving_status} = '1' or {water_saving_status} = '2'",
        ),
        radio(
          "water_monitoring_status",
          "(4) 水使用量を把握する取り組みの実施状況をご回答ください。",
          [
            {
              value: "1",
              text: "1. 事業所・店舗で水使用量を把握する取り組みを実施している。",
            },
            {
              value: "2",
              text: "2. 使用料金の請求以外、特に水使用量の把握は行っていない。",
            },
          ],
          "{water_saving_status} = '1' or {water_saving_status} = '2'",
        ),
        radio(
          "water_monitoring_tool_interest",
          "(5) 水使用量の推移を把握するツールがあった場合、ツールの利用を検討しますか。",
          [
            { value: "1", text: "1. 利用したい。" },
            { value: "2", text: "2. 利用を検討したい。" },
            { value: "3", text: "3. 今のところ関心は無い。" },
          ],
          "{water_saving_status} = '1' or {water_saving_status} = '2'",
        ),
      ],
    },
    {
      name: "page_industrial_waste",
      title: "■ 産業廃棄物排出量",
      visibleIf: "{generate_waste} = 'yes'",
      elements: [
        radio(
          "industrial_waste_status",
          "(1) 仮想国際空港で発生した貴社の産業廃棄物の処理状況についてご回答ください。",
          [
            {
              value: "1",
              text: "1. 仮想国際空港では産業廃棄物は発生していない。",
            },
            {
              value: "2",
              text: "2. 仮想国際空港で発生し処理を委託した産業廃棄物がある。",
            },
          ],
        ),
        note(
          "industrial_waste_note",
          "食用油の廃棄処理を委託した場合は、普通の産業廃棄物の「廃食用油」欄にご回答ください。",
          "{industrial_waste_status} = '2'",
        ),
        {
          type: "matrixdropdown",
          name: "industrial_waste_breakdown",
          title:
            "(2) 2024年度に処理を委託した産業廃棄物の内訳をご記入ください。",
          visibleIf: "{industrial_waste_status} = '2'",
          rows: [
            { value: "ordinary_ash", text: "普通の産業廃棄物：1. 燃え殻" },
            { value: "ordinary_sludge", text: "普通の産業廃棄物：2. 汚泥" },
            {
              value: "ordinary_waste_oil_plant",
              text: "普通の産業廃棄物：3-a. 廃食用油：植物由来",
            },
            {
              value: "ordinary_waste_oil_animal",
              text: "普通の産業廃棄物：3-b. 廃食用油：動物由来",
            },
            {
              value: "ordinary_waste_oil_total",
              text: "普通の産業廃棄物：3-a+b. 廃食用油：合計",
            },
            {
              value: "ordinary_waste_oil_other",
              text: "普通の産業廃棄物：廃食用油以外の廃油",
            },
            { value: "ordinary_waste_acid", text: "普通の産業廃棄物：4. 廃酸" },
            {
              value: "ordinary_waste_alkali",
              text: "普通の産業廃棄物：5. 廃アルカリ",
            },
            {
              value: "ordinary_plastic",
              text: "普通の産業廃棄物：6. 廃プラスチック",
            },
            { value: "ordinary_paper", text: "普通の産業廃棄物：7. 紙くず" },
            { value: "ordinary_wood", text: "普通の産業廃棄物：8. 木くず" },
            { value: "ordinary_fiber", text: "普通の産業廃棄物：9. 繊維くず" },
            {
              value: "ordinary_residue",
              text: "普通の産業廃棄物：10. 動植物性残渣",
            },
            {
              value: "ordinary_rubber",
              text: "普通の産業廃棄物：11. ゴムくず",
            },
            { value: "ordinary_metal", text: "普通の産業廃棄物：12. 金属くず" },
            {
              value: "ordinary_glass",
              text: "普通の産業廃棄物：13. ガラス陶磁器くず",
            },
            { value: "ordinary_slag", text: "普通の産業廃棄物：14. 鉱さい" },
            {
              value: "ordinary_rubble",
              text: "普通の産業廃棄物：15. がれき類",
            },
            {
              value: "ordinary_manure",
              text: "普通の産業廃棄物：16. 家畜の糞尿",
            },
            {
              value: "ordinary_dead_animal",
              text: "普通の産業廃棄物：17. 家畜の死体",
            },
            { value: "ordinary_dust", text: "普通の産業廃棄物：18. ばいじん" },
            {
              value: "ordinary_no13",
              text: "普通の産業廃棄物：19. 第13号廃棄物",
            },
            { value: "ordinary_other", text: "普通の産業廃棄物：20. その他" },
            { value: "ordinary_total", text: "普通の産業廃棄物：計" },
            { value: "special_waste_oil", text: "特別管理産業廃棄物：1. 廃油" },
            {
              value: "special_acid_alkali",
              text: "特別管理産業廃棄物：2. 廃酸・廃アルカリ",
            },
            {
              value: "special_infectious",
              text: "特別管理産業廃棄物：3. 感染性廃棄物",
            },
            { value: "special_pcb", text: "特別管理産業廃棄物：4. PCB等" },
            {
              value: "special_asbestos",
              text: "特別管理産業廃棄物：5. 廃石綿等",
            },
            {
              value: "special_hazardous",
              text: "特別管理産業廃棄物：6. 有害廃棄物",
            },
            { value: "special_other", text: "特別管理産業廃棄物：7. その他" },
            { value: "special_total", text: "特別管理産業廃棄物：計" },
          ],
          columns: [
            {
              name: "generated_total",
              title: "①発生総量 (t/年)",
              cellType: "expression",
              expression: "{row.disposal_amount} + {row.recycle_amount}",
              minWidth: "130px",
            },
            {
              name: "disposal_amount",
              title: "②処分量 (t/年)",
              cellType: "text",
              inputType: "number",
              minWidth: "120px",
            },
            {
              name: "recycle_amount",
              title: "③再生利用量 (t/年)",
              cellType: "text",
              inputType: "number",
              minWidth: "140px",
            },
            {
              name: "recycle_method",
              title: "主なごみ名称と処理方法",
              cellType: "comment",
              minWidth: "220px",
            },
            {
              name: "disposal_method",
              title: "再生利用以外の主な処分方法",
              cellType: "comment",
              minWidth: "240px",
            },
          ],
          alternateRows: true,
          columnLayout: "horizontal",
        },
        note(
          "industrial_waste_method_note",
          "処理方法、処分方法は、焼却、埋め立て、コンポスト化、再生などと記入してください。",
          "{industrial_waste_status} = '2'",
        ),
      ],
    },
    {
      name: "page_general_waste",
      title: "■ 可燃ごみの状況・排出量の削減・リサイクルの取り組み",
      visibleIf: "{generate_waste} = 'yes'",
      elements: [
        note(
          "general_waste_intro",
          "空港内で排出された可燃ごみについて、廃棄物削減およびリサイクル率向上のための状況をご回答ください。",
        ),
        {
          type: "multipletext",
          name: "burnable_waste_daily_amount",
          title:
            "1-1) 可燃ごみ（白色袋で排出）の一日当たりの排出量の概数を教えてください。",
          items: [
            { name: "amount", title: "一日あたり概ね", inputType: "number" },
            { name: "unit", title: "単位（袋、kgなど）" },
            {
              name: "bag_capacity_liter",
              title: "ゴミ袋の平均的な容量（リットル）",
              inputType: "number",
            },
          ],
        },
        {
          type: "matrixdropdown",
          name: "burnable_waste_mix_ratio",
          title:
            "1-2) 可燃ごみのうち、プラスチック、生ごみ、雑がみ等の混入割合を教えてください。",
          rows: [
            { value: "plastic", text: "プラスチックの割合" },
            { value: "food_waste", text: "生ごみ（食品残渣）の割合" },
            { value: "misc_paper", text: "雑がみの割合" },
            { value: "other", text: "その他" },
          ],
          columns: [
            {
              name: "ratio",
              title: "割合（%程度）",
              cellType: "text",
              inputType: "number",
              minWidth: "130px",
            },
          ],
          alternateRows: true,
        },
        {
          type: "checkbox",
          name: "misc_paper_items",
          title:
            "1-3) 雑がみの排出がある場合、具体的な品目を選択してください。（複数回答可）",
          choices: [
            "紙箱（お菓子の箱等）",
            "紙袋",
            "メモ用紙・コピー用紙",
            "紙コップ",
            "紙芯",
            "包装紙",
            "新聞・雑誌",
            "その他",
          ],
        },
        {
          type: "text",
          name: "misc_paper_items_other",
          title: "「その他」を選択した場合、具体的な品目名をご記入ください。",
          visibleIf: "{misc_paper_items} contains 'その他'",
        },
        radio(
          "waste_reduction_plan_status",
          "2-1) 今後、廃棄物全般を削減またはリサイクルされる予定がございましたら教えてください。",
          [
            { value: "1", text: "1. 削減（リサイクル）の予定がある。" },
            { value: "2", text: "2. 削減（リサイクル）の予定はない。" },
          ],
        ),
        comment(
          "waste_reduction_plan_reason",
          "削減（リサイクル）の予定がある場合、削減理由をご記入ください。",
          "{waste_reduction_plan_status} = '1'",
        ),
        radio(
          "waste_reduction_target_status",
          "2-2) 御社全体の廃棄物の削減目標がありましたら教えてください。",
          reductionStatusChoices("廃棄物排出量"),
        ),
        targetMatrix(
          "waste_reduction_targets",
          "2-3) 廃棄物の削減目標の内容をご記入ください。",
          "基準年度の廃棄物排出量",
          "{waste_reduction_target_status} = '1'",
        ),
        comment(
          "waste_reduction_target_note",
          "2-4) 廃棄物の削減目標や取り組みについて補足事項がございましたら教えてください。",
          "{waste_reduction_target_status} = '1' or {waste_reduction_target_status} = '2'",
        ),
        comment(
          "waste_reduction_no_action_reason",
          "2-5) 取り組みは特にしていない理由がございましたら教えてください。",
          "{waste_reduction_target_status} = '3'",
        ),
        radio(
          "food_waste_disposal_status",
          "3-1) 生ごみ（厨芥類）の捨て方について教えてください。",
          [
            { value: "1", text: "1. 生ごみは別のゴミ箱に分けて捨てている。" },
            {
              value: "2",
              text: "2. 生ごみは他のごみと同じゴミ箱に捨てている。",
            },
            { value: "3", text: "3. 生ごみ（厨芥類）の発生はない。" },
          ],
        ),
        radio(
          "food_waste_separation_feasibility",
          "3-2) 今後生ごみの分別を開始した場合、分別の可否について教えてください。",
          [
            { value: "1", text: "1. ほとんどの生ごみの分別は可能と思われる。" },
            { value: "2", text: "2. 一部の生ごみの分別は可能と思われる。" },
            { value: "3", text: "3. 生ごみの分別は難しい。" },
          ],
          "{food_waste_disposal_status} != '3'",
        ),
        {
          type: "text",
          name: "food_waste_separable_ratio",
          title:
            "一部の生ごみの分別が可能な場合、分別可能な割合（割程度）をご記入ください。",
          inputType: "number",
          visibleIf: "{food_waste_separation_feasibility} = '2'",
        },
        comment(
          "food_waste_separation_difficulty_reason",
          "生ごみの分別が難しい理由を教えてください。",
          "{food_waste_separation_feasibility} = '2' or {food_waste_separation_feasibility} = '3'",
        ),
        radio(
          "plastic_waste_separation_feasibility",
          "3-3) 今後プラスチックごみの分別を開始した場合、分別の可否について教えてください。",
          [
            {
              value: "1",
              text: "1. ほとんどのプラスチックごみの分別は可能と思われる。",
            },
            {
              value: "2",
              text: "2. 一部のプラスチックごみの分別は可能と思われる。",
            },
            { value: "3", text: "3. プラスチックごみの分別は難しい。" },
          ],
        ),
        {
          type: "text",
          name: "plastic_waste_separable_ratio",
          title:
            "一部のプラスチックごみの分別が可能な場合、分別可能な割合（割程度）をご記入ください。",
          inputType: "number",
          visibleIf: "{plastic_waste_separation_feasibility} = '2'",
        },
        comment(
          "plastic_waste_separation_difficulty_reason",
          "プラスチックごみの分別が難しい理由を教えてください。",
          "{plastic_waste_separation_feasibility} = '2' or {plastic_waste_separation_feasibility} = '3'",
        ),
        radio(
          "misc_paper_separation_feasibility",
          "3-4) 今後雑がみの分別を開始した場合、分別の可否について教えてください。",
          [
            { value: "1", text: "1. ほとんどの雑がみの分別は可能と思われる。" },
            { value: "2", text: "2. 一部の雑がみの分別は可能と思われる。" },
            {
              value: "3",
              text: "3. 雑がみの分別に著しく手間がかかる部分があるため協力は難しい。",
            },
          ],
        ),
        {
          type: "text",
          name: "misc_paper_separable_ratio",
          title:
            "一部の雑がみの分別が可能な場合、分別可能な割合（割程度）をご記入ください。",
          inputType: "number",
          visibleIf: "{misc_paper_separation_feasibility} = '2'",
        },
        comment(
          "misc_paper_separation_difficulty_reason",
          "雑がみの分別が難しい理由を教えてください。",
          "{misc_paper_separation_feasibility} = '2' or {misc_paper_separation_feasibility} = '3'",
        ),
        {
          type: "multipletext",
          name: "shredder_waste_amount",
          title:
            "(4) シュレッダー袋について、可燃ごみ（白袋）での排出はありますか。",
          items: [
            {
              name: "bags_per_month",
              title: "排出量（袋/月）",
              inputType: "number",
            },
            {
              name: "bag_capacity_liter",
              title: "ゴミ袋容量（リットル）",
              inputType: "number",
            },
          ],
        },
        comment(
          "waste_recycle_additional_note",
          "(5) ごみの分別・リサイクルについて、補足の情報・ご意見などがあればご記入ください。",
        ),
      ],
    },
  ],
};
