/* eslint-disable powerbi-visuals/no-inner-outer-html */
"use strict";

import powerbi from "powerbi-visuals-api";
import "./../style/visual.less";

import DataView = powerbi.DataView;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import ISelectionManager = powerbi.extensibility.ISelectionManager;

// --------- Configuración de formato ---------
interface FormattingSettings {
    evenRowBgColor: string;
    oddRowBgColor: string;
    alignHorizontal: string;
    alignVertical: string;
    headerBgColor: string;
    headerFontColor: string;
    headerAlign: string;
    fontFamily: string;
    fontSize: number;
    sombra: boolean;
    preset: string;
    showTitle: boolean;
    titleText: string;
    titleFontColor: string;
    titleFontSize: number;
    donutSize: number;
    daxSvgSize: number;
    donutColor: string;
    sparklineColor: string;
    autoDetectStatus: boolean;
    autoDetectPercentages: boolean;
    enableScroll: boolean;
    headerSticky: boolean;
    maxColumnWidth: number;
    minColumnWidth: number;
}

function safeColor(obj: any, def: string): string {
    // Soporta string "#fff", { solid: { color: "#fff" } } y null/undefined
    if (!obj) return def;
    if (typeof obj === "string") return obj;
    if (typeof obj === "object" && obj.solid && typeof obj.solid.color === "string") return obj.solid.color;
    return def;
}

function getFormattingSettings(dataView: DataView): FormattingSettings {
    const objects = (dataView && dataView.metadata && dataView.metadata.objects) ? dataView.metadata.objects : {};
    return {
        evenRowBgColor: safeColor((objects.rowFormatting && objects.rowFormatting.evenRowBgColor) ? objects.rowFormatting.evenRowBgColor : null, "#f5f8ff"),
        oddRowBgColor: safeColor((objects.rowFormatting && objects.rowFormatting.oddRowBgColor) ? objects.rowFormatting.oddRowBgColor : null, "#fff"),
        alignHorizontal: (objects.columnFormatting && typeof objects.columnFormatting.alignHorizontal === "string")
            ? objects.columnFormatting.alignHorizontal
            : "center",
        alignVertical: (objects.columnFormatting && typeof objects.columnFormatting.alignVertical === "string")
            ? objects.columnFormatting.alignVertical
            : "middle",
        headerBgColor: safeColor((objects.headerFormatting && objects.headerFormatting.headerBgColor) ? objects.headerFormatting.headerBgColor : null, "#eaeaea"),
        headerFontColor: safeColor((objects.headerFormatting && objects.headerFormatting.headerFontColor) ? objects.headerFormatting.headerFontColor : null, "#262626"),
        headerAlign: (objects.headerFormatting && typeof objects.headerFormatting.headerAlign === "string")
            ? objects.headerFormatting.headerAlign
            : "center",
        fontFamily: (objects.cellFormatting && typeof objects.cellFormatting.fontFamily === "string")
            ? objects.cellFormatting.fontFamily
            : "Segoe UI, Arial, sans-serif",
        fontSize: (objects.cellFormatting && objects.cellFormatting.fontSize) ? Number(objects.cellFormatting.fontSize) : 12,
        sombra: (objects.sombra && objects.sombra.enableShadow === true) ? true : false,
        preset: (objects.stylePreset && typeof objects.stylePreset.preset === "string")
            ? objects.stylePreset.preset
            : "PowerBI",
        showTitle: (objects.title && objects.title.show === true) ? true : false,
        titleText: (objects.title && typeof objects.title.titleText === "string")
            ? objects.title.titleText
            : "Mi Tabla",
        titleFontColor: safeColor((objects.title && objects.title.fontColor) ? objects.title.fontColor : null, "#000000"),
        titleFontSize: (objects.title && objects.title.fontSize) ? Number(objects.title.fontSize) : 16,
        donutSize: (objects.minicharts && objects.minicharts.donutSize) ? Number(objects.minicharts.donutSize) : 24,
        daxSvgSize: (objects.minicharts && objects.minicharts.daxSvgSize) ? Number(objects.minicharts.daxSvgSize) : 36,
        donutColor: safeColor((objects.minicharts && objects.minicharts.donutColor) ? objects.minicharts.donutColor : null, "#4682B4"),
        sparklineColor: safeColor((objects.minicharts && objects.minicharts.sparklineColor) ? objects.minicharts.sparklineColor : null, "#4682B4"),
        autoDetectStatus: (objects.minicharts && objects.minicharts.autoDetectStatus === false) ? false : true,
        autoDetectPercentages: (objects.minicharts && objects.minicharts.autoDetectPercentages === false) ? false : true,
        enableScroll: (objects.tableSettings && objects.tableSettings.enableScroll === false) ? false : true,
        headerSticky: (objects.tableSettings && objects.tableSettings.headerSticky === false) ? false : true,
        maxColumnWidth: (objects.tableSettings && objects.tableSettings.maxColumnWidth) ? Number(objects.tableSettings.maxColumnWidth) : 200,
        minColumnWidth: (objects.tableSettings && objects.tableSettings.minColumnWidth) ? Number(objects.tableSettings.minColumnWidth) : 80
    };
}

