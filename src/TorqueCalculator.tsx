import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Info, Calculator, Menu } from "lucide-react";

// Reference ranges compiled from industry sources for common closure sizes (mm)
// Values are application torque in in-lb.
// Sources: 
//   - Plastic Bottle Corporation (PBC) - Torque Guidelines for Capping Bottles
//   - Reliable Caps (24mm, 28mm, 38mm)
//   - MJS Packaging (50% rule)
//   - Industry standards
const TABLE_RANGES: Record<number, { min: number; max: number }> = {
   8: { min: 3, max: 7 },    // PBC
  10: { min: 4, max: 8 },    // PBC
  13: { min: 5, max: 9 },    // PBC
  15: { min: 5, max: 9 },    // PBC
  18: { min: 7, max: 10 },   // PBC
  20: { min: 8, max: 12 },   // PBC
  22: { min: 9, max: 14 },   // PBC
  24: { min: 10, max: 18 },  // PBC, Reliable Caps
  28: { min: 12, max: 21 },  // PBC, Reliable Caps
  30: { min: 13, max: 23 },  // PBC
  33: { min: 15, max: 25 },  // PBC
  38: { min: 17, max: 26 },  // PBC, Reliable Caps
  43: { min: 17, max: 27 },  // PBC
  48: { min: 19, max: 30 },  // PBC
  53: { min: 21, max: 36 },  // PBC
  58: { min: 23, max: 40 },  // PBC
  63: { min: 25, max: 43 },  // PBC
  66: { min: 26, max: 45 },  // PBC
  70: { min: 28, max: 50 },  // PBC
  83: { min: 32, max: 60 },  // PBC
  86: { min: 40, max: 65 },  // PBC
  89: { min: 40, max: 70 },  // PBC
 100: { min: 45, max: 70 },  // PBC
 110: { min: 45, max: 70 },  // PBC
};

// SPI Neck Finish Specifications (pb-7)
// Dimensions in inches (converted from table values)
// H: Height of neck finish, S: Top to first thread, I: Inner diameter, T: Outside diameter of thread, E: Outside diameter of neck
// Sources: SPI pb-7 - SPI Neck Finish Specifications for Standard Closures
type SPISpec = {
  spiSize: number;
  h?: { min: number; max: number }; // Height of neck finish (inches)
  s?: { min: number; max: number }; // Top to first thread (inches)
  i?: { min: number; max: number }; // Inner diameter (inches)
  t: { min: number; max: number }; // Outside diameter of thread (inches) - key dimension
  e?: { min: number; max: number }; // Outside diameter of neck (inches)
  threadsPerInch?: number;
};

