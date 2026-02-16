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

export function JsonToXmlClient({ dict }: { dict?: any }) {
  const [jsonInput, setJsonInput] = useState("");
  const [xmlOutput, setXmlOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Simple JSON to XML converter (alternative method, not currently used)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const json2xml = (o: any, tab: string): string => {
    const toXml = function (v: any, name: string, ind: string): string {
      let xml = "";
      if (v instanceof Array) {
        for (let i = 0, n = v.length; i < n; i++)
          xml += ind + toXml(v[i], name, ind + "\t") + "\n";
      } else if (typeof v == "object") {
        let hasChild = false;
        xml += ind + "<" + name;
        for (const m in v) {
          if (m.charAt(0) == "@")
            xml += " " + m.substr(1) + '="' + v[m].toString() + '"';
          else hasChild = true;
        }
        xml += hasChild ? ">" : "/>";
        if (hasChild) {
          for (const m in v) {
            if (m == "#text") xml += v[m];
            else if (m == "#cdata") xml += "<![CDATA[" + v[m] + "]]>";
            else if (m.charAt(0) != "@") xml += toXml(v[m], m, ind + "\t");
          }
          xml +=
            (xml.charAt(xml.length - 1) == "\n" ? ind : "") + "</" + name + ">";
        }
      } else {
        xml += ind + "<" + name + ">" + v.toString() + "</" + name + ">";
      }
      return xml;
    };

    let xml = "";
    for (const m in o) {
      xml += toXml(o[m], m, "");
    }
    return tab ? xml.replace(/\t/g, tab) : xml.replace(/\t|\n/g, "");
  };

  // Improved JSON to XML function
  const OBJtoXML = (obj: any): string => {
    let xml = "";
    for (const prop in obj) {
      xml += obj[prop] instanceof Array ? "" : "<" + prop + ">";
      if (obj[prop] instanceof Array) {
        for (const array in obj[prop]) {
          xml += "<" + prop + ">";
          xml += OBJtoXML(new Object(obj[prop][array]));
          xml += "</" + prop + ">";
        }
      } else if (typeof obj[prop] == "object") {
        xml += OBJtoXML(new Object(obj[prop]));
      } else {
        xml += obj[prop];
      }
      xml += obj[prop] instanceof Array ? "" : "</" + prop + ">";
    }
    xml = xml.replace(/<\/?[0-9]{1,}>/g, "");
    return xml;
  };

  const convertToXml = () => {
    setError(null);
    if (!jsonInput.trim()) {
      setXmlOutput("");
      return;
    }

    try {
      const jsonObj = JSON.parse(jsonInput);
      // Wrap in root if it's an array or doesn't have a single root
      let objToConvert = jsonObj;
      // Basic check if it needs a root element
      if (Array.isArray(jsonObj) || Object.keys(jsonObj).length > 1) {
        objToConvert = { root: jsonObj };
      }

      const xml = OBJtoXML(objToConvert);

      // Basic prettify
      setXmlOutput(xml);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_err) {
      setError("Invalid JSON format. Please check your input.");
      setXmlOutput("");
    }
  };

  const handleCopy = () => {
    if (!xmlOutput) return;
    navigator.clipboard.writeText(xmlOutput);
    toast.success("XML copied to clipboard");
  };

  const handleClear = () => {
    setJsonInput("");
    setXmlOutput("");
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
      setJsonInput(text);
      setError(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center min-h-[50vh]">
      <div className="flex flex-col items-center justify-center w-full max-w-4xl mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 mb-6">
          <FileCode className="w-8 h-8 text-orange-600 dark:text-orange-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          {dict?.json_to_xml?.title || "JSON to XML Converter"}
        </h1>
        <p className="text-muted-foreground text-center max-w-2xl mb-8">
          {dict?.json_to_xml?.subtitle || "Convert JSON data to XML format instantly. Paste your JSON code, or Drag & Drop a file."}
        </p>

        <div className="w-full grid md:grid-cols-2 gap-4">
          <Card
            className={`border-gray-200 dark:border-gray-800 transition-colors ${isDragging ? "border-orange-500 bg-orange-50 dark:bg-orange-900/10" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <CardContent className="p-4 flex flex-col h-[500px]">
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium flex items-center gap-2">
                  <FileJson className="w-4 h-4 text-muted-foreground" />
                  JSON Input
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
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-sm rounded-lg border-2 border-dashed border-orange-500">
                    <p className="text-lg font-medium text-orange-600 dark:text-orange-400">
                      Drop JSON file here
                    </p>
                  </div>
                )}
                <Textarea
                  placeholder='{"name": "John", "age": 30}'
                  className="flex-1 font-mono text-sm resize-none"
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                />
              </div>
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-gray-800">
            <CardContent className="p-4 flex flex-col h-[500px]">
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-muted-foreground" />
                  XML Output
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  disabled={!xmlOutput}
                  className="h-8"
                >
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  Copy
                </Button>
              </div>
              <Textarea
                readOnly
                placeholder="<root>...</root>"
                className="flex-1 font-mono text-sm resize-none bg-muted/30"
                value={xmlOutput}
              />
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Button
            size="lg"
            onClick={convertToXml}
            className="bg-orange-600 hover:bg-orange-700 text-white min-w-[200px]"
          >
            <ArrowRightLeft className="w-4 h-4 mr-2" />
            Convert JSON to XML
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
              {dict?.json_to_xml?.tips_title || "Tips for JSON Conversion"}
            </h2>
            <p className="text-muted-foreground">
              {dict?.json_to_xml?.tips_desc || "Make sure your JSON is valid before converting."}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: dict?.json_to_xml?.tip1_title || "Valid JSON",
                desc: dict?.json_to_xml?.tip1_desc || "Ensure keys are quoted using double quotes. Single quotes are not valid JSON.",
              },
              {
                title: dict?.json_to_xml?.tip2_title || "Root Element",
                desc: dict?.json_to_xml?.tip2_desc || "XML requires a single root element. If your JSON structure is an array or has multiple top-level keys, we wrap it in a <root> tag.",
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
              Common questions about our JSON to XML converter.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {[
                {
                  q: "What is JSON?",
                  a: "JSON (JavaScript Object Notation) is a lightweight data-interchange format. It is easy for humans to read and write and easy for machines to parse and generate.",
                },
                {
                  q: "What is XML?",
                  a: "XML (Extensible Markup Language) is a markup language that defines a set of rules for encoding documents in a format that is both human-readable and machine-readable.",
                },
                {
                  q: "Why convert JSON to XML?",
                  a: "While JSON is popular for web APIs, many legacy systems and enterprise applications still require XML. Validating data against a schema (XSD) is also often easier with XML.",
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
