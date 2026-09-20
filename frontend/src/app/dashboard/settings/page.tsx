"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { IconCheck, IconMoon, IconSun, IconDeviceDesktop, IconDownload, IconUpload } from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  useAppearanceSettings,
  COLOR_THEME_OPTIONS,
  FONT_SIZE_OPTIONS,
} from "@/hooks/use-appearance-settings";
import { useInvoiceTemplateStore } from "@/stores/invoice-template-store";
import { toast } from "sonner";
import { Loader } from "@/components/loader";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { colorTheme, fontSize, setColorTheme, setFontSize } = useAppearanceSettings();
  const { uploading, uploadTemplate, downloadTemplate } = useInvoiceTemplateStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [downloading, setDownloading] = useState(false);

  // next-themes' `theme` is undefined until mounted client-side — avoid
  // rendering a mode that doesn't match what the server sent.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleDownloadTemplate = async () => {
    setDownloading(true);
    try {
      const blob = await downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "FACTURE model.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download invoice template");
    } finally {
      setDownloading(false);
    }
  };

  const handleUploadTemplate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      await uploadTemplate(file);
      toast.success("Invoice template updated");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update invoice template");
    }
  };

  return (
    <section className="flex flex-col gap-4 w-full px-6 py-4">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
      </div>

      <div className="grid gap-4 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Theme mode</CardTitle>
          </CardHeader>
          <CardContent>
            {mounted && (
              <ToggleGroup
                type="single"
                variant="outline"
                value={theme}
                onValueChange={(value) => value && setTheme(value)}
                className="w-fit"
              >
                <ToggleGroupItem value="light" className="gap-2 px-4">
                  <IconSun className="h-4 w-4" />
                  Light
                </ToggleGroupItem>
                <ToggleGroupItem value="dark" className="gap-2 px-4">
                  <IconMoon className="h-4 w-4" />
                  Dark
                </ToggleGroupItem>
                <ToggleGroupItem value="system" className="gap-2 px-4">
                  <IconDeviceDesktop className="h-4 w-4" />
                  System
                </ToggleGroupItem>
              </ToggleGroup>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accent color</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {COLOR_THEME_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setColorTheme(option.value)}
                  aria-pressed={colorTheme === option.value}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-lg border p-3 w-24 transition-colors hover:bg-accent",
                    colorTheme === option.value ? "border-primary ring-2 ring-primary/30" : "border-border"
                  )}
                >
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full"
                    style={{ backgroundColor: option.swatch }}
                  >
                    {colorTheme === option.value && <IconCheck className="h-4 w-4 text-white" />}
                  </span>
                  <span className="text-xs font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Font size</CardTitle>
          </CardHeader>
          <CardContent>
            <ToggleGroup
              type="single"
              variant="outline"
              value={fontSize}
              onValueChange={(value) => value && setFontSize(value as typeof fontSize)}
              className="w-fit"
            >
              {FONT_SIZE_OPTIONS.map((option) => (
                <ToggleGroupItem key={option.value} value={option.value} className="px-4">
                  {option.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoice template</CardTitle>
            <CardDescription>
              Replaces the xlsx design every generated invoice is rendered from — admin only. Upload keeps the
              previous version as a backup.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="outline" onClick={handleDownloadTemplate} disabled={downloading}>
                {downloading ? <Loader size={16} /> : <IconDownload className="h-4 w-4" />}
                <span className="ml-2">Download current template</span>
              </Button>
              <Button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                {uploading ? <Loader size={16} /> : <IconUpload className="h-4 w-4" />}
                <span className="ml-2">{uploading ? "Uploading..." : "Upload new template"}</span>
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx"
                className="hidden"
                onChange={handleUploadTemplate}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
