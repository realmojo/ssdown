"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileCode,
  ArrowRightLeft,
  Copy,
  Trash2,
  CheckCircle2,
  Lightbulb,
  FileJson,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import Adsense from "@/components/Adsense";

export function XmlToJsonClient({ dict }: { dict?: any }) {
  const [xmlInput, setXmlInput] = useState("");
  const [jsonOutput, setJsonOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Convert DOM to Object
  const xmlToJson = (xml: Node): any => {
    // Create the return object
    let obj: any = {};

    if (xml.nodeType === 1) {
      // element
      // do attributes
      if (xml instanceof Element && xml.attributes.length > 0) {
        obj["@attributes"] = {};
        for (let j = 0; j < xml.attributes.length; j++) {
          const attribute = xml.attributes.item(j);
          if (attribute) {
            obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
          }
        }
      }
    } else if (xml.nodeType === 3) {
      // text
      obj = xml.nodeValue?.trim();
    }

    // do children
    if (xml.hasChildNodes()) {
      for (let i = 0; i < xml.childNodes.length; i++) {
        const item = xml.childNodes.item(i);
        const nodeName = item.nodeName;

        if (item.nodeType === 3 && !item.nodeValue?.trim()) continue;

        if (typeof obj === "string") {
          // If we already have text content, but now find children, convert to object?
          // Simple case: ignore empty whitespace
          continue;
        }

        // if nodeType is text, just return value if it's the only child
        if (xml.childNodes.length === 1 && item.nodeType === 3) {
          return item.nodeValue;
        }

        if (typeof obj[nodeName] === "undefined") {
          obj[nodeName] = xmlToJson(item);
        } else {
          if (typeof obj[nodeName].push === "undefined") {
            const old = obj[nodeName];
            obj[nodeName] = [];
            obj[nodeName].push(old);
          }
          obj[nodeName].push(xmlToJson(item));
        }
      }
    }
    return obj;
  };

  const convertToJson = () => {
    setError(null);
    if (!xmlInput.trim()) {
      setJsonOutput("");
      return;
    }

    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlInput, "text/xml");

      const parserError = xmlDoc.querySelector("parsererror");
      if (parserError) {
        throw new Error("Invalid XML format");
      }

      const json = xmlToJson(xmlDoc);
      // Usually the parser creates a document wrapper #document, we might want the root element
      // However parsing logic usually handles it.
      // Let's refine: json usually has "root" property or similar.

      // Let's look at the output structure.
      // The current xmlToJson function will map the root node.
      // We often want to return the content inside #document

      let finalJson = json;
      // If result has "#document" as key, use its content
      // Actually DOMParser.parseFromString returns a Document.
      // xmlToJson(xmlDoc) will return {"root": ...} usually.

      // Better approach: start from firstChild
      const result = xmlToJson(xmlDoc.firstChild as Node);
      const rootName = (xmlDoc.firstChild as Element).tagName;
      finalJson = { [rootName]: result };

      setJsonOutput(JSON.stringify(finalJson, null, 2));
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_err) {
      setError("Invalid XML format. Please check your input.");
      setJsonOutput("");
    }
  };

  const handleCopy = () => {
    if (!jsonOutput) return;
    navigator.clipboard.writeText(jsonOutput);
    toast.success("JSON copied to clipboard");
  };

  const handleClear = () => {
    setXmlInput("");
    setJsonOutput("");
    setError(null);
  };

  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const text = await file.text();
      setXmlInput(text);
      setError(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center min-h-[50vh]">
      <div className="flex flex-col items-center justify-center w-full max-w-4xl mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 mb-6">
          <FileJson className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          {dict?.xml_to_json?.title || "XML to JSON Converter"}
        </h1>
        <p className="text-muted-foreground text-center max-w-2xl mb-8">
          {dict?.xml_to_json?.subtitle || "Convert XML data to JSON format instantly. Paste your XML code, or Drag & Drop a file."}
        </p>

        <Adsense slotId="7759160077" />

        <div className="w-full grid md:grid-cols-2 gap-4">
          <Card
            className={`border-gray-200 dark:border-gray-800 transition-colors ${isDragging ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <CardContent className="p-4 flex flex-col h-[500px]">
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-muted-foreground" />
                  XML Input
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="h-8 text-muted-foreground hover:text-red-500"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Clear
                </Button>
              </div>
              <div className="relative flex-1 flex flex-col">
                {isDragging && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-sm rounded-lg border-2 border-dashed border-blue-500">
                    <p className="text-lg font-medium text-blue-600 dark:text-blue-400">
                      Drop XML file here
                    </p>
                  </div>
                )}
                <Textarea
                  placeholder="<root><name>John</name><age>30</age></root>"
                  className="flex-1 font-mono text-sm resize-none"
                  value={xmlInput}
                  onChange={(e) => setXmlInput(e.target.value)}
                />
              </div>
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-gray-800">
            <CardContent className="p-4 flex flex-col h-[500px]">
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium flex items-center gap-2">
                  <FileJson className="w-4 h-4 text-muted-foreground" />
                  JSON Output
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  disabled={!jsonOutput}
                  className="h-8"
                >
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  Copy
                </Button>
              </div>
              <Textarea
                readOnly
                placeholder="{ ... }"
                className="flex-1 font-mono text-sm resize-none bg-muted/30"
                value={jsonOutput}
              />
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Button
            size="lg"
            onClick={convertToJson}
            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[200px]"
          >
            <ArrowRightLeft className="w-4 h-4 mr-2" />
            Convert XML to JSON
          </Button>
        </div>
      </div>

      <div className="w-full max-w-4xl mx-auto mt-12 px-4 space-y-16">
        <section className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-4">
              <Lightbulb className="w-8 h-8 text-yellow-500" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              {dict?.xml_to_json?.tips_title || "Tips for XML Conversion"}
            </h2>
            <p className="text-muted-foreground">
              {dict?.xml_to_json?.tips_desc || "Ensure your XML is well-formed."}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: dict?.xml_to_json?.tip1_title || "Attributes",
                desc: dict?.xml_to_json?.tip1_desc || "XML attributes typically become properties prefixed with '@attributes' or similar in the resulting JSON object.",
              },
              {
                title: dict?.xml_to_json?.tip2_title || "Arrays",
                desc: dict?.xml_to_json?.tip2_desc || "Repeated XML tags at the same level are converted into a JSON array.",
              },
            ].map((tip, idx) => (
              <div
                key={idx}
                className="flex gap-4 p-4 rounded-lg bg-white dark:bg-gray-800"
              >
                <div className="flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{tip.title}</h3>
                  <p className="text-sm text-muted-foreground">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto">
              Common questions about our XML to JSON converter.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {[
                {
                  q: "Does it support CDATA?",
                  a: "Yes, CDATA sections are typically extracted as text content.",
                },
                {
                  q: "How are attributes handled?",
                  a: "They are usually stored in a special property like @attributes to differentiate them from child elements.",
                },
              ].map((item, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`}>
                  <AccordionTrigger>{item.q}</AccordionTrigger>
                  <AccordionContent>{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </div>
    </div>
  );
}
