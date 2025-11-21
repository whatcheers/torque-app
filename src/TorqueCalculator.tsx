import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Info, Calculator } from "lucide-react";

// Reference ranges compiled from industry sources for common closure sizes (mm)
// Values are application torque in in-lb.
// Sources: Reliable Caps (24mm, 28mm, 38mm), MJS Packaging (50% rule), industry standards
const TABLE_RANGES: Record<number, { min: number; max: number }> = {
  24: { min: 10, max: 18 },
  28: { min: 12, max: 21 },
  38: { min: 17, max: 26 },
  43: { min: 17, max: 27 },
  48: { min: 19, max: 30 },
  53: { min: 21, max: 36 },
  63: { min: 25, max: 43 },
  70: { min: 28, max: 50 },
  89: { min: 40, max: 70 },
 110: { min: 45, max: 70 },
};

type Mode = "table" | "rule";

type Units = "inlb" | "N·m" | "kgf·cm";

const toNm = (inlb: number) => inlb * 0.113; // 1 in-lb ≈ 0.113 N·m
const toKgfcm = (inlb: number) => inlb * 1.1521; // 1 in-lb ≈ 1.1521 kgf·cm

function convert(inlb: number, units: Units) {
  if (units === "inlb") return inlb;
  if (units === "N·m") return toNm(inlb);
  return toKgfcm(inlb);
}

function fmt(value: number, units: Units) {
  const v = convert(value, units);
  const digits = units === "N·m" ? 3 : 1;
  return v.toFixed(digits);
}

