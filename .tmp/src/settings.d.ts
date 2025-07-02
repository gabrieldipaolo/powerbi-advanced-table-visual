import powerbi from "powerbi-visuals-api";
import DataView = powerbi.DataView;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
export declare class GeneralSettings {
    responsive: boolean;
}
export declare class HeaderSettings {
    show: boolean;
    fontColor: string;
    backgroundColor: string;
    fontSize: number;
    textAlignment: string;
}
export declare class RowsSettings {
    fontColor: string;
    backgroundColor: string;
    alternateBackgroundColor: string;
    fontSize: number;
    textAlignment: string;
}
export declare class ColumnAlignmentSettings {
    column1Alignment: string;
    column2Alignment: string;
    column3Alignment: string;
}
export declare class BordersSettings {
    show: boolean;
    color: string;
    width: number;
    style: string;
}
export declare class ColumnWidthSettings {
    autoSize: boolean;
    column1Width: number;
    column2Width: number;
    column3Width: number;
}
export declare class ColorsSettings {
    column1Color: string;
    column2Color: string;
    column3Color: string;
}
export declare class ChartsSettings {
    enableSparklines: boolean;
    sparklineColor: string;
    enableProgressBars: boolean;
    progressBarColor: string;
}
export declare class VisualSettings {
    general: GeneralSettings;
    header: HeaderSettings;
    rows: RowsSettings;
    columnAlignment: ColumnAlignmentSettings;
    borders: BordersSettings;
    columnWidth: ColumnWidthSettings;
    colors: ColorsSettings;
    charts: ChartsSettings;
    static parse(dataView: DataView): VisualSettings;
    static getDefault(): VisualSettings;
    static enumerateObjectInstances(settings: VisualSettings, options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[];
}