// ✅ NUEVA: Función segura para limpiar contenedor
function clearContainer(container: HTMLElement): void {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
}

// ✅ NUEVA: Función segura para actualizar contenedor con HTML
function updateContainerSafely(container: HTMLElement, htmlContent: string): void {
    clearContainer(container);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    while (tempDiv.firstChild) {
        container.appendChild(tempDiv.firstChild);
    }
}

// --------- Minigráficos avanzados ---------
function renderSparkline(values: number[], type: "line" | "bar" | "column" = "line", color = "#4682B4"): string {
    if (!Array.isArray(values) || values.length < 2) return "";
    const width = 40, height = 18, min = Math.min(...values), max = Math.max(...values);
    const range = max - min || 1;
    
    if (type === "line") {
        // Linea
        const points = values.map((v, i) =>
            `${(i * (width / (values.length - 1))).toFixed(1)},${(height - ((v - min) / range) * (height - 4)).toFixed(1)}`
        ).join(" ");
        return `<svg width="${width}" height="${height}">
          <polyline points="${points}" fill="none" stroke="${color}" stroke-width="2"/>
        </svg>`;
    } else if (type === "bar" || type === "column") {
        // Barras horizontales o columnas verticales
        const barW = type === "column" ? width / values.length : (width - 4) / values.length;
        return `<svg width="${width}" height="${height}">
          ${values.map((v, i) => {
              const x = type === "column" ? i * barW : 0;
              let y = type === "column"
                  ? (height - ((v - min) / range) * (height - 4))
                  : i * (height / values.length);
              const w = type === "column" ? Math.max(barW - 1, 2) : ((v - min) / range) * (width - 4);
              let h = type === "column"
                  ? ((v - min) / range) * (height - 4)
                  : Math.max(height / values.length - 1, 2);
              if (type === "column") y = height - h;
              return `<rect x="${x + 1}" y="${y}" width="${w}" height="${h}" fill="${color}" rx="1"/>`;
          }).join("")}
        </svg>`;
    }
    return "";
}

// --------- Minigráfico de anillo (donut) ---------
function renderDonutChart(value: number, total: number = 100, size: number = 24, colors = { fill: "#4682B4", background: "#e0e0e0" }): string {
    if (typeof value !== "number" || typeof total !== "number" || total <= 0) return "";
    
    const percentage = Math.min(Math.max(value / total, 0), 1); // Entre 0 y 1
    const radius = size / 2 - 2;
    const strokeWidth = 3;
    const center = size / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference * (1 - percentage);
    
    return `<svg width="${size}" height="${size}" style="transform: rotate(-90deg);">
        <!-- Círculo de fondo -->
        <circle cx="${center}" cy="${center}" r="${radius}" 
                fill="none" stroke="${colors.background}" stroke-width="${strokeWidth}"/>
        <!-- Círculo de progreso -->
        <circle cx="${center}" cy="${center}" r="${radius}" 
                fill="none" stroke="${colors.fill}" stroke-width="${strokeWidth}"
                stroke-dasharray="${strokeDasharray}" stroke-dashoffset="${strokeDashoffset}"
                stroke-linecap="round"/>
        <!-- Texto de porcentaje -->
        <text x="${center}" y="${center + 1}" font-family="Arial, sans-serif" font-size="7" 
              text-anchor="middle" dominant-baseline="middle" fill="${colors.fill}" 
              style="transform: rotate(90deg); transform-origin: ${center}px ${center}px;">
            ${Math.round(percentage * 100)}%
        </text>
    </svg>`;
}

// --------- Detector de status con iconos/estados ---------
function getStatusIcon(status: string): string {
    const statusLower = status.toLowerCase().trim();
    const iconSize = 20;
    
    // Mapeo de estados a iconos SVG
    const statusIcons: { [key: string]: string } = {
        'active': `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="#28a745">
            <circle cx="12" cy="12" r="8" fill="#28a745"/>
            <path d="M9 12l2 2 4-4" stroke="white" stroke-width="2" fill="none"/>
        </svg>`,
        'paused': `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="#ffc107">
            <circle cx="12" cy="12" r="8" fill="#ffc107"/>
            <rect x="9" y="8" width="2" height="8" fill="white"/>
            <rect x="13" y="8" width="2" height="8" fill="white"/>
        </svg>`,
        'completed': `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="#007bff">
            <circle cx="12" cy="12" r="8" fill="#007bff"/>
            <path d="M7 12l3 3 7-7" stroke="white" stroke-width="2" fill="none"/>
        </svg>`,
        'pending': `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="#6c757d">
            <circle cx="12" cy="12" r="8" fill="#6c757d"/>
            <circle cx="12" cy="12" r="2" fill="white"/>
        </svg>`,
        'error': `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="#dc3545">
            <circle cx="12" cy="12" r="8" fill="#dc3545"/>
            <path d="M15 9l-6 6M9 9l6 6" stroke="white" stroke-width="2"/>
        </svg>`,
        'running': `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="#28a745">
            <circle cx="12" cy="12" r="8" fill="#28a745"/>
            <polygon points="10,8 10,16 16,12" fill="white"/>
        </svg>`,
        'stopped': `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="#dc3545">
            <circle cx="12" cy="12" r="8" fill="#dc3545"/>
            <rect x="8" y="8" width="8" height="8" fill="white"/>
        </svg>`
    };
    
    // Buscar coincidencia exacta primero
    if (statusIcons[statusLower]) {
        return statusIcons[statusLower];
    }
    
    // Buscar coincidencia parcial
    for (const [key, icon] of Object.entries(statusIcons)) {
        if (statusLower.includes(key) || key.includes(statusLower)) {
            return icon;
        }
    }
    
    // Por defecto: icono neutro
    return `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="#6c757d">
        <circle cx="12" cy="12" r="8" fill="#6c757d"/>
        <text x="12" y="16" font-family="Arial" font-size="10" text-anchor="middle" fill="white">?</text>
    </svg>`;
}

