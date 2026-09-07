"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileDown } from "lucide-react";
import {
  useClientInvoicesStore,
  type ClientInvoice,
  type InvoicePdfFields,
} from "@/stores/client-invoices-store";
import { amountToFrenchWords } from "@/lib/amount-to-french-words";
import { toast } from "sonner";
import { Loader } from "../loader";

interface GenerateInvoicePdfDialogProps {
  invoice: ClientInvoice;
}

// The fields the template has no backing data for — off by default, a
// blank input appears once switched on. TMSA/immobilisation/double
// équipage/gazoil are handled separately below since they also feed the
// live "extras total".
type ToggleKey =
  | "loading_date"
  | "delivery_date"
  | "remorque"
  | "cmr"
  | "commande"
  | "client_city"
  | "tmsa"
  | "immobilisation"
  | "double_equipage"
  | "gazoil";

interface ToggleFieldState {
  enabled: boolean;
  value: string;
}

const DETAIL_TOGGLES: { key: ToggleKey; label: string; placeholder?: string }[] = [
  { key: "loading_date", label: "Loading Date" },
  { key: "delivery_date", label: "Delivery Date" },
  { key: "remorque", label: "Remorque (Trailer)" },
  { key: "cmr", label: "CMR N°" },
  { key: "commande", label: "N° Commande" },
  { key: "client_city", label: "Client City" },
];

const SURCHARGE_TOGGLES: { key: ToggleKey; label: string }[] = [
  { key: "tmsa", label: "TMSA (Taxation)" },
  { key: "immobilisation", label: "Immobilisation" },
  { key: "double_equipage", label: "Double Équipage" },
  { key: "gazoil", label: "Gazoil" },
];

const EMPTY_TOGGLES: Record<ToggleKey, ToggleFieldState> = {
  loading_date: { enabled: true, value: "" },
  delivery_date: { enabled: true, value: "" },
  remorque: { enabled: false, value: "" },
  cmr: { enabled: false, value: "" },
  commande: { enabled: false, value: "" },
  client_city: { enabled: false, value: "" },
  tmsa: { enabled: false, value: "" },
  immobilisation: { enabled: false, value: "" },
  double_equipage: { enabled: false, value: "" },
  gazoil: { enabled: false, value: "" },
};

function ToggleField({
  id,
  label,
  state,
  onChange,
  type = "text",
}: {
  id: string;
  label: string;
  state: ToggleFieldState;
  onChange: (patch: Partial<ToggleFieldState>) => void;
  type?: string;
}) {
  return (
    <div className="grid gap-2 rounded-md border p-3">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-sm font-normal">
          {label}
        </Label>
        <Switch checked={state.enabled} onCheckedChange={(enabled) => onChange({ enabled })} />
      </div>
      {state.enabled && (
        <Input
          id={id}
          type={type}
          value={state.value}
          onChange={(e) => onChange({ value: e.target.value })}
        />
      )}
    </div>
  );
}

