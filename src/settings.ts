import powerbi from "powerbi-visuals-api";
import DataView = powerbi.DataView;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;

export class GeneralSettings {
    public responsive: boolean = true;
}

export class HeaderSettings {
    public show: boolean = true;
    public fontColor: string = "#333333";
    public backgroundColor: string = "#f8f9fa";
    public fontSize: number = 12;
    public textAlignment: string = "center";
}

export class RowsSettings {
    public fontColor: string = "#333333";
    public backgroundColor: string = "#ffffff";
    public alternateBackgroundColor: string = "#f8f9fa";
    public fontSize: number = 11;
    public textAlignment: string = "left";
}

export class ColumnAlignmentSettings {
    public column1Alignment: string = "left";
    public column2Alignment: string = "center";
    public column3Alignment: string = "right";
}

export class BordersSettings {
    public show: boolean = true;
    public color: string = "#dee2e6";
    public width: number = 1;
    public style: string = "solid";
}

export class ColumnWidthSettings {
    public autoSize: boolean = false;
    public column1Width: number = 120;
    public column2Width: number = 100;
    public column3Width: number = 100;
}

export class ColorsSettings {
    public column1Color: string = "#ffffff";
    public column2Color: string = "#ffffff";
    public column3Color: string = "#ffffff";
}

export class ChartsSettings {
    public enableSparklines: boolean = false;
    public sparklineColor: string = "#2196f3";
    public enableProgressBars: boolean = false;
    public progressBarColor: string = "#4caf50";
}

export class VisualSettings {
    public general: GeneralSettings = new GeneralSettings();
    public header: HeaderSettings = new HeaderSettings();
    public rows: RowsSettings = new RowsSettings();
    public columnAlignment: ColumnAlignmentSettings = new ColumnAlignmentSettings();
    public borders: BordersSettings = new BordersSettings();
    public columnWidth: ColumnWidthSettings = new ColumnWidthSettings();
    public colors: ColorsSettings = new ColorsSettings();
    public charts: ChartsSettings = new ChartsSettings();

    public static parse(dataView: DataView): VisualSettings {
        const settings = new VisualSettings();
        
        if (!dataView || !dataView.metadata || !dataView.metadata.objects) {
            return settings;
        }

        const objects = dataView.metadata.objects;

        // Parse General Settings
        if (objects.general) {
            if (objects.general.responsive !== undefined) {
                settings.general.responsive = objects.general.responsive as boolean;
            }
        }

        // Parse Header Settings
        if (objects.header) {
            if (objects.header.show !== undefined) {
                settings.header.show = objects.header.show as boolean;
            }
            if (objects.header.fontColor) {
                settings.header.fontColor = getColorValue(objects.header.fontColor);
            }
            if (objects.header.backgroundColor) {
                settings.header.backgroundColor = getColorValue(objects.header.backgroundColor);
            }
            if (objects.header.fontSize !== undefined) {
                settings.header.fontSize = objects.header.fontSize as number;
            }
            if (objects.header.textAlignment !== undefined) {
                settings.header.textAlignment = objects.header.textAlignment as string;
            }
        }

        // Parse Rows Settings
        if (objects.rows) {
            if (objects.rows.fontColor) {
                settings.rows.fontColor = getColorValue(objects.rows.fontColor);
            }
            if (objects.rows.backgroundColor) {
                settings.rows.backgroundColor = getColorValue(objects.rows.backgroundColor);
            }
            if (objects.rows.alternateBackgroundColor) {
                settings.rows.alternateBackgroundColor = getColorValue(objects.rows.alternateBackgroundColor);
            }
            if (objects.rows.fontSize !== undefined) {
                settings.rows.fontSize = objects.rows.fontSize as number;
            }
            if (objects.rows.textAlignment !== undefined) {
                settings.rows.textAlignment = objects.rows.textAlignment as string;
            }
        }

        // Parse Column Alignment Settings
        if (objects.columnAlignment) {
            if (objects.columnAlignment.column1Alignment !== undefined) {
                settings.columnAlignment.column1Alignment = objects.columnAlignment.column1Alignment as string;
            }
            if (objects.columnAlignment.column2Alignment !== undefined) {
                settings.columnAlignment.column2Alignment = objects.columnAlignment.column2Alignment as string;
            }
            if (objects.columnAlignment.column3Alignment !== undefined) {
                settings.columnAlignment.column3Alignment = objects.columnAlignment.column3Alignment as string;
            }
        }

        // Parse Borders Settings
        if (objects.borders) {
            if (objects.borders.show !== undefined) {
                settings.borders.show = objects.borders.show as boolean;
            }
            if (objects.borders.color) {
                settings.borders.color = getColorValue(objects.borders.color);
            }
            if (objects.borders.width !== undefined) {
                settings.borders.width = objects.borders.width as number;
            }
            if (objects.borders.style !== undefined) {
                settings.borders.style = objects.borders.style as string;
            }
        }

        // Parse Column Width Settings
        if (objects.columnWidth) {
            if (objects.columnWidth.autoSize !== undefined) {
                settings.columnWidth.autoSize = objects.columnWidth.autoSize as boolean;
            }
            if (objects.columnWidth.column1Width !== undefined) {
                settings.columnWidth.column1Width = objects.columnWidth.column1Width as number;
            }
            if (objects.columnWidth.column2Width !== undefined) {
                settings.columnWidth.column2Width = objects.columnWidth.column2Width as number;
            }
            if (objects.columnWidth.column3Width !== undefined) {
                settings.columnWidth.column3Width = objects.columnWidth.column3Width as number;
            }
        }

        // Parse Colors Settings
        if (objects.colors) {
            if (objects.colors.column1Color) {
                settings.colors.column1Color = getColorValue(objects.colors.column1Color);
            }
            if (objects.colors.column2Color) {
                settings.colors.column2Color = getColorValue(objects.colors.column2Color);
            }
            if (objects.colors.column3Color) {
                settings.colors.column3Color = getColorValue(objects.colors.column3Color);
            }
        }

        // Parse Charts Settings
        if (objects.charts) {
            if (objects.charts.enableSparklines !== undefined) {
                settings.charts.enableSparklines = objects.charts.enableSparklines as boolean;
            }
            if (objects.charts.sparklineColor) {
                settings.charts.sparklineColor = getColorValue(objects.charts.sparklineColor);
            }
            if (objects.charts.enableProgressBars !== undefined) {
                settings.charts.enableProgressBars = objects.charts.enableProgressBars as boolean;
            }
            if (objects.charts.progressBarColor) {
                settings.charts.progressBarColor = getColorValue(objects.charts.progressBarColor);
            }
        }

        return settings;
    }

