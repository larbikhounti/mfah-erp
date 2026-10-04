import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

/**
 * One entry per data field on "FACTURE model.xlsx" (mapped to the
 * template's own cell addresses in invoice-template-cells.ts, so the fill
 * step is a straight pass-through — see ClientInvoicePdfService). All
 * optional and all plain strings: the frontend's "generate invoice" dialog
 * is the one source of truth for what's included and how it's formatted
 * (dates, numbers, etc.) — this endpoint just fills whatever it's given and
 * leaves every other cell blank on the PDF.
 *
 * `transitaire` maps to the template's 4th surcharge column (labeled
 * "Transitaire" on the template).
 *
 * `tva` is optional like everything else: when the dialog's TVA switch is
 * off it isn't sent, and the TVA header/value block is blanked out.
 *
 * `invoice_number` is deliberately NOT here — it always comes from the
 * invoice's own `invoiceNumber` in the DB (see ClientInvoicePdfService),
 * never from the request, so the number printed on the PDF can never drift
 * from the number the system actually tracks (payment status, uniqueness,
 * the attachment it gets saved under, etc.).
 */
export class GenerateInvoicePdfDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() client_name?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() client_address?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() client_ice?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() invoice_date?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() loading_date?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() delivery_date?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() matricule?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() remorque?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() operation?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() cmr?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() commande?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() tmsa?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() immobilisation?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() double_equipage?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() transitaire?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() extras_total?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() designation?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() quantity?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() unit_price?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() line_total?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() tva?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() total_ht?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() amount_in_words?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() exchange_rate_line?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() total_ttc_mad?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() total_ttc?: string;
}