// --------- Renderizado dinámico de celda ---------
function renderCell(cell: any, tipoMini: "line" | "bar" | "column" = "line", columnName: string = "", settings?: FormattingSettings): string {
    // Si es null o undefined, devolver vacío
    if (cell == null || cell === undefined) return "";
    
    // Configuración por defecto con verificación segura
    const config = {
        donutSize: (settings && settings.donutSize) ? settings.donutSize : 24,
        daxSvgSize: (settings && settings.daxSvgSize) ? settings.daxSvgSize : 36,
        donutColor: (settings && settings.donutColor) ? settings.donutColor : "#4682B4",
        sparklineColor: (settings && settings.sparklineColor) ? settings.sparklineColor : "#4682B4",
        autoDetectStatus: (settings && settings.autoDetectStatus !== false) ? true : false,
        autoDetectPercentages: (settings && settings.autoDetectPercentages !== false) ? true : false
    };
    
    // Si es string, verificar formatos especiales
    if (typeof cell === "string") {
        const cellStr = cell.trim();
        const columnLower = columnName.toLowerCase();
        
        // SVG directo
        if (cellStr.startsWith("<svg") && cellStr.includes("</svg>")) return cellStr;
        
        // ✅ MEJORADO: Manejo especial para data:image/svg+xml de DAX (incluyendo utf8)
        if (cellStr.startsWith("data:image/svg+xml")) {
            try {
                // Extraer el SVG del data URL - soporte para múltiples formatos
                let svgContent = cellStr.replace(/^data:image\/svg\+xml[^,]*,/, "");
                
                // Si no hay coma, intentar otros formatos
                if (svgContent === cellStr) {
                    svgContent = cellStr.replace(/^data:image\/svg\+xml[^<]*/, "");
                }
                
                // Decodificar URL encoding si es necesario
                let decodedSvg = "";
                try {
                    decodedSvg = decodeURIComponent(svgContent);
                } catch (e) {
                    // Si falla decodeURIComponent, usar directo
                    decodedSvg = svgContent;
                }
                
                // Si aún no funciona, intentar UTF-8 directo desde después de "utf8,"
                if (!decodedSvg.includes("<svg") && cellStr.includes("utf8,")) {
                    decodedSvg = cellStr.split("utf8,")[1] || svgContent;
                }
                
                // Debug logging para troubleshooting
                console.log("🎨 SVG Original:", cellStr.substring(0, 100) + "...");
                console.log("🎨 SVG Decodificado:", decodedSvg.substring(0, 200) + "...");
                
                // Limpiar y corregir el SVG
                let cleanSvg = decodedSvg
                    // Remover comentarios dentro del SVG
                    .replace(/\/\*.*?\*\//g, "")
                    // Corregir porcentajes problemáticos en coordenadas
                    .replace(/cy=['"]50%['"]/g, `cy="${config.daxSvgSize / 2}"`)
                    .replace(/cx=['"]50%['"]/g, `cx="${config.daxSvgSize / 2}"`)
                    // Corregir viewBox si tiene porcentajes
                    .replace(/viewBox=['"]0 0 100% 100%['"]/, `viewBox="0 0 100 100"`)
                    // Asegurar que tenga xmlns si no lo tiene
                    .replace(/<svg(?![^>]*xmlns)/, `<svg xmlns="http://www.w3.org/2000/svg"`);
                
                // ✅ NUEVO: Escalar el SVG al tamaño configurado
                if (cleanSvg.includes("<svg") && cleanSvg.includes("</svg>")) {
                    // Extraer dimensiones originales
                    const widthMatch = cleanSvg.match(/width=['"](\d+)['"]/);
                    const heightMatch = cleanSvg.match(/height=['"](\d+)['"]/);
                    const originalWidth = widthMatch ? parseInt(widthMatch[1]) : config.daxSvgSize;
                    const originalHeight = heightMatch ? parseInt(heightMatch[1]) : config.daxSvgSize;
                    
                    // Calcular escala para ajustar al tamaño deseado
                    const scale = config.daxSvgSize / Math.max(originalWidth, originalHeight);
                    const finalWidth = Math.round(originalWidth * scale);
                    const finalHeight = Math.round(originalHeight * scale);
                    
                    // Aplicar nuevo tamaño manteniendo proporciones
                    cleanSvg = cleanSvg
                        .replace(/width=['"](\d+)['"]/, `width="${finalWidth}"`)
                        .replace(/height=['"](\d+)['"]/, `height="${finalHeight}"`);
                    
                    // Si no tiene width/height, agregarlos
                    if (!widthMatch) {
                        cleanSvg = cleanSvg.replace(/<svg/, `<svg width="${config.daxSvgSize}" height="${config.daxSvgSize}"`);
                    }
                    
                    // Aplicar CSS para centrado y mejor visualización
                    return `<div style="
                        display: inline-flex; 
                        align-items: center; 
                        justify-content: center;
                        min-width: ${config.daxSvgSize + 4}px; 
                        min-height: ${config.daxSvgSize + 4}px;
                        margin: 2px;
                    ">${cleanSvg}</div>`;
                } else {
                    console.warn("SVG inválido después de limpieza:", cleanSvg.substring(0, 100));
                    return `<span style="color:#dc3545;">SVG Error</span>`;
                }
            } catch (error) {
                console.error("Error procesando SVG de DAX:", error);
                // Fallback: usar como imagen con tamaño correcto
                return `<img src="${cellStr}" style="
                    height:${config.daxSvgSize}px;
                    width:${config.daxSvgSize}px;
                    max-width:${config.daxSvgSize + 10}px;
                    object-fit: contain;
                " onerror="this.style.display='none'; this.parentNode.innerHTML='❌ SVG Error';" />`;
            }
        }
        
        // Data URL de otras imágenes
        if (cellStr.startsWith("data:image/")) return `<img src="${cellStr}" style="height:22px;max-width:45px;" />`;
        
        // URL de imagen
        if (/^https?:\/\/.+\.(svg|png|jpg|jpeg|gif|webp)$/i.test(cellStr)) {
            return `<img src="${cellStr}" style="height:22px;max-width:45px;" />`;
        }
        
        // Detectar campos de STATUS y convertir a iconos (si está habilitado)
        if (config.autoDetectStatus && (columnLower.includes("status") || columnLower.includes("state") || columnLower.includes("estado"))) {
            return getStatusIcon(cellStr);
        }
        
        // Donut chart: donut:valor:total o donut:valor:total:color
        if (/^donut:\d+(\.\d+)?:\d+(\.\d+)?(:#[0-9A-Fa-f]{6})?$/.test(cellStr)) {
            try {
                const parts = cellStr.split(":");
                const value = parseFloat(parts[1]);
                const total = parseFloat(parts[2]);
                const color = parts[3] || config.donutColor;
                return renderDonutChart(value, total, config.donutSize, { fill: color, background: "#e0e0e0" });
            } catch (e) {
                console.warn("Error parsing donut chart:", e);
            }
        }
        
        // Sparkline como texto JSON: spark:[1,2,3,4]
        if (/^spark:\[\s*[\d\s,.-]+\s*\]$/.test(cellStr)) {
            try {
                const arr = JSON.parse(cellStr.replace("spark:", ""));
                if (Array.isArray(arr) && arr.every(v => typeof v === "number")) {
                    return renderSparkline(arr, tipoMini, config.sparklineColor);
                }
            } catch (e) {
                console.warn("Error parsing sparkline data:", e);
            }
        }
        
        // Auto-detectar porcentajes para donut charts (si está habilitado)
        if (config.autoDetectPercentages && /^\d+(\.\d+)?%$/.test(cellStr)) {
            const value = parseFloat(cellStr.replace("%", ""));
            return renderDonutChart(value, 100, config.donutSize, { fill: config.donutColor, background: "#e0e0e0" });
        }
        
        // Auto-detectar fracciones para donut charts: 25/100, 3/5, etc.
        if (config.autoDetectPercentages && /^\d+(\.\d+)?\/\d+(\.\d+)?$/.test(cellStr)) {
            const parts = cellStr.split("/");
            const value = parseFloat(parts[0]);
            const total = parseFloat(parts[1]);
            return renderDonutChart(value, total, config.donutSize, { fill: config.donutColor, background: "#e0e0e0" });
        }
        
        // Para cualquier otro string, devolverlo como está
        return cellStr;
    }
    
    // Si es array de números (sparkline como medida)
    if (Array.isArray(cell) && cell.length > 0 && cell.every(v => typeof v === "number")) {
        return renderSparkline(cell, tipoMini, config.sparklineColor);
    }
    
    // Si es número y la columna sugiere porcentaje, crear donut
    if (typeof cell === "number") {
        if (isNaN(cell)) return "N/A";
        
        const columnLower = columnName.toLowerCase();
        // Auto-donut para columnas que sugieren porcentajes (si está habilitado)
        if (config.autoDetectPercentages && 
            (columnLower.includes("percent") || columnLower.includes("rate") || 
             columnLower.includes("%") || columnLower.includes("ratio"))) {
            // Asumir que es un porcentaje de 0-100
            const percentage = cell > 1 ? cell : cell * 100;
            return renderDonutChart(percentage, 100, config.donutSize, { fill: config.donutColor, background: "#e0e0e0" });
        }
        
        return cell.toLocaleString();
    }
    
    // Boolean
    if (typeof cell === "boolean") {
        return cell ? 
            `<span style="color:#28a745;">✓ Sí</span>` : 
            `<span style="color:#dc3545;">✗ No</span>`;
    }
    
    // Fecha
    if (cell instanceof Date) {
        return cell.toLocaleDateString();
    }
    
    // Default: convertir a string de forma segura
    return String(cell);
}

// --------- Aplicar presets de estilo ---------
function applyStylePreset(preset: string, settings: FormattingSettings): FormattingSettings {
    switch (preset) {
        case "claro":
            return {
                ...settings,
                evenRowBgColor: "#ffffff",
                oddRowBgColor: "#f8f9fa",
                headerBgColor: "#e9ecef",
                headerFontColor: "#495057"
            };
        case "oscuro":
            return {
                ...settings,
                evenRowBgColor: "#2d3436",
                oddRowBgColor: "#343a40",
                headerBgColor: "#495057",
                headerFontColor: "#ffffff"
            };
        case "minimalista":
            return {
                ...settings,
                evenRowBgColor: "#ffffff",
                oddRowBgColor: "#ffffff",
                headerBgColor: "#ffffff",
                headerFontColor: "#000000",
                sombra: false
            };
        default:
            return settings;
    }
}

// --------- Visual principal Power BI ---------
export class Visual implements IVisual {
    private target: HTMLElement;
    private tableContainer: HTMLElement;
    private settings: FormattingSettings;
    private host: IVisualHost;
    private selectionManager: ISelectionManager;

    constructor(options: VisualConstructorOptions) {
        this.target = options.element;
        this.host = options.host;
        this.selectionManager = this.host.createSelectionManager();
        
        this.tableContainer = document.createElement("div");
        this.tableContainer.className = "mi-tabla-personalizada";
        
        // ✅ Agregar scroll y CSS mejorado
        this.tableContainer.style.cssText = `
            width: 100%;
            height: 100%;
            overflow: auto;
            position: relative;
            background: transparent;
        `;
        
        this.target.appendChild(this.tableContainer);
        
        // Agregar soporte para teclado
        this.tableContainer.setAttribute("tabindex", "0");
        this.tableContainer.setAttribute("role", "table");
        this.tableContainer.setAttribute("aria-label", "Tabla personalizada de datos");
    }

    public update(options: VisualUpdateOptions): void {
        const dataView = options.dataViews && options.dataViews[0];
        if (!dataView || !dataView.table) {
            // ✅ SEGURO: Método DOM seguro en lugar de innerHTML
            clearContainer(this.tableContainer);
            const noDataDiv = document.createElement('div');
            noDataDiv.style.cssText = 'padding:20px;text-align:center;color:#666;';
            noDataDiv.textContent = 'No hay datos disponibles';
            this.tableContainer.appendChild(noDataDiv);
            return;
        }

        this.settings = getFormattingSettings(dataView);
        this.settings = applyStylePreset(this.settings.preset, this.settings);
        
        const { columns, rows } = dataView.table;

        // Debug ESPECÍFICO para configuración actual
        console.log("🚨 DEBUG CONFIGURACIÓN ACTUAL:");
        console.log("   - Columnas en sección 'Columnas':", columns.filter((_, i) => i < 10).map(c => c.displayName));
        console.log("   - Total de columnas:", columns.length);
        console.log("   - Total de filas RECIBIDAS:", rows.length);
        console.log("   - Primera fila completa:", rows[0]);
        console.log("   - Longitud de primera fila:", rows[0] ? rows[0].length : 0);
        console.log("   - Valores únicos en col 0:", rows.length > 0 ? new Set(rows.map(r => r[0])).size : 0);
        console.log("   - ¿Hay identidad de filas?", dataView.table.identity ? "SÍ - " + dataView.table.identity.length : "NO");
        
        // ✅ NUEVO: Detectar si está en modo detalle (sin agrupación)
        const isModoDetalle = dataView.table.identity && dataView.table.identity.length === rows.length;
        console.log("   - ¿Modo detalle detectado?", isModoDetalle ? "SÍ" : "NO");
        
        if (isModoDetalle) {
            console.log("✅ MODO DETALLE DETECTADO: Cada fila tiene identidad única");
        }
        
        // Detectar si Power BI está agrupando automáticamente
        if (rows.length > 0) {
            const firstColumnValues = rows.map(row => row[0]);
            const uniqueValues = new Set(firstColumnValues);
            const duplicatesDetected = firstColumnValues.length !== uniqueValues.size;
            
            if (duplicatesDetected) {
                console.error("🚨 PROBLEMA DETECTADO: Power BI está agrupando datos automáticamente");
                console.error("   - Filas recibidas:", rows.length);
                console.error("   - Valores únicos:", uniqueValues.size);
                console.error("   - SOLUCIÓN: Usar 'Contenido Dinámico' en lugar de 'Columnas'");
            } else {
                console.log("✅ DATOS CORRECTOS: Sin agrupación detectada");
            }
        }
        
        // Verificar si se perdieron datos vs la fuente original
        if (rows.length < 10) {
            console.warn("⚠️ ADVERTENCIA: Muy pocas filas recibidas");
            console.warn("   - Esto indica pérdida de datos por agrupación");
            console.warn("   - SOLUCIÓN INMEDIATA: Mover campos a 'Contenido Dinámico'");
        }

        // Verificar si hay columnas
        if (!columns || columns.length === 0) {
            // ✅ SEGURO: Método DOM seguro en lugar de innerHTML
            clearContainer(this.tableContainer);
            const noColumnsDiv = document.createElement('div');
            noColumnsDiv.style.cssText = 'padding:20px;text-align:center;color:#666;';
            noColumnsDiv.textContent = 'No se han agregado columnas';
            this.tableContainer.appendChild(noColumnsDiv);
            return;
        }

        // Verificar si hay filas con MENSAJE ESPECÍFICO para pérdida de datos
        if (!rows || rows.length === 0) {
            // ✅ SEGURO: Método DOM seguro en lugar de innerHTML
            clearContainer(this.tableContainer);
            const warningDiv = document.createElement('div');
            warningDiv.style.cssText = 'padding:20px;text-align:center;color:#666;background:#fff3cd;border:1px solid #ffeaa7;border-radius:8px;';
            warningDiv.innerHTML = `
                <h3 style='color:#856404;margin-top:0;'>⚠️ Sin datos visibles</h3>
                <p style='margin:10px 0;'><strong>Causa más probable:</strong> Agrupación automática por campos en "Columnas"</p>
                <div style='background:#f8f9fa;padding:15px;margin:15px 0;border-left:4px solid #007bff;text-align:left;'>
                    <p style='margin:0 0 10px 0;font-weight:bold;color:#007bff;'>🔧 SOLUCIÓN INMEDIATA:</p>
                    <ol style='margin:0;padding-left:20px;'>
                        <li>Mueve todos los campos de <strong>"Columnas"</strong> a <strong>"Contenido Dinámico"</strong></li>
                        <li>O configura cada campo como <strong>"No resumir"</strong></li>
                        <li>Mantén solo las métricas numéricas en <strong>"Valores"</strong></li>
                    </ol>
                </div>
                <p style='font-size:14px;color:#6c757d;'>Revisa la consola (F12) para más detalles técnicos</p>
            `;
            this.tableContainer.appendChild(warningDiv);
            return;
        }

        // ⚠️ DETECCIÓN AUTOMÁTICA DE PROBLEMAS (mejorada - solo si NO está en modo detalle)
        const problemasDetectados: string[] = [];
        
        if (!isModoDetalle) {
            // Detectar pérdida de filas por agrupación automática
            if (rows.length < 50 && columns.length > 3) {
                problemasDetectados.push("PÉRDIDA DE DATOS: Muy pocas filas con muchas columnas - agrupación automática detectada");
            }
            
            // Detectar valores únicos vs total de filas (con verificación segura)
            if (rows.length > 0 && rows[0] && rows[0].length > 0) {
                const uniqueFirstColumnValues = new Set(rows.map(row => row && row[0] ? row[0] : "null"));
                if (uniqueFirstColumnValues.size < rows.length * 0.9) {
                    problemasDetectados.push("AGRUPACIÓN DETECTADA: Menos valores únicos que filas");
                }
                
                // Detectar ratio sospechoso de filas vs columnas
                if (rows.length < 30 && columns.length > 6) {
                    problemasDetectados.push("RATIO SOSPECHOSO: Pocas filas (" + rows.length + ") vs muchas columnas (" + columns.length + ")");
                }
            }
            
            // Mostrar alerta específica para pérdida de datos
            if (problemasDetectados.length > 0) {
                console.error("🚨 PÉRDIDA DE DATOS DETECTADA:");
                problemasDetectados.forEach(problema => console.error(`   - ${problema}`));
                console.error("🔧 SOLUCIÓN INMEDIATA:");
                console.error("   1. MOVER campos de 'Columnas' a 'Contenido Dinámico'");
                console.error("   2. O USAR 'Valores' con campos configurados como 'No resumir'");
                console.error("   3. VERIFICAR que cada campo esté como 'No resumir'");
            }
        } else {
            console.log("✅ CONFIGURACIÓN VÁLIDA: Modo detalle detectado - sin agrupación");
        }

        // ✅ INICIALIZAR HTML CORRECTAMENTE
        let html = "";

        // DETECCIÓN AUTOMÁTICA de pérdida de datos por agrupación (solo si NO es modo detalle)
        if (!isModoDetalle && rows.length > 0 && rows.length < 50) {
            const firstColumnValues = rows.map(row => row[0]);
            const uniqueValues = new Set(firstColumnValues);
            
            // Si hay muy pocas filas y muchas columnas, probablemente hay agrupación
            if (columns.length > 5 && uniqueValues.size < 15) {
                console.error("🚨 PÉRDIDA DE DATOS DETECTADA - Mostrando alerta al usuario");
                
                const alertHtml = `
                    <div style='background:#fff3cd;border:1px solid #ffeaa7;padding:10px;margin-bottom:15px;border-radius:4px;'>
                        <strong style='color:#856404;'>⚠️ Advertencia:</strong> 
                        <span style='color:#856404;'>Solo ${rows.length} filas visibles. Posible agrupación automática. </span>
                        <button onclick='alert("SOLUCIÓN:\\n1. Mover campos de Columnas a Contenido Dinámico\\n2. O usar Valores con No resumir\\n3. Configurar cada campo como No resumir")' style='background:#007bff;color:white;border:none;padding:4px 8px;border-radius:3px;cursor:pointer;margin-left:5px;'>Ver Solución</button>
                    </div>
                `;
                
                html = alertHtml + html;
            }
        } else if (isModoDetalle) {
            // Mostrar mensaje de éxito para modo detalle
            const successHtml = `
                <div style='background:#d4edda;border:1px solid #c3e6cb;padding:8px;margin-bottom:10px;border-radius:4px;'>
                    <strong style='color:#155724;'>✅ Configuración válida:</strong> 
                    <span style='color:#155724;'>Modo detalle activo - ${rows.length} filas sin agrupación</span>
                </div>
            `;
            html = successHtml + html;
        }

        // Título si está habilitado
        if (this.settings.showTitle) {
            html += `<div style="
                font-family:${this.settings.fontFamily};
                font-size:${this.settings.titleFontSize}px;
                color:${this.settings.titleFontColor};
                font-weight:bold;
                text-align:center;
                margin-bottom:10px;
            ">${this.settings.titleText}</div>`;
        }

        html += `<div style="
            width: 100%;
            height: 100%;
            overflow: auto;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
        ">
        <table style="
            width: 100%;
            border-collapse: collapse;
            font-family: ${this.settings.fontFamily};
            font-size: ${this.settings.fontSize}px;
            ${this.settings.sombra ? "box-shadow: 2px 2px 10px rgba(0,0,0,0.12);" : ""}
            min-width: 100%;
            table-layout: auto;
        ">`;

        // Encabezado con atributos de accesibilidad y header sticky configurable
        const stickyHeaderStyle = this.settings.headerSticky ? "position: sticky; top: 0; z-index: 10;" : "";
        html += `<thead role="rowgroup" style="${stickyHeaderStyle} background: white;"><tr role="row">`;
        columns.forEach((col, index) => {
            const columnName = col ? col.displayName : `Columna_${index}`;
            const columnType = col && col.type ? col.type : "unknown";
            console.log(`🔍 Columna ${index}: ${columnName} (${columnType})`);
            html += `<th role="columnheader" title="${columnName}" style="
                background: ${this.settings.headerBgColor};
                color: ${this.settings.headerFontColor};
                text-align: ${this.settings.headerAlign};
                font-weight: 700;
                padding: 8px 8px;
                border-bottom: 2px solid #bbb;
                border-right: 1px solid #ddd;
                min-width: ${this.settings.minColumnWidth}px;
                max-width: ${this.settings.maxColumnWidth}px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                ${this.settings.headerSticky ? "position: sticky; top: 0; z-index: 11;" : ""}
            ">${columnName}</th>`;
        });
        html += "</tr></thead>";

        // Cuerpo con minigráficos/imagenes/tooltips enriquecidos y soporte para highlights
        html += '<tbody role="rowgroup">';
        rows.forEach((row, rowIdx) => {
            console.log(`🔍 Fila ${rowIdx}:`, row);
            
            const bgColor = rowIdx % 2 === 0 ? this.settings.evenRowBgColor : this.settings.oddRowBgColor;
            html += `<tr role="row" style="background:${bgColor};" data-row-index="${rowIdx}">`;
            
            // Iterar sobre columnas en lugar de sobre la fila para evitar problemas con filas incompletas
            columns.forEach((column, colIdx) => {
                // Obtener el valor de la celda de forma segura
                const cell = row && row[colIdx] !== undefined ? row[colIdx] : null;
                
                const columnName = column ? column.displayName : `Columna_${colIdx}`;
                console.log(`🔍 Celda [${rowIdx},${colIdx}] (${columnName}):`, cell, typeof cell);
                
                // Detecta el tipo de minigráfico por nombre de columna
                let tipoMini: "line" | "bar" | "column" = "line";
                const colName = columnName.toLowerCase();
                if (colName.includes("sparkbar")) tipoMini = "bar";
                if (colName.includes("sparkcol")) tipoMini = "column";
                
                const cellContent = renderCell(cell, tipoMini, columnName, this.settings);

                // Tooltip enriquecido con información del contexto
                const tooltip = `Columna: ${columnName}\nValor: ${typeof cell === "object" ? JSON.stringify(cell) : String(cell)}\nFila: ${rowIdx + 1}`;
                
                html += `<td role="cell" style="
                    text-align: ${this.settings.alignHorizontal};
                    vertical-align: ${this.settings.alignVertical};
                    padding: 6px 8px;
                    border-bottom: 1px solid #ededed;
                    border-right: 1px solid #f0f0f0;
                    min-width: ${this.settings.minColumnWidth}px;
                    max-width: ${this.settings.maxColumnWidth}px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    position: relative;
                " title="${tooltip}" data-col-index="${colIdx}" tabindex="0">${cellContent}</td>`;
            });
            html += "</tr>";
        });
        html += "</tbody></table></div>";

        // ✅ SEGURO: Método DOM seguro en lugar de innerHTML
        updateContainerSafely(this.tableContainer, html);

        // Configurar eventos para interacciones y tooltips avanzados
        try {
            this.setupInteractions(dataView);
        } catch (error) {
            console.warn("Error configurando interacciones:", error);
        }
    }

    private setupInteractions(dataView: DataView): void {
        if (!this.tableContainer) {
            return;
        }

        const rows = this.tableContainer.querySelectorAll('tbody tr');
        
        for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
            const row = rows[rowIndex];
            if (!row) continue;
            
            const cells = row.querySelectorAll('td');
            
            // Agregar eventos de clic para selección
            row.addEventListener('click', (event) => {
                if (event) {
                    event.preventDefault();
                }
                console.log('Fila ' + (rowIndex + 1) + ' seleccionada');
            });

            // Agregar soporte para navegación con teclado
            for (let colIndex = 0; colIndex < cells.length; colIndex++) {
                const cell = cells[colIndex];
                if (!cell) continue;
                
                cell.addEventListener('keydown', (event) => {
                    if (event && (event.key === 'Enter' || event.key === ' ')) {
                        event.preventDefault();
                        console.log('Celda [' + (rowIndex + 1) + ', ' + (colIndex + 1) + '] activada');
                    }
                });

                // Tooltip básico
                cell.addEventListener('mouseenter', () => {
                    if (dataView && dataView.table && dataView.table.columns && dataView.table.rows) {
                        const columnName = (dataView.table.columns[colIndex] && dataView.table.columns[colIndex].displayName) ? 
                            dataView.table.columns[colIndex].displayName : 
                            'Columna_' + colIndex;
                        const cellValue = (dataView.table.rows[rowIndex] && 
                            dataView.table.rows[rowIndex][colIndex] !== undefined) ? 
                            String(dataView.table.rows[rowIndex][colIndex]) : 
                            'N/A';
                        const tooltipText = columnName + ': ' + cellValue;
                        
                        cell.setAttribute('title', tooltipText);
                    }
                });
            }
        }
    }

    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
        const objectName = options.objectName;
        const instances: VisualObjectInstance[] = [];

        switch (objectName) {
            case "rowFormatting":
                instances.push({
                    objectName: objectName,
                    selector: null,
                    properties: {
                        evenRowBgColor: this.settings?.evenRowBgColor || "#f5f8ff",
                        oddRowBgColor: this.settings?.oddRowBgColor || "#fff"
                    }
                });
                break;

            case "columnFormatting":
                instances.push({
                    objectName: objectName,
                    selector: null,
                    properties: {
                        alignHorizontal: this.settings?.alignHorizontal || "center",
                        alignVertical: this.settings?.alignVertical || "middle"
                    }
                });
                break;

            case "headerFormatting":
                instances.push({
                    objectName: objectName,
                    selector: null,
                    properties: {
                        headerBgColor: this.settings?.headerBgColor || "#eaeaea",
                        headerFontColor: this.settings?.headerFontColor || "#262626",
                        headerAlign: this.settings?.headerAlign || "center"
                    }
                });
                break;

            case "cellFormatting":
                instances.push({
                    objectName: objectName,
                    selector: null,
                    properties: {
                        fontFamily: this.settings?.fontFamily || "Segoe UI, Arial, sans-serif",
                        fontSize: this.settings?.fontSize || 12
                    }
                });
                break;

            case "sombra":
                instances.push({
                    objectName: objectName,
                    selector: null,
                    properties: {
                        enableShadow: this.settings?.sombra || false
                    }
                });
                break;

            case "stylePreset":
                instances.push({
                    objectName: objectName,
                    selector: null,
                    properties: {
                        preset: this.settings?.preset || "PowerBI"
                    }
                });
                break;

            case "title":
                instances.push({
                    objectName: objectName,
                    selector: null,
                    properties: {
                        show: this.settings?.showTitle || false,
                        titleText: this.settings?.titleText || "Mi Tabla",
                        fontColor: this.settings?.titleFontColor || "#000000",
                        fontSize: this.settings?.titleFontSize || 16
                    }
                });
                break;

            case "minicharts":
                instances.push({
                    objectName: objectName,
                    selector: null,
                    properties: {
                        donutSize: this.settings?.donutSize || 24,
                        daxSvgSize: this.settings?.daxSvgSize || 36,
                        donutColor: this.settings?.donutColor || "#4682B4",
                        sparklineColor: this.settings?.sparklineColor || "#4682B4",
                        autoDetectStatus: this.settings?.autoDetectStatus !== false,
                        autoDetectPercentages: this.settings?.autoDetectPercentages !== false
                    }
                });
                break;

            case "tableSettings":
                instances.push({
                    objectName: objectName,
                    selector: null,
                    properties: {
                        enableScroll: this.settings?.enableScroll !== false,
                        headerSticky: this.settings?.headerSticky !== false,
                        maxColumnWidth: this.settings?.maxColumnWidth || 200,
                        minColumnWidth: this.settings?.minColumnWidth || 80
                    }
                });
                break;
        }

        return instances;
    }
}