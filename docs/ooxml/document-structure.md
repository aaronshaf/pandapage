# DOCX Document Structure

This document provides a detailed overview of the core structure of a WordprocessingML (DOCX) document, based on the `wml.xsd` schema.

## Core Components

A DOCX file is a ZIP archive containing multiple parts. The main content is in `word/document.xml`. This file contains the `<w:document>` element, which is the root element for the main document part.

### `<w:document>` Element

The `<w:document>` element is the top-level container for the main document content.

| Child Element | Description |
| --- | --- |
| `<w:body>` | Contains the main content of the document. |
| `<w:background>` | Defines the document's background color or image. |

### `<w:body>` Element

The `<body>` is the container for the visible content of the document.

| Child Element | Description |
| --- | --- |
| `<w:p>` | A paragraph. This is the most common block-level element. |
| `<w:tbl>` | A table. |
| `<w:sdt>` | A Structured Document Tag, used for content controls. |
| `<w:sectPr>` | Section properties that define the layout of the last section in the document. |

## Block-Level Elements

These are the main containers for content in a document.

### Paragraphs: `<w:p>`

The paragraph is the fundamental unit of block-level content.

| Child Element | Description |
| --- | --- |
| `<w:pPr>` | **Paragraph Properties**. Defines formatting for the paragraph, such as alignment, indentation, and spacing. |
| `<w:r>` | **Run**. A contiguous region of text with the same properties. |
| `<w:hyperlink>` | A hyperlink. |
| `<w:fldSimple>` | A simple field. |
| `<w:sdt>` | A content control within a paragraph. |

**Example:**
```xml
<w:p>
    <w:pPr>
        <w:pStyle w:val="Heading1"/>
        <w:jc w:val="center"/>
    </w:pPr>
    <w:r>
        <w:rPr><w:b/></w:rPr>
        <w:t>This is a bold, centered heading.</w:t>
    </w:r>
</w:p>
```

### Tables: `<w:tbl>`

Tables are used to organize content in a grid.

| Child Element | Description |
| --- | --- |
| `<w:tblPr>` | **Table Properties**. Defines the table's overall appearance, such as width, borders, and alignment. |
| `<w:tblGrid>` | **Table Grid**. Defines the widths of the columns in the table. |
| `<w:tr>` | **Table Row**. A row in the table. |

## Inline-Level Elements

These elements appear within block-level elements like paragraphs.

### Runs: `<w:r>`

A run is a contiguous region of text that shares the same set of properties. A paragraph can contain multiple runs.

| Child Element | Description |
| --- | --- |
| `<w:rPr>` | **Run Properties**. Defines the formatting for the text in the run, such as font, size, color, and bolding. |
| `<w:t>` | **Text**. Contains the actual text content. |
| `<w:br>` | A break, such as a line break or page break. |
| `<w:tab>` | A tab character. |
| `<w:drawing>` | A container for a drawing, such as an image. |
| `<w:fldChar>` | A character for a complex field. |

### Text: `<w:t>`

The `<w:t>` element contains the document's text. The `xml:space="preserve"` attribute is important to maintain whitespace.

```xml
<w:t xml:space="preserve">  This text will have leading and trailing spaces.  </w:t>
```

### Breaks: `<w:br>`

The `<w:br>` element is used to insert breaks in the document.

| Attribute | Description | Values |
| --- | --- | --- |
| `w:type` | The type of break. | `page`, `column`, `textWrapping` |
| `w:clear` | For text wrapping breaks, specifies where the next line should start. | `none`, `left`, `right`, `all` |

## Properties Elements

These elements define the formatting and behavior of other elements.

### Paragraph Properties: `<w:pPr>`

Defines the properties for a paragraph.

| Child Element | Description |
| --- | --- |
| `<w:pStyle>` | The style ID for the paragraph. |
| `<w:jc>` | Justification (alignment). |
| `<w:ind>` | Indentation. |
| `<w:spacing>` | Spacing before and after the paragraph. |
| `<w:numPr>` | Numbering properties for lists. |
| `<w:pBdr>` | Paragraph borders. |
| `<w:shd>` | Shading (background color). |
| `<w:tabs>` | Custom tab stops. |
| `<w:pageBreakBefore>` | Insert a page break before the paragraph. |

### Run Properties: `<w:rPr>`