const SPI_SPECS: Record<number, SPISpec> = {
  13: { spiSize: 13, t: { min: 0.502, max: 0.514 }, e: { min: 0.442, max: 0.454 }, s: { min: 0.022, max: 0.052 }, i: { min: 0.218, max: 0.218 }, threadsPerInch: 12 },
  15: { spiSize: 15, t: { min: 0.569, max: 0.581 }, e: { min: 0.509, max: 0.521 }, s: { min: 0.022, max: 0.052 }, i: { min: 0.258, max: 0.258 }, threadsPerInch: 12 },
  18: { spiSize: 18, t: { min: 0.688, max: 0.704 }, e: { min: 0.604, max: 0.620 }, s: { min: 0.356, max: 0.386 }, i: { min: 0.508, max: 0.538 }, h: { min: 0.602, max: 0.632 }, threadsPerInch: 8 },
  20: { spiSize: 20, t: { min: 0.767, max: 0.783 }, e: { min: 0.683, max: 0.699 }, s: { min: 0.356, max: 0.386 }, i: { min: 0.539, max: 0.569 }, h: { min: 0.727, max: 0.757 }, threadsPerInch: 8 },
  22: { spiSize: 22, t: { min: 0.846, max: 0.862 }, e: { min: 0.762, max: 0.778 }, s: { min: 0.356, max: 0.386 }, i: { min: 0.570, max: 0.600 }, h: { min: 0.822, max: 0.852 }, threadsPerInch: 8 },
  24: { spiSize: 24, t: { min: 0.924, max: 0.940 }, e: { min: 0.840, max: 0.856 }, s: { min: 0.385, max: 0.415 }, i: { min: 0.631, max: 0.661 }, h: { min: 0.942, max: 0.972 }, threadsPerInch: 8 },
  28: { spiSize: 28, t: { min: 1.068, max: 1.088 }, e: { min: 0.974, max: 0.994 }, s: { min: 0.385, max: 0.415 }, i: { min: 0.693, max: 0.723 }, h: { min: 1.067, max: 1.097 }, threadsPerInch: 6 },
  30: { spiSize: 30, t: { min: 1.107, max: 1.127 }, e: { min: 1.013, max: 1.033 }, s: { min: 0.388, max: 0.418 }, threadsPerInch: 6 },
  33: { spiSize: 33, t: { min: 1.241, max: 1.265 }, e: { min: 1.147, max: 1.171 }, s: { min: 0.388, max: 0.418 }, i: { min: 1.259, max: 1.289 }, threadsPerInch: 6 },
  35: { spiSize: 35, t: { min: 1.340, max: 1.364 }, e: { min: 1.246, max: 1.270 }, s: { min: 0.388, max: 0.418 }, threadsPerInch: 6 },
  38: { spiSize: 38, t: { min: 1.452, max: 1.476 }, e: { min: 1.358, max: 1.382 }, s: { min: 0.388, max: 0.418 }, threadsPerInch: 6 },
  40: { spiSize: 40, t: { min: 1.550, max: 1.58 }, e: { min: 1.465, max: 1.486 }, s: { min: 0.388, max: 0.418 }, threadsPerInch: 6 },
  43: { spiSize: 43, t: { min: 1.624, max: 1.654 }, e: { min: 1.530, max: 1.560 }, s: { min: 0.388, max: 0.418 }, threadsPerInch: 6 },
  45: { spiSize: 45, t: { min: 1.710, max: 1.740 }, e: { min: 1.616, max: 1.646 }, s: { min: 0.388, max: 0.418 }, threadsPerInch: 6 },
  48: { spiSize: 48, t: { min: 1.840, max: 1.870 }, e: { min: 1.746, max: 1.776 }, s: { min: 0.388, max: 0.418 }, threadsPerInch: 6 },
  51: { spiSize: 51, t: { min: 1.933, max: 1.968 }, e: { min: 1.839, max: 1.874 }, s: { min: 0.393, max: 0.423 }, threadsPerInch: 6 },
  53: { spiSize: 53, t: { min: 2.032, max: 2.067 }, e: { min: 1.938, max: 1.973 }, s: { min: 0.393, max: 0.423 }, threadsPerInch: 6 },
  58: { spiSize: 58, t: { min: 2.189, max: 2.224 }, e: { min: 2.095, max: 2.130 }, s: { min: 0.393, max: 0.423 }, threadsPerInch: 6 },
  60: { spiSize: 60, t: { min: 2.307, max: 2.342 }, e: { min: 2.213, max: 2.248 }, s: { min: 0.393, max: 0.423 }, threadsPerInch: 6 },
  63: { spiSize: 63, t: { min: 2.426, max: 2.461 }, e: { min: 2.332, max: 2.367 }, s: { min: 0.393, max: 0.423 }, threadsPerInch: 6 },
  66: { spiSize: 66, t: { min: 2.544, max: 2.579 }, e: { min: 2.450, max: 2.485 }, s: { min: 0.393, max: 0.423 }, threadsPerInch: 6 },
  70: { spiSize: 70, t: { min: 2.701, max: 2.736 }, e: { min: 2.607, max: 2.642 }, s: { min: 0.393, max: 0.423 }, threadsPerInch: 6 },
  75: { spiSize: 75, t: { min: 2.878, max: 2.913 }, e: { min: 2.784, max: 2.819 }, s: { min: 0.393, max: 0.423 }, threadsPerInch: 6 },
  77: { spiSize: 77, t: { min: 3.00, max: 3.035 }, e: { min: 2.906, max: 2.914 }, s: { min: 0.472, max: 0.502 }, threadsPerInch: 6 },
  83: { spiSize: 83, t: { min: 3.233, max: 3.268 }, e: { min: 3.113, max: 3.148 }, s: { min: 0.472, max: 0.502 }, threadsPerInch: 5 },
  89: { spiSize: 89, t: { min: 3.476, max: 3.511 }, e: { min: 3.356, max: 3.391 }, s: { min: 0.520, max: 0.550 }, threadsPerInch: 5 },
  100: { spiSize: 100, t: { min: 3.902, max: 3.937 }, e: { min: 3.782, max: 3.817 }, s: { min: 0.582, max: 0.612 }, threadsPerInch: 5 },
  110: { spiSize: 110, t: { min: 4.296, max: 4.331 }, e: { min: 4.176, max: 4.211 }, s: { min: 0.582, max: 0.612 }, threadsPerInch: 5 },
  120: { spiSize: 120, t: { min: 4.689, max: 4.724 }, e: { min: 4.569, max: 4.604 }, s: { min: 0.670, max: 0.700 }, threadsPerInch: 5 },
};

// Convert inches to mm for display
const inchesToMm = (inches: number) => inches * 25.4;
const mmToInches = (mm: number) => mm / 25.4;

// Get SPI size from T dimension (outside diameter of thread)
// Returns the closest matching SPI size based on T dimension in mm
function getSPISizeFromTDimension(tMm: number): number | null {
  let closestSize: number | null = null;
  let minDiff = Infinity;
  
  for (const [size, spec] of Object.entries(SPI_SPECS)) {
    const tMinMm = inchesToMm(spec.t.min);
    const tMaxMm = inchesToMm(spec.t.max);
    const tCenterMm = (tMinMm + tMaxMm) / 2;
    const diff = Math.abs(tMm - tCenterMm);
    
    if (diff < minDiff && tMm >= tMinMm && tMm <= tMaxMm) {
      minDiff = diff;
      closestSize = parseInt(size);
    }
  }
  
  // If no exact match, find closest
  if (closestSize === null) {
    for (const [size, spec] of Object.entries(SPI_SPECS)) {
      const tCenterMm = (inchesToMm(spec.t.min) + inchesToMm(spec.t.max)) / 2;
      const diff = Math.abs(tMm - tCenterMm);
      if (diff < minDiff) {
        minDiff = diff;
        closestSize = parseInt(size);
      }
    }
  }
  
  return closestSize;
}