    public static getDefault(): VisualSettings {
        return new VisualSettings();
    }

    public static enumerateObjectInstances(settings: VisualSettings, options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] {
        const objectName = options.objectName;
        const objectInstance: VisualObjectInstance = {
            objectName: objectName,
            selector: undefined,
            properties: {}
        };

        switch (objectName) {
            case "general":
                objectInstance.properties = {
                    responsive: settings.general.responsive
                };
                break;

            case "header":
                objectInstance.properties = {
                    show: settings.header.show,
                    fontColor: settings.header.fontColor,
                    backgroundColor: settings.header.backgroundColor,
                    fontSize: settings.header.fontSize,
                    textAlignment: settings.header.textAlignment
                };
                break;

            case "rows":
                objectInstance.properties = {
                    fontColor: settings.rows.fontColor,
                    backgroundColor: settings.rows.backgroundColor,
                    alternateBackgroundColor: settings.rows.alternateBackgroundColor,
                    fontSize: settings.rows.fontSize,
                    textAlignment: settings.rows.textAlignment
                };
                break;

            case "columnAlignment":
                objectInstance.properties = {
                    column1Alignment: settings.columnAlignment.column1Alignment,
                    column2Alignment: settings.columnAlignment.column2Alignment,
                    column3Alignment: settings.columnAlignment.column3Alignment
                };
                break;

            case "borders":
                objectInstance.properties = {
                    show: settings.borders.show,
                    color: settings.borders.color,
                    width: settings.borders.width,
                    style: settings.borders.style
                };
                break;

            case "columnWidth":
                objectInstance.properties = {
                    autoSize: settings.columnWidth.autoSize,
                    column1Width: settings.columnWidth.column1Width,
                    column2Width: settings.columnWidth.column2Width,
                    column3Width: settings.columnWidth.column3Width
                };
                break;

            case "colors":
                objectInstance.properties = {
                    column1Color: settings.colors.column1Color,
                    column2Color: settings.colors.column2Color,
                    column3Color: settings.colors.column3Color
                };
                break;

            case "charts":
                objectInstance.properties = {
                    enableSparklines: settings.charts.enableSparklines,
                    sparklineColor: settings.charts.sparklineColor,
                    enableProgressBars: settings.charts.enableProgressBars,
                    progressBarColor: settings.charts.progressBarColor
                };
                break;
        }

        return [objectInstance];
    }
}

// Helper function to extract color values
function getColorValue(colorObject: any): string {
    if (typeof colorObject === 'string') {
        return colorObject;
    }
    if (colorObject && colorObject.solid && colorObject.solid.color) {
        return colorObject.solid.color;
    }
    return "#333333"; // fallback color
}