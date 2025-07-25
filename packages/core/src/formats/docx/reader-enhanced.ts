import { Effect } from "effect";
import { debug } from "../../common/debug";
import { DocxParseError } from "./types";
import type { EnhancedDocxDocument } from "./types";

// Re-export types for convenience
export type {
  EnhancedDocxDocument,
  DocxElement,
  DocxTable,
  DocxTableRow,
  DocxTableCell,
  DocxParseError,
} from "./types";

/**
 * Enhanced DOCX reader with proper XML parsing and metadata extraction
 */
export const readEnhancedDocx = (
  buffer: ArrayBuffer,
): Effect.Effect<EnhancedDocxDocument, DocxParseError> =>
  Effect.tryPromise({
    try: async () => {
      debug.log("Reading enhanced DOCX file...");
      const startTime = Date.now();

      // Import required modules
      const { parseDocumentXmlEnhanced } = await import("./document-parser");
      const { parseXmlString } = await import("../../common/xml-parser");
      const { unzipSync, strFromU8 } = await import("fflate");

      // Convert ArrayBuffer to Uint8Array
      const uint8Array = new Uint8Array(buffer);

      // Unzip the DOCX file
      const unzipped = unzipSync(uint8Array);

      // Get the main document content
      // Try standard location first, then fallback to root level for non-standard files
      let documentXml = unzipped["word/document.xml"];
      if (!documentXml) {
        documentXml = unzipped["document.xml"];
      }
      if (!documentXml) {
        throw new Error("No document.xml found in DOCX file");
      }

      // Convert to string
      const xmlContent = strFromU8(documentXml);

      // Parse XML
      const parsedXml = await Effect.runPromise(parseXmlString(xmlContent));
      const root = parsedXml.documentElement;

      // Parse elements using enhanced parser
      const elements = await Effect.runPromise(parseDocumentXmlEnhanced(root));

      // Parse metadata from core.xml if available
      const { parseCoreProperties } = await import("./docx-metadata");
      let parsedMetadata: any = {};

      try {
        const coreXml = unzipped["docProps/core.xml"];
        if (coreXml) {
          const coreContent = strFromU8(coreXml);
          const coreProps = await Effect.runPromise(parseCoreProperties(coreContent));
          parsedMetadata = { ...parsedMetadata, ...coreProps };
        }
      } catch (e) {
        debug.log("Failed to parse metadata:", e);
      }

      const processingTime = Date.now() - startTime;
      debug.log(`Enhanced DOCX parsing completed in ${processingTime}ms`);

      return {
        elements,
        metadata: {
          ...parsedMetadata,
          extractedAt: new Date(),
          originalFormat: "docx" as const,
        },
        processingTime,
        extractedAt: new Date(),
        originalFormat: "docx" as const,
        wordCount: elements.reduce((count, el) => {
          if (el.type === "paragraph") {
            return (
              count +
              el.runs
                .map((r) => r.text)
                .join("")
                .split(/\s+/)
                .filter((w) => w.length > 0).length
            );
          }
          return count;
        }, 0),
        characterCount: elements.reduce((count, el) => {
          if (el.type === "paragraph") {
            return count + el.runs.map((r) => r.text).join("").length;
          }
          return count;
        }, 0),
        paragraphCount: elements.filter((el) => el.type === "paragraph").length,
      };
    },
    catch: (error) => new DocxParseError(`Failed to parse DOCX: ${error}`),
  });
