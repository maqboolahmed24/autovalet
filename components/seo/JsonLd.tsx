import { stringifyJsonLd, type JsonLd } from "../../lib/seo/structured-data";

type JsonLdScriptProps = {
  data: JsonLd | JsonLd[];
};

export function JsonLdScript({ data }: JsonLdScriptProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: stringifyJsonLd(data),
      }}
    />
  );
}
