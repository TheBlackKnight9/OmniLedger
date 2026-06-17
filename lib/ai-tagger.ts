import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

export interface DocumentTags {
  docType: string;
  entityName?: string;
  financialYear?: string;
  assessmentYear?: string;
  amount?: string;
  pan?: string;
  gstin?: string;
  period?: string;
  formType?: string;
  [key: string]: string | undefined;
}

export async function tagDocument(
  fileName: string,
  mimeType: string,
  textContent?: string
): Promise<DocumentTags> {
  try {
    const prompt = `You are a document classifier for Indian tax and compliance documents.
Analyze the following document information and return ONLY a JSON object with these fields:
- docType: One of "PAN_CARD", "AADHAAR", "GST_RETURN", "GSTR1", "GSTR3B", "ITR_ACK", "FORM_16", "FORM_26AS", "TDS_CERTIFICATE", "INVOICE", "BALANCE_SHEET", "PROFIT_LOSS", "BANK_STATEMENT", "ROC_FILING", "INCORPORATION_CERT", "MOA_AOA", "BOARD_RESOLUTION", "OTHER"
- entityName: Name of the entity/person if found
- financialYear: e.g. "2025-26" if found
- assessmentYear: e.g. "2026-27" if found
- amount: any primary monetary amount found (as string)
- pan: PAN number if found (format: XXXXX0000X)
- gstin: GSTIN if found (format: 00XXXXX0000X0XX)
- period: Filing period if found (e.g. "June 2026", "Q1 FY 2026-27")
- formType: Specific form number if applicable (e.g. "Form 16", "Form 26AS", "ITR-1")

Only include fields where you have found or can confidently infer the value. Return ONLY valid JSON, no explanation.

File Name: ${fileName}
MIME Type: ${mimeType}
${textContent ? `\nExtracted Text Content (first 2000 chars):\n${textContent.substring(0, 2000)}` : ""}`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Parse the JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const tags = JSON.parse(jsonMatch[0]) as DocumentTags;
      return tags;
    }

    // Fallback: infer from filename
    return inferTagsFromFileName(fileName);
  } catch (error) {
    console.error("AI tagging failed, falling back to filename inference:", error);
    return inferTagsFromFileName(fileName);
  }
}

function inferTagsFromFileName(fileName: string): DocumentTags {
  const name = fileName.toLowerCase();
  let docType = "OTHER";

  if (name.includes("pan")) docType = "PAN_CARD";
  else if (name.includes("aadhaar") || name.includes("aadhar")) docType = "AADHAAR";
  else if (name.includes("gstr-1") || name.includes("gstr1")) docType = "GSTR1";
  else if (name.includes("gstr-3b") || name.includes("gstr3b")) docType = "GSTR3B";
  else if (name.includes("gst")) docType = "GST_RETURN";
  else if (name.includes("itr")) docType = "ITR_ACK";
  else if (name.includes("form-16") || name.includes("form16")) docType = "FORM_16";
  else if (name.includes("form-26as") || name.includes("26as")) docType = "FORM_26AS";
  else if (name.includes("tds")) docType = "TDS_CERTIFICATE";
  else if (name.includes("invoice") || name.includes("bill")) docType = "INVOICE";
  else if (name.includes("balance") && name.includes("sheet")) docType = "BALANCE_SHEET";
  else if (name.includes("profit") || name.includes("p&l") || name.includes("pnl")) docType = "PROFIT_LOSS";
  else if (name.includes("bank") && name.includes("statement")) docType = "BANK_STATEMENT";
  else if (name.includes("roc")) docType = "ROC_FILING";
  else if (name.includes("incorporation")) docType = "INCORPORATION_CERT";
  else if (name.includes("moa") || name.includes("aoa")) docType = "MOA_AOA";
  else if (name.includes("resolution")) docType = "BOARD_RESOLUTION";

  // Try to extract PAN from filename
  const panMatch = fileName.match(/[A-Z]{5}[0-9]{4}[A-Z]/);
  const gstinMatch = fileName.match(/[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]{3}/);

  return {
    docType,
    ...(panMatch ? { pan: panMatch[0] } : {}),
    ...(gstinMatch ? { gstin: gstinMatch[0] } : {}),
  };
}