export function GenerateInvoicePdfDialog({ invoice }: GenerateInvoicePdfDialogProps) {
  const { getPdfPrefill, generateInvoicePdf } = useClientInvoicesStore();

  const [isOpen, setIsOpen] = useState(false);
  const [loadingPrefill, setLoadingPrefill] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [clientName, setClientName] = useState("");
  const [clientIce, setClientIce] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [operation, setOperation] = useState("");
  const [designation, setDesignation] = useState("");
  // Matricule already has a real source of truth (the mission's own truck)
  // whenever there is one — no toggle needed, just editable like the rest
  // of the trip details, blank by default for subcontracted missions.
  const [matricule, setMatricule] = useState("");

  const [currency, setCurrency] = useState<"MAD" | "EUR">("MAD");
  const [quantity, setQuantity] = useState("1");
  const [unitPrice, setUnitPrice] = useState("");
  const [tva, setTva] = useState("");
  const [totalHt, setTotalHt] = useState("");
  const [totalHtTouched, setTotalHtTouched] = useState(false);
  const [amountInWords, setAmountInWords] = useState("");
  const [amountInWordsTouched, setAmountInWordsTouched] = useState(false);

  // The template's total boxes have "DH" printed as static design text, not
  // something we can swap per invoice — for EUR invoices we spell the
  // currency out in the amount itself instead so it's never ambiguous.
  const formatMoney = (value: number) => (currency === "EUR" ? `${value.toFixed(2)} EUR` : value.toFixed(2));
  // Same idea, but always shows a unit — used for the dialog's own
  // read-only previews, where "1000.00" alone would be ambiguous.
  const displayMoney = (value: number) => `${value.toFixed(2)} ${currency === "EUR" ? "EUR" : "DH"}`;

  const [toggles, setToggles] = useState<Record<ToggleKey, ToggleFieldState>>(EMPTY_TOGGLES);
  const updateToggle = (key: ToggleKey, patch: Partial<ToggleFieldState>) =>
    setToggles((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));

  useEffect(() => {
    if (!isOpen) return;
    setLoadingPrefill(true);
    getPdfPrefill(invoice.id)
      .then((prefill) => {
        setCurrency(prefill.currency);
        setClientName(prefill.client_name);
        setClientIce(prefill.client_ice);
        setInvoiceDate(prefill.invoice_date);
        setOperation(prefill.operation);
        setDesignation(prefill.designation);
        setMatricule(prefill.matricule);
        setQuantity(prefill.quantity);
        setUnitPrice(prefill.unit_price);
        setTva(prefill.tva);
        setTotalHt(prefill.total_ht);
        setTotalHtTouched(false);
        setAmountInWords(prefill.amount_in_words);
        setAmountInWordsTouched(false);
        setToggles({
          ...EMPTY_TOGGLES,
          loading_date: { enabled: true, value: prefill.loading_date },
          delivery_date: { enabled: true, value: prefill.delivery_date },
        });
      })
      .catch(() => toast.error("Failed to load invoice details"))
      .finally(() => setLoadingPrefill(false));
  }, [isOpen, invoice.id, getPdfPrefill]);

  const lineTotal = (parseFloat(quantity) || 0) * (parseFloat(unitPrice) || 0);
  const extrasTotal = SURCHARGE_TOGGLES.reduce((sum, { key }) => {
    const field = toggles[key];
    return sum + (field.enabled ? parseFloat(field.value) || 0 : 0);
  }, 0);

  useEffect(() => {
    if (!totalHtTouched) setTotalHt(formatMoney(lineTotal + extrasTotal));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineTotal, extrasTotal, totalHtTouched, currency]);

  const totalTtc = (parseFloat(totalHt) || 0) + (parseFloat(tva) || 0);

  useEffect(() => {
    if (!amountInWordsTouched) setAmountInWords(amountToFrenchWords(totalTtc, currency));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalTtc, amountInWordsTouched, currency]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const fields: InvoicePdfFields = {
        client_name: clientName,
        client_ice: clientIce,
        // invoice_number is never sent — the backend always fills it from
        // the invoice's own record, so it can't drift from what the system
        // tracks under that number.
        invoice_date: invoiceDate,
        operation,
        designation,
        matricule,
        quantity,
        unit_price: unitPrice,
        line_total: formatMoney(lineTotal),
        total_ht: totalHt,
        tva,
        total_ttc: formatMoney(totalTtc),
        amount_in_words: amountInWords,
      };
      if (extrasTotal > 0) fields.extras_total = formatMoney(extrasTotal);

      for (const key of Object.keys(toggles) as ToggleKey[]) {
        const field = toggles[key];
        if (field.enabled && field.value.trim()) {
          fields[key] = field.value.trim();
        }
      }

      const blob = await generateInvoicePdf(invoice.id, fields);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Facture-${invoice.invoiceNumber.replace(/[\\/]/g, "-")}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Invoice PDF generated and saved to attachments");
      setIsOpen(false);
    } catch (error: any) {
      let message = "Failed to generate invoice PDF";
      if (error?.response?.data instanceof Blob) {
        try {
          const parsed = JSON.parse(await error.response.data.text());
          message = parsed.message || message;
        } catch {
          // Keep the generic message.
        }
      } else {
        message = error?.response?.data?.message || message;
      }
      toast.error(message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <span className="relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden">
          <FileDown className="mr-2 h-4 w-4" />
          Generate Invoice
        </span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Invoice — {invoice.invoiceNumber}</DialogTitle>
          <DialogDescription>
            Fields with a switch aren&apos;t tracked anywhere in the system — turn one on to type it in for
            this invoice only.
          </DialogDescription>
        </DialogHeader>

        {loadingPrefill ? (
          <div className="flex items-center justify-center py-12">
            <Loader size={24} />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">Client &amp; Invoice</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Client</Label>
                  <div className="rounded-md border bg-muted px-3 py-2 text-sm">{clientName}</div>
                </div>
                <div className="grid gap-2">
                  <Label>ICE</Label>
                  <div className="rounded-md border bg-muted px-3 py-2 text-sm">{clientIce}</div>
                </div>
                <div className="grid gap-2">
                  <Label>Invoice N°</Label>
                  <div className="rounded-md border bg-muted px-3 py-2 text-sm">{invoice.invoiceNumber}</div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="invoice_date">Invoice Date</Label>
                  <Input id="invoice_date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">Trip Details</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="operation">Operation</Label>
                  <Input id="operation" value={operation} onChange={(e) => setOperation(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="matricule">Matricule (Truck Plate)</Label>
                  <Input
                    id="matricule"
                    value={matricule}
                    onChange={(e) => setMatricule(e.target.value)}
                    placeholder="No truck on this mission"
                  />
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="designation">Designation</Label>
                  <Textarea
                    id="designation"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {DETAIL_TOGGLES.map(({ key, label }) => (
                  <ToggleField
                    key={key}
                    id={key}
                    label={label}
                    state={toggles[key]}
                    onChange={(patch) => updateToggle(key, patch)}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">Surcharges (optional)</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {SURCHARGE_TOGGLES.map(({ key, label }) => (
                  <ToggleField
                    key={key}
                    id={key}
                    label={label}
                    type="number"
                    state={toggles[key]}
                    onChange={(patch) => updateToggle(key, patch)}
                  />
                ))}
              </div>
              {extrasTotal > 0 && (
                <p className="text-sm text-muted-foreground">
                  Surcharges total: <span className="font-medium text-foreground">{displayMoney(extrasTotal)}</span>
                </p>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">Billing</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input id="quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="unit_price">Unit Price</Label>
                  <Input id="unit_price" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Line Total</Label>
                  <div className="rounded-md border bg-muted px-3 py-2 text-sm">{displayMoney(lineTotal)}</div>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="total_ht">Total HT</Label>
                  <Input
                    id="total_ht"
                    value={totalHt}
                    onChange={(e) => {
                      setTotalHt(e.target.value);
                      setTotalHtTouched(true);
                    }}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tva">TVA (manual)</Label>
                  <Input id="tva" value={tva} onChange={(e) => setTva(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Total TTC</Label>
                  <div className="rounded-md border bg-muted px-3 py-2 text-sm font-medium">
                    {displayMoney(totalTtc)}
                  </div>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount_in_words">Amount in words</Label>
                <Textarea
                  id="amount_in_words"
                  value={amountInWords}
                  onChange={(e) => {
                    setAmountInWords(e.target.value);
                    setAmountInWordsTouched(true);
                  }}
                  rows={2}
                />
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={generating}>
            Cancel
          </Button>
          <Button type="button" onClick={handleGenerate} disabled={loadingPrefill || generating}>
            {generating ? (
              <span className="flex items-center">
                <Loader size={16} />
                <span className="ml-2">Generating...</span>
              </span>
            ) : (
              "Generate Invoice"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