type Mode = "table" | "rule";
type Units = "inlb" | "N·m";
type ViewMode = "operator" | "debug";

const toNm = (inlb: number) => inlb * 0.113; // 1 in-lb ≈ 0.113 N·m
function convert(inlb: number, units: Units) {
  if (units === "inlb") return inlb;
  return toNm(inlb);
}

function fmt(value: number, units: Units) {
  const v = convert(value, units);
  const digits = units === "N·m" ? 3 : 1;
  return v.toFixed(digits);
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const DIAMETER_RANGE = { min: 10, max: 130 };
const REMOVAL_RANGE = { min: 30, max: 70 };
const UNIT_LABELS: Record<Units, { label: string; description: string }> = {
  inlb: { label: "US", description: "in-lb" },
  "N·m": { label: "Metric", description: "N·m" },
};

export default function TorqueCalculator() {
  const [diameter, setDiameter] = useState<number>(38);
  const [mode, setMode] = useState<Mode>("table");
  const [units, setUnits] = useState<Units>("inlb");
  const [removalPct, setRemovalPct] = useState<[number]>([50]); // expected removal as % of application
  const [debugMode, setDebugMode] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>("operator");
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [spiSize, setSpiSize] = useState<number | null>(null);

  const updateDiameter = (value: number) => {
    const clamped = clamp(value, DIAMETER_RANGE.min, DIAMETER_RANGE.max);
    setDiameter(clamped);
    // Auto-detect SPI size from diameter (assuming diameter ≈ T dimension in mm)
    const detectedSpi = getSPISizeFromTDimension(clamped);
    setSpiSize(detectedSpi);
  };
  const adjustDiameter = (delta: number) => setDiameter((prev) => {
    const newVal = clamp(prev + delta, DIAMETER_RANGE.min, DIAMETER_RANGE.max);
    const detectedSpi = getSPISizeFromTDimension(newVal);
    setSpiSize(detectedSpi);
    return newVal;
  });
  const updateRemovalPct = (value: number) => setRemovalPct([clamp(value, REMOVAL_RANGE.min, REMOVAL_RANGE.max)]);
  
  // Update diameter when SPI size is selected
  const handleSpiSizeChange = (size: number | null) => {
    setSpiSize(size);
    if (size && SPI_SPECS[size]) {
      // Use the center of T dimension range as the diameter
      const tCenterMm = (inchesToMm(SPI_SPECS[size].t.min) + inchesToMm(SPI_SPECS[size].t.max)) / 2;
      setDiameter(Math.round(tCenterMm));
    }
  };
  
  const currentSpiSpec = spiSize ? SPI_SPECS[spiSize] : null;
  
  // Initialize SPI size detection on mount
  useEffect(() => {
    const detectedSpi = getSPISizeFromTDimension(diameter);
    setSpiSize(detectedSpi);
  }, []);

  const appRange = useMemo(() => {
    if (mode === "table" && TABLE_RANGES[diameter]) {
      return TABLE_RANGES[diameter as keyof typeof TABLE_RANGES];
    }
    // Rule of thumb: application torque ≈ 50% of cap diameter (mm), with a ±20% band.
    const center = diameter * 0.5;
    const min = center * 0.8;
    const max = center * 1.2;
    return { min, max };
  }, [diameter, mode]);

  const removal = useMemo(() => {
    const pct = removalPct[0] / 100;
    return {
      min: appRange.min * pct,
      max: appRange.max * pct,
    };
  }, [appRange, removalPct]);

  const hasExact = useMemo(() => Boolean(TABLE_RANGES[diameter]), [diameter]);

  const debugInfo = useMemo(() => {
    const calculationSteps: string[] = [];
    let centerValue: number | null = null;
    let calculationUsed = "";

    if (mode === "table" && TABLE_RANGES[diameter]) {
      calculationUsed = "Table Lookup (PBC Guidelines)";
      calculationSteps.push(`Found exact table entry for ${diameter} mm diameter`);
      calculationSteps.push(`Table value (PBC): ${TABLE_RANGES[diameter].min} - ${TABLE_RANGES[diameter].max} in-lb`);
    } else if (mode === "rule") {
      calculationUsed = "50% Rule";
      centerValue = diameter * 0.5;
      calculationSteps.push("Step 1: Calculate center value = diameter × 0.5");
      calculationSteps.push(`  Center = ${diameter} mm × 0.5 = ${centerValue} in-lb`);
      calculationSteps.push("Step 2: Apply ±20% tolerance band");
      calculationSteps.push(`  Min = ${centerValue} × 0.8 = ${appRange.min.toFixed(2)} in-lb`);
      calculationSteps.push(`  Max = ${centerValue} × 1.2 = ${appRange.max.toFixed(2)} in-lb`);
    } else {
      calculationUsed = "50% Rule (fallback)";
      centerValue = diameter * 0.5;
      calculationSteps.push(`No table entry found for ${diameter} mm, using 50% rule`);
      calculationSteps.push("Step 1: Calculate center value = diameter × 0.5");
      calculationSteps.push(`  Center = ${diameter} mm × 0.5 = ${centerValue} in-lb`);
      calculationSteps.push("Step 2: Apply ±20% tolerance band");
      calculationSteps.push(`  Min = ${centerValue} × 0.8 = ${appRange.min.toFixed(2)} in-lb`);
      calculationSteps.push(`  Max = ${centerValue} × 1.2 = ${appRange.max.toFixed(2)} in-lb`);
    }

    calculationSteps.push(`Application Range: ${appRange.min.toFixed(2)} - ${appRange.max.toFixed(2)} in-lb`);
    calculationSteps.push("");
    calculationSteps.push("Removal Calculation:");
    calculationSteps.push(`Removal percentage: ${removalPct[0]}%`);
    calculationSteps.push(`Removal min = ${appRange.min.toFixed(2)} × ${removalPct[0]}% = ${removal.min.toFixed(2)} in-lb`);
    calculationSteps.push(`Removal max = ${appRange.max.toFixed(2)} × ${removalPct[0]}% = ${removal.max.toFixed(2)} in-lb`);

    if (units !== "inlb") {
      calculationSteps.push("");
      calculationSteps.push(`Unit Conversion (${units}):`);
      calculationSteps.push("Conversion factor: 1 in-lb = 0.113 N·m");
        calculationSteps.push(`Application min: ${appRange.min.toFixed(2)} × 0.113 = ${convert(appRange.min, units).toFixed(3)} N·m`);
        calculationSteps.push(`Application max: ${appRange.max.toFixed(2)} × 0.113 = ${convert(appRange.max, units).toFixed(3)} N·m`);
        calculationSteps.push(`Removal min: ${removal.min.toFixed(2)} × 0.113 = ${convert(removal.min, units).toFixed(3)} N·m`);
        calculationSteps.push(`Removal max: ${removal.max.toFixed(2)} × 0.113 = ${convert(removal.max, units).toFixed(3)} N·m`);
    }

    return {
      calculationUsed,
      centerValue,
      steps: calculationSteps,
      rawValues: {
        diameter,
        appRangeInLb: appRange,
        removalInLb: removal,
        removalPct: removalPct[0],
        units,
      },
    };
  }, [diameter, mode, appRange, removal, removalPct, units]);

  const handleCopyResults = async () => {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify({ diameter, appRange, removal, units, mode }, null, 2),
      );
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const renderOperatorMode = () => (
    <div className="space-y-2 h-full overflow-hidden">
      <Card className="shadow-sm">
        <CardContent className="space-y-4 p-4">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-wide text-slate-500 font-semibold">
              Cap diameter
            </p>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                className="h-16 w-16 text-3xl"
                onClick={() => adjustDiameter(-1)}
                disabled={diameter <= DIAMETER_RANGE.min}
                aria-label="Decrease cap diameter"
              >
                –
              </Button>
              <div className="flex-1 text-center">
                <p className="text-4xl font-bold tabular-nums">{diameter}</p>
                <p className="text-xs uppercase tracking-wide text-slate-500">mm</p>
              </div>
              <Button
                className="h-16 w-16 text-3xl"
                onClick={() => adjustDiameter(1)}
                disabled={diameter >= DIAMETER_RANGE.max}
                aria-label="Increase cap diameter"
              >
                +
              </Button>
            </div>
            <div className="py-2">
              <Slider
                value={[diameter]}
                min={DIAMETER_RANGE.min}
                max={DIAMETER_RANGE.max}
                step={1}
                onValueChange={(v) => updateDiameter(v[0])}
                aria-label="Adjust cap diameter"
                className="touch-manipulation"
              />
            </div>
            <p className="text-xs text-slate-500 text-center">
              Common: 8, 10, 13, 15, 18, 20, 22, 24, 28, 30, 33, 38, 43, 48, 53, 58, 63, 66, 70, 83, 86, 89, 100, 110 mm
            </p>
          </div>

          <div className="space-y-2 border-t pt-4">
            <p className="text-sm uppercase tracking-wide text-slate-500 font-semibold">
              SPI Neck Size
            </p>
            <Select 
              value={spiSize?.toString() || ""} 
              onValueChange={(v) => handleSpiSizeChange(v ? parseInt(v) : null)}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select SPI size (auto-detected)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {Object.keys(SPI_SPECS).map((size) => (
                  <SelectItem key={size} value={size}>
                    SPI {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {spiSize && (
              <p className="text-xs text-slate-500">
                Detected from diameter. T dimension: {inchesToMm(currentSpiSpec!.t.min).toFixed(1)}-{inchesToMm(currentSpiSpec!.t.max).toFixed(1)} mm
              </p>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm uppercase tracking-wide text-slate-500 font-semibold">
              Calculation
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={mode === "table" ? "default" : "outline"}
                className="h-14 text-lg"
                onClick={() => setMode("table")}
              >
                Table
              </Button>
              <Button
                variant={mode === "rule" ? "default" : "outline"}
                className="h-14 text-lg"
                onClick={() => setMode("rule")}
              >
                50% Rule
              </Button>
            </div>
            <p className="text-xs text-slate-500">
              {mode === "table"
                ? hasExact
                  ? "Using PBC torque guidelines for this diameter."
                  : "No table entry for this diameter. Using 50% rule fallback."
                : "Torque ≈ diameter × 0.5 with ±20% tolerance band."}
            </p>
          </div>
        </CardContent>
      </Card>

      {currentSpiSpec && (
        <Card className="shadow-sm border-blue-200 bg-blue-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">SPI {spiSize} Neck Finish Specifications</CardTitle>
            <p className="text-xs text-slate-600">pb-7 Standard Closures</p>
          </CardHeader>
          <CardContent className="space-y-3 p-4 pt-0">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-slate-500 font-semibold mb-1">T Dimension (Thread OD)</p>
                <p className="font-mono">{currentSpiSpec.t.min.toFixed(3)}" - {currentSpiSpec.t.max.toFixed(3)}"</p>
                <p className="text-xs text-slate-400">({inchesToMm(currentSpiSpec.t.min).toFixed(1)} - {inchesToMm(currentSpiSpec.t.max).toFixed(1)} mm)</p>
              </div>
              {currentSpiSpec.e && (
                <div>
                  <p className="text-xs text-slate-500 font-semibold mb-1">E Dimension (Neck OD)</p>
                  <p className="font-mono">{currentSpiSpec.e.min.toFixed(3)}" - {currentSpiSpec.e.max.toFixed(3)}"</p>
                  <p className="text-xs text-slate-400">({inchesToMm(currentSpiSpec.e.min).toFixed(1)} - {inchesToMm(currentSpiSpec.e.max).toFixed(1)} mm)</p>
                </div>
              )}
              {currentSpiSpec.s && (
                <div>
                  <p className="text-xs text-slate-500 font-semibold mb-1">S Dimension (Top to Thread)</p>
                  <p className="font-mono">{currentSpiSpec.s.min.toFixed(3)}" - {currentSpiSpec.s.max.toFixed(3)}"</p>
                  <p className="text-xs text-slate-400">({inchesToMm(currentSpiSpec.s.min).toFixed(2)} - {inchesToMm(currentSpiSpec.s.max).toFixed(2)} mm)</p>
                </div>
              )}
              {currentSpiSpec.i && (
                <div>
                  <p className="text-xs text-slate-500 font-semibold mb-1">I Dimension (Inner Diameter)</p>
                  <p className="font-mono">{currentSpiSpec.i.min.toFixed(3)}" - {currentSpiSpec.i.max.toFixed(3)}"</p>
                  <p className="text-xs text-slate-400">({inchesToMm(currentSpiSpec.i.min).toFixed(1)} - {inchesToMm(currentSpiSpec.i.max).toFixed(1)} mm)</p>
                </div>
              )}
              {currentSpiSpec.h && (
                <div>
                  <p className="text-xs text-slate-500 font-semibold mb-1">H Dimension (Neck Height)</p>
                  <p className="font-mono">{currentSpiSpec.h.min.toFixed(3)}" - {currentSpiSpec.h.max.toFixed(3)}"</p>
                  <p className="text-xs text-slate-400">({inchesToMm(currentSpiSpec.h.min).toFixed(1)} - {inchesToMm(currentSpiSpec.h.max).toFixed(1)} mm)</p>
                </div>
              )}
              {currentSpiSpec.threadsPerInch && (
                <div>
                  <p className="text-xs text-slate-500 font-semibold mb-1">Threads per Inch</p>
                  <p className="font-mono text-lg">{currentSpiSpec.threadsPerInch}</p>
                </div>
              )}
            </div>
            <div className="text-xs text-slate-600 pt-2 border-t border-blue-200">
              <p className="font-semibold mb-1">Dimension Definitions:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li><strong>T:</strong> Outside diameter of thread (key dimension for closure fit)</li>
                <li><strong>E:</strong> Outside diameter of neck (minor diameter at thread root)</li>
                <li><strong>S:</strong> Distance from top to first thread (determines thread engagement)</li>
                <li><strong>I:</strong> Inner diameter (clearance for filling tubes)</li>
                <li><strong>H:</strong> Height of neck finish</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm">
        <CardContent className="space-y-4 p-4">
          <div className="space-y-2" role="region" aria-label="Application torque">
            <p className="text-sm uppercase tracking-wide text-slate-500 font-semibold">
              Application torque
            </p>
            <p className="text-3xl font-bold break-words" aria-live="polite" aria-atomic="true">
              {fmt(appRange.min, units)} – {fmt(appRange.max, units)} {UNIT_LABELS[units].description}
            </p>
            {!hasExact && mode === "table" && (
              <p className="text-xs text-amber-600 flex items-start gap-1">
                <Info className="h-4 w-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span>Table value unavailable. Showing 50% rule range.</span>
              </p>
            )}
          </div>

          <div className="space-y-2" role="region" aria-label="Removal torque">
            <p className="text-sm uppercase tracking-wide text-slate-500 font-semibold">
              Removal torque
            </p>
            <p className="text-3xl font-bold break-words" aria-live="polite" aria-atomic="true">
              {fmt(removal.min, units)} – {fmt(removal.max, units)} {UNIT_LABELS[units].description}
            </p>
            <p className="text-xs text-slate-500">
              Removal = application × {removalPct[0]}% (adjust in Debug mode).
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-lg sm:text-xl">Settings</CardTitle>
            <p className="text-xs text-slate-500">Quick configuration</p>
          </div>
          <Button
            variant="ghost"
            className="h-10 w-10 p-0"
            onClick={() => setSettingsOpen((prev) => !prev)}
            aria-expanded={settingsOpen}
            aria-label="Toggle settings"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </CardHeader>
        {settingsOpen && (
          <CardContent className="space-y-6 pt-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-wide text-slate-500 font-semibold">
                    Debug mode
                  </p>
                  <p className="text-xs text-slate-500">
                    Slide to reveal advanced controls
                  </p>
                </div>
                <span className="text-lg font-semibold">
                  {viewMode === "debug" ? "On" : "Off"}
                </span>
              </div>
              <Slider
                min={0}
                max={1}
                step={1}
                value={[viewMode === "debug" ? 1 : 0]}
                onValueChange={(val) => setViewMode(val[0] === 1 ? "debug" : "operator")}
                aria-label="Toggle debug mode"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>Operator</span>
                <span>Debug</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm uppercase tracking-wide text-slate-500 font-semibold">
                Units
              </p>
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(UNIT_LABELS) as Units[]).map((unit) => (
                  <Button
                    key={unit}
                    variant={units === unit ? "default" : "outline"}
                    className="h-16 text-lg flex flex-col"
                    onClick={() => setUnits(unit)}
                  >
                    <span className="text-lg font-semibold">{UNIT_LABELS[unit].label}</span>
                    <span className="text-xs text-white/80">
                      {UNIT_LABELS[unit].description}
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );

  const renderDebugMode = () => (
    <>
        <Card className="shadow-sm">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-xl sm:text-2xl">Inputs</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 sm:gap-4 sm:grid-cols-2">
            <div className="space-y-4 sm:space-y-3">
            <Label htmlFor="diameter" className="text-base sm:text-base block mb-2">
              Cap diameter (mm)
            </Label>
              <Input
                id="diameter"
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
              min={DIAMETER_RANGE.min}
              max={DIAMETER_RANGE.max}
                step={1}
                value={diameter}
              onChange={(e) => {
                const next = Number(e.target.value);
                if (Number.isNaN(next)) return;
                updateDiameter(next);
              }}
                className="text-lg sm:text-base h-14 sm:h-10 px-4 py-3"
                aria-label="Cap diameter in millimeters"
                aria-describedby="diameter-hint"
              />
              <div className="px-2 py-5 sm:py-3">
                <Slider
                  value={[diameter]}
                min={DIAMETER_RANGE.min}
                max={DIAMETER_RANGE.max}
                  step={1}
                onValueChange={(v) => updateDiameter(v[0])}
                  aria-label="Adjust cap diameter"
                  className="touch-manipulation"
                />
              </div>
              <p id="diameter-hint" className="text-sm sm:text-xs text-slate-500 px-2">
                Common sizes: 8, 10, 13, 15, 18, 20, 22, 24, 28, 30, 33, 38, 43, 48, 53, 58, 63, 66, 70, 83, 86, 89, 100, 110 mm
              </p>
              
              <div className="space-y-2 pt-2">
                <Label className="text-base sm:text-base block mb-2">SPI Neck Size</Label>
                <Select 
                  value={spiSize?.toString() || ""} 
                  onValueChange={(v) => handleSpiSizeChange(v ? parseInt(v) : null)}
                >
                  <SelectTrigger className="h-14 sm:h-10 text-base">
                    <SelectValue placeholder="Select SPI size (auto-detected)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {Object.keys(SPI_SPECS).map((size) => (
                      <SelectItem key={size} value={size}>
                        SPI {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {spiSize && currentSpiSpec && (
                  <p className="text-xs text-slate-500 px-2">
                    T dimension: {inchesToMm(currentSpiSpec.t.min).toFixed(1)}-{inchesToMm(currentSpiSpec.t.max).toFixed(1)} mm
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-5 sm:space-y-3">
              <div>
                <Label className="text-base sm:text-base block mb-2">Calculation mode</Label>
                <Select value={mode} onValueChange={(v: Mode) => setMode(v)}>
                  <SelectTrigger className="h-14 sm:h-10 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="table">Use guideline table (if available)</SelectItem>
                    <SelectItem value="rule">Use 50 percent rule</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm sm:text-xs text-slate-600 space-y-1 mt-3 sm:mt-2 p-3 sm:p-2 bg-slate-50 rounded leading-relaxed">
                {mode === "table" ? (
                  <>
                    <p className="font-medium">Table Mode:</p>
                  <p>
                    Uses PBC (Plastic Bottle Corporation) torque guidelines for standard closure sizes.
                    More accurate when an exact match is available.
                  </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium">50% Rule Mode:</p>
                  <p>
                    Calculates torque as 50% of the cap diameter (in mm) in in-lb, with a ±20% tolerance band. This rule is validated by MJS Packaging and industry standards.
                  </p>
                  </>
                )}
              </div>

              <div>
                <Label className="text-base sm:text-base block mb-2">Units</Label>
                <Select value={units} onValueChange={(v: Units) => setUnits(v)}>
                  <SelectTrigger className="h-14 sm:h-10 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inlb">in-lb</SelectItem>
                    <SelectItem value="N·m">N·m</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                <Label htmlFor="removal" className="text-base sm:text-base">
                  Expected removal percent
                </Label>
                  <span className="text-lg sm:text-base font-semibold text-primary px-3 py-1 bg-primary/10 rounded-md">
                    {removalPct[0]}%
                  </span>
                </div>
                <div className="px-2 py-5 sm:py-3">
                  <Slider 
                    id="removal" 
                  min={REMOVAL_RANGE.min}
                  max={REMOVAL_RANGE.max}
                    step={1} 
                    value={removalPct} 
                  onValueChange={(v) => updateRemovalPct(v[0])}
                    className="touch-manipulation"
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-400 px-2 -mt-1 mb-2">
                <span>{REMOVAL_RANGE.min}%</span>
                <span>{REMOVAL_RANGE.max}%</span>
                </div>
                <p className="text-sm sm:text-xs text-slate-500 px-2">
                <span className="text-green-600 font-medium">Typical range: 40-60%</span> of application torque.
                </p>
              </div>

              <div className="pt-2 flex items-start space-x-4 sm:space-x-3">
                <input
                  type="checkbox"
                  id="debug"
                  checked={debugMode}
                  onChange={(e) => setDebugMode(e.target.checked)}
                  className="h-6 w-6 sm:h-5 sm:w-5 rounded border-gray-300 touch-manipulation mt-1 flex-shrink-0"
                  aria-label="Enable debug mode to show calculation details"
                />
                <Label htmlFor="debug" className="cursor-pointer text-base sm:text-sm leading-tight pt-0.5">
                  Show debug calculations
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-xl sm:text-2xl">Results</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2" role="region" aria-label="Application torque results">
              <p className="text-sm font-medium">Application torque range</p>
              <p className="text-xl sm:text-2xl font-semibold break-words" aria-live="polite" aria-atomic="true">
              {fmt(appRange.min, units)} - {fmt(appRange.max, units)} {UNIT_LABELS[units].description}
              </p>
              {!hasExact && mode === "table" && (
                <p className="text-xs text-amber-600 flex items-start gap-1 mt-2" role="alert">
                  <Info className="h-4 w-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span>No exact table entry for this diameter. Showing rule of thumb instead.</span>
                </p>
              )}
            </div>

            <div className="space-y-2" role="region" aria-label="Removal torque results">
              <p className="text-sm font-medium">Estimated removal torque</p>
              <p className="text-xl sm:text-2xl font-semibold break-words" aria-live="polite" aria-atomic="true">
              {fmt(removal.min, units)} - {fmt(removal.max, units)} {UNIT_LABELS[units].description}
              </p>
              <p className="text-xs text-slate-500">
                Removal is computed as application multiplied by your percent slider.
              </p>
            </div>
          </CardContent>
        </Card>

        {currentSpiSpec && (
          <Card className="shadow-sm border-green-200 bg-green-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg sm:text-xl">SPI {spiSize} Neck Finish Specifications</CardTitle>
              <p className="text-xs text-slate-600">pb-7 Standard Closures</p>
            </CardHeader>
            <CardContent className="space-y-3 p-4 pt-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-xs text-slate-500 font-semibold mb-1">T Dimension (Thread OD)</p>
                  <p className="font-mono text-base">{currentSpiSpec.t.min.toFixed(3)}" - {currentSpiSpec.t.max.toFixed(3)}"</p>
                  <p className="text-xs text-slate-400">({inchesToMm(currentSpiSpec.t.min).toFixed(1)} - {inchesToMm(currentSpiSpec.t.max).toFixed(1)} mm)</p>
                </div>
                {currentSpiSpec.e && (
                  <div>
                    <p className="text-xs text-slate-500 font-semibold mb-1">E Dimension (Neck OD)</p>
                    <p className="font-mono text-base">{currentSpiSpec.e.min.toFixed(3)}" - {currentSpiSpec.e.max.toFixed(3)}"</p>
                    <p className="text-xs text-slate-400">({inchesToMm(currentSpiSpec.e.min).toFixed(1)} - {inchesToMm(currentSpiSpec.e.max).toFixed(1)} mm)</p>
                  </div>
                )}
                {currentSpiSpec.s && (
                  <div>
                    <p className="text-xs text-slate-500 font-semibold mb-1">S Dimension</p>
                    <p className="font-mono text-base">{currentSpiSpec.s.min.toFixed(3)}" - {currentSpiSpec.s.max.toFixed(3)}"</p>
                    <p className="text-xs text-slate-400">({inchesToMm(currentSpiSpec.s.min).toFixed(2)} - {inchesToMm(currentSpiSpec.s.max).toFixed(2)} mm)</p>
                  </div>
                )}
                {currentSpiSpec.i && (
                  <div>
                    <p className="text-xs text-slate-500 font-semibold mb-1">I Dimension (ID)</p>
                    <p className="font-mono text-base">{currentSpiSpec.i.min.toFixed(3)}" - {currentSpiSpec.i.max.toFixed(3)}"</p>
                    <p className="text-xs text-slate-400">({inchesToMm(currentSpiSpec.i.min).toFixed(1)} - {inchesToMm(currentSpiSpec.i.max).toFixed(1)} mm)</p>
                  </div>
                )}
                {currentSpiSpec.h && (
                  <div>
                    <p className="text-xs text-slate-500 font-semibold mb-1">H Dimension (Height)</p>
                    <p className="font-mono text-base">{currentSpiSpec.h.min.toFixed(3)}" - {currentSpiSpec.h.max.toFixed(3)}"</p>
                    <p className="text-xs text-slate-400">({inchesToMm(currentSpiSpec.h.min).toFixed(1)} - {inchesToMm(currentSpiSpec.h.max).toFixed(1)} mm)</p>
                  </div>
                )}
                {currentSpiSpec.threadsPerInch && (
                  <div>
                    <p className="text-xs text-slate-500 font-semibold mb-1">Threads/Inch</p>
                    <p className="font-mono text-lg">{currentSpiSpec.threadsPerInch}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {debugMode && (
          <Card className="shadow-sm border-blue-200 bg-blue-50/30">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Calculator className="h-5 w-5 flex-shrink-0" />
                <span>Debug Calculations</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-white p-3 sm:p-4 rounded border border-blue-200">
                <p className="text-sm font-semibold mb-2 text-blue-900">
                  Method Used: {debugInfo.calculationUsed}
                </p>
                {spiSize && currentSpiSpec && (
                  <div className="mb-3 pb-3 border-b border-blue-200">
                    <p className="text-xs font-semibold text-blue-900 mb-1">SPI {spiSize} Specifications:</p>
                    <p className="text-xs text-slate-700">T Dimension: {currentSpiSpec.t.min.toFixed(3)}" - {currentSpiSpec.t.max.toFixed(3)}" ({inchesToMm(currentSpiSpec.t.min).toFixed(1)} - {inchesToMm(currentSpiSpec.t.max).toFixed(1)} mm)</p>
                    <p className="text-xs text-slate-700">Cap diameter matches SPI {spiSize} T dimension range</p>
                  </div>
                )}
                <div className="space-y-1 text-xs font-mono text-slate-700 break-words">
                  {debugInfo.steps.map((step, idx) => (
                    <div key={idx} className={step === "" ? "h-2" : ""}>
                      {step}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white p-3 rounded border border-blue-200 overflow-x-auto">
                <p className="text-xs font-semibold mb-2 text-blue-900">Raw Values (in-lb):</p>
                <pre className="text-xs font-mono text-slate-700 whitespace-pre-wrap break-words">
                  {JSON.stringify({...debugInfo.rawValues, spiSize: spiSize || null}, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-sm">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-xl sm:text-2xl">Notes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 space-y-2">
            <ul className="list-disc pl-5 space-y-2 leading-relaxed">
            <li>Always validate with a calibrated cap torque tester on your actual bottle, closure, and liner.</li>
            <li>Record removal torque over time because liners can relax and torque can back off.</li>
            <li>If you change liner, resin, neck finish, or fill conditions, re-verify.</li>
            <li>Some manufacturers (e.g., Berry/Amcor) may not provide numeric torque specifications and instead use "conventional capping methods."</li>
            </ul>
            <div className="text-xs text-slate-500 mt-3">
              Table covers sizes 8-110mm based on PBC guidelines. For sizes not in the table, use the 50 percent rule (validated by MJS Packaging) or your supplier specification.
            </div>
            <div className="text-xs text-slate-500 mt-4 pt-3 border-t border-slate-200">
              <p className="font-semibold mb-1">Sources:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Plastic Bottle Corporation (PBC) - Torque Guidelines for Capping Bottles</li>
                <li>Reliable Caps, LLC - Technical bulletins for 24mm, 28mm, 38mm CT closures</li>
                <li>MJS Packaging, Inc. - 50% rule guideline (torque ≈ diameter × 0.5)</li>
                <li>SPI pb-7 - SPI Neck Finish Specifications for Standard Closures</li>
                <li>Industry standards and compiled reference data</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-3 justify-end">
          <Button 
            variant="secondary" 
          onClick={() => {
            setMode("table");
          }}
            aria-label="Reset calculation mode to table"
            className="w-full sm:w-auto h-14 sm:h-10 text-base px-6 sm:px-4"
          >
            Reset to table
          </Button>
          <Button 
          onClick={handleCopyResults}
            aria-label="Copy results as JSON to clipboard"
            className="w-full sm:w-auto h-14 sm:h-10 text-base px-6 sm:px-4"
          >
            Copy results JSON
          </Button>
        </div>
    </>
  );

  return (
    <div className="h-full w-full bg-gradient-to-b from-slate-50 to-white px-4 py-2 overflow-hidden">
      <div className="mx-auto max-w-3xl space-y-2 h-full flex flex-col">
        <header className="text-center flex-shrink-0 py-1">
          <h1 className="text-xl font-bold tracking-tight leading-tight">Bottle Cap Torque Calculator</h1>
          <p className="text-xs text-slate-600 mt-0.5 px-2" role="doc-subtitle">
            Quickly estimate application and removal torque from cap diameter.
          </p>
        </header>

        <div className="flex-1 overflow-hidden">
          {viewMode === "operator" ? renderOperatorMode() : renderDebugMode()}
        </div>
      </div>
    </div>
  );
}