export default function TorqueCalculator() {
  const [diameter, setDiameter] = useState<number>(38);
  const [mode, setMode] = useState<Mode>("table");
  const [units, setUnits] = useState<Units>("inlb");
  const [removalPct, setRemovalPct] = useState<[number]>([50]); // expected removal as % of application
  const [debugMode, setDebugMode] = useState<boolean>(false);

  const appRange = useMemo(() => {
    if (mode === "table" && TABLE_RANGES[diameter]) {
      return TABLE_RANGES[diameter as keyof typeof TABLE_RANGES];
    }
    // Rule of thumb: application torque ≈ 50% of cap diameter (mm), with a ±20% band.
    // Example: 38 mm -> center 19 in-lb, band 15.2 - 22.8 in-lb
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

  // Debug calculations
  const debugInfo = useMemo(() => {
    let calculationSteps: string[] = [];
    let centerValue: number | null = null;
    let calculationUsed: string = "";

    if (mode === "table" && TABLE_RANGES[diameter]) {
      calculationUsed = "Table Lookup";
      calculationSteps.push(`Found exact table entry for ${diameter} mm diameter`);
      calculationSteps.push(`Table value: ${TABLE_RANGES[diameter].min} - ${TABLE_RANGES[diameter].max} in-lb`);
    } else if (mode === "rule") {
      calculationUsed = "50% Rule";
      centerValue = diameter * 0.5;
      calculationSteps.push(`Step 1: Calculate center value = diameter × 0.5`);
      calculationSteps.push(`  Center = ${diameter} mm × 0.5 = ${centerValue} in-lb`);
      calculationSteps.push(`Step 2: Apply ±20% tolerance band`);
      calculationSteps.push(`  Min = ${centerValue} × 0.8 = ${appRange.min.toFixed(2)} in-lb`);
      calculationSteps.push(`  Max = ${centerValue} × 1.2 = ${appRange.max.toFixed(2)} in-lb`);
    } else {
      // table mode but no exact match
      calculationUsed = "50% Rule (fallback)";
      centerValue = diameter * 0.5;
      calculationSteps.push(`No table entry found for ${diameter} mm, using 50% rule`);
      calculationSteps.push(`Step 1: Calculate center value = diameter × 0.5`);
      calculationSteps.push(`  Center = ${diameter} mm × 0.5 = ${centerValue} in-lb`);
      calculationSteps.push(`Step 2: Apply ±20% tolerance band`);
      calculationSteps.push(`  Min = ${centerValue} × 0.8 = ${appRange.min.toFixed(2)} in-lb`);
      calculationSteps.push(`  Max = ${centerValue} × 1.2 = ${appRange.max.toFixed(2)} in-lb`);
    }

    calculationSteps.push(`Application Range: ${appRange.min.toFixed(2)} - ${appRange.max.toFixed(2)} in-lb`);

    // Removal calculation
    calculationSteps.push(``);
    calculationSteps.push(`Removal Calculation:`);
    calculationSteps.push(`Removal percentage: ${removalPct[0]}%`);
    calculationSteps.push(`Removal min = ${appRange.min.toFixed(2)} × ${removalPct[0]}% = ${removal.min.toFixed(2)} in-lb`);
    calculationSteps.push(`Removal max = ${appRange.max.toFixed(2)} × ${removalPct[0]}% = ${removal.max.toFixed(2)} in-lb`);

    // Unit conversions
    if (units !== "inlb") {
      calculationSteps.push(``);
      calculationSteps.push(`Unit Conversion (${units}):`);
      if (units === "N·m") {
        calculationSteps.push(`Conversion factor: 1 in-lb = 0.113 N·m`);
        calculationSteps.push(`Application min: ${appRange.min.toFixed(2)} × 0.113 = ${convert(appRange.min, units).toFixed(3)} N·m`);
        calculationSteps.push(`Application max: ${appRange.max.toFixed(2)} × 0.113 = ${convert(appRange.max, units).toFixed(3)} N·m`);
        calculationSteps.push(`Removal min: ${removal.min.toFixed(2)} × 0.113 = ${convert(removal.min, units).toFixed(3)} N·m`);
        calculationSteps.push(`Removal max: ${removal.max.toFixed(2)} × 0.113 = ${convert(removal.max, units).toFixed(3)} N·m`);
      } else {
        calculationSteps.push(`Conversion factor: 1 in-lb = 1.1521 kgf·cm`);
        calculationSteps.push(`Application min: ${appRange.min.toFixed(2)} × 1.1521 = ${convert(appRange.min, units).toFixed(1)} kgf·cm`);
        calculationSteps.push(`Application max: ${appRange.max.toFixed(2)} × 1.1521 = ${convert(appRange.max, units).toFixed(1)} kgf·cm`);
        calculationSteps.push(`Removal min: ${removal.min.toFixed(2)} × 1.1521 = ${convert(removal.min, units).toFixed(1)} kgf·cm`);
        calculationSteps.push(`Removal max: ${removal.max.toFixed(2)} × 1.1521 = ${convert(removal.max, units).toFixed(1)} kgf·cm`);
      }
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
      }
    };
  }, [diameter, mode, appRange, removal, removalPct, units]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-white px-4 py-5 sm:px-3 sm:py-4 md:p-6 safe-area-inset">
      <div className="mx-auto max-w-3xl space-y-5 sm:space-y-4 md:space-y-6">
        <header className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">Bottle Cap Torque Calculator</h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1 px-2" role="doc-subtitle">
            Quickly estimate application and removal torque from cap diameter.
          </p>
        </header>

        <Card className="shadow-sm">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-xl sm:text-2xl">Inputs</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 sm:gap-4 sm:grid-cols-2">
            <div className="space-y-4 sm:space-y-3">
              <Label htmlFor="diameter" className="text-base sm:text-base block mb-2">Cap diameter (mm)</Label>
              <Input
                id="diameter"
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min={10}
                max={130}
                step={1}
                value={diameter}
                onChange={(e) => setDiameter(Number(e.target.value) || 0)}
                className="text-lg sm:text-base h-14 sm:h-10 px-4 py-3"
                aria-label="Cap diameter in millimeters"
                aria-describedby="diameter-hint"
              />
              <div className="px-2 py-5 sm:py-3">
                <Slider
                  value={[diameter]}
                  min={10}
                  max={130}
                  step={1}
                  onValueChange={(v) => setDiameter(v[0])}
                  aria-label="Adjust cap diameter"
                  className="touch-manipulation"
                />
              </div>
              <p id="diameter-hint" className="text-sm sm:text-xs text-slate-500 px-2">
                Common sizes include 24, 28, 38, 43, 48, 53, 63, 70, 89, 110.
              </p>
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
                    <p>Uses industry-standard torque ranges from compiled reference tables for common closure sizes. More accurate when an exact match is available.</p>
                  </>
                ) : (
                  <>
                    <p className="font-medium">50% Rule Mode:</p>
                    <p>Calculates torque as 50% of the cap diameter (in mm) in in-lb, with a ±20% tolerance band. This rule is validated by MJS Packaging and industry standards. Formula: Center = diameter × 0.5, Range = Center × 0.8 to Center × 1.2</p>
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
                    <SelectItem value="kgf·cm">kgf·cm</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="removal" className="text-base sm:text-base">Expected removal percent</Label>
                  <span className="text-lg sm:text-base font-semibold text-primary px-3 py-1 bg-primary/10 rounded-md">
                    {removalPct[0]}%
                  </span>
                </div>
                <div className="px-2 py-5 sm:py-3">
                  <Slider 
                    id="removal" 
                    min={30} 
                    max={70} 
                    step={1} 
                    value={removalPct} 
                    onValueChange={(v) => setRemovalPct(v as [number])}
                    className="touch-manipulation"
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-400 px-2 -mt-1 mb-2">
                  <span>30%</span>
                  <span>70%</span>
                </div>
                <p className="text-sm sm:text-xs text-slate-500 px-2">
                  <span className="text-green-600 font-medium">Typical range: 40-60%</span> of application torque (per industry sources: Reliable Caps, MJS Packaging). Adjust based on your specific closure and liner.
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
                {fmt(appRange.min, units)} - {fmt(appRange.max, units)} {units}
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
                {fmt(removal.min, units)} - {fmt(removal.max, units)} {units}
              </p>
              <p className="text-xs text-slate-500">
                Removal is computed as application multiplied by your percent slider.
              </p>
            </div>
          </CardContent>
        </Card>

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
                  {JSON.stringify(debugInfo.rawValues, null, 2)}
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
              <li>Always validate with a calibrated cap torque tester on your actual bottle, closure, and liner.
              </li>
              <li>Record removal torque over time because liners can relax and torque can back off.
              </li>
              <li>If you change liner, resin, neck finish, or fill conditions, re-verify.
              </li>
              <li>Some manufacturers (e.g., Berry/Amcor) may not provide numeric torque specifications and instead use "conventional capping methods."
              </li>
            </ul>
            <div className="text-xs text-slate-500 mt-3">
              Table covers common sizes only. For other sizes, use the 50 percent rule (validated by MJS Packaging) or your supplier specification.
            </div>
            <div className="text-xs text-slate-500 mt-4 pt-3 border-t border-slate-200">
              <p className="font-semibold mb-1">Sources:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Reliable Caps, LLC - Technical bulletins for 24mm, 28mm, 38mm CT closures</li>
                <li>MJS Packaging, Inc. - 50% rule guideline (torque ≈ diameter × 0.5)</li>
                <li>Industry standards and compiled reference data</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-3 justify-end">
          <Button 
            variant="secondary" 
            onClick={() => { setMode("table"); }}
            aria-label="Reset calculation mode to table"
            className="w-full sm:w-auto h-14 sm:h-10 text-base px-6 sm:px-4"
          >
            Reset to table
          </Button>
          <Button 
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(JSON.stringify({ diameter, appRange, removal, units }, null, 2));
              } catch (err) {
                console.error('Failed to copy:', err);
              }
            }}
            aria-label="Copy results as JSON to clipboard"
            className="w-full sm:w-auto h-14 sm:h-10 text-base px-6 sm:px-4"
          >
            Copy results JSON
          </Button>
        </div>
      </div>
    </div>
  );
}