Defines the properties for a run of text. See the [Text Formatting](./text-formatting.md) document for a more detailed list.

| Child Element | Description |
| --- | --- |
| `<w:rStyle>` | The character style ID. |
| `<w:rFonts>` | Font information. |
| `<w:b>` | Bold. |
| `<w:i>` | Italic. |
| `<w:u>` | Underline. |
| `<w:color>` | Text color. |
| `<w:sz>` | Font size (in half-points). |
| `<w:highlight>` | Text highlight color. |
| `<w:vertAlign>` | Vertical alignment (superscript/subscript). |

## Section Properties: `<w:sectPr>`

The `<w:sectPr>` element defines the page layout for a section of the document. It is found as the last element in a `<body>` or inside a `<w:pPr>`.

| Child Element | Description |
| --- | --- |
| `<w:pgSz>` | **Page Size**. Defines the width and height of the page. |
| `<w:pgMar>` | **Page Margins**. Defines the margins for the page (top, bottom, left, right, header, footer). |
| `<w:cols>` | **Columns**. Defines multiple columns for the section. |
| `<w:pgNumType>` | **Page Numbering**. Defines the format for page numbers. |
| `<w:headerReference>` | A reference to a header part. |
| `<w:footerReference>` | A reference to a footer part. |
| `<w:type>` | The type of section break (e.g., `nextPage`, `continuous`). |

## TypeScript Interfaces

Here are some simplified TypeScript interfaces that can be used to model the core structure of a DOCX document.

```typescript
// Represents the entire document
interface Document {
  body: Body;
  background?: Background;
}

// Represents the document body
interface Body {
  content: (Paragraph | Table)[];
  sectionProperties?: SectionProperties;
}

// Represents a paragraph
interface Paragraph {
  type: 'paragraph';
  properties?: ParagraphProperties;
  children: (Run | Hyperlink)[];
}

// Represents a run of text with consistent formatting
interface Run {
  type: 'run';
  properties?: RunProperties;
  children: (Text | Drawing | Tab | Break)[];
}

// Represents a text element
interface Text {
  type: 'text';
  text: string;
  preserveSpace: boolean;
}

// Represents a table
interface Table {
  type: 'table';
  properties?: TableProperties;
  grid: TableGrid;
  rows: TableRow[];
}

// Represents a table row
interface TableRow {
  properties?: TableRowProperties;
  cells: TableCell[];
}

// Represents a table cell
interface TableCell {
  properties?: TableCellProperties;
  children: (Paragraph | Table)[];
}

// Represents a hyperlink
interface Hyperlink {
  type: 'hyperlink';
  relationshipId: string;
  children: Run[];
}

// Represents a drawing
interface Drawing {
  type: 'drawing';
  drawing: InlineDrawing | AnchoredDrawing;
}
```

## Important Attributes

### Revision Identifiers (`rsid*`)

Attributes starting with `rsid` (e.g., `w:rsidR`, `w:rsidSect`) are used by Word to track revisions. For most parsing and rendering purposes, these can be safely ignored.

### Relationship ID (`r:id`)

The `r:id` attribute is used to create a relationship to another part in the OOXML package, such as an image, hyperlink, or header. This is a fundamental concept for linking document parts together.

## Implementation Notes

### Parsing Considerations

1.  **Order Matters**: Elements must appear in a specific order within their parent element as defined by the schema.
2.  **Empty Elements**: Empty paragraphs still require a `<w:p/>` tag to be present.
3.  **Namespace Awareness**: Always use a namespace-aware XML parser to correctly handle the different XML namespaces (e.g., `w:`, `a:`, `pic:`).
4.  **Default Values**: Many properties have default values that should be applied when the property is not explicitly specified in the markup.
5.  **Relationship Resolution**: Always resolve `r:id` attributes against the corresponding `.rels` file to find the correct target part.

### Common Pitfalls

1.  **Missing Relationships**: Referencing a relationship ID that does not exist in the `.rels` file will result in a broken link (e.g., a missing image).
2.  **Invalid Structure**: Elements that are out of order can cause a document to be rejected by Microsoft Word or other viewers.
3.  **Unit Confusion**: Be mindful of the different units used for measurements (Twips, EMUs, half-points, etc.) and convert them correctly.
4.  **Toggle Properties**: Incorrectly handling toggle properties (like bold and italic) can lead to the opposite of the intended formatting).